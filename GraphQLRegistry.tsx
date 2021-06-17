import {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { GraphQLHandler } from './GraphQLHandler'

type GraphQLRegistryContextStateConfig = {
  fieldConfig: GraphQLFieldConfig<unknown, Request>
  operationType: 'mutation' | 'query' | 'subscription'
}

type GraphQLRegistryContextState = {
  register: (name: string, config: GraphQLRegistryContextStateConfig) => void
}

const GraphQLRegistryContext = createContext({} as GraphQLRegistryContextState)
export const useGraphQLRegistry = (): GraphQLRegistryContextState =>
  useContext(GraphQLRegistryContext)

export function GraphQLRegistry(props: {
  addListener: any
  children: JSX.Element | JSX.Element[]
}): JSX.Element {
  const { addListener, children } = props

  const [map, setMap] = useState<{
    [x: string]: GraphQLRegistryContextStateConfig
  }>({})

  const register = useCallback(
    (name: string, config: GraphQLRegistryContextStateConfig) => {
      setMap((prev) => {
        const next = { ...prev, [name]: config }
        return next
      })
    },
    []
  )

  const schema = useMemo(() => {
    const queryFields: {
      [x: string]: GraphQLFieldConfig<unknown, Request>
    } = {}
    const mutationFields: {
      [x: string]: GraphQLFieldConfig<unknown, Request>
    } = {}

    for (const key in map) {
      const field = map[key]
      if (field.operationType === 'query') {
        queryFields[key] = field.fieldConfig
      } else if (field.operationType === 'mutation') {
        mutationFields[key] = field.fieldConfig
      }
    }
    const result = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: queryFields,
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutationFields,
      }),
    })

    return result
  }, [map])

  const fieldResolver = useCallback<GraphQLFieldResolver<unknown, Request>>(
    (source: any, args, context, info) => {
      if (map[info.fieldName]) {
        const { resolve } = map[info.fieldName].fieldConfig
        if (resolve) return resolve(source, args, context, info)
      }
      return source[info.fieldName]
    },
    [map]
  )

  return (
    <GraphQLRegistryContext.Provider
      value={{
        register,
      }}
    >
      <GraphQLHandler
        schema={schema}
        fieldResolver={fieldResolver}
        addListener={addListener}
        graphiql
      ></GraphQLHandler>
      {children}
    </GraphQLRegistryContext.Provider>
  )
}
