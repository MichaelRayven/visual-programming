export type Transform<T> = (data: T[]) => T[];

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => Transform<T>;

export type Sort<T> = <K extends keyof T>(key: K) => Transform<T>;

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupBy<T> = <K extends keyof T>(
  key: K,
) => (data: T[]) => Group<T, K>[];

export type GroupTransform<T, K extends keyof T> = (
  groups: Group<T, K>[],
) => Group<T, K>[];

export type Having<T> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean,
) => GroupTransform<T, K>;

export type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

export function query<T>(
  ...steps: (
    | Transform<T>
    | GroupTransform<T, keyof T>
    | ReturnType<GroupBy<T>>
  )[]
): Transform<T> {
  return (data: any) => {
    return steps.reduce((acc, step) => step(acc), data);
  };
}

export const where: Where<User> = (key, value) => (data) =>
  data.filter((item) => item[key] === value);

export const sort: Sort<User> = (key) => (data) =>
  [...data].sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });

export const groupBy: GroupBy<User> = (key) => (data) => {
  const groups = data.reduce(
    (acc, item) => {
      const k = item[key] as unknown as string;
      if (!acc[k]) {
        acc[k] = { key: item[key], items: [] };
      }
      acc[k].items.push(item);
      return acc;
    },
    {} as Record<string, Group<User, typeof key>>,
  );
  return Object.values(groups);
};

export const having: Having<User> = (predicate) => (groups) =>
  groups.filter(predicate);
