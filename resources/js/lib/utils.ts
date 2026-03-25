import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Role } from '@/enums/role';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function roleToReadableString(role: Role): string {
    switch (role) {
        case Role.Student:
            return 'Student';
        case Role.Teacher:
            return 'Docent';
        case Role.Admin:
            return 'Beheerder';
        default:
            return 'Niet gevonden';
    }
}

export function dateToReadableString(date: string): string {
    return new Date(date).toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
