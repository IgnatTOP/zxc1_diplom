<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class SupportMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_type',
        'sender_user_id',
        'source',
        'body',
        'telegram_update_id',
        'sent_at',
        'is_read_by_user',
        'is_read_by_admin',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'is_read_by_user' => 'boolean',
            'is_read_by_admin' => 'boolean',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(SupportConversation::class, 'conversation_id');
    }

    public function senderUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
