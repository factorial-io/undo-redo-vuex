---
prev: ./usage
next: ./demo
---

# Testing and test scenarios

Development tests are run using the [Jest](https://jestjs.io/) test runner. The `./tests/store` directory contains a basic Vuex store with a namespaced `list` module.

The test blocks (each `it()` declaration) in `./tests/unit` directory are grouped to mimic certain user interactions with the store, making it possible to track the change in state over time.

```js
yarn test
```