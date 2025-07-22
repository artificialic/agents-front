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