import { shallowMount } from "@vue/test-utils";
import Todos from "../../src/components/Todos/Todos.vue";

test("renders correctly", () => {
  const context = {
    props: {
      list: [],
      label: "You don't have any Todos yet",
      canUndo: false,
      canRedo: false
    },
    on: {
      postNewTodo: () => { },
      undo: () => { },
      redo: () => { }
    }
  };

  const wrapper = shallowMount(Todos, {
    context
  });
  expect(wrapper.element).toMatchSnapshot();
});
