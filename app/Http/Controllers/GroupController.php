<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $groups = Group::with('users', 'exams')->withCount('users')->get();
        $students = Inertia::lazy(
            fn () => User::where('role', 'student')
                ->select('id', 'name', 'email')
                ->get()
        );
        $exams = Inertia::lazy(
            fn () => Exam::all()
        );

        return Inertia::render('groups/groups', [
            'groups' => $groups,
            'students' => $students,
            'exams' => $exams,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        Group::create(['name' => $request->name]);

        return redirect()->route('groups')->with('success', 'Groep succesvol aangemaakt!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $group = Group::where('id', $id)->firstOrFail();
        $group->update(['name' => $request->name]);

        return back()->with('success', 'Groep succesvol bijgewerkt!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (! Group::find($id)) {
            return redirect()->route('groups')->with('error', 'Groep niet gevonden!');
        }

        Group::findOrFail($id)->users()->detach();
        Group::findOrFail($id)->exams()->detach();
        Group::destroy($id);

        return redirect()->route('groups')->with('success', 'Groep succesvol verwijderd!');
    }

    public function attachExam(Request $request, string $id)
    {
        $request->validate(['exam_id' => 'required|exists:exams,id']);
        $group = Group::findOrFail($id);
        $group->exams()->syncWithoutDetaching([$request->exam_id]);

        return back()->with('success', 'Toets succesvol toegevoegd aan groep!');
    }

    public function detachExam(string $groupId, string $examId)
    {
        $group = Group::findOrFail($groupId);
        $group->exams()->detach($examId);

        return back()->with('success', 'Toets succesvol verwijderd uit groep!');
    }

    public function attachUser(Request $request, string $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $group = Group::findOrFail($id);
        $group->users()->syncWithoutDetaching([$request->user_id]);

        return back()->with('success', 'Student succesvol toegevoegd aan groep!');
    }

    public function detachUser(string $id, string $userId)
    {
        $group = Group::findOrFail($id);

        $group->users()->detach($userId);

        return back()->with('success', 'Student succesvol verwijderd uit de groep!');
    }
}
