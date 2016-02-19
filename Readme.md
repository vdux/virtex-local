
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
import {mount} from 'virtex-local'

export default mount('app', reducer)
```

### Local state

When using virtex-local, your components will receive three extra things in their model:

 * `local` - Wraps actions that you want to direct to your local reducer.
 * `state` - Your components local state.

### Example

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

## Dirty map

There is a second argument you may pass to the virtex-local middleware when you install it, `dirty`. If you pass this argument, virtex-local will maintain a map of the dirty state of your components. This can be useful for implementing partial subtree re-rendering optimizations. E.g.

```javascript
const dirty = {}
applyMiddleware(local('app', dirty), ...)

function update (state) {
  Object.keys(dirty).forEach(key => rerenderSubtree(key)))
}
```

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
