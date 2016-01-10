
# virtex-local

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A local state middleware for [virtex](https://github.com/ashaffer/virtex) [components](https://github.com/ashaffer/virtex-component)

## Installation

    $ npm install virtex-local

## Usage

First, you need to install it in your redux middleware stack *before* [virtex-component](https://github.com/ashaffer/virtex-component).  E.g.

`applyMiddleware(local('app'), component, dom(document), ...others)`

The `'app'` string passed to virtex-local tells it where in your global state atom your component state tree will be mounted. In this case, `state.app` is where it will live. In order for this to work, you will also need to mount [redux-ephemeral](https://github.com/ashaffer/redux-ephemeral) into your reducer at the same key, like this:

```javascript
import combineReducers from '@f/combine-reducers'
import ephemeral from 'redux-ephemeral'

export default combineReducers({
  // ...other reducers,
  app: ephemeral
})
```

### Local state

When using virtex-local, your components will receive three extra things in their model:

 * `local` - Wraps actions that you want to direct to your local reducer.
 * `state` - Your components local state.
 * `ref` - Allows you to dispatch actions to other components, see below for more details.

### Example (without refs)

```javascript
import element from 'virtex-element'

function render ({local, state}) {
  return (
    <input type='text' onChange={local(setText)} />
    <span>
      The text in your input is {state.text}
    </span>
  )
}

const SET_TEXT = 'SET_TEXT'

function setText (e) {
  const text = e.currentTarget.value

  return {
    type: SET_TEXT,
    payload: text
  }
}

function reducer (state, action) {
  switch (action.type) {
    case SET_TEXT:
      return {
        ...state,
        text: action.payload
      }
  }

  return state
}

export default {
  render,
  reducer
}
```

### Refs

Refs allow you to talk to child components. The `ref` property you receive in your model has two functions on it:

  * `as(name)` - Binds a ref to `name`. Put it on a component like this `<Dropdown ref={ref.as('my_dropdown')}`
  * `to(name, actionCreator)` - Returns a curried function that dispatches the action returned by `actionCreator` to the ref specified by `name`. E.g. `<button onClick={ref.to('my_dropdown', Dropdown.toggle)} />`

### Example (with refs)

Sometimes you want to be able to tell your child component's to do something.  You can call any of your children's actions by referencing them like this:

```javascript
import Dropdown from 'components/dropdown'

function render ({ref}) {
  const {input} = refs

  return (
    <Dropdown ref={ref.as('dropdown')}>
      <div>Thing 1</div>
      <div>Thing 2</div>
    </Dropdown>
    <button onClick={ref.to('dropdown', Dropdown.toggle)}>Toggle Dropdown</button>
  )
}
```

Where `Dropdown` has:

```javascript

function render ({state, children}) {
  return (
    <div class={{show: state.open}}>
      {children}
    </div>
  )
}

const TOGGLE = 'TOGGLE_DROPDOWN'

function toggle () {
  return {
    type: TOGGLE
  }
}

function reducer (state, action) {
  switch (action.type) {
    case TOGGLE:
      return {
        ...state
        open: !state.open
      }
  }

  return state
}

export default {
  render,
  reducer,
  toggle
}
```

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
