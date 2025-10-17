import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, "dd MMM yyyy 'a las' HH:mm", { locale: es });
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDuration = (startTimestamp: number, endTimestamp: number) => {
  const start = formatTime(startTimestamp);
  const end = formatTime(endTimestamp);
  return `${start} - ${end}`;
};

export const formatDurationMs = (durationMs: number) => {
  const seconds = Math.floor(durationMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString()?.padStart(2, '0')}`;
};

export const formatTimestamp = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString()?.padStart(2, '0')}`;
};
