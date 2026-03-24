import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export function DeleteDialog({
    title,
    description,
    open,
    onOpenChange,
    onConfirm,
}: {
    title: string;
    description: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </DialogHeader>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuleren
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Verwijderen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}