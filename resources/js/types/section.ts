import type { Question } from './question';

export type Section = {
    id: number;
    name: string;
    new_page: boolean; //makes it so that the section is on a new page (sections are on the same page by default)
    sequencenr: number; // order of the sections in the exam
    questions?: Question[];
};
