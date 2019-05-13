import store from "../store-non-namespaced";
import { undo, redo } from "./utils-test";

const state: any = store.state;

const item = {
  foo: "bar"
};

describe("Testing multiple undo/redo in a vuex store", () => {
  it("Add 3 items to list and undo once", async () => {
    const expectedState = [{ ...item }, { ...item }, { ...item }];

    // Commit the item to the store and assert
    store.commit("addItem", { item });
    store.commit("addItem", { item });
    store.commit("addItem", { item });
    expect(state.list).toEqual(expectedState);

    // The undo function should remove the item
    // Undo twice
    await undo(store)();
    await undo(store)();

    // Assert list items after undos
    expect(state.list).toEqual([{ ...item }]);
  });

  it("Assert list items after redo", async () => {
    // Redo twice
    await redo(store)();
    await redo(store)();
    expect(state.list).toEqual([{ ...item }, { ...item }, { ...item }]);
  });
});
