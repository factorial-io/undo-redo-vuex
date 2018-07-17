import test from 'ava';
import Vue from 'vue';
import plain from 'vue-plain';
import store from './store-non-namespaced';

// Get plain objects from vue/vuex getter/setter objects (https://github.com/Coffcer/vue-plain)
Vue.use(plain);

const redo = () => store.dispatch('redo');
const undo = () => store.dispatch('undo');

const item = (id, label) => ({ id, label });
const firstGroupItems = [
  item(0, 'First group item one'),
  item(1, 'First group item two'),
];

const itemWithoutGroup = item(2, 'Item without group');

const secondGroupItems = [
  item(3, 'Second group item one'),
  item(4, 'Second group item two'),
  item(5, 'Second group item three'),
];

test.serial('Add all items', async t => {
  // Commit the items with action groups to the store and assert
  await store.commit('addItem', {
    item: firstGroupItems[0],
    actionGroup: 'firstGroup',
  });
  await store.commit('addItem', {
    item: firstGroupItems[1],
    actionGroup: 'firstGroup',
  });
  await store.commit('addItem', { item: itemWithoutGroup }); // no group here
  await store.commit('addItem', {
    item: secondGroupItems[0],
    actionGroup: 'secondGroup',
  });
  await store.commit('addItem', {
    item: secondGroupItems[1],
    actionGroup: 'secondGroup',
  });
  await store.commit('addItem', {
    item: secondGroupItems[2],
    actionGroup: 'secondGroup',
  });

  t.deepEqual(Vue.plain(store.state.list), [
    ...firstGroupItems,
    itemWithoutGroup,
    ...secondGroupItems,
  ]);
});

test.serial('Undo secondGroup should remove all secondGroup items', async t => {
  await undo();
  t.deepEqual(Vue.plain(store.state.list), [
    ...firstGroupItems,
    itemWithoutGroup,
  ]);
});

test.serial('Redo secondGroup should restore full list', async t => {
  await redo();
  t.deepEqual(Vue.plain(store.state.list), [
    ...firstGroupItems,
    itemWithoutGroup,
    ...secondGroupItems,
  ]);
});

test.serial('Undo secondGroup', async t => {
  await undo();
  t.deepEqual(Vue.plain(store.state.list), [
    ...firstGroupItems,
    itemWithoutGroup,
  ]);
});

test.serial('Undo secondGroup and mutation without group', async t => {
  await undo();
  t.deepEqual(Vue.plain(store.state.list), firstGroupItems);
});

test.serial('Undo firstGroup as well should leave list empty', async t => {
  await undo();
  t.deepEqual(Vue.plain(store.state.list), []);
});

test.serial('Redo firstGroup should restore items from firstGroup', async t => {
  await redo();
  t.deepEqual(Vue.plain(store.state.list), firstGroupItems);
});

test.serial('Redo mutation without group should restore that item', async t => {
  await redo();
  t.deepEqual(Vue.plain(store.state.list), [
    ...firstGroupItems,
    itemWithoutGroup,
  ]);
});

test.serial('Redo secondGroup should restore full list again', async t => {
  await redo();
  t.deepEqual(Vue.plain(store.state.list), [
    ...firstGroupItems,
    itemWithoutGroup,
    ...secondGroupItems,
  ]);
});
