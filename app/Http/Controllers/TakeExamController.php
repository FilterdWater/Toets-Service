<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Submission;
use Carbon\Carbon;
use Exception;
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
        $now = now();
        $userId = Auth::id();

        $baseQuery = Exam::query()
            ->with(['groups', 'users'])
            ->where(function ($query) use ($userId) {
                $query->whereHas('groups.users', fn($q) => $q->whereKey($userId))
                    ->orWhereHas('users', fn($q) => $q->whereKey($userId));
            })
            ->where('active_from', '<=', $now)
            ->where('active_until', '>=', $now);

        $availableExams = (clone $baseQuery)
            ->where(function ($query) use ($userId) {
                $query->whereDoesntHave('submissions', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                    ->orWhereHas('submissions', function ($q) use ($userId) {
                        $q->where('user_id', $userId)
                            ->whereNull('submitted_at');
                    });
            })
            ->get();

        $finishedExams = (clone $baseQuery)
            ->whereHas('submissions', function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->whereNotNull('submitted_at');
            })
            ->get();

        return Inertia::render('student/student', [
            'availableExams' => $availableExams,
            'finishedExams' => $finishedExams,
        ]);
    }

    public function makeExam(string $id)
    {
        $exam = Exam::with([
            'sections.questions.answers',
            'submissions' => function ($query) {
                $query->where('user_id', Auth::id());
            }
        ])->where('id', $id)->firstOrFail();
        return Inertia::render('student/make-exam', [
            'exam' => $exam,
        ]);
    }

    public function startExam(string $id)
    {
        Submission::create([
            'user_id' => Auth::id(),
            'exam_id' => $id,
            'started_at' => now(),
            'submitted_at' => null
        ]);

        return;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, string $id)
    {
        try {
        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $exam = Exam::findOrFail($id);

        $now = Carbon::now();
        if ($now < $exam->active_from || $now > $exam->active_until) {
            return back()->withErrors(['exam' => 'Exam is not active']);
        }

        // get current user's submission
        $submission = $exam->submissions()->firstOrCreate(
            ['user_id' => Auth::id()],
            ['started_at' => now()]
        );

        // prevent resubmission
        if ($submission->submitted_at) {
            return back()->withErrors(['exam' => 'Already submitted']);
        }

        //Get all question IDs from the exam
        $questionIds = $exam->sections()
            ->with('questions')
            ->get()
            ->flatMap(fn($s) => $s->questions->pluck('id'))
            ->toArray();

        // dd($questionIds);
        // Check which questions are unanswered
        $answeredQuestionIds = array_keys($validated['answers']);
        $missing = array_diff($questionIds, $answeredQuestionIds);
        if (!empty($missing)) {
            // dd("BLAAT");
            return back()->with('error', 'Beantwoord eerst alle vragen voor het inleveren van de toets. ' . count($missing) . ' vragen over.');
        }

        // mark submitted
        $submission->update(['submitted_at' => now()]);

        // save answers
        foreach ($validated['answers'] as $questionId => $answer) {
            if (is_array($answer)) {
                foreach ($answer as $ansId) {
                    $submission->userAnswers()->create([
                        'question_id' => $questionId,
                        'selected_answer' => $ansId, // single choice
                        'text_answer' => null,
                    ]);
                }
            } else if (is_int($answer)) {
                $submission->userAnswers()->create([
                    'question_id' => $questionId,
                    'selected_answer' => $answer, // single choice
                    'text_answer' => null,
                ]);
            } else if (is_string($answer)) {
                // text answer
                $submission->userAnswers()->create([
                    'question_id' => $questionId,
                    'selected_answer' => null,
                    'text_answer' => $answer,
                ]);
            }
        }
        } catch (Exception $e) {
            return back()->with('error', 'Er is iets fout gegaan');
        }

        return redirect()->route('student')->with('success', 'Examen succesvol ingestuurd!');
    }
}
