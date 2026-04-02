import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, LockIcon, SaveIcon } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import type { Role } from '@/enums/role';
import AppLayout from '@/layouts/app-layout';
import RolSelector, {
    SelectorMode,
} from '@/pages/admin/components/rol-selector';
import {
    accounts,
    accountEdit,
    accountResetPassword,
    accountUpdate,
    accountUpdateIsActive,
} from '@/routes';
import type { BreadcrumbItem, User } from '@/types';

type AccountEditProps = {
    user: User;
    backUrl?: string | null;
};

export default function AccountEdit({ user, backUrl }: AccountEditProps) {
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [activeProcessing, setActiveProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Accounts',
            href: backUrl ?? accounts(),
        },
        {
            title: 'Wijzig account',
            href: accountEdit(user.id),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role as Role,
        is_active: Boolean(user.is_active),
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const { data: activeData, setData: setActiveData } = useForm({
        is_active: Boolean(user.is_active),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Creëer account" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <Heading
                        variant="small"
                        title="Wijzig account"
                        description="Wijzig een bestaande account"
                    />
                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            put(accountUpdate.url(user.id));
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <Label>Rol</Label>
                            <RolSelector
                                value={data.role as Role}
                                placeholder="Selecteer een rol"
                                mode={SelectorMode.Select}
                                onValueChange={(value) =>
                                    setData(
                                        'role',
                                        value === 'all'
                                            ? (user.role as Role)
                                            : value,
                                    )
                                }
                            />
                            <InputError message={errors.role} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Naam</Label>
                                <Input
                                    name="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Email</Label>
                            <Input
                                name="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="flex gap-3">
                            <Button disabled={processing}>
                                {(processing && <Spinner />) || <SaveIcon />}
                                Wijzigingen opslaan
                            </Button>
                        </div>

                        {/* Reset Password Button */}
                        <div className="flex flex-col gap-3">
                            <Heading
                                variant="small"
                                title="Wachtwoord"
                                description="Wijzig het wachtwoord van de gebruiker"
                            />
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => setIsPasswordOpen(true)}
                                >
                                    <LockIcon />
                                    Wachtwoord wijzigen
                                </Button>
                            </div>
                        </div>

                        {/* Active Switch */}
                        <div className="flex flex-col gap-3">
                            <Heading
                                variant="small"
                                title="Account activiteit"
                                description="Wijzig de activiteit van de gebruiker"
                            />
                            <div className="flex gap-3">
                                <Switch
                                    size="lg"
                                    checked={activeData.is_active}
                                    disabled={activeProcessing}
                                    onCheckedChange={(checked) => {
                                        setActiveData('is_active', checked);
                                        setActiveProcessing(true);
                                        router.put(
                                            accountUpdateIsActive.url(user.id),
                                            { is_active: checked },
                                            {
                                                preserveScroll: true,
                                                onFinish: () =>
                                                    setActiveProcessing(false),
                                            },
                                        );
                                    }}
                                />
                                <Badge
                                    variant={
                                        activeData.is_active
                                            ? 'active'
                                            : 'destructive'
                                    }
                                >
                                    {activeData.is_active
                                        ? 'Actief'
                                        : 'Inactief'}
                                </Badge>
                            </div>
                        </div>
                    </form>
                    <Button variant="outline" className="mt-4 w-full" asChild>
                        <Link href={backUrl ?? accounts()}>
                            <ArrowLeftIcon />
                            Terug naar accounts
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Reset Password Dialog */}
            <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset wachtwoord</DialogTitle>
                        <DialogDescription>
                            Hieronder kun je het wachtwoord van de gebruiker
                            resetten.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">
                            Nieuw wachtwoord
                        </Label>
                        <Input
                            name="password"
                            type="password"
                            value={passwordData.password}
                            onChange={(event) =>
                                setPasswordData('password', event.target.value)
                            }
                        />
                        <InputError message={passwordErrors?.password} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">
                            Nieuw wachtwoord bevestigen
                        </Label>
                        <Input
                            name="password_confirmation"
                            type="password"
                            value={passwordData.password_confirmation}
                            onChange={(event) =>
                                setPasswordData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError
                            message={passwordErrors?.password_confirmation}
                        />
                    </div>
                    <div className="space-y-4">
                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                                type="button"
                                disabled={passwordProcessing}
                                onClick={() =>
                                    putPassword(
                                        accountResetPassword.url(user.id),
                                    )
                                }
                            >
                                {passwordProcessing && <Spinner />}
                                Reset wachtwoord
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
