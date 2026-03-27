<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ApplicationStatisticsController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/application-statistics');
    }
}
