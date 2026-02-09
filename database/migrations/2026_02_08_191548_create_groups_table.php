<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->string('name');
            $table->string('style');
            $table->string('level');
            $table->string('day_of_week')->nullable();
            $table->string('time')->nullable();
            $table->unsignedSmallInteger('age_min')->nullable();
            $table->unsignedSmallInteger('age_max')->nullable();
            $table->unsignedSmallInteger('max_students')->default(15);
            $table->unsignedSmallInteger('current_students')->default(0);
            $table->unsignedInteger('billing_amount_cents')->default(520000);
            $table->unsignedSmallInteger('billing_period_days')->default(30);
            $table->string('currency', 3)->default('RUB');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['section_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
