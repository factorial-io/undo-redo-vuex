# undo-redo-vuex

A Vuex plugin for module namespaced undo and redo functionality. This plugin takes inspiration and extends the work of [vuex-undo-redo](https://github.com/anthonygore/vuex-undo-redo).

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

### Named store module

```js
export default {
  // Defined state
  state,
  // Defined mutations
  mutations,
  actions: {
    // The following two NOOP functions are required to trigger the undo/redo
    // mechanism in the plugin
    undo() {},
    redo() {}
  },
  namespaced: true
}
```

### store/index.js

```js
import Vuex from 'vuex';
import undoRedo from 'undo-redo-vuex';

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
  modules: {
    list,
  }
});
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

**Kind**: global function  
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

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| actions | <code>Array.&lt;Object&gt;</code> | The array of objects containing the each action's name and payload |

<a name="store/plugins/undoRedo_getConfig"></a>

### store/plugins/undoRedo:getConfig(namespace) ⇒ <code>Object</code>
Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

**Kind**: global function  
**Returns**: <code>Object</code> - config - The object containing the undo/redo stacks of the store module  

| Param | Type | Description |
| --- | --- | --- |
| namespace | <code>String</code> | The name of the store module |

<a name="store/plugins/undoRedo_setConfig"></a>

### store/plugins/undoRedo:setConfig(namespace, config)
Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| namespace | <code>String</code> | The name of the store module |
| config | <code>String</code> | The object containing the updated undo/redo stacks of the store module |

<a name="store/plugins/undoRedo_redo"></a>

### store/plugins/undoRedo:redo()
The Redo function - commits the latest undone mutation to the store,
and pushes it to the done stack

**Kind**: global function  
<a name="store/plugins/undoRedo_undo"></a>

### store/plugins/undoRedo:undo()
The Undo function - pushes the latest done mutation to the top of the undone
stack by popping the done stack and 'replays' all mutations in the done stack

**Kind**: global function
