import test from 'ava';
import Vue from 'vue';
import plain from 'vue-plain';
import store from './store-non-namespaced';

// Get plain objects from vue/vuex getter/setter objects (https://github.com/Coffcer/vue-plain)
Vue.use(plain);

const item = {
  foo: 'bar',
};

test.serial('Add 3 items to list and undo once', async t => {
  const expectedState = [{ ...item }, { ...item }, { ...item }];

  // Commit the item to the store and assert
  await store.commit('addItem', { item });
  await store.commit('addItem', { item });
  await store.commit('addItem', { item });
  t.deepEqual(Vue.plain(store.state.list), expectedState);

  // The undo function should remove the item
  await store.dispatch('undo');
});

test.serial('Undo once', async () => {
  await store.dispatch('undo');
});

test.serial('Assert list items after undos', async t => {
  t.deepEqual(Vue.plain(store.state.list), [{ ...item }]);
});

test.serial('Redo once', async () => {
  await store.dispatch('redo');
});

test.serial('Redo once', async () => {
  await store.dispatch('redo');
});

test.serial('Assert list items after redo', async t => {
  t.deepEqual(Vue.plain(store.state.list), [
    { ...item },
    { ...item },
    { ...item },
  ]);
});
