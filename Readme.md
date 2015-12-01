
# virtex-local

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A local state middleware for [virtex](https://github.com/ashaffer/virtex) [components](https://github.com/ashaffer/virtex-component)

## Installation

    $ npm install virtex-local

## Usage

First, you need to install it in your redux middleware stack *before* [virtex-component](https://github.com/ashaffer/virtex-component).  E.g.

`applyMiddleware(local, component, ...others)`

### Local state

If you want your component to have local state, you need to export a reducer and some actions.  You can do that like this:

```javascript
import {localAction} from 'virtex-local'

const SET_TEXT = 'SET_TEXT'

function render ({actions, state}) {
  return (
    <input type='text' onChange={setText} />
    <span>
      The text in your input is {state.text}
    </span>
  )
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
  reducer,
  actions: {
    setText: localAction(SET_TEXT)
  }
}
```

A curried copy of your local actions will be passed into your `model` as `actions`.  They will also be passed into all of your lifecycle hooks, including render.  Any local actions emitted on the key of your component will be processed by your `reducer` to produce a new local state.

### Refs

Sometimes you want to be able to tell your child component's to do something.  You can call any of your children's actions by referencing them like this:

```javascript
function render ({link, refs}) {
  const {input} = refs

  return (
    <TextInput ref={link('input')} />
    <button onClick={() => input.clear()}>Clear Input</button>
  )
}
```

Where `TextInput` has:

```javascript
import {localAction} from 'virtex-local'

const SET_TEXT = 'SET_TEXT'
const CLEAR_TEXT = 'CLEAR_TEXT'

function render ({actions, state}) {
  return (
    <input type='text' onChange={setText} />
    <span>
      The text in your input is {state.text}
    </span>
  )
}

function reducer (state, action) {
  switch (action.type) {
    case CLEAR_TEXT:
      return {
        ...state,
        text: ''
      }
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
  reducer,
  actions: {
    setText: localAction(SET_TEXT),
    clear: localAction(CLEAR_TEXT)
  }
}
```

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
