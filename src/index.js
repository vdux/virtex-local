/**
 * Imports
 */

import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
import identity from '@micro-js/identity'
import objectEqual from 'object-equal'
import arrayEqual from 'array-equal'
import {actions} from 'virtex'
import getProp from 'get-prop'
import omap from 'omap'

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
  const {initialState = defaultState} = component

  prepare(thunk, initialState(thunk.props))

  // If a component does not have a reducer, it does not
  // get any local state
  if (component.reducer) {
    component.shouldUpdate = component.shouldUpdate || shouldUpdate
    dispatch(createEphemeral(stateKey(thunk), component.reducer, thunk.state))

    if (thunk.props.ref) {
      thunk.props.ref(thunk.actions)
    }
  }
}

function update ({getState}, thunk, prev) {
  prepare(thunk, getProp(getState(), stateKey(thunk)))

  if (thunk.props.ref) {
    thunk.props.ref(thunk.actions)
  }
}

function destroy ({dispatch}, thunk) {
  const component = thunk.type
  component.reducer && dispatch(destroyEphemeral(stateKey(thunk)))
}

function defaultState () {
  return {}
}

function stateKey (thunk) {
  const {path, key} = thunk

  return key === undefined
    ? path
    : path.slice(0, path.lastIndexOf('.') + 1) + '.' + key
}

function shouldUpdate (prev, next) {
  return !arrayEqual(prev.children, next.children) || !objectEqual(prev.props, next.props) || !objectEqual(prev.state, next.state)
}

function localAction (type, fn = identity) {
  return (...args) => updateEphemeral(stateKey(args[0]), {type, payload: fn(...args)})
}

function ref (refs) {
  return name => send => refs[name] = send
}

function prepare (thunk, state) {
  thunk.state = state
  thunk.actions = curryActions(thunk)
  thunk.refs = thunk.refs || {}
  thunk.ref = ref(thunk.refs)
}

function curryActions (thunk) {
  return omap(thunk.type.actions, fn => (...args) => fn(thunk, ...args))
}

/**
 * Exports
 */

export default local
export {
  localAction
}
