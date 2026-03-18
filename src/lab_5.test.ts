import { describe, expect, expectTypeOf, it } from "vitest";
import {
  where,
  sort,
  groupBy,
  having,
  query,
  type WhereOp,
  type GroupByOp,
  type HavingOp,
  type SortOp,
  type User,
} from "./lab_5";

describe("lab 5 — query pipeline with ordered operations", () => {
  const users: User[] = [
    { id: 1, name: "Ivan", surname: "Kravitz", age: 30, city: "Moscow" },
    {
      id: 2,
      name: "Ekaterina",
      surname: "Ivanova",
      age: 25,
      city: "Saint Petersburg",
    },
    { id: 3, name: "Dmitry", surname: "Kravitz", age: 35, city: "Moscow" },
    {
      id: 4,
      name: "Mikhail",
      surname: "Paul",
      age: 40,
      city: "Saint Petersburg",
    },
  ];

  it("where + sort: filters then sorts", () => {
    const pipeline = query(where("city", "Moscow"), sort("age"));
    expect(pipeline(users)).toEqual([
      { id: 1, name: "Ivan", surname: "Kravitz", age: 30, city: "Moscow" },
      { id: 3, name: "Dmitry", surname: "Kravitz", age: 35, city: "Moscow" },
    ]);
  });

  it("sort with equal values preserves stability", () => {
    const usersWithEqualAge: User[] = [
      { id: 1, name: "Anna", surname: "Gon", age: 25, city: "Moscow" },
      {
        id: 2,
        name: "Boris",
        surname: "Lane",
        age: 25,
        city: "Saint Petersburg",
      },
      { id: 3, name: "Vladimir", surname: "Rhal", age: 30, city: "Moscow" },
    ];
    const pipeline = query(sort("age"));
    const result = pipeline(usersWithEqualAge);
    expect(result).toHaveLength(3);
    expect(result.map((u: User) => u.age)).toEqual([25, 25, 30]);
  });

  it("groupBy + having: groups then filters groups", () => {
    const pipeline = query(
      groupBy("city"),
      having((group) => group.items.length > 1),
    );
    expect(pipeline(users)).toEqual([
      { key: "Moscow", items: [users[0], users[2]] },
      { key: "Saint Petersburg", items: [users[1], users[3]] },
    ]);
  });

  it("having discards small groups", () => {
    const extendedUsers: User[] = [
      ...users,
      { id: 5, name: "Tatiana", surname: "Ivanova", age: 28, city: "Kazan" },
    ];
    const pipeline = query(
      groupBy("city"),
      having((group) => group.items.length > 1),
    );
    const result = pipeline(extendedUsers);
    expect(result).toHaveLength(2);
  });

  it("where → groupBy → having combination", () => {
    const pipeline = query(
      where("name", "Dmitry"),
      groupBy("city"),
      having((group) => group.items.some((u: User) => u.age > 32)),
    );
    expect(pipeline(users)).toEqual([{ key: "Moscow", items: [users[2]] }]);
  });

  it("handles empty array", () => {
    const pipeline = query(
      groupBy("city"),
      having((group) => group.items.length > 1),
    );
    expect(pipeline([])).toEqual([]);
  });

  it("sorts arbitrary array", () => {
    const unsorted: User[] = [
      { id: 5, name: "Zoya", surname: "Ivanova", age: 22, city: "Moscow" },
      { id: 1, name: "Ivan", surname: "Tarp", age: 30, city: "Moscow" },
      {
        id: 3,
        name: "Alisa",
        surname: "Belize",
        age: 25,
        city: "Saint Petersburg",
      },
    ];
    const pipeline = query(sort("age"));
    const result = pipeline(unsorted);
    expect(result.map((u: User) => u.age)).toEqual([22, 25, 30]);
  });

  it("multiple where operations", () => {
    const pipeline = query(where("city", "Moscow"), where("surname", "Kravitz"));
    expect(pipeline(users)).toEqual([
      { id: 1, name: "Ivan", surname: "Kravitz", age: 30, city: "Moscow" },
      { id: 3, name: "Dmitry", surname: "Kravitz", age: 35, city: "Moscow" },
    ]);
  });

  it("where → groupBy → having → sort full pipeline", () => {
    const pipeline = query(
      where("surname", "Kravitz"),
      groupBy("city"),
      having((group) => group.items.length >= 1),
      sort("age"),
    );
    const result = pipeline(users);
    expect(result).toBeDefined();
  });

  describe("type-level: factory function return types", () => {
    it("where() returns WhereOp<User>", () => {
      expectTypeOf(where("city", "Moscow")).toExtend<WhereOp<User>>();
    });

    it("sort() returns SortOp<User>", () => {
      expectTypeOf(sort("age")).toExtend<SortOp<User>>();
    });

    it("groupBy() returns GroupByOp<User>", () => {
      expectTypeOf(groupBy("city")).toExtend<GroupByOp<User>>();
    });

    it("having() returns HavingOp<User>", () => {
      expectTypeOf(having(() => true)).toExtend<HavingOp<User>>();
    });
  });

  describe("type-level: valid operation orderings compile", () => {
    it("where, sort", () => {
      query(where("city", "Moscow"), sort("age"));
    });

    it("where, where, sort", () => {
      query(where("city", "Moscow"), where("name", "Ivan"), sort("age"));
    });

    it("groupBy, having", () => {
      query(
        groupBy("city"),
        having((group) => group.items.length > 1),
      );
    });

    it("where, groupBy, having, sort (full pipeline)", () => {
      query(
        where("city", "Moscow"),
        groupBy("city"),
        having((group) => group.items.length > 1),
        sort("age"),
      );
    });

    it("only sort", () => {
      query(sort("age"));
    });

    it("only where", () => {
      query(where("city", "Moscow"));
    });

    it("only groupBy", () => {
      query(groupBy("city"));
    });

    it("where, groupBy", () => {
      query(where("city", "Moscow"), groupBy("city"));
    });

    it("groupBy, sort", () => {
      query(groupBy("city"), sort("age"));
    });
  });

  describe("type-level: invalid operation orderings do not compile", () => {
    it("sort before where is rejected", () => {
      // @ts-expect-error — sort must come after where
      query(sort("age"), where("city", "Moscow"));
    });

    it("having before groupBy is rejected", () => {
      // @ts-expect-error — having must come after groupBy
      query(having((group) => group.items.length > 1), groupBy("city"));
    });

    it("groupBy after sort is rejected", () => {
      // @ts-expect-error — groupBy cannot follow sort
      query(sort("age"), groupBy("city"));
    });

    it("where after groupBy is rejected", () => {
      // @ts-expect-error — where cannot follow groupBy
      query(groupBy("city"), where("city", "Moscow"));
    });

    it("where after sort is rejected", () => {
      // @ts-expect-error — where cannot follow sort
      query(sort("age"), where("city", "Moscow"));
    });

    it("where after having is rejected", () => {
      // @ts-expect-error — where cannot follow having
      query(having((group) => group.items.length > 1), where("city", "Moscow"));
    });

    it("sort before groupBy before where is rejected", () => {
      // @ts-expect-error — completely reversed order
      query(sort("age"), groupBy("city"), where("city", "Moscow"));
    });

    it("having after sort is rejected", () => {
      // @ts-expect-error — having cannot follow sort
      query(sort("age"), having((group) => group.items.length > 1));
    });
  });
});
