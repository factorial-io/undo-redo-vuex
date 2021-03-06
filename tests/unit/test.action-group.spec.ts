import store from "../store-non-namespaced";
import { undo, redo } from "./utils-test";

const item = {
  foo: "bar"
};

const other = {
  cool: "idea"
};

const state: any = store.state;

describe("Testing undo/redo of grouped mutations (i.e. Actions)", () => {
  it("Add 4 items to list", async () => {
    // Commit the items with action groups to the store and assert
    store.commit("addItem", { item });
    store.commit("addItem", { item, actionGroup: "firstGroup" });
    store.commit("addItem", { item: other, actionGroup: "firstGroup" });
    store.commit("addItem", { item, actionGroup: "secondGroup" });

    // Assert items: should contain 4 items
    const expectedState = [{ ...item }, { ...item }, { ...other }, { ...item }];
    expect(state.list).toEqual(expectedState);
  });

  it("Undo secondGroup", async () => {
    await undo(store)();

    // Assert items: should contain 3 items
    expect(state.list).toEqual([{ ...item }, { ...item }, { ...other }]);
  });

  it("Undo firstGroup", async () => {
    await undo(store)();

    // Assert items: should contain 1 item
    expect(state.list).toEqual([{ ...item }]);
  });

  it("Redo firstGroup", async () => {
    await redo(store)();

    // Assert items: should contain 3 items
    expect(state.list).toEqual([{ ...item }, { ...item }, { ...other }]);
  });

  it("Redo secondGroup", async () => {
    await redo(store)();

    // Assert items: should contain 4 items
    expect(state.list).toEqual([
      { ...item },
      { ...item },
      { ...other },
      { ...item }
    ]);
  });

  it('Repeat action: "firstGroup"', () => {
    store.commit("addItem", { item, actionGroup: "firstGroup" });
    store.commit("addItem", { item: other, actionGroup: "firstGroup" });

    // Assert items: should contain 6 items
    expect(state.list).toEqual([
      { ...item },
      { ...item },
      { ...other },
      { ...item },
      { ...item },
      { ...other }
    ]);
  });

  it("Undo firstGroup", async () => {
    await undo(store)();

    // Assert items: should contain 6 items
    expect(state.list).toEqual([
      { ...item },
      { ...item },
      { ...other },
      { ...item }
    ]);
  });
});
