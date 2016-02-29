/**
 * Imports
 */

import ephemeral, {createEphemeral, toEphemeral, destroyEphemeral, isEphemeral, lookup} from 'redux-ephemeral'
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
          // Prevent the clearing of dirtiness
          // if we're just rendering a cached
          // node
          if (!action.vnode.vnode) {
            delete dirty[action.vnode.path]
          }

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

  prepare(thunk, initialState)

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

function prepare (thunk, initialState) {
  thunk.local = (fn, ...outerArgs) => (...innerArgs) => toEphemeral(thunk.path, thunk.type.reducer, fn.apply(thunk, outerArgs.concat(innerArgs)))
  thunk.state = initialState(thunk)
}

/**
 * Exports
 */

export default local
export {
  ephemeral as mount
}
