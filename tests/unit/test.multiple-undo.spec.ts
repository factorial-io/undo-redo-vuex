import Vue from "vue";
import store from "../store-non-namespaced";

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
    await store.dispatch("undo");
    await Vue.nextTick();
    await store.dispatch("undo");

    // Assert list items after undos
    expect(state.list).toEqual([{ ...item }]);
  });

  it("Assert list items after redo", async () => {
    // Redo twice
    await store.dispatch("redo");
    await store.dispatch("redo");
    expect(state.list).toEqual([{ ...item }, { ...item }, { ...item }]);
  });
});
