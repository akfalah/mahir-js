import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function AdminContentPanel({ children }: Props) {
  return (
    <section className='overflow-hidden rounded-3xl border bg-card shadow-sm'>
      {children}
    </section>
  );
}
