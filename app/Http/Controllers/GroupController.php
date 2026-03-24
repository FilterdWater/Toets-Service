<?php

namespace App\Http\Controllers;

use App\Models\Group;
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
        return Inertia::render('groups/groups', [
            'groups' => $groups
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
        if (!Group::find($id)) {
            return redirect()->route('groups')->with('error', 'Groep niet gevonden!');
        }

        Group::findOrFail($id)->users()->detach();
        Group::findOrFail($id)->exams()->detach();
        Group::destroy($id);

        return redirect()->route('groups')->with('success', 'Groep succesvol verwijderd!');
    }
}
