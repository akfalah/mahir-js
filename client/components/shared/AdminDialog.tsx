import { ComponentProps } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

type ButtonVariant = ComponentProps<typeof Button>['variant'];

type Props = {
  open: boolean;
  title: string;
  description: string;
  isDeleting?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export default function AdminDialog({
  open,
  title,
  description,
  isDeleting = false,
  confirmLabel = 'Delete',
  loadingLabel = 'Deleting...',
  confirmVariant = 'destructive',
  onConfirm,
  onOpenChange,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className='rounded-2xl sm:max-w-md'
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <Separator />

          <DialogDescription className='leading-relaxed'>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='gap-2 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type='button'
            variant={confirmVariant}
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting && <Spinner />}
            {isDeleting ? loadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
