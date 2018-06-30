# undo-redo-vuex

A Vuex plugin for module namespaced undo and redo functionality. This plugin takes inspiration from and extends the work of [vuex-undo-redo](https://github.com/anthonygore/vuex-undo-redo).

## Installation

```js
yarn add undo-redo-vuex
```

### Browser

```html
<script type="text/javascript" src="node_modules/undo-redo-vuex/dist/undo-redo-vuex.min.js"></script>
```

### Module

```js
import undoRedo from 'undo-redo-vuex';
```

## Usage

As a standard [plugin for Vuex](https://vuex.vuejs.org/guide/plugins.html), `undo-redo-vuex` can be used with the following setup:

### Named or basic store module

The `scaffoldStore` helper function will bootstrap a vuex store to setup the `state`, `actions` and `mutations` to work with the plugin.

```js
import { scaffoldStore } from 'undo-redo-vuex';

const state = {
  // Define vuex state properties as normal
};
const actions = {
  // Define vuex actions as normal
};
const mutations = {
  // Define vuex mutations as normal
}

export default scaffoldStore({
  state,
  actions,
  mutations,
  namespaced: true // NB: do not include this is non-namespaced stores
});
```

Alternatively, the `scaffoldState`, `scaffoldActions`, and `scaffoldMutations` helper functions can be individually required to bootstrap the vuex store. This will expose `canUndo` and `canRedo` as vuex state properties which can be used to enable/disable UI controls (e.g. undo/redo buttons).

```js
import {
  scaffoldState,
  scaffoldActions,
  scaffoldMutations,
} from 'undo-redo-vuex';

const state = {
  // Define vuex state properties as normal
};
const actions = {
  // Define vuex actions as normal
};
const mutations = {
  // Define vuex mutations as normal
}

export default {
  // Use the respective helper function to scaffold state, actions and mutations
  state: scaffoldState(state),
  actions: scaffoldActions(actions),
  mutations: scaffoldMutations(mutations),
  namespaced: true // NB: do not include this is non-namespaced stores
}
```

### store/index.js

- Namespaced modules

```js
import Vuex from 'vuex';
import undoRedo from 'undo-redo-vuex';

// NB: The following config is used for namespaced store modules.
// Please see below for configuring a non-namespaced (basic) vuex store
export default new Vuex.Store({
  plugins: [
    undoRedo({
      // The config object for each store module is defined in the 'paths' array
      paths: [
        {
          namespace: 'list',
          // Any mutations that you want the undo/redo mechanism to ignore
          ignoreMutations: ['addShadow', 'removeShadow'],
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
  }
});
```

- Non-namespaced (basic) vuex store

```js
import Vuex from 'vuex';
import undoRedo from 'undo-redo-vuex';

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [
    undoRedo({
      // NB: Include 'ignoreMutations' at root level, and do not provide the list of 'paths'.
      ignoreMutations: ['addShadow', 'removeShadow'],
    }),
  ],
});
```

### Accessing `canUndo` and `canRedo` properties

- Vue SFC (.vue)

```js
import { mapState } from 'vuex';

const MyComponent = {
  computed: {
    ...mapState({
      undoButtonEnabled: 'canUndo',
      redoButtonEnabled: 'canRedo',
    }),
  }
}
```

## Testing and test scenarios

Development tests are run using the [Ava](https://github.com/avajs/ava) test runner. The `./test/store` directory contains a basic Vuex store with a namespaced `list` module.

The tests in `./test/test.js` are executed serially to track the change in store state over time.

```js
yarn test
```

## API documentation and reference

### Functions

<dl>
<dt><a href="#store/plugins/undoRedo">store/plugins/undoRedo(options)</a> ⇒ <code>function</code></dt>
<dd><p>The Undo-Redo plugin module</p>
</dd>
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

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.namespace | <code>String</code> | The named vuex store module |
| options.ignoreMutations | <code>Array.&lt;String&gt;</code> | The list of store mutations (belonging to the module) to be ignored |

<a name="store/plugins/undoRedo_pipeActions"></a>

### store/plugins/undoRedo:pipeActions(actions)
Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise


| Param | Type | Description |
| --- | --- | --- |
| actions | <code>Array.&lt;Object&gt;</code> | The array of objects containing the each action's name and payload |

<a name="store/plugins/undoRedo_getConfig"></a>

### store/plugins/undoRedo:getConfig(namespace) ⇒ <code>Object</code>
Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

**Returns**: <code>Object</code> - config - The object containing the undo/redo stacks of the store module  

| Param | Type | Description |
| --- | --- | --- |
| namespace | <code>String</code> | The name of the store module |

<a name="store/plugins/undoRedo_setConfig"></a>

### store/plugins/undoRedo:setConfig(namespace, config)
Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise


| Param | Type | Description |
| --- | --- | --- |
| namespace | <code>String</code> | The name of the store module |
| config | <code>String</code> | The object containing the updated undo/redo stacks of the store module |

<a name="store/plugins/undoRedo_redo"></a>

### store/plugins/undoRedo:redo()
The Redo function - commits the latest undone mutation to the store,
and pushes it to the done stack

<a name="store/plugins/undoRedo_undo"></a>

### store/plugins/undoRedo:undo()
The Undo function - pushes the latest done mutation to the top of the undone
stack by popping the done stack and 'replays' all mutations in the done stack
