import Vue from "vue";
import store from "../store-non-namespaced";
import { undo, redo } from "./utils-test";

const state: any = store.state;

const item = {
  foo: "bar"
};

const getDoneUndone = () => {
  const { done, undone } = state.undoRedoConfig;

  return { done, undone };
};

describe("Testing undo/redo in a non-namespaced vuex store", () => {
  it("Add item to list and undo", async () => {
    const expectedState = [{ ...item }];

    // Commit the item to the store and assert
    store.commit("addItem", { item });
    expect(state.list).toEqual(expectedState);

    const { done } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "addItem",
        payload: {
          item
        }
      }
    ]);
  });

  it("Check 'canUndo' value; The undo function should remove the item", async () => {
    expect(state.canUndo).toBeTruthy();
    await undo(store)();
    await Vue.nextTick();

    // Check 'canUndo' value, Assert list items after undo
    expect(state.canUndo).toBeFalsy();
    expect(state.list).toEqual([]);

    const { done, undone } = getDoneUndone();

    expect(undone).toEqual([
      {
        type: "addItem",
        payload: {
          item
        }
      }
    ]);
    expect(done).toEqual([]);
  });

  it("Redo 'addItem' commit", async () => {
    await redo(store)();

    // Assert list items after redo
    const expectedState = [{ ...item }];
    expect(state.list).toEqual(expectedState);

    const { done, undone } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "addItem",
        payload: {
          item
        }
      }
    ]);
    expect(undone).toEqual([]);
  });

  it("Grouped mutations: adding two items to the list", async () => {
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
    const actionGroup = "myAction";

    // Commit the items to the store and assert
    store.commit("addItem", { item, actionGroup });
    store.commit("addItem", { item: anotherItem, actionGroup });
    expect(state.list).toEqual(expectedState);

    const { done, undone } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "addItem",
        payload: {
          item
        }
      },
      {
        type: "addItem",
        payload: {
          item,
          actionGroup
        }
      },
      {
        type: "addItem",
        payload: {
          item: anotherItem,
          actionGroup
        }
      }
    ]);
    expect(undone).toEqual([]);

    // The undo function should remove the item
    await undo(store)();

    // Assert list items after undo: should contain 1 item
    expect(state.list).toEqual([{ ...item }]);
  });

  it("Assert list items after redos: should contain 3 items", async () => {
    // Redo "addItem" twice
    await redo(store)();
    await redo(store)();
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];

    expect(state.list).toEqual(expectedState);
  });

  it("'addShadow' action should be dispatched on undo", async () => {
    let expectedState = [...state.list, item];

    // Redo "addItem"
    store.commit("addItem", {
      index: 0,
      item,
      undoCallback: "addShadow",
      redoCallback: "removeShadow"
    });
    expect(state.list).toEqual(expectedState);

    await undo(store)();
    expectedState = [{ ...item }];
    expect(state.shadow).toEqual(expectedState);
  });

  it("'removeShadow' should be dispatched on redo", async () => {
    // Redo "addItem"
    await redo(store)();
    const expectedState = [
      { foo: "bar" },
      { foo: "bar" },
      { foo: "baz" },
      { foo: "bar" }
    ];

    // Check shadow: should contain no items
    expect(state.list).toEqual(expectedState);
    expect(state.shadow).toEqual([]);
  });
});
