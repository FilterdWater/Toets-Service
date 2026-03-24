import { Form, Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Exam, User } from '@/types';
import { destroyGroup, groups, storeGroup, teacher } from '@/routes';
import { Group } from '@/types/group';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/delete-dialog';

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
    const [selectedGroup, setSelectedGroup] = useState<GroupOverviewProps | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <DeleteDialog
                title="Groep verwijderen"
                description={`Weet je zeker dat je de groep "${selectedGroup?.name}" wilt verwijderen?`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={() => {
                    if (!selectedGroup) return;

                    router.delete(destroyGroup.url({ id: selectedGroup.id }), {
                        onSuccess: () => {
                            setSelectedGroup(null);
                            setDeleteDialogOpen(false);
                        },
                    });
                }}
            />
            <Head title="Docent" />
            <Button onClick={() => setDialogOpen(true)}>Groep aanmaken</Button>
            <div className="flex h-full flex-1 flex-col md:flex-row gap-4 overflow-x-auto rounded-xl p-4">
                <div className="w-full md:w-1/2">
                    {groups.map((g) => {
                        return (
                            <Card
                                className="relative mb-3"
                                onClick={() => setSelectedGroup(g)}
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
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <CardTitle className="text-lg">
                                {selectedGroup?.name ?? 'Geen groep gekozen'}
                            </CardTitle>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={selectedGroup === null}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Verwijderen
                            </Button>
                        </CardHeader>
                        {selectedGroup !== null && (
                            <CardContent>
                                <CardTitle>Toetsen</CardTitle>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedGroup?.exams?.map((e) => (
                                        <Card key={e.id} className="p-2">
                                            {e.name}
                                        </Card>
                                    ))}
                                </div>
                                <CardTitle className="mt-6">
                                    Studenten
                                </CardTitle>
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
                        <DialogTitle>Groep aanmaken</DialogTitle>
                    </DialogHeader>

                    <Form
                        {...storeGroup.form()}
                        className="flex flex-col gap-6"
                        onSuccess={() => setDialogOpen(false)}
                    >
                        <Input
                            type="text"
                            name="name"
                            placeholder="Groep naam"
                            className="input input-bordered w-full"
                        />
                        <Button type="submit">Toevoegen</Button>
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
