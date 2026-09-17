import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { Slot } from 'radix-ui';

import { CodeXml } from 'lucide-react';

const publicLogoVariants = cva('flex items-center gap-x-2', {
  variants: {
    variant: {
      default: '[&>.logo-text]:hidden',
      'with-text': '[&>.logo-text]:inline',
    },
    size: {
      default:
        '[&>.logo-icon]:size-8 [&>.logo-icon>svg]:size-5 [&>.logo-text]:text-xl',
      bigger:
        '[&>.logo-icon]:size-9 [&>.logo-icon>svg]:size-6 [&>.logo-text]:text-2xl',
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export function PublicLogo({
  className,
  href = '/',
  variant = 'default',
  size = 'default',
  asChild = false,
}: React.ComponentProps<typeof Link> &
  VariantProps<typeof publicLogoVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : Link;

  return (
    <Comp
      href={href}
      data-slot='a'
      data-variant={variant}
      data-size={size}
      className={cn(publicLogoVariants({ variant, size, className }))}
    >
      <div className='logo-icon flex items-center justify-center rounded-lg bg-primary'>
        <CodeXml className='text-white' />
      </div>

      <span className='logo-text font-bold text-primary'>
        Mahir<span className='text-foreground'>JS</span>
      </span>
    </Comp>
  );
}
