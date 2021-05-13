/* global db print */
/* eslint no-restricted-globals: "off" */
const names = ["banana republic", "Tommy", "CK", "Hoodie", "Chain"];
const categories = ["Shirts", "Jeans", "Jackets", "Sweaters", "Accessories"];
const images = [
  "https://homepages.cae.wisc.edu/~ece533/images/monarch.png",
  "https://homepages.cae.wisc.edu/~ece533/images/girl.png",
  "https://homepages.cae.wisc.edu/~ece533/images/serrano.png",
  "https://homepages.cae.wisc.edu/~ece533/images/tulips.png",
  "https://homepages.cae.wisc.edu/~ece533/images/pool.png",
];
const initialCount = db.products.count();
for (let i = 0; i < 100; i += 1) {
  const id = initialCount + i + 1;
  const name = names[Math.floor(Math.random() * 5)];
  const category = categories[Math.floor(Math.random() * 5)];
  const image = images[Math.floor(Math.random() * 5)];
  const price = Math.ceil(Math.random() * 20);
  const product = {
    id,
    category,
    name,
    price,
    image,
  };
  db.products.insertOne(product);
}

const count = db.products.count();
db.counters.update({ _id: "products" }, { $set: { current: count } });

print("New product count:", count);
