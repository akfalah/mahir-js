const TZ = 'Asia/Jakarta';

export const toDay = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

export const addDays = (day: string, n: number) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000)
    .toISOString()
    .slice(0, 10);