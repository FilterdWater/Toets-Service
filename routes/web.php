<?php

use App\Enums\Role;
use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified'])->get('dashboard', function () {
    $role = auth()->user()->role;

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
    Route::inertia('docent', 'teacher')->name('teacher');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('beheerder', 'admin')->name('admin');
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::prefix('examens')->group(function () {
        Route::get('/{id}/edit', [ExamController::class, 'edit'])->name('getexam');
        Route::get('/create', [ExamController::class, 'create'])->name('createexam');
        Route::post('/store', [ExamController::class, 'store'])->name('storeexam');
        Route::put('/{exam}/update', [ExamController::class, 'update'])->name('updateexam');
    });
});

require __DIR__.'/settings.php';
