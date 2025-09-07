export const formatNumber = (value: number | null | undefined, precision: number): string => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(precision);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 