import store from "../store-non-namespaced";

const state: any = store.state;

const item = {
  foo: "bar",
};

describe("Testing multiple undo/redo in a vuex store", () => {
  it("Add 3 items to list and undo once", async () => {
    const expectedState = [{ ...item }, { ...item }, { ...item }];
  
    // Commit the item to the store and assert
    await store.commit("addItem", { item });
    await store.commit("addItem", { item });
    await store.commit("addItem", { item });
    expect(state.list).toEqual(expectedState);
  
    // The undo function should remove the item
    await store.dispatch("undo");
  });
  
  it("Undo once", async () => {
    await store.dispatch("undo");
  });
  
  it("Assert list items after undos", async () => {
    expect(state.list).toEqual([{ ...item }]);
  });
  
  it("Redo once", async () => {
    await store.dispatch("redo");
  });
  
  it("Redo once", async () => {
    await store.dispatch("redo");
  });
  
  it("Assert list items after redo", async () => {
    expect(state.list).toEqual([
      { ...item },
      { ...item },
      { ...item },
    ]);
  });
});

