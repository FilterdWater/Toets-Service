<?php

namespace App\Http\Middleware;

use App\Enums\Role as RoleEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Role
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        $role = $user->role instanceof RoleEnum
            ? $user->role->value
            : (string) $user->role;

        if (! in_array($role, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
