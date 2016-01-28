/**
 * Imports
 */

import {createEphemeral, toEphemeral, destroyEphemeral, isEphemeral, lookup} from 'redux-ephemeral'
import objectEqual from '@f/object-equal'
import arrayEqual from '@f/array-equal'
import getProp from '@f/get-prop'
import {actions} from 'virtex'

/**
 * Constants
 */

const {CREATE_THUNK, UPDATE_THUNK, DESTROY_THUNK} = actions.types

/**
 * Provide local state to virtex components
 */

function local (prop, dirty = {}) {
  return ({getState, dispatch}) => {
    const state = () => getProp(prop, getState())

    return next => action => {
      switch (action.type) {
        case CREATE_THUNK:
          delete dirty[action.vnode.path]
          create(dispatch, action.vnode)
          break
        case UPDATE_THUNK:
          delete dirty[action.vnode.path]
          update(state, action.vnode, action.prev)
          break
        case DESTROY_THUNK:
          delete dirty[action.vnode.path]
          destroy(dispatch, action.vnode)
          break
      }

      if (isEphemeral(action)) {
        dirty[action.meta.ephemeral.key] = true
      }

      return next(action)
    }
  }
}

function create (dispatch, thunk) {
  const component = thunk.type
  const {initialState = () => ({})} = component

  prepare(thunk, initialState(thunk.props))

  // If a component does not have a reducer, it does not
  // get any local state
  if (component.reducer) {
    component.shouldUpdate = component.shouldUpdate || shouldUpdate
    dispatch(createEphemeral(thunk.path, thunk.state))
  }
}

function update (getState, thunk, prev) {
  prepare(thunk, lookup(getState(), thunk.path))
}

function destroy (dispatch, thunk) {
  thunk.type.reducer && dispatch(destroyEphemeral(thunk.path))
}

function shouldUpdate (prev, next) {
  return prev.state !== next.state || !arrayEqual(prev.children, next.children) || !objectEqual(prev.props, next.props)
}

function ref (refs) {
  return name => local => refs[name] = local
}

function prepare (thunk, state) {
  thunk.state = state
  thunk.local = (fn, ...outerArgs) => (...innerArgs) => toEphemeral(thunk.path, thunk.type.reducer, fn.apply(thunk, outerArgs.concat(innerArgs)))

  const refs = {}

  thunk.ref = {
    as: ref(refs),
    to: (name, fn, ...outerArgs) => (...innerArgs) => refs[name](fn, ...outerArgs)(...innerArgs)
  }

  if (thunk.props && thunk.props.ref) {
    thunk.props.ref(thunk.local)
  }
}

/**
 * Exports
 */

export default local
