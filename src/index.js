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
  const {component, model} = thunk

  // Components get link functions even if they don't themselves
  // have local state
  model.link = link(model.refs = {})

  // If a component does not have a reducer, it does not
  // get any local state
  if (!component.reducer) return

  component.shouldUpdate = component.shouldUpdate || shouldUpdate

  const {initialState = defaultState, reducer} = component
  const key = stateKey(model)

  model.state = initialState(model.props)
  dispatch(createEphemeral(key, reducer, model.state))

  if (component.actions) {
    model.actions = curryActions(component.actions, key)
  }

  if (model.props.ref) {
    model.props.ref(model.actions)
  }
}

function update ({getState}, thunk) {
  const {model} = thunk
  model.state = getProp(getState(), stateKey(model))
}

function destroy ({getState, dispatch}, thunk) {
  const {model, component} = thunk

  if (!component.reducer) return

  const key = stateKey(model)
  model.state = getProp(getState(), key)
  dispatch(destroyEphemeral(key))
}

function defaultState () {
  return {}
}

function stateKey (model) {
  const {path, key} = model

  if (key !== undefined) {
    return path.slice(0, path.lastIndexOf('.') + 1)
  }

  return path
}

function shouldUpdate (prev, next) {
  return !arrayEqual(prev.children, next.children) || !objectEqual(prev.props, next.props) || !objectEqual(prev.state, next.state)
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
