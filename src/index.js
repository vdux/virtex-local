/**
 * Imports
 */

import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
import objectEqual from 'object-equal'
import arrayEqual from 'array-equal'
import {actions} from 'virtex'
import getProp from 'get-prop'

/**
 * Constants
 */

const {CREATE_THUNK, UPDATE_THUNK, DESTROY_THUNK} = actions.types

/**
 * Provide local state to virtex components
 */

function local (api) {
  return next => action => {
    switch (action.type) {
      case CREATE_THUNK:
        create(api, action.vnode)
        break
      case UPDATE_THUNK:
        update(api, action.vnode, action.prev)
        break
      case DESTROY_THUNK:
        destroy(api, action.vnode)
        break
    }

    return next(action)
  }
}

function create ({dispatch}, thunk) {
  const component = thunk.type
  const {initialState = () => ({})} = component

  prepare(thunk, initialState(thunk.props))

  // If a component does not have a reducer, it does not
  // get any local state
  if (component.reducer) {
    component.shouldUpdate = component.shouldUpdate || shouldUpdate
    dispatch(createEphemeral(thunk.path, component.reducer, thunk.state))
  }
}

function update ({getState}, thunk, prev) {
  prepare(thunk, getProp(getState(), thunk.path))
}

function destroy ({dispatch}, thunk) {
  thunk.type.reducer && dispatch(destroyEphemeral(thunk.path))
}

function shouldUpdate (prev, next) {
  return !arrayEqual(prev.children, next.children) || !objectEqual(prev.props, next.props) || !objectEqual(prev.state, next.state)
}

function ref (refs) {
  return name => local => refs[name] = local
}

function prepare (thunk, state) {
  thunk.state = state
  thunk.local = fn => (...args) => updateEphemeral(thunk.path, fn(thunk, ...args))

  const refs = {}

  thunk.ref = {
    as: ref(refs),
    to: (name, fn, ...outerArgs) => (...innerArgs) => refs[name](fn, ...outerArgs)(...innerArgs)
  }

  if (thunk.props.ref) {
    thunk.props.ref(thunk.local)
  }
}

/**
 * Exports
 */

export default local
