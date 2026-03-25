import { Head, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DeleteDialog } from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
                    Groep aanmaken
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-auto rounded-xl p-4 md:flex-row">
                <div className="w-full md:w-1/2">
                    {groups.map((g) => {
                        return (
                            <Card
                                className="relative mb-3"
                                key={g.id}
                                onClick={() =>
                                    setSelectedGroup(
                                        selectedGroup?.id === g.id ? null : g,
                                    )
                                }
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
                <div className="w-full md:w-1/2">
                    <Card className="md:fixed md:w-[40%]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">
                                {selectedGroup?.name ?? 'Geen groep gekozen'}
                            </CardTitle>
                            <div>
                                <Button
                                    size="sm"
                                    className="mr-2"
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
                        </CardHeader>
                        {selectedGroup !== null && (
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Toetsen</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => setDialogExamsOpen(true)}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedGroup?.exams?.map((e) => (
                                        <div
                                            key={e.id}
                                            className="flex items-center justify-between gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-900 shadow-sm transition-colors hover:bg-blue-100"
                                        >
                                            <span className="text-sm font-medium">
                                                {e.name}
                                            </span>
                                            <button
                                                onClick={() => detachExam(e.id)}
                                                className="rounded-full p-1 transition-colors hover:bg-red-100"
                                                title="Verwijderen"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedGroup?.exams?.length === 0 &&
                                        'Geen data gevonden'}
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <CardTitle>Studenten</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            setDialogStudentOpen(true)
                                        }
                                    >
                                        +
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Naam</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Verwijderen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedGroup?.users?.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>{u.name}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            detachStudent(u.id)
                                                        }
                                                    >
                                                        Verwijderen
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {selectedGroup?.users.length === 0 && (
                                            <TableCell>
                                                Geen data gevonden
                                            </TableCell>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        )}
                    </Card>
                </div>
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
