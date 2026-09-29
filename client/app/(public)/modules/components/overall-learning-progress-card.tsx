'use client';

import { useEffect, useState } from 'react';

import {
  Label,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';

import { OverviewProgress } from '@/types';

import { useAuthStore } from '@/stores/use-auth-store';

import { fetchOverviewProgress } from '@/lib/fetch';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  value: { label: 'Progress' },
} satisfies ChartConfig;

function ProgressRing({ value }: { value: number }) {
  const chartData = [{ name: 'progress', value, fill: 'var(--primary)' }];

  return (
    <ChartContainer
      config={chartConfig}
      className='shrink-0 aspect-square size-31'
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={-360}
        innerRadius={50}
        outerRadius={60}
      >
        <PolarGrid
          gridType='circle'
          radialLines={false}
          stroke='none'
          className='first:fill-muted last:fill-background'
          polarRadius={[60, 50]}
        />

        <PolarAngleAxis
          type='number'
          domain={[0, 100]}
          tick={false}
        />

        <RadialBar
          dataKey='value'
          background
          cornerRadius={10}
        />

        <PolarRadiusAxis
          tick={false}
          tickLine={false}
          axisLine={false}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor='middle'
                    dominantBaseline='middle'
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className='fill-foreground text-base font-semibold'
                    >
                      {value}%
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}

function StatRow({
  label,
  count,
}: {
  label: string;
  count?: { completed: number; total: number };
}) {
  return (
    <div className='flex items-center justify-between text-xs font-medium'>
      <span>{label}</span>

      <span>{count ? `${count.completed} / ${count.total}` : '–'}</span>
    </div>
  );
}

export function OverallLearningProgressCard() {
  const { token } = useAuthStore();

  const [overview, setOverview] = useState<OverviewProgress | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchOverviewProgress(token)
      .then((res) => {
        if (isActive)
          setOverview(Array.isArray(res.data) ? res.data[0] : res.data);
      })
      .catch((error) => {
        console.error('Failed to fetch progress overview:', error);
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <Card className='py-6 gap-y-6'>
      <CardHeader className='px-6'>
        <CardTitle className='text-2xl font-semibold'>
          Overall Learning Progress
        </CardTitle>
      </CardHeader>

      <CardContent className='px-6 flex gap-x-4'>
        <ProgressRing value={overview?.percentage ?? 0} />

        <div className='flex-1 py-3 flex flex-col gap-y-3'>
          <StatRow
            label='Module(s)'
            count={overview?.modules}
          />
          <StatRow
            label='Material(s)'
            count={overview?.materials}
          />
          <StatRow
            label='Exercise(s)'
            count={overview?.exercises}
          />
        </div>
      </CardContent>
    </Card>
  );
}
