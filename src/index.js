/**
 * Imports
 */

import {actions} from 'virtex'
import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
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
        create(api, action.thunk)
        break
      case UPDATE_THUNK:
        update(api, action.thunk, action.prev)
        break
      case DESTROY_THUNK:
        destroy(api, action.thunk)
        break
    }

    return next(action)
  }
}

function create ({dispatch}, thunk) {
  const {component, props} = thunk

  // If a component does not have a reducer, it does not
  // get any local state
  if (!component.reducer) return

  const {initialState = defaultState, reducer} = component
  const state = initialState(props)
  const key = stateKey(thunk)

  dispatch(createEphemeral(key, reducer, state))
  props.state = state
  component.actions = component.actions || {}

  props.link = link(props.refs = {})
  props.actions = curryActions(component.actions, key)

  if (props.ref) {
    props.ref(props.actions)
  }
}

function update ({getState}, thunk, prev) {
  const {props, component} = thunk

  // If a component does not have a reducer, it does not
  // get any local state
  if (!component.reducer) return

  props.state = getProp(getState(), stateKey(thunk))
  props.actions = prev.props.actions
  props.refs = prev.props.refs
  props.ref = prev.props.ref
  props.link = prev.props.link
}

function destroy ({getState, dispatch}, thunk) {
  const {props, component} = thunk

  // If a component does not have a reducer, it does not
  // get any local state
  if (!component.reducer) return

  const key = stateKey(thunk)
  props.state = getProp(getState(), key)
  dispatch(destroyEphemeral(key))
}

function defaultState () {
  return {}
}

function stateKey (thunk) {
  const {props, path} = thunk

  if (props.key !== undefined) {
    return path.slice(0, path.lastIndexOf('.') + 1)
  }

  return path
}

function curryActions (actions, key) {
  return omap(actions, fn => (payload, meta) => fn(key, payload, meta))
}

function localAction (type) {
  return (key, payload, meta) => updateEphemeral(key, {
    type,
    payload,
    meta
  })
}

function link (refs) {
  return name => actions => refs[name] = actions
}

/**
 * Exports
 */

export default local
export {
  localAction
}
