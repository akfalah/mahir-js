import Link from 'next/link';
import { cn } from 'cn';

import { ArrowRight, BookOpen, Check, Circle, Lock, Play } from 'lucide-react';

import { CardStatus } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type LearningProgress = {
  completed: number;
  total: number;
  value: number;
};

type Props = {
  label: string;
  order: number;
  title: string;
  description: string;
  status?: CardStatus;
  href?: string;
  exploreLabel?: string;
  continueLabel?: string;
  reviewLabel?: string;
  lockedLabel?: string;
  progress?: LearningProgress;
  showBadgeIcon?: boolean;
  showIconRail?: boolean;
};

export function PublicTimelineCard({
  label,
  order,
  title,
  description,
  status,
  href = '#',
  exploreLabel = 'Explore',
  continueLabel = 'Continue Learning',
  reviewLabel = 'Review',
  lockedLabel = 'Complete Previous',
  progress,
  showBadgeIcon = false,
  showIconRail = true,
}: Props) {
  const statusConfig = {
    default: {
      icon: BookOpen,
      IconClassName: 'bg-primary/10 text-primary',
      badgeVariant: undefined,
      badgeText: null,
      buttonVariant: 'default' as const,
      buttonText: `${exploreLabel} ${label}`,
      disabled: false,
    },
    'in-progress': {
      icon: Play,
      IconClassName: 'bg-blue-100 text-blue-500',
      badgeVariant: 'tertiary' as const,
      badgeText: 'In Progress',
      buttonVariant: 'default' as const,
      buttonText: continueLabel,
      disabled: false,
    },
    completed: {
      icon: Check,
      IconClassName: 'bg-primary text-white',
      badgeVariant: 'default' as const,
      badgeText: 'Completed',
      buttonVariant: 'tertiary' as const,
      buttonText: `${reviewLabel} ${label}`,
      disabled: false,
    },
    locked: {
      icon: Lock,
      IconClassName: 'bg-neutral-500 text-neutral-100',
      badgeVariant: 'secondary' as const,
      badgeText: 'Locked',
      buttonVariant: 'secondary' as const,
      buttonText: `${lockedLabel} ${label}`,
      disabled: true,
    },
  }[status ?? 'default'];

  const Icon = statusConfig.icon;

  const card = (
    <Card
      className={cn(
        'h-fit w-full py-6',
        status === 'locked'
          ? 'opacity-75'
          : 'hover:translate-x-1 hover:-translate-y-1 transition-transform',
      )}
    >
      <CardHeader className='px-6'>
        <div className='flex items-center justify-between'>
          <p className='text-xs font-medium capitalize text-muted-foreground'>
            {label} {order}
          </p>

          {statusConfig.badgeText && (
            <Badge variant={statusConfig.badgeVariant}>
              {status === 'in-progress' && (
                <Circle className='size-3 fill-primary animate-pulse' />
              )}
              {showBadgeIcon &&
                (status === 'completed' || status === 'locked') && (
                  <Icon className='size-3' />
                )}
              {statusConfig.badgeText}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='px-6 flex flex-col gap-y-4'>
        <div className='flex flex-col gap-y-2'>
          <h3 className='text-base md:text-lg font-semibold'>{title}</h3>

          <div className='h-16'>
            <p className='line-clamp-3 text-xs md:text-sm'>{description}</p>
          </div>
        </div>

        {progress && (
          <div className='flex flex-col gap-y-2'>
            <span className='flex justify-end text-xs font-medium'>
              {progress.completed} of {progress.total}
            </span>

            <div className='flex items-center gap-x-3'>
              <Progress
                value={progress.value}
                className='h-2'
              />

              <span
                className={cn(
                  'text-xs font-medium',
                  statusConfig.disabled
                    ? 'text-muted-foreground'
                    : 'text-primary',
                )}
              >
                {progress.value}%
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className='p-6 flex items-center justify-end'>
        <Button
          asChild={Boolean(href) && !statusConfig.disabled}
          variant={statusConfig.buttonVariant}
          disabled={statusConfig.disabled}
          className='capitalize'
        >
          {href && !statusConfig.disabled ? (
            <Link href={href}>
              {statusConfig.buttonText}
              <ArrowRight />
            </Link>
          ) : (
            <>
              {statusConfig.buttonText}
              <ArrowRight />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  if (!showIconRail) return card;

  return (
    <div className='flex gap-x-4'>
      <div className='pb-3 flex flex-col items-center gap-y-3'>
        <div
          className={cn(
            'size-10 lg:size-12 flex items-center justify-center rounded-lg',
            statusConfig.IconClassName,
          )}
        >
          <Icon className='size-5 lg:size-6' />
        </div>
        <div className='h-60 lg:h-64 w-0.5 bg-border' />
      </div>

      {card}
    </div>
  );
}
