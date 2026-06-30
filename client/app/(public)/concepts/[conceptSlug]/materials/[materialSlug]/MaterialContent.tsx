'use client';

import { useMemo } from 'react';
import createDOMPurify from 'dompurify';

type Props = {
  content: string;
};

export default function MaterialContent({ content }: Props) {
  const cleanContent = useMemo(() => {
    if (typeof window === 'undefined') {
      return content;
    }

    const DOMPurify = createDOMPurify(window);

    return DOMPurify.sanitize(content);
  }, [content]);

  return (
    <article
      className='flex flex-col gap-y-4 leading-relaxed text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-muted [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6'
      dangerouslySetInnerHTML={{
        __html: cleanContent,
      }}
    />
  );
}
