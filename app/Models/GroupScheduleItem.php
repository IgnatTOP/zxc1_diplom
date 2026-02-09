<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class GroupScheduleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'day_of_week',
        'date',
        'start_time',
        'end_time',
        'style',
        'level',
        'instructor',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}
