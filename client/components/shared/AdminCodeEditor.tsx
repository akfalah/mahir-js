'use client';

import Editor from '@monaco-editor/react';

type Props = {
  value: string;
  language?: string;
  height?: string;
  onChange: (value: string) => void;
};

export default function AdminCodeEditor({
  value,
  language = 'javascript',
  height = '260px',
  onChange,
}: Props) {
  return (
    <div className='overflow-hidden rounded-2xl border bg-background'>
      <Editor
        height={height}
        language={language}
        value={value}
        theme='vs-light'
        onChange={(nextValue) => onChange(nextValue ?? '')}
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
          padding: {
            top: 16,
            bottom: 16,
          },
        }}
      />
    </div>
  );
}
