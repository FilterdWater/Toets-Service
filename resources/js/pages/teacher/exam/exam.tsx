import { router, usePage } from '@inertiajs/react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { BookOpenText, Plus, SaveAll, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { DeleteDialog } from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { createExam, getExam, storeExam, updateExam, deleteExam } from '@/routes';
import type { Answer, BreadcrumbItem } from '@/types';
import type { Exam } from '@/types/exam';
import type { Question } from '@/types/question';
import type { Section } from '@/types/section';

type ExamFormAction =
    | { type: 'SET_FIELD'; field: keyof ExamFormState; value: any }
    | { type: 'UPDATE_SECTION'; sectionIndex: number; section: Section | null }
    | {
          type: 'UPDATE_QUESTION';
          sectionIndex: number;
          questionIndex: number;
          question: Question | null;
      }
    | {
          type: 'UPDATE_ANSWER';
          sectionIndex: number;
          questionIndex: number;
          answerIndex: number;
          answer: Answer;
      }
    | {
          type: 'DELETE_ANSWER';
          sectionIndex: number;
          questionIndex: number;
          answerIndex: number;
      }
    | { type: 'ADD_SECTION' }
    | { type: 'ADD_QUESTION'; sectionIndex: number }
    | { type: 'ADD_ANSWER'; sectionIndex: number; questionIndex: number }
    | { type: 'RESET'; payload: ExamFormState };

type ExamFormState = {
    id: number | null;
    name: string;
    description: string;
    max_mistakes: number;
    sections: Section[];
    globally_available: boolean;
    active_from: string;
    active_until: string;
    created_at?: string;
    updated_at?: string;
};

type ExamProps = {
    exam?: Exam | null;
};

const initialState = (exam?: Exam | null): ExamFormState => ({
    id: exam?.id || null,
    name: exam?.name || '',
    description: exam?.description || '',
    max_mistakes: exam?.max_mistakes || 0,
    sections: exam?.sections || [],
    globally_available: exam?.globally_available || false,
    active_from: exam?.active_from
        ? new Date(exam.active_from).toISOString()
        : '',
    active_until: exam?.active_until
        ? new Date(exam.active_until).toISOString()
        : '',
    created_at: exam?.created_at,
    updated_at: exam?.updated_at,
});

