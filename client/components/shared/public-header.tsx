import * as React from 'react';
import { cn } from 'cn';

export function PublicHeader({
  title,
  paragraph,
  badges,
  badgePosition = 'side',
}: {
  title: string;
  paragraph: string;
  badges?: React.ReactNode;
  badgePosition?: 'side' | 'top';
}) {
  return (
    <section className='flex flex-col gap-y-4'>
      <div
        className={cn(
          'flex gap-4',
          badgePosition === 'side' ? 'flex-row' : 'flex-col',
        )}
      >
        {badges && (
          <div
            className={cn(
              'flex items-center gap-x-3',
              badgePosition === 'side' ? 'order-2' : 'order-1',
            )}
          >
            {badges}
          </div>
        )}

        <h1
          className={cn(
            'text-3xl lg:text-4xl font-bold',
            badgePosition === 'side' ? 'order-1' : 'order-2',
          )}
        >
          {title}
        </h1>
      </div>

      <p className='text-xs lg:text-sm font-medium text-justify text-muted-foreground'>
        {paragraph}
      </p>
    </section>
  );
}
