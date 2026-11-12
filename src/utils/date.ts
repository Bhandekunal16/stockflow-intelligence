import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatDate(dateStr: string | null | undefined, format = 'DD MMM YYYY'): string {
  if (!dateStr) return 'N/A';
  return dayjs(dateStr).format(format);
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return dayjs(dateStr).format('DD MMM YYYY, hh:mm A');
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return dayjs(dateStr).fromNow();
}

export function getTodayKolkata(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}
