/**
 * Imports
 */

import {actions} from 'virtex'
import {createEphemeral, updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
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
        create(api, action.thunk)
        break
      case UPDATE_THUNK:
        update(api, action.thunk)
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

  dispatch(createEphemeral(stateKey(thunk), reducer, state))
  props.state = state
}

function update ({getState}, thunk) {
  const {props, component} = thunk

  // If a component does not have a reducer, it does not
  // get any local state
  if (!component.reducer) return

  props.state = getProp(getState(), stateKey(thunk))
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

/**
 * Exports
 */

export default local
