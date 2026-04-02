import { router, usePage } from '@inertiajs/react';
import { SaveAll, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    TooltipProvider,
    TooltipTrigger,
    Tooltip,
    TooltipContent,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import {
    createExam,
    exams,
    getExam,
    storeExam,
    updateExam,
    deleteExam,
} from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Exam } from '@/types/exam';
import type { Question } from '@/types/question';
import type { Section } from '@/types/section';

type examProps = {
    exam?: Exam | null;
    backUrl?: string | null;
};

// als het exam leeg is dan wordt het automatisch een creation page
//TODO de create pagina scheiden van de edit pagina dit moet gebeuren als er aan us-12-15 wordt gewerkt
export default function Exam({ exam, backUrl }: examProps) {
    const mode = exam ? 'edit' : 'create';
    const { errors } = usePage().props;
    //creates temp ID's for the sections and questions'
    const tempIdCounter = useRef(0);
    // the fakeID is negative since it could otherwise conflict with actual valid ID's :D
    function getTempId() {
        return tempIdCounter.current--;
    }

    useEffect(() => {
        if (errors) {
            Object.values(errors).forEach((error) => {
                toast.error(error);
            });
        }
    }, [errors]);

    const initialValues = useMemo(
        () => ({
            id: exam?.id || null,
            name: exam?.name || '',
            description: exam?.description || '',
            max_mistakes: exam?.max_mistakes || 0,
            sections: exam?.sections || [],
            created_at: exam?.created_at || '',
            updated_at: exam?.updated_at || '',
            globally_available: exam?.globally_available || false,
            active_from: exam ? new Date(exam?.active_from).toISOString() : '',
            active_until: exam
                ? new Date(exam?.active_until).toISOString()
                : '',
        }),
        [exam],
    );

    const [values, setValues] = useState(initialValues);

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [values, initialValues],
    );

    // USED FOR DEBUGGING DONT REMOVE FOR NOW
    // console.log('initialValues: ', JSON.stringify(initialValues));
    // console.log('values: ', JSON.stringify(values));
    // console.log('mode: ', mode);
    // console.log('exam: ', exam);

    const handleDiscard = () => {
        setValues(initialValues);
    };

    function handleSave() {
        //removes all the fake ID's from the sections
        const payload = {
            ...values,
            sections: values.sections.map((section) => ({
                ...section,
                id: isNaN(Number(section.id)) ? undefined : section.id,
            })),
        };

        console.log('payload: ', payload);

        if (exam) {
            router.put(updateExam.url(exam.id), payload);
        } else {
            router.post(storeExam.url(), payload);
        }
    }

    const handleDelete = () => {
        if (
            mode === 'edit' &&
            confirm('Weet je zeker dat je deze toets wilt verwijderen?')
        ) {
            router.delete(deleteExam.url(values.id!), {
                preserveScroll: true,
            });
        }
    };

    const handleDateChange = (range: DateRange | undefined) => {
        setValues((prev) => ({
            ...prev,
            active_from: range?.from?.toISOString() || '',
            active_until: range?.to?.toISOString() || '',
        }));
    };

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Toetsen',
            href: backUrl ?? exams(),
        },
        {
            title: exam ? exam.name : 'Nieuwe toets',
            href: exam ? getExam(exam.id) : createExam(),
        },
    ];

    function updateSection(
        sections: Section[],
        sectionIndex: number,
        updatedSection: Section | null,
    ) {
        if (updatedSection == null) {
            return sections.filter((_, i) => i !== sectionIndex);
        }

        const newSections = [...sections];
        newSections[sectionIndex] = updatedSection;
        return newSections;
    }

    function updateQuestion(
        sections: Section[],
        sectionIndex: number,
        questionIndex: number,
        updatedQuestion: Question,
    ) {
        const newSections = [...sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            questions: [...(newSections[sectionIndex].questions || [])],
        };
        newSections[sectionIndex].questions![questionIndex] = updatedQuestion;
        return newSections;
    }

    function handleAddSection() {
        const newSection: Section = {
            id: values.sections[values.sections.length - 1].id + 1, //fake ID this val can't be null
            name: '',
            sequence_nr: values.sections.length + 1,
            new_page: false,
            questions: [],
        };

        setValues((prev) => ({
            ...prev,
            sections: [...prev.sections, newSection],
        }));
    }

    function handleAddQuestion(sectionIndex: number) {
        const newQuestion: Question = {
            id: getTempId(), //fake ID, the ID can't be null.
            title: '',
            text: '',
            type: '',
            sequence_nr: values.sections[sectionIndex].questions?.length
                ? values.sections[sectionIndex].questions?.length + 1
                : 0,
        };

        setValues((prev) => {
            const sections = [...prev.sections];

            sections[sectionIndex] = {
                ...sections[sectionIndex],
                questions: [
                    ...(sections[sectionIndex].questions || []),
                    newQuestion,
                ],
            };

            return { ...prev, sections };
        });
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-row gap-6 p-4">
                    <div className="flex flex-9/12 flex-col gap-y-12">
                        {values.sections.map(
                            (section, sectionIndex: number) => (
                                <SectionCard
                                    key={section.id}
                                    section={section}
                                    errors={errors}
                                    index={sectionIndex}
                                    onChange={(updatedSection) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            sections: updateSection(
                                                prev.sections,
                                                sectionIndex,
                                                updatedSection,
                                            ),
                                        }))
                                    }
                                    onAddQuestion={() =>
                                        handleAddQuestion(sectionIndex)
                                    }
                                >
                                    {section.questions &&
                                        section.questions.map(
                                            (
                                                question,
                                                questionIndex: number,
                                            ) => (
                                                <QuestionCard
                                                    key={question.id}
                                                    question={question}
                                                    onChange={(
                                                        updatedQuestion,
                                                    ) =>
                                                        setValues((prev) => ({
                                                            ...prev,
                                                            sections:
                                                                updateQuestion(
                                                                    prev.sections,
                                                                    sectionIndex,
                                                                    questionIndex,
                                                                    updatedQuestion,
                                                                ),
                                                        }))
                                                    }
                                                />
                                            ),
                                        )}
                                </SectionCard>
                            ),
                        )}
                        <Button
                            className="w-full py-12"
                            variant="none"
                            onClick={handleAddSection}
                        >
                            + Voeg een nieuwe sectie toe
                        </Button>
                    </div>
                    <Card className="sticky top-4 h-fit flex-3/12 shadow-md">
                        <CardContent className="flex flex-col gap-4">
                            <Field>
                                <FieldLabel htmlFor="examtitle">
                                    Toets titel
                                </FieldLabel>
                                <Input
                                    id="examtitle"
                                    type="text"
                                    placeholder="Rekentoets"
                                    value={values.name}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
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
                                    placeholder="Beschrijving van de opdracht/toets"
                                    value={values.description}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
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
                                    from: values.active_from
                                        ? new Date(values.active_from)
                                        : undefined,
                                    to: values.active_until
                                        ? new Date(values.active_until)
                                        : undefined,
                                }}
                                onSelect={handleDateChange}
                                className="w-full"
                            />
                            <Field>
                                <FieldLabel htmlFor="maxmistakes">
                                    maximaal aantal fouten
                                </FieldLabel>
                                <Input
                                    id="maxmistakes"
                                    type="number"
                                    placeholder="8"
                                    value={values.max_mistakes}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            max_mistakes: Number(
                                                e.target.value,
                                            ),
                                        }))
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
                                    <div>Identificatiecode: {values.id}</div>
                                    <div>
                                        aangemaakt op: {values.created_at}
                                    </div>
                                    <div>
                                        laatst aangepast op: {values.updated_at}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        {mode === 'edit' && (
                            <CardFooter className="bg-muted/50">
                                <Button
                                    className="w-full"
                                    variant="destructive"
                                    disabled={mode !== 'edit'}
                                    onClick={handleDelete}
                                >
                                    <Trash2 /> Verwijderen
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </AppLayout>
            {/*should only be visible when something on the page has changed */}
            {/* diffrent text should be shown when its the creation page */}
            {isDirty && (
                <div className="sticky bottom-2.5 left-0 z-50 flex w-full justify-center">
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

interface SectionCardProps {
    section: Section;
    index: number;
    onChange: (updatedSection: Section | null) => void;
    children?: React.ReactNode;
    onAddQuestion: () => void;
    errors?: any;
}

export function SectionCard({
    section,
    index,
    onChange,
    children,
    onAddQuestion,
    errors,
}: SectionCardProps) {
    const getError = (field: string) => errors[`sections.${index}.${field}`];

    console.log('JA: ', errors);
    return (
        <Card className="shadow-md">
            <CardHeader className="flex flex-row justify-between">
                <div className="flex flex-row gap-2">
                    <Field className="w-16">
                        <Input
                            id="sequence_nr"
                            type="number"
                            placeholder="1"
                            value={section.sequence_nr}
                            onChange={(e) =>
                                onChange({
                                    ...section,
                                    sequence_nr: Number(e.target.value),
                                })
                            }
                        />
                    </Field>
                    <Field className="w-fit">
                        <Input
                            id="section_name"
                            type="text"
                            placeholder="sectie naam"
                            value={section.name}
                            onChange={(e) =>
                                onChange({ ...section, name: e.target.value })
                            }
                        />
                        {getError('name') && (
                            <FieldError>{getError('name')}</FieldError>
                        )}
                    </Field>
                    <div className="flex items-center space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                        <Switch
                                            id="section_available"
                                            checked={section.new_page}
                                            onCheckedChange={(checked) =>
                                                onChange({
                                                    ...section,
                                                    new_page: checked,
                                                })
                                            }
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Deze sectie start op een nieuwe pagina
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <Button variant="destructive" onClick={() => onChange(null)}>
                    <Trash2 /> Verwijderen
                </Button>
            </CardHeader>
            <Separator />
            <CardContent className="">
                <div className="flex flex-col gap-4">
                    {children}
                    <Button
                        className="w-fit self-center"
                        variant="default"
                        onClick={onAddQuestion}
                    >
                        + Voeg een nieuw vraag toe
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

interface QuestionCardProps {
    question: Question;
    onChange: (updatedQuestion: Question) => void;
}
export function QuestionCard({ question, onChange }: QuestionCardProps) {
    return (
        <Card>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div>{question.sequence_nr}</div>
                    <Field>
                        <FieldLabel htmlFor="question_title">
                            Vraag titel
                        </FieldLabel>
                        <Input
                            id="question_title"
                            type="text"
                            placeholder="Titel"
                            value={question.title}
                            onChange={(e) =>
                                onChange({
                                    ...question,
                                    title: e.target.value,
                                })
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="question_description">
                            Vraag beschrijving/uitleg
                        </FieldLabel>
                        <Textarea
                            id="question_description"
                            placeholder="Vraag beschrijving/uitleg"
                            value={question.text}
                            onChange={(e) =>
                                onChange({
                                    ...question,
                                    text: e.target.value,
                                })
                            }
                        />
                    </Field>
                </div>
            </CardContent>
        </Card>
    );
}

//TODO optioneel dndkit.com gebruiken voor drag en drop van sections
