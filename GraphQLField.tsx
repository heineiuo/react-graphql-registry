import { GraphQLFieldConfig } from 'graphql'
import { useEffect, useRef } from 'react'
import { useGraphQLRegistry } from './GraphQLRegistry'

/**
 * Note: only `name` and `operationType` change can
 * emit re-register call, other props like `args` will
 * only use the first time values.
 */
export function GraphQLField(
  props: GraphQLFieldConfig<unknown, Request> & {
    name: string
    operationType: 'mutation' | 'query' | 'subscription'
  }
): null {
  const { name, operationType, ...fieldConfig } = props
  const { register } = useGraphQLRegistry()

  const fieldConfigRef = useRef(fieldConfig)

  useEffect(() => {
    register(name, {
      operationType,
      fieldConfig: fieldConfigRef.current,
    })
  }, [name, operationType, register])
  return null
}
