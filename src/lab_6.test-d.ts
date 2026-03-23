import { describe, it, expectTypeOf, assertType } from "vitest";
import type { DeepReadonly, PickedByType, EventHandlers } from "./lab_6.ts";

describe("Utility Types Testing", () => {
  it("DeepReadonly should make nested properties readonly", () => {
    type Data = { a: string; b: { c: number } };
    type ReadonlyData = DeepReadonly<Data>;

    // Проверка через assertType (не даст присвоить измененное значение)
    const data: ReadonlyData = { a: "test", b: { c: 1 } };
    assertType<ReadonlyData>(data);
    expectTypeOf(data).toEqualTypeOf<{
      readonly a: string;
      readonly b: { readonly c: number };
    }>();

    // @ts-expect-error
    data.a = "test";
    // @ts-expect-error
    data.b.c = "test";
  });

  it("PickedByType should filter properties by type", () => {
    type User = { id: number; name: string; age: number; isAdmin: boolean };
    type OnlyNumbers = PickedByType<User, number>;

    expectTypeOf<OnlyNumbers>().toEqualTypeOf<{ id: number; age: number }>();
    expectTypeOf<OnlyNumbers>().not.toHaveProperty("name");
  });

  it("EventHandlers should transform keys to onEventName", () => {
    type Events = {
      click: { x: number; y: number };
      focus: { target: string };
    };

    type Handlers = EventHandlers<Events>;

    expectTypeOf<Handlers>().toEqualTypeOf<{
      onClick: (event: { x: number; y: number }) => void;
      onFocus: (event: { target: string }) => void;
    }>();

    assertType<keyof Handlers>("onClick");
    assertType<keyof Handlers>("onFocus");
  });
});
