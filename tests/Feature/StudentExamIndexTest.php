<?php

use App\Models\Exam;
use App\Models\Submission;
use App\Models\User;

test('student sees finished globally available exam without group or direct exam attachment', function (): void {
    $student = User::factory()->create();
    $exam = Exam::factory()->active()->globallyAvailable()->create();

    Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create(['outdated' => false]);

    $this->actingAs($student)
        ->get(route('student'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('student/student')
            ->has('finishedExams', 1)
            ->where('finishedExams.0.id', $exam->id)
        );
});
