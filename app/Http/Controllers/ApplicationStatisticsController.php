<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Group;
use App\Models\User;
use Inertia\Inertia;

class ApplicationStatisticsController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/application-statistics', [
            'totalUsers' => User::count(),
            'totalStudents' => User::where('role', 'student')->count(),
            'totalTeachers' => User::where('role', 'teacher')->count(),
            'totalAdmins' => User::where('role', 'admin')->count(),
            'totalExams' => Exam::count(),
            'totalGroups' => Group::count(),
        ]);
    }
}
