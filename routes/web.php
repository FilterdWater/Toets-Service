<?php

use App\Enums\Role;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
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

    Route::middleware(['role:student,teacher,admin'])->group(function () {
        Route::inertia('student', 'student')->name('student');
    });

    Route::middleware(['role:teacher,admin'])->group(function () {
        Route::inertia('docent', 'teacher')->name('teacher');
    });

    Route::middleware(['role:admin'])->group(function () {
        Route::inertia('beheerder', 'admin/admin')->name('admin');
        Route::get('accounts', [UserController::class, 'index'])->name('accounts');
    });

    Route::prefix('examens')->group(function () {
        Route::get('/{id}/wijzigen', [ExamController::class, 'edit'])->name('getexam');
        Route::get('/create', [ExamController::class, 'create'])->name('createexam');
        Route::post('/store', [ExamController::class, 'store'])->name('storeexam');
        Route::put('/{exam}', [ExamController::class, 'update'])->name('updateexam');
        Route::delete('/{exam}', [ExamController::class, 'destroy'])->name('deleteeexam');
    });
});

require __DIR__.'/settings.php';
