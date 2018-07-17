import test from 'ava';
import Vue from 'vue';
import plain from 'vue-plain';
import store from './store-non-namespaced';

// Get plain objects from vue/vuex getter/setter objects (https://github.com/Coffcer/vue-plain)
Vue.use(plain);

const item = {
  foo: 'bar',
};

const other = {
  cool: 'idea',
};

// done: [addItem, {addItem, addItem}, {addItem}] undone: []
test.serial('Add 4 items to list', async () => {
  // Commit the items with action groups to the store and assert
  store.commit('addItem', { item });
  store.commit('addItem', { item, actionGroup: 'firstGroup' });
  store.commit('addItem', { item: other, actionGroup: 'firstGroup' });
  store.commit('addItem', { item, actionGroup: 'secondGroup' });
});

test.serial('Assert items: should contain 4 items', async t => {
  const expectedState = [{ ...item }, { ...item }, { ...other }, { ...item }];
  t.deepEqual(Vue.plain(store.state.list), expectedState);
});

// done: [addItem, {addItem, addItem}] undone: [{addItem}]
test.serial('Undo secondGroup', async () => {
  await store.dispatch('undo');
});

test.serial('Assert items: should contain 3 items', async t => {
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...other },
  ]);
});

// done: [addItem] undone: [{addItem}, {addItem, addItem}]
test.serial('Undo firstGroup', async () => {
  await store.dispatch('undo');
});

test.serial('Assert items: should contain 1 item', async t => {
  t.deepEqual(Vue.plain(store.state.list), [{ ...item }]);
});

// done: [addItem, {addItem, addItem}] undone: [{addItem}]
test.serial('Redo firstGroup', async () => {
  await store.dispatch('redo');
});

test.serial('Assert items: should contain 3 items', async t => {
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...other },
  ]);
});

// done: [addItem, {addItem, addItem}, {addItem}] undone: []
test.serial('Redo secondGroup', async () => {
  await store.dispatch('redo');
});

test.serial('Assert items: should contain 4 items', async t => {
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...other },
    { ...item },
  ]);
});
