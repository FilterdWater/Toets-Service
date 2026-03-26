import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Role } from '@/enums/role';

export type RoleFilter = 'all' | Role.Admin | Role.Teacher | Role.Student;

export enum SelectorMode {
    Filter,
    Select,
}

type RolSelectorProps = {
    value: RoleFilter | Role | undefined;
    placeholder?: string;
    mode: SelectorMode;
    onValueChange: (value: RoleFilter | Role) => void;
};

export default function RolSelector({
    value,
    placeholder,
    mode,
    onValueChange,
}: RolSelectorProps) {
    return (
        <Select
            value={value}
            onValueChange={(newValue) =>
                onValueChange(newValue as RoleFilter | Role)
            }
        >
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {mode === SelectorMode.Filter && (
                    <SelectItem value="all">Alle</SelectItem>
                )}
                <SelectItem value={Role.Admin}>Beheerder</SelectItem>
                <SelectItem value={Role.Teacher}>Docent</SelectItem>
                <SelectItem value={Role.Student}>Student</SelectItem>
            </SelectContent>
        </Select>
    );
}
