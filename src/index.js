/**
 * Imports
 */

import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
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

  prepare(thunk)

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
  thunk.refs = prev.refs
  prepare(thunk, getState)
}

function destroy ({getState, dispatch}, thunk) {
  prepare(thunk, getState)
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

function curryActions (thunk) {
  const component = thunk.type

  if (component.actions) {
    thunk.actions = omap(component.actions, fn => (...args) => fn(thunk, ...args))
  }
}

function localAction (type) {
  return (thunk, payload, meta) => updateEphemeral(stateKey(thunk), {
    type,
    payload,
    meta
  })
}

function ref (refs) {
  return name => actions => refs[name] = actions
}

function prepare (thunk, getState) {
  if (!thunk.ref) thunk.ref = ref(thunk.refs = thunk.refs || {})
  curryActions(thunk)
  thunk.state = getState
    ? getProp(getState(), stateKey(thunk))
    : (thunk.type.initialState || defaultState)(thunk.props)
}

/**
 * Exports
 */

export default local
export {
  localAction
}
