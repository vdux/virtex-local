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
        update(api, action.vnode)
        break
      case DESTROY_THUNK:
        destroy(api, action.vnode)
        break
    }

    return next(action)
  }
}

function create ({dispatch}, thunk) {
  const {type: component} = thunk
  const refs = {}

  const model = createModel(thunk)

  // Components get ref functions even if they don't themselves
  // have local state
  model.ref = ref(refs)

  // If a component does not have a reducer, it does not
  // get any local state
  if (!component.reducer) return

  component.shouldUpdate = component.shouldUpdate || shouldUpdate

  const {initialState = defaultState, reducer} = component
  const key = stateKey(model)

  model.state = initialState(model.props)
  dispatch(createEphemeral(key, reducer, model.state))

  if (component.actions) {
    model.actions = curryActions(component.actions, model, refs, key)
  }

  if (model.props.ref) {
    model.props.ref(model.actions)
  }
}

function update ({getState}, thunk) {
  const model = createModel(thunk)
  model.state = getProp(getState(), stateKey(model))
}

function destroy ({getState, dispatch}, thunk) {
  const {model, type: component} = thunk

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

function curryActions (actions, model, refs, key) {
  return omap(actions, fn => (...args) => fn({model, refs, key}, ...args))
}

function localAction (type) {
  return ({key}, payload, meta) => updateEphemeral(key, {
    type,
    payload,
    meta
  })
}

function ref (refs) {
  return name => actions => refs[name] = actions
}

function createModel (thunk) {
  const model = thunk.model = thunk.model || {}

  model.path = thunk.path
  model.key = thunk.key
  model.props = thunk.attrs || {}
  model.children = thunk.children

  return model
}

/**
 * Exports
 */

export default local
export {
  localAction
}
