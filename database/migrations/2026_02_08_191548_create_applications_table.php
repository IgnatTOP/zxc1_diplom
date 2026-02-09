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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable()->index();
            $table->unsignedSmallInteger('age')->nullable();
            $table->unsignedSmallInteger('weight')->nullable();
            $table->string('style');
            $table->string('level');
            $table->string('status')->default('pending')->index();
            $table->unsignedBigInteger('assigned_group_id')->nullable()->index();
            $table->string('assigned_group')->nullable();
            $table->string('assigned_day')->nullable();
            $table->string('assigned_time')->nullable();
            $table->date('assigned_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
