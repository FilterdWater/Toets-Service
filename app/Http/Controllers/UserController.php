<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/accounts', [
            'users' => User::all(),
        ]);
    }

    public function showCreate()
    {
        return Inertia::render('admin/account-create');
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

        User::create($validated);

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
                'csv' => 'CSV file is required.',
            ]);
        }

        // Open the CSV for line-by-line parsing.
        $handle = fopen($file->getRealPath(), 'r');
        if ($handle === false) {
            return redirect()->route('accounts')->withErrors([
                'csv' => 'Unable to read CSV file.',
            ]);
        }

        // Read the header row which defines the column positions.
        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);

            return redirect()->route('accounts')->withErrors([
                'csv' => 'CSV header row is missing.',
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

            if (in_array($column, ['name', 'naam'], true)) {
                $columnIndexes['name'] = (int) $index;
            } elseif (in_array($column, ['email', 'mail', 'e_mail'], true)) {
                $columnIndexes['email'] = (int) $index;
            } elseif (in_array($column, ['password', 'wachtwoord'], true)) {
                $columnIndexes['password'] = (int) $index;
            } elseif (in_array($column, ['role', 'rol'], true)) {
                $columnIndexes['role'] = (int) $index;
            }
        }

        // Ensure all required columns exist before processing rows.
        foreach (['name', 'email', 'password', 'role'] as $requiredKey) {
            if ($columnIndexes[$requiredKey] === null) {
                fclose($handle);

                return redirect()->route('accounts')->withErrors([
                    'csv' => 'CSV missing required column: '.$requiredKey.'.',
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
                'email' => 'Duplicate emails in CSV: '.implode(', ', $duplicateEmails).'.',
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
                User::create($data);
            }
        });

        return redirect()->route('accounts')->with(
            'success',
            count($rows).' accounts geïmporteerd.',
        );
    }
}
