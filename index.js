const { ApolloServer, gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling"
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton"
  }
];
const videos = [
  {
    title: "Hoes Mad!",
    URL: "https://www.youtube.com/watch?v=J6oTIjvw_-8",
    artist: "Famous Dex",
    id: 1
  },
  {
    title: "Kamikaze",
    URL: "https://www.youtube.com/watch?v=HShOMLxQ1Ww",
    artist: "Lil Mosey",
    id: 2
  }
];
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    videos: [Video]
    play(id: ID!): Blob
  }
  type Video {
    title: String!
    url: String!
    artist: String!
    id: ID!
  }
  type Blob {
    blob: String
  }
  directive @deprecated(
    reason: String = "No Longer supported"
  ) on FIELD_DEFINITON
`;
const resolvers = {
  Query: {
    books: () => books,
    videos: () => videos,
    play: ID => {}
  }
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
