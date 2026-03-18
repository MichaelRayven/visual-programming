export type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

export type GroupTransform<T, K extends keyof T> = (
  groups: Group<T, K>[],
) => Group<T, K>[];

export type Transform<T> = (data: T[]) => T[];

// Phantom branding

declare const tag: unique symbol;

type Tagged<T, Name> = T & { readonly [tag]: Name };

export type WhereOp<T> = Tagged<Transform<T>, 'where'>;
export type SortOp<T> = Tagged<Transform<T>, 'sort'>;
export type GroupByOp<T> = Tagged<(data: T[]) => Group<T, any>[], 'groupBy'>;
export type HavingOp<T> = Tagged<(groups: Group<T, any>[]) => Group<T, any>[], 'having'>;

export type Where<T> = <K extends keyof T>(key: K, value: T[K]) => WhereOp<T>;
export type Sort<T> = <K extends keyof T>(key: K) => SortOp<T>;
export type GroupBy<T> = <K extends keyof T>(
  key: K,
) => GroupByOp<T>;

export type Having<T> = <K extends keyof T>(
  predicate: (group: Group<T, K>) => boolean,
) => HavingOp<T>;

export type Operation<T> = WhereOp<T> | GroupByOp<T> | HavingOp<T> | SortOp<T>;

type StepTag = 'where' | 'groupBy' | 'having' | 'sort';

type NextPhases = {
  where: StepTag;
  groupBy: 'groupBy' | 'having' | 'sort';
  having: 'having' | 'sort';
  sort: 'sort';
};

type GetTag<Op> = Op extends { readonly [tag]: infer N } ? N : never;

type IsValidOrder<
  Ops extends readonly Operation<any>[],
  P extends StepTag = 'where',
> = Ops extends readonly [
  infer Head extends Operation<any>,
  ...infer Tail extends Operation<any>[],
]
  ? (GetTag<Head> extends P
    ? IsValidOrder<Tail, P>
    : (GetTag<Head> extends NextPhases[P]
      ? IsValidOrder<Tail, GetTag<Head> & StepTag>
      : false)
  ) : true;

/** Shown in the TypeScript error when operations are given in the wrong order. */
type OrderError =
  'TypeError: Operations are out of order — valid sequence is: where -> groupBy -> having -> sort';

export type ValidOperationOrder<
  Ops extends readonly Operation<any>[],
> = IsValidOrder<Ops> extends true ? Ops : OrderError;

// Factory functions

export const where: Where<User> =
  (key, value) =>
    ((data) => data.filter((item) => item[key] === value)) as WhereOp<User>;

export const sort: Sort<User> =
  (key) =>
    ((data: User[]) =>
      [...data].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      })) as SortOp<User>;

export const groupBy: GroupBy<User> =
  (key) =>
    ((data) => {
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
    }) as GroupByOp<User>;

export const having: Having<User> =
  (predicate) =>
    ((groups) => groups.filter(predicate)) as HavingOp<User>;


// Query function 

export function query<const Ops extends readonly Operation<User>[]>(
  ...steps: Ops & ValidOperationOrder<Ops>
): (data: User[]) => User[] {
  return (data: User[]) => {
    return steps.reduce(
      (acc, step) => (step as any)(acc),
      data,
    );
  };
}
