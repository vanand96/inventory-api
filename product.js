const { UserInputError } = require("apollo-server-express");
const { getDb, getNextSequence } = require("./db.js");
const { mustBeSignedIn } = require("./auth.js");

async function get(_, { id }) {
  const db = getDb();
  const product = await db.collection("products").findOne({ id });
  return product;
}

const PAGE_SIZE = 10;

async function list(_, { category, priceMin, priceMax, search, page }) {
  const db = getDb();
  const filter = {};
  if (category) filter.category = category;

  if (priceMin !== undefined || priceMax !== undefined) {
    filter.price = {};
    if (priceMin !== undefined) filter.price.$gte = priceMin;
    if (priceMax !== undefined) filter.price.$lte = priceMax;
  }

  if (search) filter.$text = { $search: search };

  const cursor = db
    .collection("products")
    .find(filter)
    .sort({ id: 1 })
    .skip(PAGE_SIZE * (page - 1))
    .limit(PAGE_SIZE);

  const totalCount = await cursor.count(false);
  const products = cursor.toArray();
  const pages = Math.ceil(totalCount / PAGE_SIZE);
  return { products, pages };
  // return productDB;
}

async function add(_, { product }) {
  // product.id = productDB.length + 1;
  // productDB.push(product);
  // return product;
  const db = getDb();
  const newProduct = Object.assign({}, product);

  product.id = await getNextSequence("products");
  const result = await db.collection("products").insertOne(newProduct);
  const savedProduct = await db
    .collection("products")
    .findOne({ _id: result.insertedId });
  return savedProduct;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.name || changes.price || changes.image) {
    const product = await db.collection("products").findOne({ id });
    Object.assign(product, changes);
  }
  await db.collection("products").updateOne({ id }, { $set: changes });
  const savedProduct = await db.collection("products").findOne({ id });
  return savedProduct;
}

async function remove(_, { id }) {
  const db = getDb();
  const product = await db.collection("products").findOne({ id });
  if (!product) return false;
  product.deleted = new Date();

  let result = await db.collection("deleted_products").insertOne(product);
  if (result.insertedId) {
    result = await db.collection("products").removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

async function restore(_, { id }) {
  const db = getDb();
  const issue = await db.collection("products").findOne({ id });
  if (!issue) return false;
  issue.deleted = new Date();

  let result = await db.collection("products").insertOne(product);
  if (result.insertedId) {
    result = await db.collection("deleted_products").removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

async function counts(_, { category, priceMin, priceMax }) {
  const db = getDb();
  const filter = {};

  if (category) filter.category = category;

  if (priceMin !== undefined || priceMax !== undefined) {
    filter.effort = {};
    if (priceMin !== undefined) filter.effort.$gte = priceMin;
    if (priceMax !== undefined) filter.effort.$lte = priceMax;
  }

  const results = await db
    .collection("products")
    .aggregate([
      { $match: filter },
      {
        $group: {
          _id: { name: "$name", category: "$category" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const stats = {};
  products.forEach((result) => {
    // eslint-disable-next-line no-underscore-dangle
    const { name, category: categoryKey } = result._id;
    if (!stats[name]) stats[name] = { name };
    stats[name][categoryKey] = result.count;
  });
  return Object.values(stats);
}

module.exports = {
  list,
  add: mustBeSignedIn(add),
  get,
  update: mustBeSignedIn(update),
  delete: mustBeSignedIn(remove),
  restore: mustBeSignedIn(restore),
  counts,
};
