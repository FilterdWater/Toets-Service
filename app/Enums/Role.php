<?php

namespace App\Enums;

enum Role: string
{
    case Student = 'student';
    case Docent = 'teacher';
    case Beheerder = 'admin';
}
