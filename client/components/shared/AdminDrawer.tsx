import { ReactNode } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type Props = {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export default function AdminDrawer({
  open,
  title,
  description,
  children,
  onOpenChange,
}: Props) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction='right'
    >
      <DrawerContent className='inset-x-auto bottom-auto right-0 top-0 flex h-dvh max-h-dvh w-full max-w-2xl flex-col overflow-hidden rounded-none border-l p-0'>
        <DrawerHeader className='shrink-0 border-b'>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
