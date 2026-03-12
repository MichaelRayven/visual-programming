import { describe, expect, it } from "vitest";
import { where, sort, groupBy, having, query } from "./lab_4";
import type { User } from "./lab_4";

describe("query pipeline", () => {
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

  it("фильтрует и сортирует", () => {
    const pipeline = query(where("city", "Moscow"), sort("age"));
    expect(pipeline(users)).toEqual([
      { id: 1, name: "Ivan", surname: "Kravitz", age: 30, city: "Moscow" },
      { id: 3, name: "Dmitry", surname: "Kravitz", age: 35, city: "Moscow" },
    ]);
  });

  it("сортировка с равными значениями", () => {
    const usersWithEqualAge = [
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
    expect(result.map((u) => u.age)).toEqual(
      expect.arrayContaining([25, 25, 30]),
    );
  });

  it("группирует и фильтрует группы", () => {
    const pipeline = query(
      groupBy("city"),
      having((group) => group.items.length > 1),
    );
    expect(pipeline(users)).toEqual([
      { key: "Moscow", items: [users[0], users[2]] },
      { key: "Saint Petersburg", items: [users[1], users[3]] },
    ]);
  });

  it("having отбрасывает группы", () => {
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
    expect(result.every((g) => g.city !== "Kazan")).toBe(true);
  });

  it("комбинирует шаги", () => {
    const pipeline = query(
      where("name", "Dmitry"),
      groupBy("city"),
      having((group) => group.items.some((u) => u.age > 32)),
    );
    expect(pipeline(users)).toEqual([{ key: "Moscow", items: [users[2]] }]);
  });

  it("обрабатывает пустой массив", () => {
    const pipeline = query(
      groupBy("city"),
      having((group) => group.items.length > 1),
    );
    expect(pipeline([])).toEqual([]);
  });

  it("сортирует произвольный массив", () => {
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
    expect(result.map((u) => u.age)).toEqual([22, 25, 30]);
  });
});
