import { Head, Link, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Role } from '@/enums/role';
import AppLayout from '@/layouts/app-layout';
import RolSelector, {
    SelectorMode,
} from '@/pages/admin/components/rol-selector';
import { accounts, accountCreate } from '@/routes';
import { accountStore } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function AccountCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Accounts',
            href: accounts(),
        },
        {
            title: 'Creëer account',
            href: accountCreate(),
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Creëer account" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <Heading
                        variant="small"
                        title="Creëer account"
                        description="Creëer een nieuw account voor een gebruiker"
                    />
                    <form
                        className="space-y-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            post(accountStore.url());
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <Label>Rol</Label>
                            <RolSelector
                                value={data.role as Role}
                                placeholder="Selecteer een rol"
                                mode={SelectorMode.Select}
                                onValueChange={(value) =>
                                    setData('role', value)
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
                        <div className="flex flex-col gap-2">
                            <Label>Wachtwoord</Label>
                            <Input
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Wachtwoord bevestigen</Label>
                            <Input
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Creëer account
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={accounts()}>
                                    Annuleren
                                </Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
