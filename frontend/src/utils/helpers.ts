export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> =>
  array.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

export const formatAusDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};
