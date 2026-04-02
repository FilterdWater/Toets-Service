<?php

use App\Enums\Role;
use App\Models\Answer;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Section;
use App\Models\Submission;
use App\Models\User;
use App\Models\UserAnswer;

test('teacher can view submission detail with questions', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->active()->create();
    $section = Section::factory()->create(['exam_id' => $exam->id]);
    $question = Question::factory()->singleChoice()->create(['section_id' => $section->id]);
    $correctAnswer = Answer::factory()->correct()->create(['question_id' => $question->id]);

    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create(['outdated' => false]);

    UserAnswer::factory()
        ->forSubmission($submission)
        ->forQuestion($question)
        ->withSelectedAnswer($correctAnswer)
        ->create();

    $this->actingAs($teacher);

    $response = $this->get(route('examSubmissionDetail', [$exam, $submission]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam-result/exam-submission-detail')
        ->has('questions', 1)
        ->where('questions.0.is_correct', true)
        ->where('submission.user.name', $student->name)
    );
});

test('submission detail returns 404 when submission belongs to another exam', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $examA = Exam::factory()->active()->create();
    $examB = Exam::factory()->active()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($examA)
        ->completed()
        ->create();

    $this->actingAs($teacher);

    $response = $this->get(route('examSubmissionDetail', [$examB, $submission]));

    $response->assertNotFound();
});

test('submission detail returns 404 when submission is not completed', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->active()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->inProgress()
        ->create();

    $this->actingAs($teacher);

    $response = $this->get(route('examSubmissionDetail', [$exam, $submission]));

    $response->assertNotFound();
});
