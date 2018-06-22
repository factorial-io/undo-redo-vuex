import test from 'ava';
import Vue from 'vue';
import plain from 'vue-plain';
import store from './store-non-namespaced';

// Get plain objects from vue/vuex getter/setter objects (https://github.com/Coffcer/vue-plain)
Vue.use(plain);

const item = {
  foo: 'bar',
};

test.serial('Add item to list and undo', async t => {
  const expectedState = [{ ...item }];

  // Commit the item to the store and assert
  store.commit('addItem', { item });
  t.deepEqual(Vue.plain(store.state.list), expectedState);

  // The undo function should remove the item
  await store.dispatch('undo');
});

test.serial('Assert list items after undo', async t => {
  t.deepEqual(Vue.plain(store.state.list), []);
});

test.serial('Redo "addItem" commit', async () => {
  await store.dispatch('redo');
});

test.serial('Assert list items after redo', async t => {
  const expectedState = [{ ...item }];
  t.deepEqual(Vue.plain(store.state.list), Vue.plain(expectedState));
});

test.serial('Grouped mutations: adding two items to the list', async t => {
  const anotherItem = { foo: 'baz' };
  const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
  const actionGroup = 'myAction';

  // Commit the items to the store and assert
  store.commit('addItem', { item, actionGroup });
  store.commit('addItem', { item: anotherItem, actionGroup });
  t.deepEqual(Vue.plain(store.state.list), expectedState);

  // The undo function should remove the item
  await store.dispatch('undo');
});

test.serial('Assert list items after undo: should contain 1 item', async t => {
  t.deepEqual(Vue.plain(store.state.list), [{ ...item }]);
});

test.serial('Redo once', async () => {
  // Redo 'addItem'
  await store.dispatch('redo');
});

test.serial('Redo "addItem" twice (grouped mutations)', async () => {
  // Redo 'addItem'
  await store.dispatch('redo');
});

test.serial('Assert list items after redo: should contain 3 items', async t => {
  const anotherItem = { foo: 'baz' };
  const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];

  t.deepEqual(Vue.plain(store.state.list), Vue.plain(expectedState));
});

test.serial('"addShadow" action should be dispatched on undo', async t => {
  const expectedState = [...Vue.plain(store.state.list), item];

  // Redo 'addItem'
  store.commit('addItem', {
    index: 0,
    item,
    undoCallback: 'addShadow',
    redoCallback: 'removeShadow',
  });
  t.deepEqual(Vue.plain(store.state.list), Vue.plain(expectedState));

  await store.dispatch('undo');
});

test.serial('Check shadow: should contain 1 item', t => {
  const expectedState = [{ ...item }];
  t.deepEqual(Vue.plain(store.state.shadow), Vue.plain(expectedState));
});

test.serial('"removeShadow" should be dispatched on redo', async () => {
  // Redo 'addItem'
  await store.dispatch('redo');
});

test.serial('Check shadow: should contain no items', t => {
  const expectedState = [
    { foo: 'bar' },
    { foo: 'bar' },
    { foo: 'baz' },
    { foo: 'bar' },
  ];

  t.deepEqual(Vue.plain(store.state.list), Vue.plain(expectedState));
  t.deepEqual(Vue.plain(store.state.shadow), []);
});
