/* eslint linebreak-style: ["error", "windows"] */
/* global db print */
/* eslint no-restricted-globals: "off" */

db.products.remove({});
db.deleted_products.remove({});

const productsDB = [
  {
    id: 1,
    category: "Shirts",
    name: "Formal",
    price: 5,
    image: "https://www/google.com",
  },
  {
    id: 2,
    category: "Jeans",
    name: "Ripped",
    price: 5,
    image: "https://www/google.com",
  },
];

db.products.insertMany(productsDB);
const count = db.products.count();
print("Inserted", count, "products");

db.counters.remove({ _id: "products" });
db.counters.insert({ _id: "products", current: count });

db.products.createIndex({ id: 1 }, { unique: true });
db.products.createIndex({ name: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ name: "text", category: "text" });

db.deleted_products.createIndex({ id: 1 }, { unique: true });
