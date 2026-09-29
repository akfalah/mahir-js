'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ChevronRight } from 'lucide-react';

import {
  fetchExerciseBySlug,
  fetchMaterialBySlug,
  fetchModuleBySlug,
} from '@/lib/fetch';

// Static segment -> label. `null` hides the segment from the trail.
const SEGMENT_LABELS: Record<string, string | null> = {
  modules: 'Curriculum',
  materials: 'Materials',
  exercises: 'Exercises',
};

// A segment right after one of these is a slug, resolved to a real title
const TITLE_RESOLVERS: Record<string, (slug: string) => Promise<string>> = {
  modules: async (slug) => (await fetchModuleBySlug(slug)).data.title,
  materials: async (slug) => (await fetchMaterialBySlug(slug)).data.title,
  exercises: async (slug) => (await fetchExerciseBySlug(slug)).data.title,
};

// Lives for the whole browser session, so navigating back doesn't refetch
const titleCache = new Map<string, string>();

type Crumb = {
  href: string;
  label: string; // fallback label, used until the real title loads
  slug?: string;
  resolve?: (slug: string) => Promise<string>;
};

function prettify(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const parent = segments[index - 1];
    const resolve = parent ? TITLE_RESOLVERS[parent] : undefined;

    if (resolve) {
      crumbs.push({ href, label: prettify(segment), slug: segment, resolve });
      return;
    }

    const label = SEGMENT_LABELS[segment];
    if (label === null) return;

    crumbs.push({ href, label: label ?? prettify(segment) });
  });

  return crumbs;
}

export function PublicBreadcrumb() {
  const pathname = usePathname();
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

  // Only used to trigger a re-render when a title arrives; the cache is the source of truth
  const [, setLoadedCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    crumbs.forEach(async ({ href, slug, resolve }) => {
      if (!slug || !resolve || titleCache.has(href)) return;

      try {
        titleCache.set(href, await resolve(slug));
        if (isActive) setLoadedCount((count) => count + 1);
      } catch {
        // keep the prettified slug as the label
      }
    });

    return () => {
      isActive = false;
    };
  }, [crumbs]);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label='Breadcrumb'>
      <ol className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground'>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const label = titleCache.get(crumb.href) ?? crumb.label;

          return (
            <li
              key={crumb.href}
              className='flex items-center gap-x-2'
            >
              {index > 0 && (
                <ChevronRight
                  className='size-4 shrink-0'
                  aria-hidden='true'
                />
              )}

              {isLast ? (
                <span
                  aria-current='page'
                  className='font-medium text-foreground'
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className='transition-colors hover:text-foreground'
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
