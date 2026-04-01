export type Submission = {
    id: number;
    user_id: number;
    exam_id: number;
    started_at: string | null;
    submitted_at: string | null;
    outdated: boolean;
    created_at: string;
    updated_at: string;
};
export interface RecentSubmission {
    id: number;
    studentName: string;
    examTitle: string;
    submittedAt: string;
}
