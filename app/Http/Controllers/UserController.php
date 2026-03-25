<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/accounts', [
            'users' => User::all(),
        ]);
    }

    public function showCreate()
    {
        return Inertia::render('admin/account-create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,teacher,admin',
        ]);

        User::create($request->all());

        return redirect()->route('accounts');
    }
}
