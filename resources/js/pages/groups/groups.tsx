import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    destroyGroup,
    groups,
    storeGroup,
    teacher,
    updateGroup,
} from '@/routes';
import type { BreadcrumbItem, Exam, User, Group } from '@/types';

type GroupOverviewProps = Group & {
    users: User[];
    users_count: number;
    exams?: Exam[];
};

type GroupProps = {
    groups: GroupOverviewProps[];
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

export default function Groups({ groups }: GroupProps) {
    const [selectedGroup, setSelectedGroup] =
        useState<GroupOverviewProps | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    const {
        data,
        setData,
        processing,
        post,
        put,
        delete: deleteMethod,
        reset,
    } = useForm({
        name: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <DeleteDialog
                title="Groep verwijderen"
                description={`Weet je zeker dat je de groep "${selectedGroup?.name}" wilt verwijderen?`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={() => {
                    if (!selectedGroup) return;

                    deleteMethod(destroyGroup.url({ id: selectedGroup.id }), {
                        onSuccess: () => {
                            setSelectedGroup(null);
                            setDeleteDialogOpen(false);
                        },
                    });
                }}
            />
            <Head title="Docent" />
            <Button
                onClick={() => {
                    reset();
                    setIsEditing(false);
                    setDialogOpen(true);
                }}
            >
                Groep aanmaken
            </Button>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:flex-row">
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
                    <Card>
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
                                        setData(
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
                                        onClick={() => console.log('Add exam')}
                                    >
                                        +
                                    </Button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedGroup?.exams?.map((e) => (
                                        <Card key={e.id} className="p-2">
                                            {e.name}
                                        </Card>
                                    ))}
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <CardTitle>Studenten</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            console.log('Add student')
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedGroup?.users?.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>{u.name}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
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
                                put(updateGroup.url({ id: selectedGroup.id }), {
                                    onSuccess: () => {
                                        setDialogOpen(false);
                                        setSelectedGroup(null);
                                        reset();
                                    },
                                });
                            } else {
                                post(storeGroup.url(), {
                                    onSuccess: () => {
                                        setDialogOpen(false);
                                        reset();
                                    },
                                });
                            }
                        }}
                        className="flex flex-col gap-6"
                    >
                        <Input
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Groep naam"
                            className="input input-bordered w-full"
                        />
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Bijwerken' : 'Toevoegen'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
