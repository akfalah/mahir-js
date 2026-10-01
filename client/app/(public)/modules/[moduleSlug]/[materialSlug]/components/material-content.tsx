import DOMPurify from 'isomorphic-dompurify';

export function MaterialContent({ content }: { content: string }) {
  const cleanContent = DOMPurify.sanitize(content);

  return (
    <article
      className='
        flex flex-col leading-relaxed text-xs lg:text-sm text-foreground 
        [&_a]:font-medium [&_a]:text-primary [&_a]:underline 
        [&_h1]:text-3xl lg:[&_h1]:text-2xl [&_h1]:font-bold 
        [&_h2]:text-2xl lg:[&_h2]:text-xl [&_h2]:font-bold 
        [&_h3]:text-xl lg:[&_h3]:text-lg [&_h3]:font-bold 
        [&_ol]:pl-6 [&_ol]:list-decimal [&_ul]:pl-6 [&_ul]:list-disc 
        [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:text-muted-foreground 
        [&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-muted [&_code]:rounded 
        [&_pre]:m-4 md:[&_pre]:m-6 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:bg-muted [&_pre]:rounded-lg'
      dangerouslySetInnerHTML={{
        __html: cleanContent,
      }}
    />
  );
}
