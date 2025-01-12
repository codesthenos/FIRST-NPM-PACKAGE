# My first npm package from 0

## How to use it

`npm i codesthenos-first-npm-package`

## It has a todo-list webcomponent

## How to use it

1. Create an `index.html` that contains this:

```html
<todo-list title="TODO APP FROM NPM" button-label="DELETE DONE"></todo-list>
<script
  type="module"
  src="https://cdn.skypack.dev/codesthenos-first-npm-package"
></script>
<!-- use the above script or one of these 2 variations
OR
<script type="module" src="./script.js"></script>

OR
<script type="module">
  import 'https://cdn.skypack.dev/codesthenos-first-npm-package'
</script>
-->
```

2. If use the **OR** option, create a `script.js` with this:

```js
import './node_modules/codesthenos-first-npm-package/index.js'
```
