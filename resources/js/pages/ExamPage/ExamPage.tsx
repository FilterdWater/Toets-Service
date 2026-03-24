import { Textarea } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { exam as examRoute } from '@/routes';
import type { BreadcrumbItem } from '@/types';


type pageMode = "edit" | "create" | "view";

// als het exam leeg is dan wordt het automatisch een creation page
export default function ExamPage({exam}: {exam: any}) {
    const pageModus: pageMode = exam ? "edit" : "create";

    console.log(exam);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Exam',
            href: pageModus === 'edit' ? examRoute(exam.id).url : '',
        },
    ];

    const deleteExam = (examId: number) => {
        router.delete(examRoute.url(examId), {
            preserveScroll: true,
        });
    }

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
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="testdescription">
                                Toets beschrijving
                            </FieldLabel>
                            <Textarea
                                id="testdescription"
                                placeholder="beschrijving van de opdracht/toets"
                                className="resize-none"
                            />
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
                            />
                        </Field>

                        {pageModus === 'edit' && (
                            <>
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <div>toets identificatiecode:</div>
                                    <div>aangemaakt op:</div>
                                    <div>laatst aangepast op:</div>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteExam(exam?.id)}
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
            <div className="absolute bottom-2.5 left-0 z-50 flex w-full justify-center">
                <div className="flex w-fit gap-2.5 rounded-lg border p-2.5 shadow-sm">
                    <Button variant="destructive">Wijzigingen weggooien</Button>
                    <Button variant="default">Wijzigingen opslaan</Button>
                </div>
            </div>
        </>
    );
}
