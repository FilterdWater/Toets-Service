<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TakeExamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $now = Carbon::now();

        $availableExams = Exam::with(['groups', 'users'])
            ->where(function ($query) {
                $query->whereHas('groups.users', fn ($q) => $q->whereKey(Auth::id()))
                    ->orWhereHas('users', fn ($q) => $q->whereKey(Auth::id()));
            })
            ->where('active_from', '<=', $now)
            ->where('active_until', '>=', $now)
            ->whereDoesntHave('submissions', fn ($q) => $q->where('user_id', Auth::id()))
            ->get();

        $finishedExams = Exam::with(['groups', 'users'])
            ->where(function ($query) {
                $query->whereHas('groups.users', fn ($q) => $q->whereKey(Auth::id()))
                    ->orWhereHas('users', fn ($q) => $q->whereKey(Auth::id()));
            })
            ->where('active_from', '<=', $now)
            ->where('active_until', '>=', $now)
            ->whereHas('submissions', fn ($q) => $q->where('user_id', Auth::id()))
            ->get();

        return Inertia::render('student/student', [
            'availableExams' => $availableExams,
            'finishedExams' => $finishedExams,
        ]);
    }

    public function makeExam(string $id)
    {
        $exam = Exam::with(['sections.questions.answers'])->where('id', $id)->firstOrFail();

        return Inertia::render('student/make-exam', [
            'exam' => $exam,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([

        ]);

    }
}
