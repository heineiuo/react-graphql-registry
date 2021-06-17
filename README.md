# `<GraphQLRegistry>` &middot;  <a href="https://github.com/heineiuo/react-graphql-registry/actions"><img style="max-width:100%" alt="GitHub Actions status" src="https://github.com/heineiuo/react-graphql-registry/workflows/CI/badge.svg"></a>  <a href="https://www.npmjs.com/package/react-graphql-registry"><img style="max-width:100%" alt="npm version" src="https://img.shields.io/npm/v/react-graphql-registry.svg?style=flat"></a>  


## Usage

```tsx


const GraphQLUser = new GraphQLObject({
  // TODO
})

const resolveUser = useCallback(async (_, args, ctx):Promise<User> => {
 // TODO
}, [])

 <GraphQLRegistry addListener={props.addListener}>
      <GraphQLField
        name="user"
        operationType="query"
        description="Query user metadata"
        type={GraphQLUser}
        args={{
          userId: { type: GraphQLNonNull(GraphQLID) },
        }}
        resolve={resolveUser}
      ></GraphQLField>
<GraphQLRegistry>
```