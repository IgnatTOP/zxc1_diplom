<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function updateEnrollment(Request $request, Enrollment $enrollment)
    {
        $payload = $request->validate([
            'status' => ['nullable', 'string', 'max:40'],
            'startedAt' => ['nullable', 'date'],
            'endedAt' => ['nullable', 'date'],
            'nextPaymentDueAt' => ['nullable', 'date'],
            'billingAmountCents' => ['nullable', 'integer', 'min:0'],
            'billingPeriodDays' => ['nullable', 'integer', 'min:1', 'max:365'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        $enrollment->update([
            'status' => array_key_exists('status', $payload) ? $payload['status'] : $enrollment->status,
            'started_at' => array_key_exists('startedAt', $payload) ? $payload['startedAt'] : $enrollment->started_at,
            'ended_at' => array_key_exists('endedAt', $payload) ? $payload['endedAt'] : $enrollment->ended_at,
            'next_payment_due_at' => array_key_exists('nextPaymentDueAt', $payload) ? $payload['nextPaymentDueAt'] : $enrollment->next_payment_due_at,
            'billing_amount_cents' => array_key_exists('billingAmountCents', $payload) ? $payload['billingAmountCents'] : $enrollment->billing_amount_cents,
            'billing_period_days' => array_key_exists('billingPeriodDays', $payload) ? $payload['billingPeriodDays'] : $enrollment->billing_period_days,
            'currency' => array_key_exists('currency', $payload) ? strtoupper((string) $payload['currency']) : $enrollment->currency,
        ]);

        return response()->json([
            'ok' => true,
            'item' => $enrollment->fresh()->load(['user:id,name,email', 'group:id,name', 'section:id,name']),
        ]);
    }

    public function updatePayment(Request $request, Payment $payment)
    {
        $payload = $request->validate([
            'amountCents' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', 'string', 'max:40'],
            'dueAt' => ['nullable', 'date'],
            'paidAt' => ['nullable', 'date'],
            'gateway' => ['nullable', 'string', 'max:120'],
        ]);

        $payment->update([
            'amount_cents' => array_key_exists('amountCents', $payload) ? $payload['amountCents'] : $payment->amount_cents,
            'currency' => array_key_exists('currency', $payload) ? strtoupper((string) $payload['currency']) : $payment->currency,
            'status' => array_key_exists('status', $payload) ? $payload['status'] : $payment->status,
            'due_at' => array_key_exists('dueAt', $payload) ? $payload['dueAt'] : $payment->due_at,
            'paid_at' => array_key_exists('paidAt', $payload) ? $payload['paidAt'] : $payment->paid_at,
            'gateway' => array_key_exists('gateway', $payload) ? $payload['gateway'] : $payment->gateway,
        ]);

        return response()->json([
            'ok' => true,
            'item' => $payment->fresh()->load(['user:id,name,email', 'enrollment:id,group_id', 'enrollment.group:id,name']),
        ]);
    }
}
