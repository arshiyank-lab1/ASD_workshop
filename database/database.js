const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '..', 'db.json');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function readData() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}
async function writeData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
module.exports = {
  getAllProducts: async () => {
    await delay(1000);
    return await readData();
  },
  getProductById: async (id) => {
    const products = await readData();
    return products.find((p) => p.id === Number(id));
  },
  createProduct: async (productData) => {
    const products = await readData();
    const newProduct = { id: Date.now(), ...productData };
    products.push(newProduct);
    await writeData(products);
    return newProduct;
  },
  updateProduct: async (id, productData) => {
    const products = await readData();
    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;
    products[index] = { ...products[index], ...productData };
    await writeData(products);
    return products[index];
  },
  deleteProduct: async (id) => {
    const products = await readData();
    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) return false;
    const updatedProducts = products.filter((p) => p.id !== Number(id));
    await writeData(updatedProducts);
    return true;
  }
};