const templateElement = document.createElement("template")

templateElement.innerHTML = `
<style>


</style>

<div class="input-action-wrapper">
  <input type="text" />
  <button disabled></button>
</div>
`

class InputAction extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({ mode: "open" })

    this.buttonLabel = this.getAttribute('button-label') ?? 'ACTION'
    this.placeholder = this.getAttribute('placeholder') ?? 'placeholder text'
  }

  connectedCallback() {
    const template = templateElement.content.cloneNode(true)

    template.querySelector('button').textContent = this.buttonLabel
    template.querySelector('input').setAttribute('placeholder', this.placeholder)

    this.shadowRoot.appendChild(template)

    const button = this.shadowRoot.querySelector('button')
    const input = this.shadowRoot.querySelector('input')
    // add in the button in the shadow dom a click event listener that dispatches a custom event
    button.addEventListener('click', () => {
      const inputText = input.value
      const customEvent = new CustomEvent('input-action-submit', {
        detail: inputText
      })

      this.dispatchEvent(customEvent)
      // clear input value after use it
      input.value = ''
      // set disabled
      button.setAttribute('disabled', '')
    })
    // add input event to the input in the shadow dom to listen when it changes
    input.addEventListener('input', (event) => {
      const value = event.target.value
      
      if (!value) {
        button.setAttribute('disabled', '')
      } else {
        button.removeAttribute('disabled')
      }
    })
    // add to 'Enter' key the same functionality as the ADD button
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const inputText = input.value
        const customEvent = new CustomEvent('input-action-submit', {
          detail: inputText
        })
  
        this.dispatchEvent(customEvent)
        // clear input value after use it
        input.value = ''
        // set disabled
        button.setAttribute('disabled', '')
      }
    })
  }
}

window.customElements.define("input-action", InputAction)