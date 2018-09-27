// https://docs.cypress.io/api/introduction/api.html

describe("My First Test", () => {
  it("Visits the app root url", () => {
    cy.visit("/");
    cy.contains("h4", "You don't have any Todos yet");
    cy.get("#undo").should("be.disabled");
    cy.get("#redo").should("be.disabled");
  });

  it("Type new todo", () => {
    cy.get("input")
      .type("Hello, world!{enter}");
      cy.get("#undo").should("not.be.disabled");
    
    cy.get("ol")
      .contains("li", "Hello, world!");
  });

  it("Undo removes todo", () => {
    cy.get("#undo").click();
    cy.get("ol").should("be.empty");
    cy.get("#undo").should("be.disabled");
    cy.get("#redo").should("not.be.disabled");
  });

  it("Redo input", () => {
    cy.get("#redo").click();
    cy.get("ol")
      .contains("li", "Hello, world!");
    cy.get("#undo").should("not.be.disabled");
    cy.get("#redo").should("be.disabled");
  });
});
