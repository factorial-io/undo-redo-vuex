import Vue from "vue";
import { getExposedConfigStore } from "../store";
import { undo, redo, clear } from "./utils-test";

const item = {
  foo: "bar"
};

const store = getExposedConfigStore();
const state: any = store.state;

/**
 * Check exposed done and undone stacks in the store's state
 * after mutation|undo|redo
 */
const getDoneUndone = () => {
  const { done, undone } = state.list.undoRedoConfig;

  return { done, undone };
};

describe("Simple testing for undo/redo on a namespaced vuex store", () => {
  it("Add item to list", () => {
    const expectedState = [{ ...item }];

    // Commit the item to the store and assert
    store.commit("list/addItem", { item });

    const { done } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "list/addItem",
        payload: {
          item
        }
      }
    ]);
  });

  it("Check 'canUndo' value; The undo function should remove the item", async () => {
    expect(state.list.canUndo).toBeTruthy();

    await undo(store)("list");
    await Vue.nextTick();

    const { done, undone } = getDoneUndone();

    expect(undone).toEqual([
      {
        type: "list/addItem",
        payload: {
          item
        }
      }
    ]);
    expect(done).toEqual([]);
  });

  it("Redo 'addItem' commit", async () => {
    await redo(store)("list");

    const { done, undone } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "list/addItem",
        payload: {
          item
        }
      }
    ]);
    expect(undone).toEqual([]);
  });

  it("Grouped mutations: adding two items to the list", async () => {
    const anotherItem = { foo: "baz" };
    const actionGroup = "myAction";

    // Commit the items to the store and assert
    store.commit("list/addItem", { item, actionGroup });
    store.commit("list/addItem", { item: anotherItem, actionGroup });

    const { done, undone } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "list/addItem",
        payload: {
          item
        }
      },
      {
        type: "list/addItem",
        payload: {
          item,
          actionGroup
        }
      },
      {
        type: "list/addItem",
        payload: {
          item: anotherItem,
          actionGroup
        }
      }
    ]);
    expect(undone).toEqual([]);
  });

  it("Dispatch undo", async () => {
    const actionGroup = "myAction";
    const anotherItem = { foo: "baz" };

    // The undo function should remove the item
    await undo(store)("list");

    const { done, undone } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "list/addItem",
        payload: {
          item
        }
      }
    ]);
    expect(undone).toEqual([
      {
        type: "list/addItem",
        payload: {
          item,
          actionGroup
        }
      },
      {
        type: "list/addItem",
        payload: {
          item: anotherItem,
          actionGroup
        }
      }
    ]);
  });

  it("Redo 'addItem' twice (grouped mutations)", async () => {
    // Redo 'addItem'
    await redo(store)("list");
    const actionGroup = "myAction";
    const anotherItem = { foo: "baz" };

    const { done, undone } = getDoneUndone();

    expect(done).toEqual([
      {
        type: "list/addItem",
        payload: {
          item
        }
      },
      {
        type: "list/addItem",
        payload: {
          item,
          actionGroup
        }
      },
      {
        type: "list/addItem",
        payload: {
          item: anotherItem,
          actionGroup
        }
      }
    ]);
    expect(undone).toEqual([]);
  });
});
