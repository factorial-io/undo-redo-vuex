import { shallowMount } from "@vue/test-utils";
import Todos from "../../src/components/Todos/Todos.vue";

describe("Todos.vue", () => {
  const getProps = () => ({
    list: [],
    label: "You don't have any Todos yet",
    canUndo: false,
    canRedo: false
  });

  it("Should render correctly", () => {
    const wrapper = shallowMount(Todos, {
      propsData: getProps()
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it("Should trigger an undo action", () => {
    const baseProps = getProps();
    const propsData = {
      ...baseProps,
      canUndo: true
    };
    const wrapper = shallowMount(Todos, { propsData });
    const undoButton = wrapper.find("#undo");
    expect(undoButton.element.getAttribute("disabled")).toBeFalsy();
    undoButton.trigger("click");
    expect(wrapper.emitted().undo).toBeTruthy();
  });

  it("Should trigger a redo action", () => {
    const baseProps = getProps();
    const propsData = {
      ...baseProps,
      canRedo: true
    };
    const wrapper = shallowMount(Todos, { propsData });
    const redoButton = wrapper.find("#redo");
    expect(redoButton.element.getAttribute("disabled")).toBeFalsy();
    redoButton.trigger("click");
    expect(wrapper.emitted().redo).toBeTruthy();
  });

  it("Should submit a new item when the 'add' button is clicked", () => {
    const baseProps = getProps();
    const wrapper = shallowMount(Todos, {
      propsData: baseProps
    });
    const addButton = wrapper.find("#post");
    addButton.trigger("click");
    expect(wrapper.emitted().postNewTodo).toBeTruthy();
  });
});
