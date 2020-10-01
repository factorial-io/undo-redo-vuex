# undo-redo-vuex

A Vuex plugin for module namespaced undo and redo functionality. This plugin takes inspiration from and extends the work of [vuex-undo-redo](https://github.com/anthonygore/vuex-undo-redo).

## Installation

```js
yarn add undo-redo-vuex
```

### Browser

```html
<script
  type="text/javascript"
  src="node_modules/undo-redo-vuex/dist/undo-redo-vuex.min.js"
></script>
```

### Module

```js
import undoRedo from "undo-redo-vuex";
```

## Usage

As a standard [plugin for Vuex](https://vuex.vuejs.org/guide/plugins.html), `undo-redo-vuex` can be used with the following setup:

### How to use it in your store module

The `scaffoldStore` helper function will bootstrap a vuex store to setup the `state`, `actions` and `mutations` to work with the plugin.

```js
import { scaffoldStore } from "undo-redo-vuex";

const state = {
  list: [],
  /**
   * 'resetList' is a placeholder (initially the same as 'list') to 
   * fast-forward 'list' during a 'reset()'
   */
  resetList: [],
  // Define vuex state properties as normal
};
const actions = {
  // Define vuex actions as normal
};
const mutations = {
  /*
   * NB: The emptyState mutation HAS to be implemented.
   * This mutation resets the state props to a "base" state,
   * on top of which subsequent mutations are "replayed"
   * whenever undo/redo is dispatched.
   */
  emptyState: state => {
    // Sets some state prop to the 'reset placeholder' value
    state.list = [...state.resetList];
  },

  resetState: state => {
    // Sets the 'reset placeholder' (see state.resetList) prop to the current state
    state.resetList = [...state.list];
  },

  // Define vuex mutations as normal
};

export default scaffoldStore({
  state,
  actions,
  mutations,
  namespaced: true, // NB: do not include this is non-namespaced stores
});
```

### Setting up `emptyState` and `resetState` mutations

The undo and redo functionality requires the `emptyState` mutation (in the example above) to be defined by the developer. This mutation (which is not tracked in the undo and redo stacks) allows state to be 'replayed' in the chronological order mutations are executed. The `clear()` action also commits `emptyState` to re-initialize the store to its original state. The `reset()` action additionally requires the `resetState` mutation to be defined, allowing the state to 'fast-forward' to its point when `reset()` was called before other mutations are 'replayed'.

Alternatively, the `scaffoldState`, `scaffoldActions`, and `scaffoldMutations` helper functions can be individually required to bootstrap the vuex store. This will expose `canUndo` and `canRedo` as vuex state properties which can be used to enable/disable UI controls (e.g. undo/redo buttons).

```js
import {
  scaffoldState,
  scaffoldActions,
  scaffoldMutations,
} from "undo-redo-vuex";

const state = {
  list: [],
  resetList: [],
  // Define vuex state properties as normal
};
const actions = {
  // Define vuex actions as normal
};
const mutations = {
  emptyState: state => {
    state.list = [...(state.resetList || [])];
  },
  resetState: state => {
    // Sets the 'reset placeholder' (see state.resetList) prop to the current state
    state.resetList = [...state.list];
  },
  // Define vuex mutations as normal
};

export default {
  // Use the respective helper function to scaffold state, actions and mutations
  state: scaffoldState(state),
  actions: scaffoldActions(actions),
  mutations: scaffoldMutations(mutations),
  namespaced: true, // NB: do not include this is non-namespaced stores
};
```

### Setup the store plugin

- Namespaced modules

```js
import Vuex from "vuex";
import undoRedo from "undo-redo-vuex";

// NB: The following config is used for namespaced store modules.
// Please see below for configuring a non-namespaced (basic) vuex store
export default new Vuex.Store({
  plugins: [
    undoRedo({
      // The config object for each store module is defined in the 'paths' array
      paths: [
        {
          namespace: "list",
          // Any mutations that you want the undo/redo mechanism to ignore
          ignoreMutations: ["addShadow", "removeShadow"],
        },
      ],
    }),
  ],
  /*
   * For non-namespaced stores:
   * state,
   * actions,
   * mutations,
   */
  // Modules for namespaced stores:
  modules: {
    list,
  },
});
```

- Non-namespaced (basic) vuex store

```js
import Vuex from "vuex";
import undoRedo from "undo-redo-vuex";

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [
    undoRedo({
      // NB: Include 'ignoreMutations' at root level, and do not provide the list of 'paths'.
      ignoreMutations: ["addShadow", "removeShadow"],
    }),
  ],
});
```

### Accessing `canUndo` and `canRedo` properties

- Vue SFC (.vue)

```js
import { mapState } from "vuex";

const MyComponent = {
  computed: {
    ...mapState({
      undoButtonEnabled: "canUndo",
      redoButtonEnabled: "canRedo",
    }),
  },
};
```

### Undoing actions with `actionGroups`

In certain scenarios, undo/redo is required on store actions which may consist of one or more mutations. This feature is accessible by including a `actionGroup` property in the `payload` object of the associated vuex action. Please refer to `test/test-action-group-undo.js` for more comprehensive scenarios.

- vuex module

```js
const actions = {
  myAction({ commit }, payload) {
    // An arbitrary label to identify the group of mutations to undo/redo
    const actionGroup = "myAction";

    // All mutation payloads should contain the actionGroup property
    commit("mutationA", {
      ...payload,
      actionGroup,
    });
    commit("mutationB", {
      someProp: true,
      actionGroup,
    });
  },
};
```

- Undo/redo stack illustration

```js
// After dispatching 'myAction' once
done = [
  { type: "mutationA", payload: { ...payload, actionGroup: "myAction" } },
  { type: "mutationB", payload: { someProp: true, actionGroup: "myAction" } },
];
undone = [];

// After dispatching 'undo'
done = [];
undone = [
  { type: "mutationA", payload: { ...payload, actionGroup: "myAction" } },
  { type: "mutationB", payload: { someProp: true, actionGroup: "myAction" } },
];
```

### Working with undo/redo on mutations produced by side effects (i.e. API/database calls)

In Vue.js apps, Vuex mutations are often committed inside actions that contain asynchronous calls to an API/database service:
For instance, `commit("list/addItem", item)` could be called after an axios request to `PUT https://<your-rest-api>/v1/list`.
When undoing the `commit("list/addItem", item)` mutation, an appropriate API call is required to `DELETE` this item. The inverse also applies if the first API call is the `DELETE` method (`PUT` would have to be called when the `commit("list/removeItem", item)` is undone).
View the unit test for this feature [here](https://github.com/factorial-io/undo-redo-vuex/blob/b2a61ae92aad8c76ed9328021d2c6fc62ccc0774/tests/unit/test.basic.spec.ts#L66).

This scenario can be implemented by providing the respective action names as the `undoCallback` and `redoCallback` fields in the mutation payload (NB: the payload object should be parameterized as an object literal):

```js
const actions = {
  saveItem: async (({ commit }), item) => {
    await axios.put(PUT_ITEM, item);
    commit("addItem", {
      item,
      // dispatch("deleteItem", { item }) on undo()
      undoCallback: "deleteItem",
      // dispatch("saveItem", { item }) on redo()
      redoCallback: "saveItem"
    });
  },
  deleteItem: async (({ commit }), item) => {
    await axios.delete(DELETE_ITEM, item);
    commit("removeItem", {
      item,
      // dispatch("saveItem", { item }) on undo()
      undoCallback: "saveItem",
      // dispatch("deleteItem", { item }) on redo()
      redoCallback: "deleteItem"
    });
  }
};

const mutations = {
  // NB: payload parameters as object literal props
  addItem: (state, { item }) => {
    // adds the item to the list
  },
  removeItem: (state, { item }) => {
    // removes the item from the list
  }
};
```

### Clearing the undo/redo stacks with the `clear` action

The internal `done` and `undone` stacks used to track mutations in the vuex store/modules can be cleared (i.e. emptied) with the `clear` action. This action is scaffolded when using `scaffoldActions(actions)` of `scaffoldStore(store)`. This enhancement is described further in [issue #7](https://github.com/factorial-io/undo-redo-vuex/issues/7#issuecomment-490073843), with accompanying [unit tests](https://github.com/factorial-io/undo-redo-vuex/commit/566a13214d0804ab09f63fcccf502cb854327f8e).

```js
/**
 * Current done stack: [mutationA, mutation B]
 * Current undone stack: [mutationC]
 **/
this.$store.dispatch("list/clear");

await this.$nextTick();
/**
 * Current done stack: []
 * Current undone stack: []
 **/
```

### Resetting the current state with the `reset` action

Unlike the `clear` action, `reset` empties the `done` and `undone` stacks, but maintains the state of the store up to this particular point. This action is scaffolded when using `scaffoldActions(actions)` of `scaffoldStore(store)`. This enhancement is described further in [issue #13](https://github.com/factorial-io/undo-redo-vuex/issues/13), with accompanying [unit tests](https://github.com/factorial-io/undo-redo-vuex/tree/master/tests/unit/test.reset.spec.ts).

```js
/**
 * Current done stack: [mutationA, mutation B]
 * Current undone stack: [mutationC]
 **/
this.$store.dispatch("list/reset");

await this.$nextTick();
/**
 * Current done stack: []
 * Current undone stack: []
 * state: resetState (i.e. initial state + mutationA + mutationB)
 **/
```

### Inspecting `done` and `undone` mutations

Some vuex powered applications may require knowledge of the `done` and `undone` stacks, e.g. to preserve undo/redo functionality between page loads. The following configuration exposes the stacks by scaffoling a `undoRedoConfig` object in the store or module which uses the plugin:

```js
import Vuex from "vuex";
import undoRedo, { scaffoldStore } from "undo-redo-vuex";

// state, getters, actions & mutations ...

// boolean flag to expose done and undone stacks
const exposeUndoRedoConfig = true;

const storeConfig = scaffoldStore({
  state,
  actions,
  mutations
}, exposeUndoRedoConfig); // boolean flag as the second optional param

/**
 * NB: When configuring state, actions or mutations with scaffoldState,
 * scaffoldActions or scaffoldMutations, the exposeUndoRedoConfig = true
 * flag should be passed as the second param.
 */ 

const store = new Vuex.Store({
  ...storeConfig,
  plugins: [
    // Pass boolean flag as an named option
    undoRedo({ exposeUndoRedoConfig })
  ]
});
```

To access the exposed `done` and `undone` stacks, e.g. in a component:

```js
const { done, undone } = this.$store.state;
```

This enhancement is described further in [issue #45](https://github.com/factorial-io/undo-redo-vuex/issues/45), with accompanying [unit tests](https://github.com/factorial-io/undo-redo-vuex/tree/master/tests/unit/test.expose-undo-redo-stacks.spec.ts).

## Testing and test scenarios

Development tests are run using the [Jest](https://jestjs.io/) test runner. The `./tests/store` directory contains a basic Vuex store with a namespaced `list` module.

The test blocks (each `it()` declaration) in `./tests/unit` directory are grouped to mimic certain user interactions with the store, making it possible to track the change in state over time.

```js
yarn test
```

## Demo Vue.js app in `tests/vue-undo-redo-demo`

A demo Vue.js TODO application featuring this plugin is included in the `tests/vue-undo-redo-demo` directory. Example test specs for Vue.js unit testing with Jest, and E2E testing with Cypress are also provided.

## API documentation and reference

### Public API

<dl>
<dt><a href="#store/plugins/undoRedo">store/plugins/undoRedo(options)</a> ⇒ <code>function</code></dt>
<dd><p>The Undo-Redo plugin module</p>
</dd>
<dt><a href="#store/plugins/undoRedo_redo">store/plugins/undoRedo:redo()</a></dt>
<dd><p>The Redo function - commits the latest undone mutation to the store,
and pushes it to the done stack</p>
</dd>
<dt><a href="#store/plugins/undoRedo_undo">store/plugins/undoRedo:undo()</a></dt>
<dd><p>The Undo function - pushes the latest done mutation to the top of the undone
stack by popping the done stack and &#39;replays&#39; all mutations in the done stack</p>
</dd>
</dl>

<a name="store/plugins/undoRedo"></a>

### store/plugins/undoRedo(options) ⇒ <code>function</code>

The Undo-Redo plugin module

**Returns**: <code>function</code> - plugin - the plugin function which accepts the store parameter

| Param                   | Type                              | Description                                                         |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------- |
| options                 | <code>Object</code>               |                                                                     |
| options.namespace       | <code>String</code>               | The named vuex store module                                         |
| options.ignoreMutations | <code>Array.&lt;String&gt;</code> | The list of store mutations (belonging to the module) to be ignored |

<a name="store/plugins/undoRedo_redo"></a>

### store/plugins/undoRedo:redo()

The Redo function - commits the latest undone mutation to the store,
and pushes it to the done stack

<a name="store/plugins/undoRedo_undo"></a>

### store/plugins/undoRedo:undo()

The Undo function - pushes the latest done mutation to the top of the undone
stack by popping the done stack and 'replays' all mutations in the done stack

### Internal functions (reference only)

<dl>
<dt><a href="#store/plugins/undoRedo_pipeActions">store/plugins/undoRedo:pipeActions(actions)</a></dt>
<dd><p>Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise</p>
</dd>
<dt><a href="#store/plugins/undoRedo_getConfig">store/plugins/undoRedo:getConfig(namespace)</a> ⇒ <code>Object</code></dt>
<dd><p>Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise</p>
</dd>
<dt><a href="#store/plugins/undoRedo_setConfig">store/plugins/undoRedo:setConfig(namespace, config)</a></dt>
<dd><p>Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise</p>
</dd>
</dl>

<a name="store/plugins/undoRedo_pipeActions"></a>

### store/plugins/undoRedo:pipeActions(actions)

Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

| Param   | Type                              | Description                                                        |
| ------- | --------------------------------- | ------------------------------------------------------------------ |
| actions | <code>Array.&lt;Object&gt;</code> | The array of objects containing the each action's name and payload |

<a name="store/plugins/undoRedo_getConfig"></a>

### store/plugins/undoRedo:getConfig(namespace) ⇒ <code>Object</code>

Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

**Returns**: <code>Object</code> - config - The object containing the undo/redo stacks of the store module

| Param     | Type                | Description                  |
| --------- | ------------------- | ---------------------------- |
| namespace | <code>String</code> | The name of the store module |

<a name="store/plugins/undoRedo_setConfig"></a>

### store/plugins/undoRedo:setConfig(namespace, config)

Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

| Param     | Type                | Description                                                            |
| --------- | ------------------- | ---------------------------------------------------------------------- |
| namespace | <code>String</code> | The name of the store module                                           |
| config    | <code>String</code> | The object containing the updated undo/redo stacks of the store module |
