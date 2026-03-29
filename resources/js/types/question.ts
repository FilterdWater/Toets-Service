import { Answer } from "./answer";

export type Question = {
    id: number;
    title: string;
    text: string;
    type: string;
    sequence_nr: number;
    section_id: number;
    created_at: string;
    updated_at: string;
    answers?: Answer[];
};
