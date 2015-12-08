/**
 * Imports
 */

import {updateEphemeral, destroyEphemeral} from 'redux-ephemeral'
import objectEqual from '@micro-js/object-equal'
import arrayEqual from '@micro-js/array-equal'
import getProp from '@micro-js/get-prop'
import {actions} from 'virtex'

/**
 * Constants
 */

const {CREATE_THUNK, UPDATE_THUNK, DESTROY_THUNK} = actions.types

/**
 * Provide local state to virtex components
 */

function local (prop = '') {
  return ({getState, dispatch}) => {
    const state = () => getProp(prop, getState())

    return next => action => {
      switch (action.type) {
        case CREATE_THUNK:
          create(dispatch, action.vnode)
          break
        case UPDATE_THUNK:
          update(state, action.vnode, action.prev)
          break
        case DESTROY_THUNK:
          destroy(dispatch, action.vnode)
          break
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
    dispatch(updateEphemeral(thunk.path, thunk.state))
  }
}

function update (getState, thunk, prev) {
  prepare(thunk, getProp(thunk.path, getState()))
}

function destroy (dispatch, thunk) {
  thunk.type.reducer && dispatch(destroyEphemeral(thunk.path))
}

function shouldUpdate (prev, next) {
  return !arrayEqual(prev.children, next.children) || !objectEqual(prev.props, next.props) || prev.state !== next.state
}

function ref (refs) {
  return name => local => refs[name] = local
}

function prepare (thunk, state) {
  thunk.state = state
  thunk.local = (fn, ...outerArgs) => (...innerArgs) => updateEphemeral(thunk.path, thunk.type.reducer(thunk.state, fn.apply(thunk, outerArgs.concat(innerArgs))))

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
