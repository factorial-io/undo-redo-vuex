import test from 'ava';
import Vue from 'vue';
import plain from 'vue-plain';
import store from './store-non-namespaced';

// Get plain objects from vue/vuex getter/setter objects (https://github.com/Coffcer/vue-plain)
Vue.use(plain);

const item = {
  foo: 'bar',
};

test.serial('Add 4 items to list', async t => {
  const expectedState = [{ ...item }, { ...item }, { ...item }, { ...item }];

  // Commit the items with action groups to the store and assert
  await store.commit('addItem', { item });
  await store.commit('addItem', { item, actionGroup: 'firstGroup' });
  await store.commit('addItem', { item, actionGroup: 'firstGroup' });
  await store.commit('addItem', { item, actionGroup: 'secondGroup' });
  t.deepEqual(Vue.plain(store.state.list), expectedState);
});

test.serial('Undo secondGroup', async t => {
  await store.dispatch('undo');
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...item },
  ]);
});

test.serial('Undo firstGroup', async t => {
  await store.dispatch('undo');
  t.deepEqual(Vue.plain(store.state.list), [{ ...item }]);
});

test.serial('Redo firstGroup', async t => {
  await store.dispatch('redo');
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...item },
  ]);
});

test.serial('Redo secondGroup', async t => {
  await store.dispatch('redo');
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...item },
    { ...item },
  ]);
});
