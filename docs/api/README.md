# API documentation and reference

## undoRedo(options) ⇒ <code>function</code>

The Undo-Redo plugin module

**Returns**: <code>function</code> - plugin - the plugin function which accepts the store parameter

| Param                        | Type                              | Description                                                         |
| ---------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| options                      | <code>Object</code>               |                                                                     |
| options.namespace            | <code>String</code>               | The named vuex store module                                         |
| options.ignoreMutations      | <code>Array.&lt;String&gt;</code> | The list of store mutations (belonging to the module) to be ignored |
| options.exposeUndoRedoConfig | <code>Boolean</code>              | (Optional) Flag to expose the `done` and `undone` mutation stacks   |

## undoRedo:redo()

The Redo function - commits the latest undone mutation to the store,
and pushes it to the done stack

## undoRedo:undo()

The Undo function - pushes the latest done mutation to the top of the undone
stack by popping the done stack and 'replays' all mutations in the done stack

## undoRedo:clear()

The Clear function - empties the done and undone stacks, and re-initializes 
the store's state by executing the `emptyState` mutation

## undoRedo:reset()

The Reset function - empties the done and undone stacks, and resets the 
store's initial state to the current by executing the `resetState` mutation 

## undoRedo:pipeActions(actions)

Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

| Param   | Type                              | Description                                                        |
| ------- | --------------------------------- | ------------------------------------------------------------------ |
| actions | <code>Array.&lt;Object&gt;</code> | The array of objects containing the each action's name and payload |

## undoRedo:getConfig(namespace) ⇒ <code>Object</code>

Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

**Returns**: <code>Object</code> - config - The object containing the undo/redo stacks of the store module

| Param     | Type                | Description                  |
| --------- | ------------------- | ---------------------------- |
| namespace | <code>String</code> | The name of the store module |

## undoRedo:setConfig(namespace, config)

Piping async action calls sequentially using Array.prototype.reduce
to chain and initial, empty promise

| Param     | Type                | Description                                                            |
| --------- | ------------------- | ---------------------------------------------------------------------- |
| namespace | <code>String</code> | The name of the store module                                           |
| config    | <code>String</code> | The object containing the updated undo/redo stacks of the store module |
