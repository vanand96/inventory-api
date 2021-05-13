const fs = require("fs");
require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");

const about = require("./about.js");
const product = require("./product.js");
const auth = require("./auth.js");

const resolvers = {
  Query: {
    about: about.getAboutMessage,
    user: auth.resolveUser,
    productList: product.list,
    product: product.get,
    productCounts: product.counts,
  },
  Mutation: {
    setAboutMessage: about.setAboutMessage,
    productAdd: product.add,
    productUpdate: product.update,
    productDelete: product.delete,
    productRestore: product.restore,
  },
};

function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync("schema.graphql", "utf-8"),
  resolvers,
  context: getContext,
  formatError: (error) => {
    console.log(error);
    return error;
  },
  playground: true,
  introspection: true,
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || "true") === "true";
  console.log("CORS setting:", enableCors);
  let cors;
  if (enableCors) {
    const origin = process.env.UI_SERVER_ORIGIN || "http://localhost:8000";
    const methods = "POST";
    cors = { origin, methods, credentials: true };
  } else {
    cors = "false";
  }
  server.applyMiddleware({ app, path: "/graphql", cors });
}

module.exports = { installHandler };
