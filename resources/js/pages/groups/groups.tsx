import { Form, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Exam, User } from '@/types';
import { groups, storeGroups, teacher } from '@/routes';
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
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Docent" />
            <Button onClick={() => setDialogOpen(true)}>Groep aanmaken</Button>
            <div className="flex h-full flex-1 flex-row gap-4 overflow-x-auto rounded-xl p-4">
                <div className="w-1/2">
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
                <div className="w-1/2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {selectedGroup?.name ?? 'Geen groep gekozen'}
                            </CardTitle>
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
                        {...storeGroups.form()}
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
