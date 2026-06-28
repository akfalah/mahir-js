type Props = {
  message: string | null;
};

export default function AdminStatusMessage({ message }: Props) {
  if (!message) {
    return null;
  }

  return (
    <p className='rounded-2xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground'>
      {message}
    </p>
  );
}
