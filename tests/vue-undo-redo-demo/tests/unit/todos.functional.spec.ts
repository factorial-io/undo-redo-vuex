import { shallowMount } from "@vue/test-utils";
import Todos from "../../src/components/Todos/Todos.functional.vue";

describe("Todos.vue", () => {
  const getContext = () => ({
    props: {
      list: [],
      label: "You don't have any Todos yet",
      canUndo: false,
      canRedo: false
    },
    on: {
      postNewTodo: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn()
    }
  });

  it("Should render correctly", () => {
    const wrapper = shallowMount(Todos, {
      context: getContext()
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it("Should trigger an undo action", () => {
    const baseContext = getContext();
    const context = {
      ...baseContext,
      props: {
        ...baseContext.props,
        canUndo: true
      }
    };
    const wrapper = shallowMount(Todos, { context });
    const undoButton = wrapper.find("#undo");
    expect(undoButton.element.getAttribute("disabled")).toBeFalsy();
    undoButton.trigger("click");
    expect(context.on.undo).toHaveBeenCalled();
  });

  it("Should trigger a redo action", () => {
    const baseContext = getContext();
    const context = {
      ...baseContext,
      props: {
        ...baseContext.props,
        canRedo: true
      }
    };
    const wrapper = shallowMount(Todos, { context });
    const redoButton = wrapper.find("#redo");
    expect(redoButton.element.getAttribute("disabled")).toBeFalsy();
    redoButton.trigger("click");
    expect(context.on.redo).toHaveBeenCalled();
  });

  it("Should submit a new item when the 'add' button is clicked", () => {
    const context = getContext();
    const wrapper = shallowMount(Todos, {
      context
    });
    const addButton = wrapper.find("#post");
    addButton.trigger("click");
    expect(context.on.postNewTodo).toHaveBeenCalled();
  });
});
