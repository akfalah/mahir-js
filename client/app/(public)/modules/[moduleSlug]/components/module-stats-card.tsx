'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { fetchMaterialProgress } from '@/lib/fetch';
import { useAuthStore } from '@/stores/use-auth-store';

import { MaterialSummary } from '@/types';

type Props = {
  materials: MaterialSummary[];
};

type Stats = {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
};

function StatRow({ label, count }: { label: string; count?: number }) {
  return (
    <div className='flex items-center justify-between text-xs font-medium'>
      <span>{label}</span>
      <span>{count !== undefined ? count : '–'}</span>
    </div>
  );
}

function GuestStatsCta({ total }: { total: number }) {
  return (
    <Card className='relative overflow-hidden py-6 gap-y-6'>
      <div
        aria-hidden
        className='pointer-events-none select-none blur-sm opacity-50'
      >
        <CardHeader className='px-6'>
          <CardTitle className='text-2xl font-semibold'>Module Stats</CardTitle>
        </CardHeader>

        <CardContent className='px-6 flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-3'>
            <StatRow
              label='Total Materials'
              count={total}
            />
            <StatRow
              label='Completed'
              count={0}
            />
            <StatRow
              label='Remaining'
              count={total}
            />
          </div>

          <div className='flex flex-col gap-y-3'>
            <div className='flex items-center justify-between text-xs font-medium'>
              <span className='text-xs font-normal'>Module Progress</span>
              <span className='text-sm font-medium text-primary'>0%</span>
            </div>

            <Progress value={0} />
          </div>
        </CardContent>
      </div>

      <div className='absolute inset-0 flex flex-col items-center justify-center gap-y-3 bg-background/60 p-6 text-center'>
        <div className='flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
          <Lock className='size-6' />
        </div>

        <p className='max-w-56 text-xs lg:text-sm font-medium text-muted-foreground'>
          Sign in to track your progress through this module
        </p>

        <div className='flex gap-x-2'>
          <Button
            asChild
            variant='outline'
          >
            <Link href='/sign-in'>Sign In</Link>
          </Button>

          <Button
            asChild
          >
            <Link href='/sign-up'>Sign Up</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StudentModuleStatsCard({ materials }: Props) {
  const { token } = useAuthStore();

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchMaterialProgress(token)
      .then((res) => {
        if (!isActive) return;

        const materialIds = new Set(materials.map((m) => m.id));
        const completed = res.data.filter(
          (progress) =>
            progress.isCompleted && materialIds.has(progress.materialId),
        ).length;
        const total = materials.length;

        setStats({
          total,
          completed,
          remaining: total - completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch module stats:', error);
      });

    return () => {
      isActive = false;
    };
  }, [token, materials]);

  return (
    <Card className='py-6 gap-y-6'>
      <CardHeader className='px-6'>
        <CardTitle className='text-2xl font-semibold'>Module Stats</CardTitle>
      </CardHeader>

      <CardContent className='px-6 flex flex-col gap-y-6'>
        <div className='flex flex-col gap-y-3'>
          <StatRow
            label='Total Materials'
            count={stats?.total}
          />
          <StatRow
            label='Completed'
            count={stats?.completed}
          />
          <StatRow
            label='Remaining'
            count={stats?.remaining}
          />
        </div>

        <div className='flex flex-col gap-y-3'>
          <div className='flex items-center justify-between text-xs font-medium'>
            <span className='text-xs font-normal'>Module Progress</span>
            <span className='text-sm font-medium text-primary'>
              {stats?.percentage ?? 0}%
            </span>
          </div>

          <Progress value={stats?.percentage ?? 0} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ModuleStatsCard({ materials }: Props) {
  const { user, hasHydrated } = useAuthStore();

  if (!hasHydrated) return null;

  if (!user) return <GuestStatsCta total={materials.length} />;

  if (user.role !== 'STUDENT') return null;

  return <StudentModuleStatsCard materials={materials} />;
}
