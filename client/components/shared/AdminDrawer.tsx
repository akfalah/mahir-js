import { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type DrawerSize = 'md' | 'lg' | 'xl' | 'full';

type Props = {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
  size?: DrawerSize;
  className?: string;
  onOpenChange: (open: boolean) => void;
};

const drawerWidth: Record<DrawerSize, string> = {
  md: 'min(100vw, 36rem)',
  lg: 'min(100vw, 48rem)',
  xl: 'min(100vw, 72rem)',
  full: '100vw',
};

export default function AdminDrawer({
  open,
  title,
  description,
  children,
  size = 'md',
  className,
  onOpenChange,
}: Props) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction='right'
    >
      <DrawerContent
        className={cn(
          'right-0 top-0 flex h-dvh max-h-dvh flex-col overflow-hidden rounded-none border-l p-0',
          className,
        )}
        style={
          {
            width: drawerWidth[size],
            maxWidth: '100vw',
          } as CSSProperties
        }
      >
        <DrawerHeader className='shrink-0 border-b'>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
