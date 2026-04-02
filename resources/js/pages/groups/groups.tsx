import { Head, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeleteDialog } from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import {
    attachExam,
    attachUser,
    destroyGroup,
    detachUser,
    groups,
    storeGroup,
    teacher,
    updateGroup,
    detachExam as detachExamRoute,
} from '@/routes';
import type { BreadcrumbItem, Exam, User, Group } from '@/types';

type GroupOverviewProps = Group & {
    users: User[];
    users_count: number;
    exams?: Exam[];
};

type GroupProps = {
    groups: GroupOverviewProps[];
    students?: User[];
    exams?: Exam[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Docent',
        href: teacher.url(),
    },
    {
        title: 'Groepen',
        href: groups.url(),
    },
];

export default function Groups({ groups, students, exams }: GroupProps) {
    const [selectedGroup, setSelectedGroup] =
        useState<GroupOverviewProps | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogStudentOpen, setDialogStudentOpen] = useState<boolean>(false);
    const [dialogExamsOpen, setDialogExamsOpen] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
    const [loadingExams, setLoadingExams] = useState<boolean>(true);
    const [sheetOpen, setSheetOpen] = useState<boolean>(false);

    const groupForm = useForm({
        name: '',
    });

    const studentForm = useForm({
        user_id: '',
    });

    const examForm = useForm({
        exam_id: '',
    });

    useEffect(() => {
        if (dialogStudentOpen && (!students || students.length === 0)) {
            router.reload({
                only: ['students'],
                onFinish: () => {
                    setLoadingStudents(false);
                },
            });
        }
    }, [dialogStudentOpen, students]);

    useEffect(() => {
        if (dialogExamsOpen && (!exams || exams.length === 0)) {
            router.reload({
                only: ['exams'],
                onFinish: () => {
                    setLoadingExams(false);
                },
            });
        }
    }, [dialogExamsOpen, exams]);

    const detachStudent = (userId: number) => {
        if (!selectedGroup) return;

        studentForm.delete(
            detachUser.url({ group: selectedGroup.id, user: userId }),
            {
                onSuccess: (page: any) => {
                    const updatedGroup = page.props.groups.find(
                        (g: GroupOverviewProps) => g.id === selectedGroup.id,
                    );
                    if (updatedGroup) setSelectedGroup(updatedGroup);
                },
            },
        );
    };

    const detachExam = (examId: number) => {
        if (!selectedGroup) return;

        examForm.delete(
            detachExamRoute.url({ group: selectedGroup.id, exam: examId }),
            {
                onSuccess: (page: any) => {
                    const updatedGroup = page.props.groups.find(
                        (g: GroupOverviewProps) => g.id === selectedGroup.id,
                    );
                    if (updatedGroup) setSelectedGroup(updatedGroup);
                },
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            rightContent={
                <Button
                    onClick={() => {
                        groupForm.reset();
                        setIsEditing(false);
                        setDialogOpen(true);
                    }}
                >
                    <Plus /> Groep aanmaken
                </Button>
            }
        >
            <DeleteDialog
                title="Groep verwijderen"
                description={`Weet je zeker dat je de groep "${selectedGroup?.name}" wilt verwijderen?`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={() => {
                    if (!selectedGroup) return;

                    groupForm.delete(
                        destroyGroup.url({ id: selectedGroup.id }),
                        {
                            onSuccess: () => {
                                setSelectedGroup(null);
                                setDeleteDialogOpen(false);
                            },
                        },
                    );
                }}
            />
            <Head title="Docent" />
            <div className="grid-cols flex h-full flex-1 flex-col gap-4 overflow-auto rounded-xl p-4 md:flex-row">
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {groups.map((g) => {
                        return (
                            <Card
                                className="relative mb-3"
                                key={g.id}
                                onClick={() => {
                                    if (selectedGroup?.id === g.id) {
                                        setSelectedGroup(null);
                                        setSheetOpen(false);
                                    } else {
                                        setSelectedGroup(g);
                                        setSheetOpen(true);
                                    }
                                }}
                            >
                                {selectedGroup?.id === g.id ? (
                                    <ChevronRight className="absolute top-3 right-3" />
                                ) : (
                                    <ChevronDown className="absolute top-3 right-3" />
                                )}

                                <CardHeader>
                                    <CardTitle>{g.name}</CardTitle>
                                </CardHeader>

                                <CardFooter>
                                    Aantal studenten: {g.users_count}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent className="w-[90vw] max-w-250! overflow-auto px-5 pb-6">
                        <SheetHeader className="mt-8 -ml-4 flex flex-row items-center justify-between">
                            <SheetTitle className="text-2xl">
                                {selectedGroup?.name ?? 'Geen groep gekozen'}
                            </SheetTitle>

                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    disabled={selectedGroup === null}
                                    onClick={() => {
                                        groupForm.setData(
                                            'name',
                                            selectedGroup?.name ?? '',
                                        );
                                        setIsEditing(true);
                                        setDialogOpen(true);
                                    }}
                                >
                                    Bewerken
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={selectedGroup === null}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    Verwijderen
                                </Button>
                            </div>
                        </SheetHeader>

                        {selectedGroup && (
                            <div className="mt-4 space-y-6">
                                {/* Toetsen */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            Toetsen
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setDialogExamsOpen(true)
                                            }
                                        >
                                            <Plus />
                                        </Button>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedGroup.exams?.map((e) => (
                                            <div
                                                key={e.id}
                                                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1"
                                            >
                                                <span className="text-sm">
                                                    {e.name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        detachExam(e.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        ))}

                                        {selectedGroup.exams?.length === 0 &&
                                            'Geen data'}
                                    </div>
                                </div>

                                {/* Studenten */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            Studenten
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                setDialogStudentOpen(true)
                                            }
                                        >
                                            <Plus />
                                        </Button>
                                    </div>

                                    <div className="mt-2 space-y-2">
                                        {selectedGroup.users.map((u) => (
                                            <div
                                                key={u.id}
                                                className="flex items-center justify-between rounded border p-2"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {u.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {u.email}
                                                    </p>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        detachStudent(u.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        {selectedGroup.users.length === 0 &&
                                            'Geen data'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
            <Dialog
                open={dialogExamsOpen}
                onOpenChange={setDialogExamsOpen}
                modal
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Examen toewijzen aan groep</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (!selectedGroup) return;

                            examForm.post(
                                attachExam.url({ id: selectedGroup.id }),
                                {
                                    onSuccess: (page: any) => {
                                        const updatedGroup =
                                            page.props.groups.find(
                                                (g: GroupOverviewProps) =>
                                                    g.id === selectedGroup.id,
                                            );

                                        if (updatedGroup)
                                            setSelectedGroup(updatedGroup);

                                        setDialogExamsOpen(false);
                                        examForm.reset();
                                    },
                                },
                            );
                        }}
                        className="flex flex-col gap-4"
                    >
                        {loadingExams ? (
                            <p>Laden...</p>
                        ) : (
                            <Select
                                value={examForm.data.exam_id?.toString() || ''}
                                onValueChange={(value: string) =>
                                    examForm.setData('exam_id', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecteer Examen" />
                                </SelectTrigger>

                                <SelectContent>
                                    {exams?.map((exam) => (
                                        <SelectItem
                                            key={exam.id}
                                            value={String(exam.id)}
                                        >
                                            {exam.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Button type="submit" disabled={examForm.processing}>
                            Examen toewijzen aan groep
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog
                open={dialogStudentOpen}
                onOpenChange={setDialogStudentOpen}
                modal
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Student toewijzen aan groep</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (!selectedGroup) return;

                            studentForm.post(
                                attachUser.url({ id: selectedGroup.id }),
                                {
                                    onSuccess: (page: any) => {
                                        const updatedGroup =
                                            page.props.groups.find(
                                                (g: GroupOverviewProps) =>
                                                    g.id === selectedGroup.id,
                                            );
                                        if (updatedGroup)
                                            setSelectedGroup(updatedGroup);

                                        setDialogStudentOpen(false);
                                        studentForm.reset();
                                    },
                                },
                            );
                        }}
                        className="flex flex-col gap-4"
                    >
                        {loadingStudents ? (
                            <p>Laden...</p>
                        ) : (
                            <Select
                                value={
                                    studentForm.data.user_id?.toString() || ''
                                }
                                onValueChange={(value: string) =>
                                    studentForm.setData('user_id', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecteer student" />
                                </SelectTrigger>

                                <SelectContent>
                                    {students?.map((student) => (
                                        <SelectItem
                                            key={student.id}
                                            value={String(student.id)}
                                        >
                                            {student.name} ({student.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Button type="submit" disabled={studentForm.processing}>
                            Student toewijzen aan groep
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Groep bewerken' : 'Groep aanmaken'}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (isEditing && selectedGroup) {
                                groupForm.put(
                                    updateGroup.url({ id: selectedGroup.id }),
                                    {
                                        onSuccess: () => {
                                            setDialogOpen(false);
                                            setSelectedGroup(null);
                                            groupForm.reset();
                                        },
                                    },
                                );
                            } else {
                                groupForm.post(storeGroup.url(), {
                                    onSuccess: () => {
                                        setDialogOpen(false);
                                        groupForm.reset();
                                    },
                                });
                            }
                        }}
                        className="flex flex-col gap-6"
                    >
                        <Input
                            type="text"
                            name="name"
                            value={groupForm.data.name}
                            onChange={(e) =>
                                groupForm.setData('name', e.target.value)
                            }
                            placeholder="Groep naam"
                            className="input input-bordered w-full"
                        />
                        <Button type="submit" disabled={groupForm.processing}>
                            {isEditing ? 'Bijwerken' : 'Toevoegen'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
