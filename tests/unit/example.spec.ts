import { mutations } from "../store/modules/list";

const item = {
  foo: 'bar',
};

describe("Simple testing for undo/redo on a namespaced vuex store", () => {
  it("Add item to list", () => {
    const state = { list: [] };
    const expectedState = [{ ...item }];

    // Commit the item to the store and assert
    mutations.addItem(state, { item });
    
    expect(state.list).toEqual(expectedState);
  });
});
