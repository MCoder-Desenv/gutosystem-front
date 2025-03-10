// src/util/dateUtils.ts

/**
 * Formata uma data no formato `yyyy-MM-dd` para `dd/MM/yyyy`.
 */
export const formatDateToBackend = (date: string): string => {
    if (!date) return '';

    // Divida a string da data no formato `yyyy-MM-dd`
    const [year, month, day] = date?.split('-');
    
    // Construa a data no formato esperado para o backend
    return `${day}/${month}/${year}`;
};

export const formatDateTimeToBackend = (date: string): string => {
    if (!date) return '';

    // Separar a parte da data e hora
    const [datePart, timePart] = date.split(' '); // "2025-02-26" e "17:32:44"

    // Verificar se a data é válida antes de continuar
    if (!datePart) return '';

    // Extrair ano, mês e dia
    const [year, month, day] = datePart.split('-');

    // Retornar no formato esperado "dd/MM/yyyy HH:mm:ss"
    return `${day}/${month}/${year} ${timePart || ''}`;
};


export const formatDateTimeToBackendToDate = (date: string): string => {
    if (!date) return '';

    // Separar a parte da data e hora
    const [datePart] = date.split(' '); // "2025-02-26" e "17:32:44"

    // Verificar se a data é válida antes de continuar
    if (!datePart) return '';

    // Extrair ano, mês e dia
    const [year, month, day] = datePart.split('-');

    // Retornar no formato esperado "dd/MM/yyyy HH:mm:ss"
    return `${day}/${month}/${year}`;
};

/**
 * Formata uma data no formato `dd/MM/yyyy` para `yyyy-MM-dd` (para uso no input).
 */
export const formatDateToInput = (date: string): string => {
    if (!date) return '';
    const [day, month, year] = date?.split('/');
    return `${year}-${month}-${day}`;
};

/**
 * Valida se uma string está no formato `dd/MM/yyyy`.
 */
export const isValidDate = (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    const d = new Date(year, month - 1, day);
    return d.getDate() === day && d.getMonth() === month - 1 && d.getFullYear() === year;
};
