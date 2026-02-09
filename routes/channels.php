<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('support.user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id || $user->role === 'admin';
});

Broadcast::channel('support.admin', function ($user) {
    return $user->role === 'admin';
});
