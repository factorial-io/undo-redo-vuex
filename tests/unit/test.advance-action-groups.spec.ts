import store from "../store-non-namespaced";

const state: any = store.state;

const redo = () => store.dispatch("redo");
const undo = () => store.dispatch("undo");

const item = (id: number, label: string) => ({ id, label });
const firstGroupItems = [
  item(0, "First group item one"),
  item(1, "First group item two")
];

const itemWithoutGroup = item(2, "Item without group");

const secondGroupItems = [
  item(3, "Second group item one"),
  item(4, "Second group item two"),
  item(5, "Second group item three")
];

describe("Testing more advanced combinations of grouped mutations", () => {
  it("Add all items", async () => {
    // Commit the items with action groups to the store and assert
    await store.commit("addItem", {
      item: firstGroupItems[0],
      actionGroup: "firstGroup"
    });
    await store.commit("addItem", {
      item: firstGroupItems[1],
      actionGroup: "firstGroup"
    });
    await store.commit("addItem", { item: itemWithoutGroup }); // no group here
    await store.commit("addItem", {
      item: secondGroupItems[0],
      actionGroup: "secondGroup"
    });
    await store.commit("addItem", {
      item: secondGroupItems[1],
      actionGroup: "secondGroup"
    });
    await store.commit("addItem", {
      item: secondGroupItems[2],
      actionGroup: "secondGroup"
    });

    expect(state.list).toEqual([
      ...firstGroupItems,
      itemWithoutGroup,
      ...secondGroupItems
    ]);
  });

  it("Undo secondGroup should remove all secondGroup items", async () => {
    await undo();
    expect(state.list).toEqual([...firstGroupItems, itemWithoutGroup]);
  });

  it("Redo secondGroup should restore full list", async () => {
    await redo();
    expect(state.list).toEqual([
      ...firstGroupItems,
      itemWithoutGroup,
      ...secondGroupItems
    ]);
  });

  it("Undo secondGroup", async () => {
    await undo();
    expect(state.list).toEqual([...firstGroupItems, itemWithoutGroup]);
  });

  it("Undo secondGroup and mutation without group", async () => {
    await undo();
    expect(state.list).toEqual(firstGroupItems);
  });

  it("Undo firstGroup as well should leave list empty", async () => {
    await undo();
    expect(state.list).toEqual([]);
  });

  it("Redo firstGroup should restore items from firstGroup", async () => {
    await redo();
    expect(state.list).toEqual(firstGroupItems);
  });

  it("Redo mutation without group should restore that item", async () => {
    await redo();
    expect(state.list).toEqual([...firstGroupItems, itemWithoutGroup]);
  });

  it("Redo secondGroup should restore full list again", async () => {
    await redo();
    expect(state.list).toEqual([
      ...firstGroupItems,
      itemWithoutGroup,
      ...secondGroupItems
    ]);
  });
});
