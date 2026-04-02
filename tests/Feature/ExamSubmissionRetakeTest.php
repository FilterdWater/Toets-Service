<?php

use App\Enums\Role;
use App\Models\Answer;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Section;
use App\Models\Submission;
use App\Models\User;
use App\Models\UserAnswer;

beforeEach(function (): void {
    $this->teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);
});

test('teacher can allow retake by marking submission outdated', function (): void {
    $this->actingAs($this->teacher);

    $exam = Exam::factory()->active()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create([
            'outdated' => false,
        ]);

    $response = $this->from(route('examResults', $exam))
        ->post(route('submissionAllowRetake', [$exam, $submission]));

    $response->assertRedirect();
    expect($submission->fresh()->outdated)->toBeTrue();
});

test('allow retake is rejected for sufficient score', function (): void {
    $this->actingAs($this->teacher);

    $exam = Exam::factory()->active()->create();
    $section = Section::factory()->create(['exam_id' => $exam->id]);
    $question = Question::factory()->singleChoice()->create(['section_id' => $section->id]);
    $correctAnswer = Answer::factory()->correct()->create(['question_id' => $question->id]);

    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create([
            'outdated' => false,
        ]);

    UserAnswer::factory()
        ->forSubmission($submission)
        ->forQuestion($question)
        ->withSelectedAnswer($correctAnswer)
        ->create();

    $response = $this->from(route('examResults', $exam))
        ->post(route('submissionAllowRetake', [$exam, $submission]));

    $response->assertStatus(422);
    expect($submission->fresh()->outdated)->toBeFalse();
});

test('allow retake cannot be undone', function (): void {
    $this->actingAs($this->teacher);

    $exam = Exam::factory()->active()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create([
            'outdated' => true,
        ]);

    $response = $this->from(route('examResults', $exam))
        ->post(route('submissionAllowRetake', [$exam, $submission]));

    $response->assertStatus(422);
    expect($submission->fresh()->outdated)->toBeTrue();
});

test('submission allow retake returns 404 when submission belongs to another exam', function (): void {
    $this->actingAs($this->teacher);

    $examA = Exam::factory()->active()->create();
    $examB = Exam::factory()->active()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($examA)
        ->completed()
        ->create(['outdated' => false]);

    $response = $this->from(route('examResults', $examB))
        ->post(route('submissionAllowRetake', [$examB, $submission]));

    $response->assertNotFound();
});

test('submission allow retake aborts when submission is not completed', function (): void {
    $this->actingAs($this->teacher);

    $exam = Exam::factory()->active()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $submission = Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->inProgress()
        ->create(['outdated' => false]);

    $response = $this->from(route('examResults', $exam))
        ->post(route('submissionAllowRetake', [$exam, $submission]));

    $response->assertStatus(422);
});

test('student sees exam in available list when only submission is outdated', function (): void {
    $exam = Exam::factory()->active()->globallyAvailable()->create();
    $student = User::factory()->create(['role' => Role::Student]);
    $exam->users()->attach($student->id);

    Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create([
            'outdated' => true,
        ]);

    $this->actingAs($student);

    $response = $this->get(route('student'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('student/student')
        ->where('availableExams', function ($exams) use ($exam) {
            return $exams->contains(fn (array $e) => $e['id'] === $exam->id);
        })
    );
});
