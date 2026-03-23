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

        return redirect()->route(match ($role) {
            'admin' => 'admin',
            'teacher' => 'teacher',
            'student' => 'student',
            default => 'login',
        });
    }
}
