<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Submission;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

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
                $query->whereHas('groups.users', fn ($q) => $q->whereKey($userId))
                    ->orWhereHas('users', fn ($q) => $q->whereKey($userId));
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
            ->where('active_from', '<=', $now)
            ->where('active_until', '>=', $now)
            ->whereHas('submissions', fn ($q) => $q->where('user_id', Auth::id()))
            ->get()
            ->map(function (Exam $exam) {
                $submission = $exam->submissions()
                    ->where('user_id', Auth::id())
                    ->whereNotNull('submitted_at')
                    ->latest('submitted_at')
                    ->first();

                $exam->setAttribute('submitted_at', $submission?->submitted_at);

                return $exam;
            });

        return Inertia::render('student/student', [
            'availableExams' => $availableExams,
            'finishedExams' => $finishedExams,
        ]);
    }

    public function showExam(string $id)
    {
        $exam = Exam::with([
            'sections.questions.answers',
            'submissions' => function ($query) {
                $query->where('user_id', Auth::id());
            },
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
            'submitted_at' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, string $id)
    {
        try {
            $exam = Exam::findOrFail($id);

            $now = Carbon::now();
            if ($now < $exam->active_from || $now > $exam->active_until) {
                return back()->with('error', 'Examen is niet actief');
            }

            // get current user's submission
            $submission = $exam->submissions()->firstOrCreate(
                ['user_id' => Auth::id()],
                ['started_at' => now()]
            );

            // prevent resubmission
            if ($submission->submitted_at) {
                return back()->with('error', 'Examen is al ingeleverd');
            }

            // Get all question IDs from the exam
            $questionIds = $exam->sections()
                ->with('questions')
                ->get()
                ->flatMap(fn ($s) => $s->questions->pluck('id'))
                ->toArray();

            // Check which questions are unanswered
            $answeredQuestionIds = array_keys(array_filter($request['answers'], function ($answer) {
                if (is_array($answer)) {
                    return ! empty($answer);
                }

                return $answer !== '';
            }));

            $missing = array_diff($questionIds, $answeredQuestionIds);

            if (! empty($missing)) {
                return back()->with([
                    'error' => 'Beantwoord eerst alle vragen.',
                    'missingQuestions' => array_values($missing),
                ]);
            }

            // mark submitted
            $submission->update(['submitted_at' => now()]);

            // save answers
            foreach ($request['answers'] as $questionId => $answer) {
                if (is_array($answer)) {
                    foreach ($answer as $ansId) {
                        $submission->userAnswers()->create([
                            'question_id' => $questionId,
                            'selected_answer' => $ansId, // single choice
                            'text_answer' => null,
                        ]);
                    }
                } elseif (is_int($answer)) {
                    $submission->userAnswers()->create([
                        'question_id' => $questionId,
                        'selected_answer' => $answer, // single choice
                        'text_answer' => null,
                    ]);
                } elseif (is_string($answer)) {
                    // text answer
                    $submission->userAnswers()->create([
                        'question_id' => $questionId,
                        'selected_answer' => null,
                        'text_answer' => $answer,
                    ]);
                }
            }
        } catch (Exception $e) {
            return back()->with('error', 'Er is iets misgegaan');
        }

        return redirect()->route('student')->with('success', 'Examen succesvol ingestuurd!');
    }

    public function showResult(Request $request, $examId): Response
    {
        $exam = Exam::with('sections')->findOrFail($examId);

        $submission = Submission::where('exam_id', $exam->id)
            ->where('user_id', $request->user()->id)
            ->whereNotNull('submitted_at')
            ->where('outdated', false)
            ->latest('submitted_at')
            ->with('userAnswers.selectedAnswer')
            ->first();

        $totalQuestions = 0;
        $correctAnswers = 0;

        if ($submission) {
            $totalQuestions = $submission->userAnswers->count();
            $correctAnswers = $submission->userAnswers
                ->filter(fn ($ua) => $ua->selectedAnswer?->is_correct)
                ->count();
        }

        $durationInSeconds = null;
        if ($submission?->started_at && $submission?->submitted_at) {
            $durationInSeconds = $submission->started_at->diffInSeconds($submission->submitted_at);
        }

        return Inertia::render('student/exam-result', [
            'exam' => array_merge(
                $exam->toArray(),
                [
                    'created_at' => $exam->created_at?->format('d-m-Y H:i'),
                    'updated_at' => $exam->updated_at?->format('d-m-Y H:i'),
                    'sections' => $exam->sections,
                ]
            ),
            'result' => [
                'total_questions' => $totalQuestions,
                'correct_answers' => $correctAnswers,
                'submitted_at' => $submission?->submitted_at,
                'duration_in_seconds' => $durationInSeconds,
                'has_submission' => $submission !== null,
            ],
        ]);
    }
}
