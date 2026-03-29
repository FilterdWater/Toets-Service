import { Question } from "./question";

export type Section = {
    id: number;
    name: string;
    new_page: boolean;
    sequence_nr: number;
    exam_id: number;
    created_at: string;
    updated_at: string;
    questions?: Question[];
};
