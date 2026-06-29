'use client';

import { useEffect } from 'react';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

type Props = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function AdminTextEditor({
  value,
  placeholder = 'Write material content here...',
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-80 rounded-b-2xl bg-background px-4 py-4 text-sm leading-relaxed outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();

    if (value && value !== currentHtml) {
      editor.commands.setContent(value);
    }

    if (!value && currentHtml !== '<p></p>') {
      editor.commands.setContent('<p></p>');
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className='min-h-80 rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground'>
        Loading editor...
      </div>
    );
  }

  const toolbarItems = [
    {
      label: 'Bold',
      icon: Bold,
      active: editor.isActive('bold'),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Italic',
      icon: Italic,
      active: editor.isActive('italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Strike',
      icon: Strikethrough,
      active: editor.isActive('strike'),
      action: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: 'H2',
      icon: Heading2,
      active: editor.isActive('heading', { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      icon: Heading3,
      active: editor.isActive('heading', { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: 'Bullet List',
      icon: List,
      active: editor.isActive('bulletList'),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Ordered List',
      icon: ListOrdered,
      active: editor.isActive('orderedList'),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Code',
      icon: Code,
      active: editor.isActive('code'),
      action: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: 'Quote',
      icon: Quote,
      active: editor.isActive('blockquote'),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className='overflow-hidden rounded-2xl border bg-background'>
      <div className='flex flex-wrap gap-2 border-b bg-muted/30 p-2'>
        {toolbarItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.label}
              type='button'
              variant={item.active ? 'default' : 'secondary'}
              size='sm'
              className='gap-2'
              onClick={item.action}
            >
              <Icon className='size-4' />
              <span className='hidden sm:inline'>{item.label}</span>
            </Button>
          );
        })}

        <Button
          type='button'
          variant='secondary'
          size='sm'
          className='gap-2'
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className='size-4' />
          <span className='hidden sm:inline'>Undo</span>
        </Button>

        <Button
          type='button'
          variant='secondary'
          size='sm'
          className='gap-2'
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className='size-4' />
          <span className='hidden sm:inline'>Redo</span>
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          '[&_.tiptap>*+*]:pt-3',
          '[&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-bold',
          '[&_.tiptap_h3]:text-xl [&_.tiptap_h3]:font-bold',
          '[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6',
          '[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6',
          '[&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-muted-foreground',
          '[&_.tiptap_code]:rounded [&_.tiptap_code]:bg-muted [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5',
          '[&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:bg-muted [&_.tiptap_pre]:p-4',
          '[&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        )}
      />
    </div>
  );
}
