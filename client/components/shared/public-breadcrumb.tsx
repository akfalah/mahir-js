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

const titleCache = new Map<string, string>();

type Crumb = {
  href: string;
  label: string;
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

  if (segments[0] !== 'modules') {
    // Fallback for routes outside this nested tree — prettify each segment
    return segments.map((segment, index) => ({
      href: '/' + segments.slice(0, index + 1).join('/'),
      label: prettify(segment),
    }));
  }

  const crumbs: Crumb[] = [{ href: '/modules', label: 'Curriculum' }];

  // segments[0] = 'modules', segments[1] = moduleSlug,
  // segments[2] = materialSlug (optional), segments[3] = exerciseSlug (optional)
  const resolvers = [
    fetchModuleBySlug,
    fetchMaterialBySlug,
    fetchExerciseBySlug,
  ];

  for (let i = 1; i < segments.length && i <= 3; i++) {
    const slug = segments[i];
    const href = '/' + segments.slice(0, i + 1).join('/');
    const resolve = resolvers[i - 1];

    crumbs.push({
      href,
      label: prettify(slug),
      slug,
      resolve: (s) => resolve(s).then((res) => res.data.title),
    });
  }

  return crumbs;
}

export function PublicBreadcrumb() {
  const pathname = usePathname();
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

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
      <ol className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
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
