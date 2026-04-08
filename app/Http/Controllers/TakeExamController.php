<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Models\Submission;
use App\Services\SubmissionScoreCalculator;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Collection;
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
                $query->where('globally_available', true)
                    ->orWhereHas('groups.users', fn ($q) => $q->whereKey($userId))
                    ->orWhereHas('users', fn ($q) => $q->whereKey($userId));
            })
            ->where('active_from', '<=', $now)
            ->where('active_until', '>=', $now);

        $availableExams = (clone $baseQuery)
            ->where(function ($query) use ($userId) {
                $query->whereDoesntHave('submissions', function ($q) use ($userId) {
                    $q->where('user_id', $userId)->where('outdated', false);
                })
                    ->orWhereHas('submissions', function ($q) use ($userId) {
                        $q->where('user_id', $userId)
                            ->where('outdated', false)
                            ->whereNull('submitted_at');
                    });
            })
            ->orderBy('active_until')
            ->get();

        $finishedExams = (clone $baseQuery)
            ->whereHas('submissions', function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->whereNotNull('submitted_at')
                    ->where('outdated', false);
            })
            ->where('active_from', '<=', $now)
            ->where('active_until', '>=', $now)
            ->whereHas('submissions', fn ($q) => $q->where('user_id', Auth::id()))
            ->get()
            ->map(function (Exam $exam) {
                $submission = $exam->submissions()
                    ->where('user_id', Auth::id())
                    ->whereNotNull('submitted_at')
                    ->where('outdated', false)
                    ->latest('submitted_at')
                    ->first();

                $exam->setAttribute('submitted_at', $submission?->submitted_at);

                return $exam;
            })
            ->sortByDesc('submitted_at')
            ->values();

        return Inertia::render('student/student', [
            'availableExams' => $availableExams,
            'finishedExams' => $finishedExams,
        ]);
    }

    public function showExam(Request $request, string $id)
    {
        $exam = Exam::with([
            'sections.questions.answers',
            'submissions' => function ($query) {
                $query->where('user_id', Auth::id())->where('outdated', false);
            },
        ])->where('id', $id)->firstOrFail();

        $repeatIncorrect = $this->shouldRepeatIncorrectOnly($exam, $request->user()->id);

        if ($repeatIncorrect) {
            $latestSubmitted = $exam->submissions()
                ->where('user_id', Auth::id())
                ->whereNotNull('submitted_at')
                ->latest('submitted_at')
                ->with('userAnswers')
                ->first();

            if ($latestSubmitted === null) {
                return back()->with('error', 'Er is geen eerdere inzending om te herhalen.');
            }

            $incorrectQuestionIds = $this->incorrectQuestionIds($exam, $latestSubmitted);
            $correctQuestionIds = $this->correctQuestionIds($exam, $latestSubmitted);

            if ($incorrectQuestionIds === []) {
                return back()->with('error', 'Er zijn geen fout beantwoorde vragen om te herhalen.');
            }

            foreach ($exam->sections as $section) {
                foreach ($section->questions as $question) {
                    $question->setAttribute('repeat_required', in_array($question->id, $incorrectQuestionIds, true));
                    $question->setAttribute('previously_correct', in_array($question->id, $correctQuestionIds, true));
                }
            }
        }

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
            $repeatIncorrect = $this->shouldRepeatIncorrectOnly($exam, $request->user()->id);

            $now = Carbon::now();
            if ($now < $exam->active_from || $now > $exam->active_until) {
                return back()->with('error', 'Examen is niet actief');
            }

            // get current user's in-progress (non-outdated) submission
            $submission = $exam->submissions()
                ->where('user_id', Auth::id())
                ->where('outdated', false)
                ->whereNull('submitted_at')
                ->latest('started_at')
                ->first();

            if ($submission === null) {
                $alreadySubmitted = $exam->submissions()
                    ->where('user_id', Auth::id())
                    ->where('outdated', false)
                    ->whereNotNull('submitted_at')
                    ->exists();

                if ($alreadySubmitted) {
                    return back()->with('error', 'Examen is al ingeleverd');
                }

                $submission = $exam->submissions()->create([
                    'user_id' => Auth::id(),
                    'started_at' => now(),
                ]);
            }

            // Get all question IDs from the exam
            $questionIds = $exam->sections()
                ->with('questions')
                ->get()
                ->flatMap(fn ($s) => $s->questions->pluck('id'))
                ->toArray();

            $previousSubmission = null;
            if ($repeatIncorrect) {
                $previousSubmission = $exam->submissions()
                    ->where('user_id', Auth::id())
                    ->whereNotNull('submitted_at')
                    ->latest('submitted_at')
                    ->with('userAnswers')
                    ->first();

                if ($previousSubmission === null) {
                    return back()->with('error', 'Er is geen eerdere inzending om te herhalen.');
                }

                $incorrectQuestionIds = $this->incorrectQuestionIds($exam, $previousSubmission);
                $questionIds = array_values(array_intersect($questionIds, $incorrectQuestionIds));

                if ($questionIds === []) {
                    return back()->with('error', 'Er zijn geen fout beantwoorde vragen om te herhalen.');
                }
            }

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
            foreach ($questionIds as $questionId) {
                $answer = $request['answers'][$questionId] ?? null;

                if ($answer === null) {
                    continue;
                }

                if (is_array($answer)) {
                    foreach ($answer as $ansId) {
                        if (! is_numeric($ansId)) {
                            continue;
                        }

                        $submission->userAnswers()->create([
                            'question_id' => $questionId,
                            'selected_answer' => (int) $ansId,
                            'text_answer' => null,
                        ]);
                    }
                } elseif (is_numeric($answer)) {
                    $submission->userAnswers()->create([
                        'question_id' => $questionId,
                        'selected_answer' => (int) $answer,
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

            if ($repeatIncorrect && $previousSubmission !== null) {
                $carriedCorrectQuestionIds = $this->correctQuestionIds($exam, $previousSubmission);
                $previousAnswersByQuestion = $previousSubmission->userAnswers->groupBy('question_id');

                foreach ($carriedCorrectQuestionIds as $questionId) {
                    foreach ($previousAnswersByQuestion->get($questionId, new Collection) as $previousAnswer) {
                        $submission->userAnswers()->create([
                            'question_id' => $questionId,
                            'selected_answer' => $previousAnswer->selected_answer,
                            'text_answer' => $previousAnswer->text_answer,
                        ]);
                    }
                }
            }
        } catch (Exception $e) {
            return back()->with('error', 'Er is iets misgegaan');
        }

        $exam->loadMissing('sections.questions.answers');
        $submission->load('userAnswers');
        $graded = SubmissionScoreCalculator::calculate($submission, $exam);
        $totalQuestions = $graded['total_questions'];
        $correctAnswers = $graded['correct_answers'];

        $durationInSeconds = null;
        if ($submission?->started_at && $submission?->submitted_at) {
            $durationInSeconds = $submission->started_at->diffInSeconds($submission->submitted_at);
        }

        return Inertia::render('student/exam-result', [
            'exam' => new ExamResource($exam),
            'result' => [
                'total_questions' => $totalQuestions,
                'correct_answers' => $correctAnswers,
                'incorrect_questions' => count($this->incorrectQuestionIds($exam, $submission)),
                'submitted_at' => $submission?->submitted_at,
                'duration_in_seconds' => $durationInSeconds,
                'has_submission' => $submission !== null,
            ],
        ]);
    }

    public function showResult(Request $request, $examId)
    {
        $exam = Exam::with([
            'sections.questions.answers',
        ])->findOrFail($examId);

        $submission = Submission::where('exam_id', $exam->id)
            ->where('user_id', $request->user()->id)
            ->whereNotNull('submitted_at')
            ->where('outdated', false)
            ->latest('submitted_at')
            ->with('userAnswers')
            ->first();

        if ($submission == null || $submission->submitted_at == null) {
            return back()->with('error', 'Dit examen heeft geen resultaat of is niet van jou.');
        }

        $graded = SubmissionScoreCalculator::calculate($submission, $exam);
        $totalQuestions = $graded['total_questions'];
        $correctAnswers = $graded['correct_answers'];

        $durationInSeconds = null;
        if ($submission?->started_at && $submission?->submitted_at) {
            $durationInSeconds = $submission->started_at->diffInSeconds($submission->submitted_at);
        }

        return Inertia::render('student/exam-result', [
            'exam' => new ExamResource($exam),
            'result' => [
                'total_questions' => $totalQuestions,
                'correct_answers' => $correctAnswers,
                'incorrect_questions' => count($this->incorrectQuestionIds($exam, $submission)),
                'submitted_at' => $submission?->submitted_at,
                'duration_in_seconds' => $durationInSeconds,
                'has_submission' => $submission !== null,
            ],
        ]);
    }

    /**
     * @return list<int>
     */
    protected function incorrectQuestionIds(Exam $exam, Submission $submission): array
    {
        $exam->loadMissing('sections.questions.answers');
        $submission->loadMissing('userAnswers');

        $userAnswersByQuestion = $submission->userAnswers->groupBy('question_id');
        $incorrectQuestionIds = [];

        foreach ($exam->sections as $section) {
            foreach ($section->questions as $question) {
                $rows = $userAnswersByQuestion->get($question->id, new Collection);
                $isCorrect = SubmissionScoreCalculator::isQuestionAnswerCorrect($question, $rows);

                if ($isCorrect === false) {
                    $incorrectQuestionIds[] = $question->id;
                }
            }
        }

        return $incorrectQuestionIds;
    }

    /**
     * @return list<int>
     */
    protected function correctQuestionIds(Exam $exam, Submission $submission): array
    {
        $exam->loadMissing('sections.questions.answers');
        $submission->loadMissing('userAnswers');

        $userAnswersByQuestion = $submission->userAnswers->groupBy('question_id');
        $correctQuestionIds = [];

        foreach ($exam->sections as $section) {
            foreach ($section->questions as $question) {
                $rows = $userAnswersByQuestion->get($question->id, new Collection);
                $isCorrect = SubmissionScoreCalculator::isQuestionAnswerCorrect($question, $rows);

                if ($isCorrect === true) {
                    $correctQuestionIds[] = $question->id;
                }
            }
        }

        return $correctQuestionIds;
    }

    protected function shouldRepeatIncorrectOnly(Exam $exam, int $userId): bool
    {
        $latestSubmitted = $exam->submissions()
            ->where('user_id', $userId)
            ->whereNotNull('submitted_at')
            ->latest('submitted_at')
            ->with('userAnswers')
            ->first();

        if ($latestSubmitted === null || ! $latestSubmitted->outdated) {
            return false;
        }

        if ($latestSubmitted->retake_mode !== 'incorrect_only') {
            return false;
        }

        $graded = SubmissionScoreCalculator::calculate($latestSubmitted, $exam);

        if ($graded['score'] >= 5.5) {
            return false;
        }

        return $this->incorrectQuestionIds($exam, $latestSubmitted) !== [];
    }
}
