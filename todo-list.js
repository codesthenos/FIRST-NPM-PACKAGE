import "./action-item.js"
import "./input-action.js"

const templateElement = document.createElement("template")

templateElement.innerHTML = `
<style>


</style>

<div class="todo-list-wrapper">
  <h1></h1>
  <input-action placeholder="New task here" button-label="ADD"></input-action>
</div>
<button></button>
`

class TodoList extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: "open" })

    this.title = this.getAttribute('title') ?? 'DEFAULT TITLE'
    this.buttonLabel = this.getAttribute('button-label') ?? 'ACTION BUTTON'

    this.storedTasks = JSON.parse(localStorage.getItem('TODOS')) ?? []
  }

  createTask ({ text, checked, taskId }) {
    const newTask = document.createElement('div')
    newTask.innerHTML = `<action-item id="${taskId}" text="${text}" ${checked ? 'checked' : ''}></action-item>`

    const actionItem = newTask.querySelector('action-item')

    actionItem.addEventListener('action-item-remove', () => {
      this.deleteTask({ id: taskId })
    })

    actionItem.addEventListener('action-item-status-change', (event) => {
      this.toggleTask({ id: taskId, checked: event.detail })
    })

    actionItem.addEventListener('action-item-edit', (event) => {
      this.updateTask({ id: taskId, newText: event.detail })
    })

    return newTask
  }

  storeTask ({ text, checked, taskId }) {
    const newTask = { text, checked, id: taskId }
    this.storedTasks = [...this.storedTasks, newTask]

    localStorage.setItem('TODOS', JSON.stringify(this.storedTasks))
  }

  showStoredTasks ({ container, tasks }) {
    tasks.forEach(task => {
      const taskDiv = this.createTask({ text: task.text, checked: task.checked, taskId: task.id })

      container.appendChild(taskDiv)
    })
  }

  deleteTask ({ id }) {
    this.storedTasks = this.storedTasks.filter(task => task.id !== id)

    localStorage.setItem('TODOS', JSON.stringify(this.storedTasks))
  }

  toggleTask ({ id, checked }) {
    this.storedTasks = this.storedTasks.map(task => {
      if (task.id !== id) {
        return task
      } else {
        return {
          ...task,
          checked
        }
      }
    })

    localStorage.setItem('TODOS', JSON.stringify(this.storedTasks))

    if (checked) {
      this.shadowRoot.querySelector(`#${id}`).setAttribute('checked', '')
    } else {
      this.shadowRoot.querySelector(`#${id}`).removeAttribute('checked')
    }
  }

  deleteAllChecked () {
    this.storedTasks = this.storedTasks.filter(task => !task.checked)

    localStorage.setItem('TODOS', JSON.stringify(this.storedTasks))
    // delete them from the current dom without refresh
    const actionItems = Array.from(this.shadowRoot.querySelectorAll('action-item[checked]'))
    actionItems.forEach(actionItem => actionItem.parentElement.remove())
  }

  updateTask ({ id, newText }) {
    this.storedTasks = this.storedTasks.map(task => {
      if (task.id !== id) {
        return task
      } else {
        return {
          ...task,
          text: newText
        }
      }
    })

    localStorage.setItem('TODOS', JSON.stringify(this.storedTasks))

    const actionItem = this.shadowRoot.querySelector(`#${id}`)
    actionItem.setAttribute('text', newText)

    const editInput = actionItem.shadowRoot.querySelector('.edit-input')
    editInput.classList.add('visually-hidden')
    editInput.setAttribute('disabled', '')

    actionItem.shadowRoot.querySelector('span').textContent = newText
  }

  connectedCallback () {
    const template = templateElement.content.cloneNode(true)

    template.querySelector('h1').textContent = this.title

    const button = template.querySelector('button')
    button.textContent = this.buttonLabel

    button.addEventListener('click', () => {
      this.deleteAllChecked()
    })

    this.shadowRoot.appendChild(template)

    const inputAction = this.shadowRoot.querySelector('input-action')
    const todoWrapper = this.shadowRoot.querySelector('.todo-list-wrapper')

    this.showStoredTasks({ container: todoWrapper, tasks: this.storedTasks })
    
    inputAction.addEventListener('input-action-submit', (event) => {
      const taskId = `ID-${crypto.randomUUID()}`
      const newActionItemDiv = this.createTask({ text: event.detail, taskId })

      this.storeTask({ text: event.detail, checked: false, taskId: taskId })

      todoWrapper.appendChild(newActionItemDiv)
    })
  }
}

window.customElements.define("todo-list", TodoList)
