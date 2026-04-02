<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()->orderBy('updated_at', 'desc');

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        return Inertia::render('admin/accounts', [
            'users' => $query->paginate(10)->withQueryString(),
            'selectedRole' => $request->input('role', 'all'),
        ]);
    }

    public function showCreate(Request $request): Response
    {
        return Inertia::render('admin/account-create', [
            'backUrl' => $this->resolveBackUrl($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => [
                'required',
                'email',
                'unique:users',
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:student,teacher,admin'],
        ]);

        unset($validated['password_confirmation']);

        User::create($validated + ['is_active' => true]);

        return redirect()->route('accounts')->with('success', 'Account succesful aangemaakt.');
    }

    public function import(Request $request): RedirectResponse
    {
        // Validate the upload payload before touching the filesystem.
        $request->validate([
            'csv' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        // The uploaded CSV file.
        $file = $request->file('csv');
        if ($file === null) {
            return redirect()->route('accounts')->withErrors([
                'csv' => 'CSV file is verplicht.',
            ]);
        }

        // Open the CSV for line-by-line parsing.
        $handle = fopen($file->getRealPath(), 'r');
        if ($handle === false) {
            return redirect()->route('accounts')->withErrors([
                'csv' => 'CSV file is niet leesbaar.',
            ]);
        }

        // Read the header row which defines the column positions.
        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);

            return redirect()->route('accounts')->withErrors([
                'csv' => 'CSV header row is verplicht.',
            ]);
        }

        // Normalize header values (trim/lowercase) and convert common separators
        // to underscores so we can map columns reliably.
        $header = array_map(
            static fn (?string $value): string => Str::of($value ?? '')
                ->trim()
                ->lower()
                ->replace(['-', ' '], '_')
                ->value(),
            $header,
        );

        // Map canonical column names to their CSV indexes.
        $columnIndexes = [
            'name' => null,
            'email' => null,
            'password' => null,
            'role' => null,
        ];

        // Discover indexes for each supported header.
        foreach ($header as $index => $column) {
            if ($column === '') {
                continue;
            }

            switch ($column) {
                case 'name':
                case 'naam':
                    $columnIndexes['name'] = (int) $index;
                    break;
                case 'email':
                case 'mail':
                case 'e_mail':
                case 'e-mail':
                    $columnIndexes['email'] = (int) $index;
                    break;
                case 'password':
                case 'wachtwoord':
                    $columnIndexes['password'] = (int) $index;
                    break;
                case 'role':
                case 'rol':
                    $columnIndexes['role'] = (int) $index;
                    break;
                default:
                    break;
            }
        }

        // Ensure all required columns exist before processing rows.
        foreach (['name', 'email', 'password', 'role'] as $requiredKey) {
            if ($columnIndexes[$requiredKey] === null) {
                fclose($handle);

                return redirect()->route('accounts')->withErrors([
                    'csv' => 'CSV mist vereiste kolom: '.$requiredKey.'.',
                ]);
            }
        }

        // Parse all data rows into a normalized structure that we can validate later.
        $rows = [];
        $rowNumber = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $rowNumber++;

            // Skip empty lines.
            if ($data === [null] || $data === false) {
                continue;
            }

            if (count($data) === 0) {
                continue;
            }

            // Extract the canonical columns for this row.
            $row = [
                'name' => $data[$columnIndexes['name']] ?? null,
                'email' => $data[$columnIndexes['email']] ?? null,
                'password' => $data[$columnIndexes['password']] ?? null,
                'role' => $data[$columnIndexes['role']] ?? null,
            ];

            $normalizedRole = strtolower(trim((string) ($row['role'] ?? '')));
            $row['role'] = match ($normalizedRole) {
                'student' => 'student',
                'docent' => 'teacher',
                'beheerder' => 'admin',
                default => $normalizedRole,
            };

            $row['password_confirmation'] = $row['password'];

            $rows[] = [
                'row_number' => $rowNumber,
                'data' => $row,
            ];
        }

        fclose($handle);

        // Prevent importing duplicates inside the same CSV file.
        $emails = [];
        foreach ($rows as $rowEntry) {
            $email = strtolower(trim((string) $rowEntry['data']['email']));
            if ($email === '') {
                continue;
            }
            $emails[$email] = ($emails[$email] ?? 0) + 1;
        }

        $duplicateEmails = array_keys(
            array_filter($emails, static fn ($count): bool => $count > 1),
        );

        // If duplicates exist, return a single `csv` error with email list.
        if ($duplicateEmails !== []) {
            return redirect()->route('accounts')->withErrors([
                'email' => 'Dubbele emails in CSV: '.implode(', ', $duplicateEmails).'.',
            ]);
        }

        // Row validation rules (must match the create/store rules).
        $rules = [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => [
                'required',
                'email',
                'unique:users',
                'regex:/^.+@.+\\..+$/',
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:student,teacher,admin'],
        ];

        // Collect the first validation error set (to show the user quickly).
        $failedErrors = null;

        foreach ($rows as $rowEntry) {
            $validator = Validator::make($rowEntry['data'], $rules);
            if ($validator->fails()) {
                $failedErrors = array_map(
                    static fn (string $message): string => 'Row '.$rowEntry['row_number'].': '.$message,
                    $validator->errors()->all(),
                );
                break;
            }
        }

        // Return validation feedback back to the UI.
        if ($failedErrors !== null) {
            return redirect()->route('accounts')->withErrors([
                'csv' => implode("\n", $failedErrors),
            ]);
        }

        // Create users inside a transaction for consistency.
        DB::transaction(function () use ($rows): void {
            foreach ($rows as $rowEntry) {
                $data = $rowEntry['data'];
                unset($data['password_confirmation']);
                User::create($data + ['is_active' => true]);
            }
        });

        return redirect()->route('accounts')->with(
            'success',
            count($rows).' accounts geïmporteerd.',
        );
    }

    public function showEdit(Request $request, string $id): Response
    {
        return Inertia::render('admin/account-edit', [
            'user' => User::findOrFail($id),
            'backUrl' => $this->resolveBackUrl($request),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'in:student,teacher,admin'],
        ]);
        $user->update($validated);

        return redirect()->route('accounts')->with('success', 'Account succesful bijgewerkt.');
    }

    public function resetPassword(Request $request, string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        unset($validated['password_confirmation']);

        $user->update($validated);

        return redirect()->route('accounts')->with('success', 'Wachtwoord succesful reset.');
    }

    public function updateIsActive(Request $request, string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update(['is_active' => $validated['is_active']]);

        return redirect()->back()->with('success', $validated['is_active'] ? 'Account succesful geactiveerd.' : 'Account succesful gedeactiveerd.');
    }
}
