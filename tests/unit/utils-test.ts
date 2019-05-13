import Vue from "vue";

export const redo = (store: any) => async (namespace: string = "") => {
  await store.dispatch(`${namespace ? `${namespace}/` : ""}redo`);
  await Vue.nextTick();
};

export const undo = (store: any) => async (namespace: string = "") => {
  await store.dispatch(`${namespace ? `${namespace}/` : ""}undo`);
  await Vue.nextTick();
};
