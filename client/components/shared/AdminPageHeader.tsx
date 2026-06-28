import { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function AdminPageHeader({ title, description, action }: Props) {
  return (
    <div className='flex flex-col gap-y-4 border-b p-5 md:p-6 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-col gap-y-2'>
        <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
          {title}
        </h1>

        <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground'>
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}
