<?php

namespace App\Actions\Fortify;

use App\Enums\Role;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class CustomLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $role = Auth::user()->role;

        if ($role instanceof Role) {
            $role = $role->value;
        }

        return redirect()->intended(match ($role) {
            'admin' => route('admin', absolute: false),
            'teacher' => route('teacher', absolute: false),
            'student' => route('student', absolute: false),
            default => route('root', absolute: false),
        });
    }
}
