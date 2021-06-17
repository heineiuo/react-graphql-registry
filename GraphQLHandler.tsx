import { graphql, GraphQLFieldResolver, GraphQLSchema } from 'graphql'
import { useEffect } from 'react'
import errors from 'http-errors'
import ReactDOM from 'react-dom/server'

function GraphqiQL(): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="robots" content="noindex" />
        <meta name="referrer" content="origin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GraphiQL</title>
        <style
          dangerouslySetInnerHTML={{
            __html: ` body {
      height: 100vh;
      margin: 0;
      overflow: hidden;
    }
    #splash {
      color: #333;
      display: flex;
      flex-direction: column;
      font-family: system, -apple-system, "San Francisco", ".SFNSDisplay-Regular", "Segoe UI", Segoe, "Segoe WP", "Helvetica Neue", helvetica, "Lucida Grande", arial, sans-serif;
      height: 100vh;
      justify-content: center;
      text-align: center;
    }`,
          }}
        ></style>
        <link rel="icon" href="favicon.ico" />
        <link
          type="text/css"
          href="/__devfiles__/node_modules/graphiql/graphiql.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="splash">Loading&hellip;</div>
        <script src="/__devfiles__/node_modules/es6-promise/es6-promise.auto.min.js"></script>
        <script src="/__devfiles__/node_modules/react/umd/react.production.min.js"></script>
        <script src="/__devfiles__/node_modules/react-dom/umd/react-dom.production.min.js"></script>
        <script src="/__devfiles__/node_modules/graphiql/graphiql.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `  // Parse the search string to get url parameters.
      var search = window.location.search;
      var parameters = {};
      search.substr(1).split('&').forEach(function (entry) {
        var eq = entry.indexOf('=');
        if (eq >= 0) {
          parameters[decodeURIComponent(entry.slice(0, eq))] =
            decodeURIComponent(entry.slice(eq + 1));
        }
      });

      // if variables was provided, try to format it.
      if (parameters.variables) {
        try {
          parameters.variables =
            JSON.stringify(JSON.parse(parameters.variables), null, 2);
        } catch (e) {
          // Do nothing, we want to display the invalid JSON as a string, rather
          // than present an error.
        }
      }

      // When the query and variables string is edited, update the URL bar so
      // that it can be easily shared
      function onEditQuery(newQuery) {
        parameters.query = newQuery;
        updateURL();
      }
      function onEditVariables(newVariables) {
        parameters.variables = newVariables;
        updateURL();
      }
      function onEditOperationName(newOperationName) {
        parameters.operationName = newOperationName;
        updateURL();
      }
      function updateURL() {
        var newSearch = '?' + Object.keys(parameters).filter(function (key) {
          return Boolean(parameters[key]);
        }).map(function (key) {
          return encodeURIComponent(key) + '=' +
            encodeURIComponent(parameters[key]);
        }).join('&');
        history.replaceState(null, null, newSearch);
      }

       function graphQLFetcher(graphQLParams) {
          // This example expects a GraphQL server at the path /graphql.
          // Change this to point wherever you host your GraphQL server.
          return fetch(parameters.fetchURL || location.pathname, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphQLParams),
          }).then(function (response) {
            return response.text();
          }).then(function (responseBody) {
            try {
              return JSON.parse(responseBody);
            } catch (error) {
              return responseBody;
            }
          });
        }

      // Render <GraphiQL /> into the body.
      ReactDOM.render(
        React.createElement(GraphiQL, {
          fetcher: graphQLFetcher,
          query: parameters.query,
          variables: parameters.variables,
          operationName: parameters.operationName,
          onEditQuery: onEditQuery,
          onEditVariables: onEditVariables,
          onEditOperationName: onEditOperationName
        }),
        document.body,
      );`,
          }}
        ></script>
      </body>
    </html>
  )
}

export function GraphQLHandler(props: {
  addListener: (event: 'fetch', callback: (event: any) => void) => () => void
  graphiql?: boolean
  schema: GraphQLSchema
  fieldResolver: GraphQLFieldResolver<any, any>
}): JSX.Element | null {
  const { addListener, schema, graphiql = false, fieldResolver } = props

  useEffect(() => {
    return addListener('fetch', async (event) => {
      try {
        let source = ``
        let variableValues: any = {}
        let operationName = null
        const method = event.request.method
        if (method === 'GET' && graphiql) {
          event.respondWith(
            new Response(
              ReactDOM.renderToStaticMarkup(<GraphqiQL></GraphqiQL>),
              {
                headers: new Headers({
                  'content-type': 'text/html',
                }),
              }
            )
          )
        } else if (method === 'POST') {
          const data = await event.request.json()
          operationName = data.operationName
          source = data.query || ''
          variableValues = data.variables || {}
        } else {
          throw new errors.MethodNotAllowed()
        }

        const result = await graphql({
          schema,
          source,
          rootValue: {},
          contextValue: event.request,
          variableValues,
          operationName,
          fieldResolver,
        })

        event.respondWith(new Response(JSON.stringify(result)))
      } catch (e) {
        event.respondWith(
          new Response(
            JSON.stringify({
              errors: [
                {
                  message: e.name,
                  locations: [
                    {
                      line: 1,
                      column: 1,
                    },
                  ],
                },
              ],
            })
          )
        )
      }
    })
  })

  return null
}
