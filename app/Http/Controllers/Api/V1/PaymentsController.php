<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentsController extends Controller
{
    public function checkout(Request $request)
    {
        $payload = $request->validate([
            'enrollmentId' => ['required', 'integer', 'exists:enrollments,id'],
            'cardNumber' => ['required', 'string', 'min:12', 'max:24'],
            'cardHolder' => ['required', 'string', 'max:120'],
            'expMonth' => ['required', 'integer', 'between:1,12'],
            'expYear' => ['required', 'integer', 'between:0,2100'],
            'cvv' => ['required', 'string', 'min:3', 'max:4'],
        ]);

        $cardNumber = preg_replace('/\D+/', '', $payload['cardNumber']) ?? '';
        $cvv = preg_replace('/\D+/', '', $payload['cvv']) ?? '';

        if (strlen($cardNumber) < 12 || strlen($cardNumber) > 19 || strlen($cvv) < 3 || strlen($cvv) > 4) {
            throw ValidationException::withMessages([
                'cardNumber' => 'Некорректные данные карты.',
            ]);
        }

        $expMonth = (int) $payload['expMonth'];
        $expYear = $this->normalizeExpYear((int) $payload['expYear']);
        $expiresAt = Carbon::create($expYear, $expMonth, 1)->endOfMonth();
        if ($expiresAt->isPast()) {
            throw ValidationException::withMessages([
                'expYear' => 'Срок действия карты истек.',
            ]);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        $enrollment = Enrollment::query()
            ->where('id', $payload['enrollmentId'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (! in_array($enrollment->status, ['active', 'paused'], true)) {
            throw ValidationException::withMessages([
                'enrollmentId' => 'Оплата доступна только для активных или приостановленных групп.',
            ]);
        }

        $now = now();
        $brand = $this->detectCardBrand($cardNumber);
        $last4 = substr($cardNumber, -4);
        $fingerprint = hash('sha256', implode('|', [
            (string) $user->id,
            (string) $brand,
            (string) $last4,
            (string) $expMonth,
            (string) $expYear,
        ]));

        $payment = DB::transaction(function () use ($user, $enrollment, $brand, $last4, $expMonth, $expYear, $fingerprint, $now, $payload): Payment {
            PaymentMethod::query()
                ->where('user_id', $user->id)
                ->update(['is_default' => false]);

            $method = PaymentMethod::query()->updateOrCreate(
                ['fingerprint' => $fingerprint],
                [
                    'user_id' => $user->id,
                    'brand' => $brand,
                    'last4' => $last4,
                    'exp_month' => $expMonth,
                    'exp_year' => $expYear,
                    'is_default' => true,
                ],
            );

            $payment = Payment::query()->create([
                'enrollment_id' => $enrollment->id,
                'user_id' => $user->id,
                'payment_method_id' => $method->id,
                'amount_cents' => $enrollment->billing_amount_cents,
                'currency' => $enrollment->currency ?: 'RUB',
                'status' => 'success',
                'due_at' => $enrollment->next_payment_due_at ?: $now,
                'paid_at' => $now,
                'gateway' => 'mock',
                'meta' => [
                    'card_holder' => $this->maskCardHolder((string) $payload['cardHolder']),
                ],
            ]);

            $enrollment->update([
                'next_payment_due_at' => $now->copy()->addDays((int) $enrollment->billing_period_days),
                'status' => 'active',
            ]);

            return $payment;
        });

        return response()->json([
            'ok' => true,
            'paymentId' => $payment->id,
            'nextDueAt' => $enrollment->fresh()->next_payment_due_at?->toIso8601String(),
        ]);
    }

    private function detectCardBrand(string $cardNumber): string
    {
        if (preg_match('/^4\d+$/', $cardNumber) === 1) {
            return 'visa';
        }
        if (preg_match('/^(5[1-5]|2[2-7])\d+$/', $cardNumber) === 1) {
            return 'mastercard';
        }
        if (preg_match('/^220[0-4]\d+$/', $cardNumber) === 1) {
            return 'mir';
        }
        return 'card';
    }

    private function maskCardHolder(string $name): string
    {
        $parts = preg_split('/\s+/u', trim($name)) ?: [];
        if ($parts === []) {
            return 'CARD HOLDER';
        }

        return collect($parts)
            ->map(function (string $part): string {
                $first = mb_substr($part, 0, 1);
                return mb_strtoupper($first).'***';
            })
            ->implode(' ');
    }

    private function normalizeExpYear(int $expYear): int
    {
        // Accept both YY and YYYY in demo checkout.
        if ($expYear >= 0 && $expYear <= 99) {
            $expYear += 2000;
        }

        if ($expYear < 2020 || $expYear > 2100) {
            throw ValidationException::withMessages([
                'expYear' => 'Некорректный год действия карты.',
            ]);
        }

        return $expYear;
    }
}
