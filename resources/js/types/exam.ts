import type { Group } from './group';
import type { Section } from './section';
import type { Submission } from './submission';

export type Exam = {
    id: number;
    name: string;
    description: string;
    active_from: string;
    active_until: string;
    globally_available: boolean;
    max_mistakes: number;
    created_at: string;
    updated_at: string;
    submitted_at?: string | null;
    sections?: Section[];
    groups?: Group[];
    submissions?: Submission[];
};

export type PaginatedExams = {
    data: Exam[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};