function examReducer(
    state: ExamFormState,
    action: ExamFormAction,
): ExamFormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };

        case 'UPDATE_SECTION':
            if (action.section === null) {
                return {
                    ...state,
                    sections: state.sections.filter(
                        (_, i) => i !== action.sectionIndex,
                    ),
                };
            }
            return {
                ...state,
                sections: state.sections.map((section, i) =>
                    i === action.sectionIndex ? action.section! : section,
                ),
            };

        case 'UPDATE_QUESTION':
            return {
                ...state,
                sections: state.sections.map((section, sIdx) => {
                    if (sIdx !== action.sectionIndex) return section;

                    const questions = [...(section.questions || [])];
                    let updatedQuestion = action.question;

                    if (updatedQuestion) {
                        if (updatedQuestion.type === 'text') {
                            updatedQuestion = {
                                ...updatedQuestion,
                                answers: [],
                            };
                        } else if (updatedQuestion.type === 'single_choice') {
                            const currentAnswers =
                                updatedQuestion.answers || [];

                            let foundFirstCorrect = false;

                            const cleanedAnswers = currentAnswers.map(
                                (answer) => {
                                    if (
                                        answer.is_correct &&
                                        !foundFirstCorrect
                                    ) {
                                        foundFirstCorrect = true;
                                        return answer;
                                    }

                                    return { ...answer, is_correct: false };
                                },
                            );

                            updatedQuestion = {
                                ...updatedQuestion,
                                answers: cleanedAnswers,
                            };
                        }
                    }

                    if (updatedQuestion === null) {
                        questions.splice(action.questionIndex, 1);
                    } else {
                        questions[action.questionIndex] = updatedQuestion;
                    }

                    return { ...section, questions };
                }),
            };

        case 'UPDATE_ANSWER':
            return {
                ...state,
                sections: state.sections.map((section, sIdx) => {
                    if (sIdx !== action.sectionIndex) return section;

                    const questions = [...(section.questions || [])];
                    const question = questions[action.questionIndex];
                    if (!question) return section;

                    const currentAnswers = [...(question.answers || [])];
                    let newAnswers = currentAnswers.map((answer, idx) =>
                        idx === action.answerIndex ? action.answer : answer,
                    );

                    // Enforce single correct answer for single_choice
                    if (
                        question.type === 'single_choice' &&
                        action.answer.is_correct
                    ) {
                        newAnswers = newAnswers.map((answer, idx) =>
                            idx === action.answerIndex
                                ? { ...answer, is_correct: true }
                                : { ...answer, is_correct: false },
                        );
                    }

                    questions[action.questionIndex] = {
                        ...question,
                        answers: newAnswers,
                    };

                    return { ...section, questions };
                }),
            };

        case 'DELETE_ANSWER':
            return {
                ...state,
                sections: state.sections.map((section, sIdx) => {
                    if (sIdx !== action.sectionIndex) return section;

                    const questions = [...(section.questions || [])];
                    const question = questions[action.questionIndex];
                    if (!question) return section;

                    const newAnswers = (question.answers || []).filter(
                        (_, i) => i !== action.answerIndex,
                    );

                    questions[action.questionIndex] = {
                        ...question,
                        answers: newAnswers,
                    };

                    return { ...section, questions };
                }),
            };

        case 'ADD_SECTION': {
            const newSection: Section = {
                id: Date.now(), // Temporary ID
                name: '',
                sequence_nr: state.sections.length + 1,
                new_page: false,
                questions: [],
            };

            return {
                ...state,
                sections: [...state.sections, newSection],
            };
        }

        case 'ADD_QUESTION': {
            const newQuestion: Question = {
                id: -Date.now(), // Temporary negative ID
                title: '',
                text: '',
                type: '',
                sequence_nr:
                    (state.sections[action.sectionIndex]?.questions?.length ??
                        0) + 1,
            };

            return {
                ...state,
                sections: state.sections.map((section, sIdx) =>
                    sIdx === action.sectionIndex
                        ? {
                              ...section,
                              questions: [
                                  ...(section.questions || []),
                                  newQuestion,
                              ],
                          }
                        : section,
                ),
            };
        }

        case 'ADD_ANSWER': {
            const newAnswer: Answer = {
                id: -Date.now(),
                answer_option: '',
                is_correct: false,
                question_id:
                    state.sections[action.sectionIndex]?.questions?.[
                        action.questionIndex
                    ]?.id ?? -Date.now(),
                sequence_nr:
                    (state.sections[action.sectionIndex]?.questions?.[
                        action.questionIndex
                    ]?.answers?.length ?? 0) + 1,
            };

            return {
                ...state,
                sections: state.sections.map((section, sIdx) => {
                    if (sIdx !== action.sectionIndex) return section;

                    const questions = [...(section.questions || [])];
                    const question = questions[action.questionIndex];

                    if (!question) return section;

                    const answers = [...(question.answers || []), newAnswer];
                    questions[action.questionIndex] = { ...question, answers };

                    return { ...section, questions };
                }),
            };
        }

        case 'RESET':
            return action.payload;

        default:
            return state;
    }
}

