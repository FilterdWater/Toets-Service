import { Head, router, usePage } from '@inertiajs/react';
import {
    ImportIcon,
    UserRoundPlus,
    UserRoundPen,
    UserRoundX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Table,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dateToReadableString, roleToReadableString } from '@/lib/utils';
import type { RoleFilter } from '@/pages/admin/components/rol-selector';
import RolSelector, {
    SelectorMode,
} from '@/pages/admin/components/rol-selector';
import { accountCreate, accounts } from '@/routes';
import type { BreadcrumbItem, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: accounts(),
    },
];

type AccountsPageProps = {
    users: User[];
};

export default function Account() {
    const { users } = usePage<AccountsPageProps>().props;
    const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');

    const filteredUsers = useMemo(() => {
        if (selectedRole === 'all') {
            return users;
        }

        return users.filter((user) => user.role === selectedRole);
    }, [selectedRole, users]);

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            rightContent={
                <>
                    <div className="hidden gap-2 md:flex">
                        <Button>
                            <ImportIcon /> Importeer account(s)
                        </Button>
                        <Button
                            onClick={() => router.visit(accountCreate.url())}
                        >
                            <UserRoundPlus /> Creëer account
                        </Button>
                    </div>
                    <div className="block md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Importeer of Creëer
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup className="flex flex-col gap-2 p-2">
                                    <DropdownMenuItem asChild>
                                        <Button>
                                            <ImportIcon /> Importeer account(s)
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Button
                                            onClick={() =>
                                                router.visit(
                                                    accountCreate.url(),
                                                )
                                            }
                                        >
                                            <UserRoundPlus /> Creëer account
                                        </Button>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            }
        >
            <Head title="Account" />
            <div className="flex h-full flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Naam</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="flex items-center gap-2">
                                Rol
                                <RolSelector
                                    value={selectedRole}
                                    placeholder="Filter op rol"
                                    mode={SelectorMode.Filter}
                                    onValueChange={setSelectedRole}
                                />
                            </TableHead>
                            <TableHead>Gemaakt op</TableHead>
                            <TableHead>Laatst bijgewerkt op</TableHead>
                            <TableHead>Acties</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role}>
                                        {roleToReadableString(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono tabular-nums">
                                    {dateToReadableString(user.created_at)}
                                </TableCell>
                                <TableCell className="font-mono tabular-nums">
                                    {dateToReadableString(user.updated_at)}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button>
                                        <UserRoundPen /> Wijzig
                                    </Button>
                                    <Button>
                                        <UserRoundX /> Deactiveer
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
