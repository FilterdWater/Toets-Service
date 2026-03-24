import { Textarea } from '@headlessui/react';
import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { getexam, storeexam, updateexam } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Exam } from '@/types/exam';

type Props = {
    exam?: Exam | null;
};
// als het exam leeg is dan wordt het automatisch een creation page
export default function ExamPage({ exam }: Props) {
    const mode = exam ? 'edit' : 'create';
    const { errors } = usePage().props;
    console.error('errors: ', errors);
    console.log("exam: ", exam);

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
        }),
        [exam],
    );

    const [values, setValues] = useState(initialValues);

    // console.log('values: ', JSON.stringify(values));
    // console.log('initialValues: ', JSON.stringify(initialValues));

    const isDirty = useMemo(
        () => JSON.stringify(values) !== JSON.stringify(initialValues),
        [values, initialValues],
    );

    const handleDiscard = () => {
        setValues(initialValues);
    };

    const handleSave = () => {
        if (exam) {
            console.log("PUT");
            router.put(updateexam.url(exam.id), values);
        } else {
            console.log('POST');
            router.post(storeexam.url(), values);
        }
    };

    const deleteExam = () => {
        if (mode === 'edit' && confirm('Are you sure you want to delete?')) {
            router.delete(getexam.url(values.id!), {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Exam',
            href: exam ? getexam(exam.id).url : '',
        },
    ];

    console.log('mode: ', mode);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-row gap-4 p-4">
                    <div className="flex-9/12">
                        <div className="rounded-xl border bg-accent">
                            Voeg een niuewe sectie toe
                        </div>
                    </div>
                    <div className="flex flex-3/12 flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
                        <Field>
                            <FieldLabel htmlFor="examtitle">
                                Toets tietel
                            </FieldLabel>
                            <Input
                                id="examtitle"
                                type="text"
                                placeholder="rekentoets"
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
                                placeholder="beschrijving van de opdracht/toets"
                                className="resize-none"
                                value={values.description}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />
                            {errors.description && (
                                <FieldError>{errors.description}</FieldError>
                            )}
                        </Field>
                        <DatePickerWithRange />
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
                                        max_mistakes: Number(e.target.value),
                                    }))
                                }
                            />
                            {errors.max_mistakes && (
                                <FieldError>{errors.max_mistakes}</FieldError>
                            )}
                        </Field>
                        {mode === 'edit' && (
                            <>
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <div>Identificatiecode: {values.id}</div>
                                    <div>
                                        aangemaakt op: {values.created_at}
                                    </div>
                                    <div>
                                        laatst aangepast op: {values.updated_at}
                                    </div>
                                </div>
                                <Button
                                    variant="destructive"
                                    disabled={mode !== 'edit'}
                                    onClick={deleteExam}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>
            {/*should only be visible when something on the page has changed */}
            {/* diffrent text should be shown when its the creation page */}
            {isDirty && (
                <div className="absolute bottom-2.5 left-0 z-50 flex w-full justify-center">
                    <div className="flex w-fit gap-2.5 rounded-lg border p-2.5 shadow-sm">
                        <Button variant="destructive" onClick={handleDiscard}>
                            Wijzigingen weggooien
                        </Button>
                        <Button variant="default" onClick={handleSave}>
                            Wijzigingen opslaan
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
