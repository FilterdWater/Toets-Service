<?php

namespace App\Actions\Fortify;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class CustomLoginResponse implements LoginResponseContract
{
  public function toResponse($request)
  {
    $role = Auth::user()->role;
    return match ($role) {
      'admin' => redirect()->intended('/admin/dashboard'),
      'teacher' => redirect()->intended('/teacher/dashboard'),
      'student' => redirect()->intended('/student/dashboard'),
      default => redirect()->intended('/'),
    };
  }
}
