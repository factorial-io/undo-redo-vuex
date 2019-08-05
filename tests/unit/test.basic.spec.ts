import Vue from "vue";
import store from "../store";
import { undo, redo } from "./utils-test";

const item = {
  foo: "bar"
};

const state: any = store.state;

describe("Simple testing for undo/redo on a namespaced vuex store", () => {
  it("Add item to list", () => {
    const expectedState = [{ ...item }];

    // Commit the item to the store and assert
    store.commit("list/addItem", { item });

    expect(state.list.list).toEqual(expectedState);
  });

  it("Check 'canUndo' value; The undo function should remove the item", async () => {
    expect(state.list.canUndo).toBeTruthy();

    await undo(store)("list");
    await Vue.nextTick();

    // Check 'canUndo' value, Assert list items after undo
    expect(state.list.canUndo).toBeFalsy();
    expect(state.list.list).toEqual([]);
  });

  it("Redo 'addItem' commit", async () => {
    expect(state.list.canRedo).toBeTruthy();
    await redo(store)("list");
  });

  it("Grouped mutations: adding two items to the list", async () => {
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
    const actionGroup = "myAction";

    // Commit the items to the store and assert
    store.commit("list/addItem", { item, actionGroup });
    store.commit("list/addItem", { item: anotherItem, actionGroup });
    expect(state.list.list).toEqual(expectedState);
  });

  it("Dispatch undo", async () => {
    // The undo function should remove the item
    await undo(store)("list");

    // Assert list items after undo: should contain 1 item
    expect(state.list.list).toEqual([{ ...item }]);
  });

  it("Redo 'addItem' twice (grouped mutations)", async () => {
    // Redo 'addItem'
    await redo(store)("list");
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];

    // Assert list items after redo: should contain 3 items
    expect(state.list.list).toEqual(expectedState);
  });

  it('"addShadow" action should be dispatched on undo', async () => {
    let expectedState = [...state.list.list, item];

    store.commit("list/addItem", {
      index: 0,
      item,
      undoCallback: "addShadow",
      redoCallback: "removeShadow"
    });
    expect(state.list.list).toEqual(expectedState);

    await undo(store)("list");
    expectedState = [{ ...item }];
    expect(state.list.shadow).toEqual(expectedState);
  });

  it("Check shadow: should contain 1 item", () => {});

  it('"removeShadow" should be dispatched on redo', async () => {
    // Redo 'addItem'
    await redo(store)("list");
    const expectedState = [
      { foo: "bar" },
      { foo: "bar" },
      { foo: "baz" },
      { foo: "bar" }
    ];

    expect(state.list.list).toEqual(expectedState);
    // Check shadow: should contain no items
    expect(state.list.shadow).toEqual([]);
  });
});
