import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';

import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];
type ButtonVariant = ComponentProps<typeof Button>['variant'];

type LearningBadge = {
  label: string;
  variant?: BadgeVariant;
};

type LearningProgress = {
  completed: number;
  total: number;
  value: number;
  label: string;
};

type Props = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  primaryBadge: LearningBadge;
  secondaryBadge?: LearningBadge;
  icon?: ReactNode;
  actionVariant?: ButtonVariant;
  progress?: LearningProgress;
};

export default function PublicLearningCard({
  title,
  description,
  href,
  actionLabel,
  primaryBadge,
  secondaryBadge,
  icon,
  actionVariant = 'default',
  progress,
}: Props) {
  return (
    <Card className='group flex h-full flex-col shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'>
      <CardContent className='flex flex-1 flex-col gap-y-5 p-4 md:p-5'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex flex-wrap gap-2'>
            <Badge
              variant={primaryBadge.variant ?? 'outline'}
              className='rounded-full'
            >
              {primaryBadge.label}
            </Badge>

            {secondaryBadge && (
              <Badge
                variant={secondaryBadge.variant ?? 'secondary'}
                className='rounded-full'
              >
                {secondaryBadge.label}
              </Badge>
            )}
          </div>

          {icon && (
            <div className='flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              {icon}
            </div>
          )}
        </div>

        <div className='flex flex-col gap-y-2'>
          <h3 className='text-lg font-bold tracking-tight transition-colors group-hover:text-primary'>
            {title}
          </h3>

          <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
            {description}
          </p>
        </div>

        {progress && (
          <div className='flex flex-col gap-y-2 rounded-2xl bg-muted/40 p-3'>
            <div className='flex items-center justify-between gap-4 text-xs'>
              <span className='text-muted-foreground'>
                {progress.completed} of {progress.total} {progress.label}
              </span>

              <span className='font-medium'>{progress.value}%</span>
            </div>

            <Progress value={progress.value} />
          </div>
        )}
      </CardContent>

      <CardFooter className='p-4 md:p-5'>
        <Button
          asChild
          variant={actionVariant}
          className='w-full gap-2'
        >
          <Link href={href}>
            {actionLabel}
            <ArrowRight className='size-4' />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
