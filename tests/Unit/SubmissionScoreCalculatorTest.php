<?php

use App\Models\Answer;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Section;
use App\Models\Submission;
use App\Models\User;
use App\Models\UserAnswer;
use App\Services\SubmissionScoreCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('multiple choice with two correct options counts as one question when fully correct', function (): void {
    $exam = Exam::factory()->active()->create();
    $section = Section::factory()->create(['exam_id' => $exam->id]);
    $question = Question::factory()->multipleChoice()->create(['section_id' => $section->id]);
    $correctA = Answer::factory()->correct()->create(['question_id' => $question->id]);
    $correctB = Answer::factory()->correct()->create(['question_id' => $question->id]);

    $submission = Submission::factory()
        ->forUser(User::factory()->create())
        ->forExam($exam)
        ->completed()
        ->create();

    UserAnswer::factory()
        ->forSubmission($submission)
        ->forQuestion($question)
        ->withSelectedAnswer($correctA)
        ->create();
    UserAnswer::factory()
        ->forSubmission($submission)
        ->forQuestion($question)
        ->withSelectedAnswer($correctB)
        ->create();

    $submission->load('userAnswers');
    $graded = SubmissionScoreCalculator::calculate($submission, $exam);

    expect($graded['total_questions'])->toBe(1)
        ->and($graded['correct_answers'])->toBe(1)
        ->and($graded['score'])->toBe(10.0);
});

test('multiple choice partial selection is incorrect for the whole question', function (): void {
    $exam = Exam::factory()->active()->create();
    $section = Section::factory()->create(['exam_id' => $exam->id]);
    $question = Question::factory()->multipleChoice()->create(['section_id' => $section->id]);
    $correctA = Answer::factory()->correct()->create(['question_id' => $question->id]);
    Answer::factory()->correct()->create(['question_id' => $question->id]);

    $submission = Submission::factory()
        ->forUser(User::factory()->create())
        ->forExam($exam)
        ->completed()
        ->create();

    UserAnswer::factory()
        ->forSubmission($submission)
        ->forQuestion($question)
        ->withSelectedAnswer($correctA)
        ->create();

    $submission->load('userAnswers');
    $graded = SubmissionScoreCalculator::calculate($submission, $exam);

    expect($graded['total_questions'])->toBe(1)
        ->and($graded['correct_answers'])->toBe(0)
        ->and($graded['score'])->toBe(0.0);
});
