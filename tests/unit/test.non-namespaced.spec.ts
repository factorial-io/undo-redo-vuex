import Vue from "vue";
import store from "../store-non-namespaced";

const state: any = store.state;

const item = {
  foo: "bar",
};

describe("Testing undo/redo in a non-namespaced vuex store", () => {
  it("Add item to list and undo", async () => {
    const expectedState = [{ ...item }];
  
    // Commit the item to the store and assert
    store.commit("addItem", { item });
    expect(state.list).toEqual(expectedState);
  });
  
  it(
    "Check 'canUndo' value; The undo function should remove the item",
    async () => {
      expect(state.canUndo).toBeTruthy();
      await store.dispatch("undo");
    },
  );
  
  it("Check 'canUndo' value, Assert list items after undo", async () => {
    expect(state.canUndo).toBeFalsy();
    expect(state.list).toEqual([]);
  });
  
  it("Redo 'addItem' commit", async () => {
    await store.dispatch("redo");
  });
  
  it("Assert list items after redo", async () => {
    const expectedState = [{ ...item }];
    expect(state.list).toEqual(expectedState);
  });
  
  it("Grouped mutations: adding two items to the list", async () => {
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
    const actionGroup = "myAction";
  
    // Commit the items to the store and assert
    store.commit("addItem", { item, actionGroup });
    store.commit("addItem", { item: anotherItem, actionGroup });
    expect(state.list).toEqual(expectedState);
  
    // The undo function should remove the item
    await store.dispatch("undo");
  });
  
  it("Assert list items after undo: should contain 1 item", async () => {
    expect(state.list).toEqual([{ ...item }]);
  });
  
  it("Redo once", async () => {
    // Redo "addItem"
    await store.dispatch("redo");
  });
  
  it("Redo 'addItem' twice (grouped mutations)", async () => {
    // Redo "addItem"
    await store.dispatch("redo");
  });
  
  it("Assert list items after redo: should contain 3 items", async () => {
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
  
    expect(state.list).toEqual(expectedState);
  });
  
  it("'addShadow' action should be dispatched on undo", async () => {
    const expectedState = [...state.list, item];
  
    // Redo "addItem"
    store.commit("addItem", {
      index: 0,
      item,
      undoCallback: "addShadow",
      redoCallback: "removeShadow",
    });
    expect(state.list).toEqual(expectedState);
  
    await store.dispatch("undo");
  });
  
  it("Check shadow: should contain 1 item", () => {
    const expectedState = [{ ...item }];
    expect(state.shadow).toEqual(expectedState);
  });
  
  it("'removeShadow' should be dispatched on redo", async () => {
    // Redo "addItem"
    await store.dispatch("redo");
  });
  
  it("Check shadow: should contain no items", () => {
    const expectedState = [
      { foo: "bar" },
      { foo: "bar" },
      { foo: "baz" },
      { foo: "bar" },
    ];
  
    expect(state.list).toEqual(expectedState);
    expect(state.shadow).toEqual([]);
  });
});
