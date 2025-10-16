const LOCALE = 'es-DO';

// Formatea una fecha ISO a formato dd/mm/yyyy
export const formatDateShort = (dateString) => {
  if (!dateString) return '–';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '–';
  }
};

// Formatea una fecha ISO a formato largo (15 de octubre de 2025)
export const formatDateLong = (dateString) => {
  if (!dateString) return '–';
  try {
    return new Date(dateString).toLocaleDateString(LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '–';
  }
};

// Formatea una fecha ISO con hora (31/12/2025, 02:30 PM)
export const formatDateTime = (dateString) => {
  if (!dateString) return '–';
  try {
    return new Date(dateString).toLocaleString(LOCALE, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '–';
  }
};

// Convierte una fecha de input[type="date"] (yyyy-mm-dd) a formato ISO para la BD
// La BD espera formato yyyy-mm-dd, así que solo validamos que esté correcto
export const dateInputToDB = (dateInputValue) => {
  if (!dateInputValue) return null;
  return dateInputValue;
};

// Convierte una fecha ISO de la BD a formato para input[type="date"] (yyyy-mm-dd)
export const dbToDateInput = (dateString) => {
  if (!dateString) return '';
  try {
    return dateString.split('T')[0];
  } catch {
    return '';
  }
};

// Obtiene la fecha actual en formato yyyy-mm-dd para inputs de fecha
export const getTodayForInput = () => {
  return new Date().toISOString().split('T')[0];
};