export default function Exam({ exam }: ExamProps) {
    const mode = exam ? 'edit' : 'create';
    const { errors } = usePage().props;

    const [state, dispatch] = useReducer(examReducer, exam, initialState);
    const [originalState, setOriginalState] = useState(initialState(exam));

    const isDirty = useMemo(() => {
        return JSON.stringify(state) !== JSON.stringify(originalState);
    }, [state, originalState]);

    console.log('originalState: ', originalState);
    console.log('state: ', state);

    useEffect(() => {
        if (errors) {
            Object.values(errors).forEach((error: any) => {
                toast.error(error);
            });
        }
    }, [errors]);

    const handleDateChange = (range: DateRange | undefined) => {
        dispatch({
            type: 'SET_FIELD',
            field: 'active_from',
            value: range?.from?.toISOString() || '',
        });
        dispatch({
            type: 'SET_FIELD',
            field: 'active_until',
            value: range?.to?.toISOString() || '',
        });
    };

    const handleSave = () => {
        // Remove temp (negative) IDs before sending
        const payload = {
            ...state,
            sections: state.sections.map((section) => ({
                ...section,
                id: section.id && section.id < 0 ? undefined : section.id,
                questions: (section.questions || []).map((question) => ({
                    ...question,
                    id:
                        question.id && question.id < 0
                            ? undefined
                            : question.id,
                })),
            })),
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOriginalState(state);
            },
        };

        if (mode === 'edit' && state.id) {
            router.put(updateExam.url(state.id), payload, options);
        } else {
            router.post(storeExam.url(), payload, options);
        }
    };

    const handleDiscard = () => {
        dispatch({ type: 'RESET', payload: initialState(exam) });
    };

    const handleDelete = () => {
        if (mode === 'edit' && state.id) {
            router.delete(deleteExam.url(state.id), { preserveScroll: true });
        }
    };

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Exam', href: exam ? getExam(exam.id).url : '' },
        {
            title: exam ? exam.name : 'Nieuwe toets',
            href: exam ? getExam(exam.id) : createExam(),
        },
    ];

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-row gap-6 p-4">
                    {/* Section Cards */}
                    <div className="flex flex-9/12 flex-col gap-y-10">
                        {state.sections.map((section, sectionIndex) => (
                            <SectionCard
                                key={section.id}
                                section={section}
                                index={sectionIndex}
                                errors={errors}
                                onChange={(updatedSection) =>
                                    dispatch({
                                        type: 'UPDATE_SECTION',
                                        sectionIndex,
                                        section: updatedSection,
                                    })
                                }
                                onAddQuestion={() =>
                                    dispatch({
                                        type: 'ADD_QUESTION',
                                        sectionIndex,
                                    })
                                }
                            >
                                {section.questions?.map(
                                    (question, questionIndex) => (
                                        <QuestionCard
                                            key={question.id}
                                            question={question}
                                            onChange={(updatedQuestion) =>
                                                dispatch({
                                                    type: 'UPDATE_QUESTION',
                                                    sectionIndex,
                                                    questionIndex,
                                                    question: updatedQuestion,
                                                })
                                            }
                                            onAddAnswer={() =>
                                                dispatch({
                                                    type: 'ADD_ANSWER',
                                                    sectionIndex,
                                                    questionIndex,
                                                })
                                            }
                                            onAnswerChange={(
                                                answerIndex,
                                                updatedAnswer,
                                            ) =>
                                                dispatch({
                                                    type: 'UPDATE_ANSWER',
                                                    sectionIndex,
                                                    questionIndex,
                                                    answerIndex,
                                                    answer: updatedAnswer,
                                                })
                                            }
                                            onDeleteAnswer={(answerIndex) =>
                                                dispatch({
                                                    type: 'DELETE_ANSWER',
                                                    sectionIndex,
                                                    questionIndex,
                                                    answerIndex,
                                                })
                                            }
                                        />
                                    ),
                                )}
                            </SectionCard>
                        ))}
                        <Button
                            className="mb-20 w-full py-12"
                            variant="none"
                            onClick={() => dispatch({ type: 'ADD_SECTION' })}
                        >
                            <Plus /> Voeg een nieuwe sectie toe
                        </Button>
                    </div>
                    {/* Sidebar */}
                    <Card className="sticky top-4 h-fit flex-3/12 shadow-md">
                        <CardContent className="flex flex-col gap-4">
                            <Field>
                                <FieldLabel htmlFor="examtitle">
                                    Toets titel
                                </FieldLabel>
                                <Input
                                    id="examtitle"
                                    value={state.name}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'SET_FIELD',
                                            field: 'name',
                                            value: e.target.value,
                                        })
                                    }
                                />
                                {errors.name && (
                                    <FieldError>{errors.name}</FieldError>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="testdescription">
                                    Toets beschrijving
                                </FieldLabel>
                                <Textarea
                                    id="testdescription"
                                    value={state.description}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'SET_FIELD',
                                            field: 'description',
                                            value: e.target.value,
                                        })
                                    }
                                />
                                {errors.description && (
                                    <FieldError>
                                        {errors.description}
                                    </FieldError>
                                )}
                            </Field>
                            <DatePickerWithRange
                                label="Toets periode"
                                selected={{
                                    from: state.active_from
                                        ? new Date(state.active_from)
                                        : undefined,
                                    to: state.active_until
                                        ? new Date(state.active_until)
                                        : undefined,
                                }}
                                onSelect={handleDateChange}
                                className="w-full"
                            />
                            <Field>
                                <FieldLabel htmlFor="maxmistakes">
                                    Maximaal aantal fouten
                                </FieldLabel>
                                <Input
                                    id="maxmistakes"
                                    type="number"
                                    value={state.max_mistakes}
                                    onChange={(e) =>
                                        dispatch({
                                            type: 'SET_FIELD',
                                            field: 'max_mistakes',
                                            value: Number(e.target.value),
                                        })
                                    }
                                />
                                {errors.max_mistakes && (
                                    <FieldError>
                                        {errors.max_mistakes}
                                    </FieldError>
                                )}
                            </Field>
                            {mode === 'edit' && (
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <div>Identificatiecode: {state.id}</div>
                                    <div>Aangemaakt op: {state.created_at}</div>
                                    <div>
                                        Laatst aangepast op: {state.updated_at}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        {mode === 'edit' && (
                            <CardFooter className="bg-muted/50">
                                <Button
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 /> Verwijderen
                                </Button>
                                <DeleteDialog
                                    title="Groep verwijderen"
                                    description={`Weet je zeker dat je de toets "${state.name}" wilt verwijderen ?`}
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                    onConfirm={() => handleDelete}
                                />
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </AppLayout>

            {isDirty && (
                <div className="fixed bottom-2.5 left-0 z-50 flex w-full justify-center">
                    <div className="bg-accent/50">
                        <div className="flex w-fit gap-2.5 rounded-lg border p-3 shadow-lg">
                            <Button
                                variant="destructive"
                                onClick={handleDiscard}
                            >
                                <Trash2 /> Wijzigingen weggooien
                            </Button>
                            <Button variant="default" onClick={handleSave}>
                                <SaveAll /> Wijzigingen opslaan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function SectionCard({
    section,
    index,
    onChange,
    children,
    onAddQuestion,
    errors,
}: {
    section: Section;
    index: number;
    onChange: (updatedSection: Section | null) => void;
    children?: React.ReactNode;
    onAddQuestion: () => void;
    errors?: any;
}) {
    const getError = (field: string) => errors?.[`sections.${index}.${field}`];

    return (
        <Card className="gap-0 pt-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-muted py-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Field className="w-20">
                            <Input
                                type="number"
                                value={section.sequence_nr}
                                onChange={(e) =>
                                    onChange({
                                        ...section,
                                        sequence_nr: Number(e.target.value),
                                    })
                                }
                            />
                        </Field>
                    </TooltipTrigger>
                    <TooltipContent>Sectie volgorde</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Field>
                            <Input
                                type="text"
                                placeholder="sectie naam"
                                value={section.name}
                                onChange={(e) =>
                                    onChange({
                                        ...section,
                                        name: e.target.value,
                                    })
                                }
                            />
                            {getError('name') && (
                                <FieldError>{getError('name')}</FieldError>
                            )}
                        </Field>
                    </TooltipTrigger>
                    <TooltipContent>Sectie titel</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <CheckboxPrimitive.Root
                            checked={section.new_page}
                            onCheckedChange={(checked) =>
                                onChange({
                                    ...section,
                                    new_page: Boolean(checked),
                                })
                            }
                            className={cn(
                                'flex items-center justify-center rounded-md border border-input p-2 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:border-primary',
                                section.new_page
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <BookOpenText className="size-5" />
                        </CheckboxPrimitive.Root>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Deze sectie start op een nieuwe pagina</p>
                    </TooltipContent>
                </Tooltip>
                <Button variant="destructive" onClick={() => onChange(null)}>
                    <Trash2 /> Verwijderen
                </Button>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
                <div className="flex flex-col gap-6">
                    {/*TODO mischien toch ipv questionCards een seperator er tussen zetten*/}
                    {children}
                    <Button
                        className="w-fit self-center"
                        variant="default"
                        onClick={onAddQuestion}
                    >
                        <Plus /> Voeg een nieuw vraag toe
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function QuestionCard({
    question,
    onChange,
    onAddAnswer,
    onAnswerChange,
    onDeleteAnswer,
}: {
    question: Question;
    onChange: (updatedQuestion: Question | null) => void;
    onAddAnswer: () => void;
    onAnswerChange: (answerIndex: number, updatedAnswer: Answer) => void;
    onDeleteAnswer: (answerIndex: number) => void;
}) {
    return (
        <Card>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Field className="w-16">
                                    <Input
                                        type="number"
                                        value={question.sequence_nr}
                                        onChange={(e) =>
                                            onChange({
                                                ...question,
                                                sequence_nr: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                    />
                                </Field>
                            </TooltipTrigger>
                            <TooltipContent>Vraag volgorde</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Field>
                                    <Input
                                        value={question.title}
                                        onChange={(e) =>
                                            onChange({
                                                ...question,
                                                title: e.target.value,
                                            })
                                        }
                                    />
                                </Field>
                            </TooltipTrigger>
                            <TooltipContent>Vraag titel</TooltipContent>
                        </Tooltip>
                        <Button
                            variant="destructive"
                            onClick={() => onChange(null)}
                        >
                            <Trash2 />
                        </Button>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="question_description">
                            Vraag beschrijving/uitleg
                        </FieldLabel>
                        <Textarea
                            value={question.text}
                            rows={3}
                            onChange={(e) =>
                                onChange({ ...question, text: e.target.value })
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Vraagtype</FieldLabel>
                        <Select
                            value={question.type}
                            onValueChange={(value) => {
                                onChange({
                                    ...question,
                                    type: value,
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Vraag type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="single_choice">
                                        Meerkeuze (één antwoord)
                                    </SelectItem>
                                    <SelectItem value="multiple_choice">
                                        Meerkeuze meervoudig (meerdere
                                        antwoorden)
                                    </SelectItem>
                                    <SelectItem value="text">
                                        Open vraag
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    {(question.type === 'single_choice' ||
                        question.type === 'multiple_choice') && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <FieldLabel>Antwoordopties</FieldLabel>
                                <Button variant="default" onClick={onAddAnswer}>
                                    <Plus /> Antwoord toevoegen
                                </Button>
                            </div>
                            {(question.answers || []).map(
                                (answer, answerIndex) => (
                                    <MultipleChoiceOption
                                        key={answer.id || answerIndex}
                                        answer={answer}
                                        onChange={(updated) =>
                                            onAnswerChange(answerIndex, updated)
                                        }
                                        onDelete={() =>
                                            onDeleteAnswer(answerIndex)
                                        }
                                    />
                                ),
                            )}
                            {(question.answers || []).length === 0 && (
                                <p className="text-sm text-muted-foreground italic">
                                    Nog geen antwoordopties toegevoegd.
                                </p>
                            )}
                        </div>
                    )}
                    {question.type === 'text' && <OpenAnswerOption />}
                </div>
            </CardContent>
        </Card>
    );
}

function MultipleChoiceOption({
    answer,
    onChange,
    onDelete,
}: {
    answer: Answer;
    onChange: (updatedAnswer: Answer) => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex items-center justify-center gap-3">
            <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 size={16} />
            </Button>
            <Field orientation="horizontal" className="w-fit">
                <Checkbox
                    id={`correct-${answer.id}`}
                    className="size-8"
                    name="is correct answer"
                    checked={Boolean(answer.is_correct)}
                    onCheckedChange={(checked) =>
                        onChange({ ...answer, is_correct: Boolean(checked) })
                    }
                />
            </Field>
            <Field>
                <Input
                    value={answer.answer_option}
                    placeholder="Antwoord tekst..."
                    onChange={(e) =>
                        onChange({ ...answer, answer_option: e.target.value })
                    }
                />
            </Field>
        </div>
    );
}

export function OpenAnswerOption() {
    return (
        <Card>
            <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
                <p>
                    Dit is een <strong>vrij in te vullen</strong>
                    vraag.
                    <br />
                    De leerling kan hier een eigen tekst invullen.
                </p>
                <p className="text-xs">
                    Er worden geen vooraf gedefinieerde antwoordopties gebruikt.
                </p>
            </CardContent>
        </Card>
    );
}
//TODO validation errors toevoegen
//TODO responsive maken
