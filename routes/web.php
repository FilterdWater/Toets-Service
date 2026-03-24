<?php

use App\Enums\Role;
use App\Http\Controllers\GroupController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified'])->get('dashboard', function () {
    $role = Auth::user()->role;

    if ($role instanceof Role) {
        $role = $role->value;
    }

    return match ($role) {
        'student' => redirect()->route('student'),
        'teacher' => redirect()->route('teacher'),
        'admin' => redirect()->route('admin'),
        default => redirect()->route('login'),
    };
})->name('dashboard');

Route::middleware(['auth', 'verified', 'role:student,teacher,admin'])->group(function () {
    Route::inertia('student', 'student')->name('student');
});

Route::middleware(['auth', 'verified', 'role:teacher,admin'])->group(function () {
    Route::prefix('docent')->group(function () {
        Route::inertia('/', 'teacher')->name('teacher');
        Route::get('groepen', [GroupController::class, 'index'])->name('groups');
        Route::post('groepen', [GroupController::class, 'store'])->name('storeGroups');
    });
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('beheerder', 'admin')->name('admin');
});

require __DIR__ . '/settings.php';
