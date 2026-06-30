'use client';

import AdminCodeEditor from '@/components/shared/AdminCodeEditor';

import { Button } from '@/components/ui/button';

type Props = {
  value: string;
  height?: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
};

export default function AdminJsonEditor({
  value,
  height = '220px',
  onChange,
  onError,
}: Props) {
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      onError?.('');
    } catch {
      onError?.('Invalid JSON format.');
    }
  };

  return (
    <div className='flex flex-col gap-y-3'>
      <AdminCodeEditor
        value={value}
        language='json'
        height={height}
        onChange={onChange}
      />

      <div className='flex justify-end'>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={handleFormatJson}
        >
          Format JSON
        </Button>
      </div>
    </div>
  );
}
