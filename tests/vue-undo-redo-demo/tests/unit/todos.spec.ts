import { mount } from "@vue/test-utils";
import Todos from "../../src/components/Todos/Todos.vue";

test("renders correctly", () => {
  const context = {
    props: {
      list: [],
      label: "You don't have any Todos yet",
      canUndo: false,
      canRedo: false
    }
  };
  const listeners = {
    postNewTodo: () => {},
    undo: () => {},
    redo: () => {}
  };

  const wrapper = mount(Todos, {
    context,
    listeners
  });
  expect(wrapper.element).toMatchSnapshot();
});
