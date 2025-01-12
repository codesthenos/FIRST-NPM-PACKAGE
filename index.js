(() => {
  // src/action-item.js
  var templateElement = document.createElement("template");
  templateElement.innerHTML = `
<style>
  input:checked ~ span {
    text-decoration: line-through;
  }
  .action-item-wrapper {
    cursor: pointer;
  }
  .visually-hidden {
    opacity: 0;
    position: absolute;
    z-index: -5;
  }

</style>

<div class="action-item-wrapper">
  <input type="checkbox" />
  <input class="visually-hidden edit-input" disabled />
  <span></span>
  <button>\u{1F6AE}</button>
</div>
`;
  var ActionItem = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.text = this.getAttribute("text") ?? "";
      this.checked = this.hasAttribute("checked");
    }
    connectedCallback() {
      const template = templateElement.content.cloneNode(true);
      const span = template.querySelector("span");
      span.textContent = this.text;
      const editInput = template.querySelector(".edit-input");
      span.addEventListener("click", () => {
        if (editInput.hasAttribute("disabled")) {
          editInput.classList.remove("visually-hidden");
          editInput.removeAttribute("disabled");
          editInput.setAttribute("value", this.text);
          span.textContent = "\u274C";
        } else {
          editInput.classList.add("visually-hidden");
          editInput.setAttribute("disabled", "");
          span.textContent = this.text;
        }
      });
      editInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          const customEvent = new CustomEvent("action-item-edit", {
            detail: event.target.value
          });
          this.dispatchEvent(customEvent);
        }
      });
      if (this.checked) {
        template.querySelector("input").setAttribute("checked", "");
      }
      this.shadowRoot.appendChild(template);
      const removeButton = this.shadowRoot.querySelector("button");
      const checkbox = this.shadowRoot.querySelector("input");
      removeButton.addEventListener("click", () => {
        const customEvent = new CustomEvent("action-item-remove");
        this.dispatchEvent(customEvent);
        this.remove();
      });
      checkbox.addEventListener("change", () => {
        const customEvent = new CustomEvent("action-item-status-change", {
          detail: checkbox.checked
        });
        this.dispatchEvent(customEvent);
      });
    }
  };
  window.customElements.define("action-item", ActionItem);

  // src/input-action.js
  var templateElement2 = document.createElement("template");
  templateElement2.innerHTML = `
<style>


</style>

<div class="input-action-wrapper">
  <input type="text" />
  <button disabled></button>
</div>
`;
  var InputAction = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.buttonLabel = this.getAttribute("button-label") ?? "ACTION";
      this.placeholder = this.getAttribute("placeholder") ?? "placeholder text";
    }
    connectedCallback() {
      const template = templateElement2.content.cloneNode(true);
      template.querySelector("button").textContent = this.buttonLabel;
      template.querySelector("input").setAttribute("placeholder", this.placeholder);
      this.shadowRoot.appendChild(template);
      const button = this.shadowRoot.querySelector("button");
      const input = this.shadowRoot.querySelector("input");
      button.addEventListener("click", () => {
        const inputText = input.value;
        const customEvent = new CustomEvent("input-action-submit", {
          detail: inputText
        });
        this.dispatchEvent(customEvent);
        input.value = "";
        button.setAttribute("disabled", "");
      });
      input.addEventListener("input", (event) => {
        const value = event.target.value;
        if (!value) {
          button.setAttribute("disabled", "");
        } else {
          button.removeAttribute("disabled");
        }
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          const inputText = input.value;
          const customEvent = new CustomEvent("input-action-submit", {
            detail: inputText
          });
          this.dispatchEvent(customEvent);
          input.value = "";
          button.setAttribute("disabled", "");
        }
      });
    }
  };
  window.customElements.define("input-action", InputAction);

  // src/todo-list.js
  var templateElement3 = document.createElement("template");
  templateElement3.innerHTML = `
<style>


</style>

<div class="todo-list-wrapper">
  <h1></h1>
  <input-action placeholder="New task here" button-label="ADD"></input-action>
</div>
<button></button>
`;
  var TodoList = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.title = this.getAttribute("title") ?? "DEFAULT TITLE";
      this.buttonLabel = this.getAttribute("button-label") ?? "ACTION BUTTON";
      this.storedTasks = JSON.parse(localStorage.getItem("TODOS")) ?? [];
    }
    createTask({ text, checked, taskId }) {
      const newTask = document.createElement("div");
      newTask.innerHTML = `<action-item id="${taskId}" text="${text}" ${checked ? "checked" : ""}></action-item>`;
      const actionItem = newTask.querySelector("action-item");
      actionItem.addEventListener("action-item-remove", () => {
        this.deleteTask({ id: taskId });
      });
      actionItem.addEventListener("action-item-status-change", (event) => {
        this.toggleTask({ id: taskId, checked: event.detail });
      });
      actionItem.addEventListener("action-item-edit", (event) => {
        this.updateTask({ id: taskId, newText: event.detail });
      });
      return newTask;
    }
    storeTask({ text, checked, taskId }) {
      const newTask = { text, checked, id: taskId };
      this.storedTasks = [...this.storedTasks, newTask];
      localStorage.setItem("TODOS", JSON.stringify(this.storedTasks));
    }
    showStoredTasks({ container, tasks }) {
      tasks.forEach((task) => {
        const taskDiv = this.createTask({ text: task.text, checked: task.checked, taskId: task.id });
        container.appendChild(taskDiv);
      });
    }
    deleteTask({ id }) {
      this.storedTasks = this.storedTasks.filter((task) => task.id !== id);
      localStorage.setItem("TODOS", JSON.stringify(this.storedTasks));
    }
    toggleTask({ id, checked }) {
      this.storedTasks = this.storedTasks.map((task) => {
        if (task.id !== id) {
          return task;
        } else {
          return {
            ...task,
            checked
          };
        }
      });
      localStorage.setItem("TODOS", JSON.stringify(this.storedTasks));
      if (checked) {
        this.shadowRoot.querySelector(`#${id}`).setAttribute("checked", "");
      } else {
        this.shadowRoot.querySelector(`#${id}`).removeAttribute("checked");
      }
    }
    deleteAllChecked() {
      this.storedTasks = this.storedTasks.filter((task) => !task.checked);
      localStorage.setItem("TODOS", JSON.stringify(this.storedTasks));
      const actionItems = Array.from(this.shadowRoot.querySelectorAll("action-item[checked]"));
      actionItems.forEach((actionItem) => actionItem.parentElement.remove());
    }
    updateTask({ id, newText }) {
      this.storedTasks = this.storedTasks.map((task) => {
        if (task.id !== id) {
          return task;
        } else {
          return {
            ...task,
            text: newText
          };
        }
      });
      localStorage.setItem("TODOS", JSON.stringify(this.storedTasks));
      const actionItem = this.shadowRoot.querySelector(`#${id}`);
      actionItem.setAttribute("text", newText);
      const editInput = actionItem.shadowRoot.querySelector(".edit-input");
      editInput.classList.add("visually-hidden");
      editInput.setAttribute("disabled", "");
      actionItem.shadowRoot.querySelector("span").textContent = newText;
    }
    connectedCallback() {
      const template = templateElement3.content.cloneNode(true);
      template.querySelector("h1").textContent = this.title;
      const button = template.querySelector("button");
      button.textContent = this.buttonLabel;
      button.addEventListener("click", () => {
        this.deleteAllChecked();
      });
      this.shadowRoot.appendChild(template);
      const inputAction = this.shadowRoot.querySelector("input-action");
      const todoWrapper = this.shadowRoot.querySelector(".todo-list-wrapper");
      this.showStoredTasks({ container: todoWrapper, tasks: this.storedTasks });
      inputAction.addEventListener("input-action-submit", (event) => {
        const taskId = `ID-${crypto.randomUUID()}`;
        const newActionItemDiv = this.createTask({ text: event.detail, taskId });
        this.storeTask({ text: event.detail, checked: false, taskId });
        todoWrapper.appendChild(newActionItemDiv);
      });
    }
  };
  window.customElements.define("todo-list", TodoList);
})();
