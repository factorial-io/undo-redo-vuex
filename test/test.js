import test from 'ava';
import Vue from 'vue';
import plain from 'vue-plain';
import store from './store';

// Get plain objects from vue/vuex getter/setter objects (https://github.com/Coffcer/vue-plain)
Vue.use(plain);

const item = {
  foo: 'bar',
};

// done: [addItem] undone: []
test.serial('Add item to list', async t => {
  const expectedState = [{ ...item }];

  // Commit the item to the store and assert
  store.commit('list/addItem', { item });
  t.deepEqual(Vue.plain(store.state.list.list), expectedState);
});

test.serial(
  'Check "canUndo" value; The undo function should remove the item',
  async t => {
    t.is(Vue.plain(store.state.list.canUndo), true);
    await store.dispatch('list/undo');
  },
);

// done: [] undone: [addItem]
test.serial('Check "canUndo" value, Assert list items after undo', async t => {
  t.is(Vue.plain(store.state.list.canUndo), false);
  t.deepEqual(Vue.plain(store.state.list.list), []);
});

// done: [addItem] undone: []
test.serial('Redo "addItem" commit', async t => {
  t.is(Vue.plain(store.state.list.canRedo), true);
  await store.dispatch('list/redo');
});

test.serial('Assert list items after redo', async t => {
  const expectedState = [{ ...item }];
  t.deepEqual(Vue.plain(store.state.list.list), Vue.plain(expectedState));
});

// done: [addItem, {addItem, addItem}] undone: []
test.serial('Grouped mutations: adding two items to the list', async t => {
  const anotherItem = { foo: 'baz' };
  const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
  const actionGroup = 'myAction';

  // Commit the items to the store and assert
  store.commit('list/addItem', { item, actionGroup });
  store.commit('list/addItem', { item: anotherItem, actionGroup });
  t.deepEqual(Vue.plain(store.state.list.list), expectedState);
});

// done: [addItem] undone: [{addItem, addItem}]
test.serial('Dispatch undo', async () => {
  // The undo function should remove the item
  await store.dispatch('list/undo');
});

test.serial('Assert list items after undo: should contain 1 item', async t => {
  t.deepEqual(Vue.plain(store.state.list.list), [{ ...item }]);
});

// done: [addItem, {addItem, addItem}] undone: []
test.serial('Redo "addItem" twice (grouped mutations)', async () => {
  // Redo 'addItem'
  await store.dispatch('list/redo');
});

test.serial('Assert list items after redo: should contain 3 items', async t => {
  const anotherItem = { foo: 'baz' };
  const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];

  t.deepEqual(Vue.plain(store.state.list.list), Vue.plain(expectedState));
});

test.serial('"addShadow" action should be dispatched on undo', async t => {
  const expectedState = [...Vue.plain(store.state.list.list), item];

  store.commit('list/addItem', {
    index: 0,
    item,
    undoCallback: 'addShadow',
    redoCallback: 'removeShadow',
  });
  t.deepEqual(Vue.plain(store.state.list.list), Vue.plain(expectedState));

  await store.dispatch('list/undo');
});

test.serial('Check shadow: should contain 1 item', t => {
  const expectedState = [{ ...item }];
  t.deepEqual(Vue.plain(store.state.list.shadow), Vue.plain(expectedState));
});

test.serial('"removeShadow" should be dispatched on redo', async () => {
  // Redo 'addItem'
  await store.dispatch('list/redo');
});

test.serial('Check shadow: should contain no items', t => {
  const expectedState = [
    { foo: 'bar' },
    { foo: 'bar' },
    { foo: 'baz' },
    { foo: 'bar' },
  ];

  t.deepEqual(Vue.plain(store.state.list.list), Vue.plain(expectedState));
  t.deepEqual(Vue.plain(store.state.list.shadow), []);
});
