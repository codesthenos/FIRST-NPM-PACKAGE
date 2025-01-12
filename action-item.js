const templateElement = document.createElement("template")

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
  <button>🚮</button>
</div>
`

class ActionItem extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({ mode: "open" })
    // NO MANEJAMOS QUE SE PINTE UN ELEMENTO VACIO
    this.text = this.getAttribute('text') ?? ''
    // checked
    this.checked = this.hasAttribute('checked')
  }

  connectedCallback() {
    const template = templateElement.content.cloneNode(true)

    const span = template.querySelector('span')

    span.textContent = this.text

    const editInput = template.querySelector('.edit-input')

    span.addEventListener('click', () => {
      if (editInput.hasAttribute('disabled')) {
        editInput.classList.remove('visually-hidden')
        editInput.removeAttribute('disabled')
        editInput.setAttribute('value', this.text)
        span.textContent = '❌'
      } else {
        editInput.classList.add('visually-hidden')
        editInput.setAttribute('disabled', '')
        span.textContent = this.text
      }
    })

    editInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const customEvent = new CustomEvent('action-item-edit', {
          detail: event.target.value
        })

        this.dispatchEvent(customEvent)
      }
    })

    if (this.checked) {
      template.querySelector('input').setAttribute('checked', '')
    }

    this.shadowRoot.appendChild(template)

    const removeButton = this.shadowRoot.querySelector('button')
    const checkbox = this.shadowRoot.querySelector('input')

    removeButton.addEventListener('click', () => {
      const customEvent = new CustomEvent('action-item-remove')

      this.dispatchEvent(customEvent)

      this.remove()
    })

    checkbox.addEventListener('change', () => {
      const customEvent = new CustomEvent('action-item-status-change', {
        detail: checkbox.checked
      })

      this.dispatchEvent(customEvent)
    })
  }
}

window.customElements.define("action-item", ActionItem)
