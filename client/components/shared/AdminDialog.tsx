import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';

type Props = {
  open: boolean;
  title: string;
  description: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export default function AdminDeleteDialog({
  open,
  title,
  description,
  isDeleting = false,
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
            variant='destructive'
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
