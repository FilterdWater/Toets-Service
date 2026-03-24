export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role: Role;
    [key: string]: unknown;
};

export enum Role {
    Student = 'student',
    Teacher = 'teacher',
    Admin = 'admin',
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

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
