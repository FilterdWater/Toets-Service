<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Group;
use App\Models\Submission;
use App\Models\User;
use Inertia\Inertia;

class ApplicationStatisticsController extends Controller
{
    public function index()
    {
        $recentSubmissions = Submission::with(['user', 'exam'])
            ->whereNotNull('submitted_at')
            ->orderBy('submitted_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($submission) => [
                'id' => $submission->id,
                'studentName' => $submission->user->name,
                'examTitle' => $submission->exam->name,
                'submittedAt' => $submission->submitted_at,
            ]);

        return Inertia::render('admin/application-statistics/application-statistics', [
            'totalUsers' => User::count(),
            'totalStudents' => User::where('role', 'student')->count(),
            'totalTeachers' => User::where('role', 'teacher')->count(),
            'totalAdmins' => User::where('role', 'admin')->count(),
            'totalExams' => Exam::count(),
            'totalGroups' => Group::count(),
            'recentSubmissions' => $recentSubmissions,
        ]);
    }
}
