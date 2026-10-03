const assert = require('assert');
const app = require('./server');

const TEST_PORT = 3456;
let server;

async function runTests() {
  console.log('--- Starting ASD Workshop API Test Suite ---');

  server = app.listen(TEST_PORT, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // Test 1: Root endpoint
    console.log('\n[1] Testing GET / ...');
    const rootRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(rootRes.status, 200, 'Root endpoint should return 200');
    const rootData = await rootRes.json();
    assert.strictEqual(rootData.name, 'ASD Workshop API');
    console.log('✓ Root endpoint returned expected payload');

    // Test 2: Health endpoint
    console.log('\n[2] Testing GET /health ...');
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'UP');
    console.log('✓ Health endpoint returned status UP');

    // Test 3: Cache MISS on first GET /products
    console.log('\n[3] Testing GET /products (Cache MISS) ...');
    const getRes1 = await fetch(`${baseUrl}/products`);
    assert.strictEqual(getRes1.status, 200);
    assert.strictEqual(getRes1.headers.get('x-cache'), 'MISS');
    const products1 = await getRes1.json();
    assert(Array.isArray(products1), 'Response should be an array');
    console.log(`✓ Products retrieved (${products1.length} items, X-Cache: MISS)`);

    // Test 4: Cache HIT on immediate second GET /products
    console.log('\n[4] Testing GET /products (Cache HIT) ...');
    const getRes2 = await fetch(`${baseUrl}/products`);
    assert.strictEqual(getRes2.status, 200);
    assert.strictEqual(getRes2.headers.get('x-cache'), 'HIT');
    console.log('✓ Cache hit verified (X-Cache: HIT)');

    // Test 5: Input validation for POST /products (invalid data)
    console.log('\n[5] Testing POST /products validation ...');
    const invalidRes1 = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    assert.strictEqual(invalidRes1.status, 400, 'Should return 400 for empty name');

    const invalidRes2 = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Valid Name', price: -10 }),
    });
    assert.strictEqual(invalidRes2.status, 400, 'Should return 400 for negative price');
    console.log('✓ Input validation correctly rejected invalid payloads with 400');

    // Test 6: Create new product & verify cache invalidation
    console.log('\n[6] Testing POST /products creation ...');
    const createRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Mechanical Keyboard', price: 89.99 }),
    });
    assert.strictEqual(createRes.status, 201, 'Should return 201 Created');
    const createdProduct = await createRes.json();
    assert(createdProduct.id, 'Created product should have an ID');
    assert.strictEqual(createdProduct.name, 'Test Mechanical Keyboard');
    console.log(`✓ Product created with ID: ${createdProduct.id}`);

    // Verify cache was invalidated after create
    const afterCreateRes = await fetch(`${baseUrl}/products`);
    assert.strictEqual(afterCreateRes.headers.get('x-cache'), 'MISS', 'Cache should be invalidated after create');
    console.log('✓ Cache invalidation verified after create');

    // Test 7: GET product by ID
    console.log(`\n[7] Testing GET /products/${createdProduct.id} ...`);
    const getByIdRes = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(getByIdRes.status, 200);
    const fetchedProduct = await getByIdRes.json();
    assert.strictEqual(fetchedProduct.id, createdProduct.id);
    console.log('✓ Fetched product by ID successfully');

    // Test 8: UPDATE product
    console.log(`\n[8] Testing PUT /products/${createdProduct.id} ...`);
    const updateRes = await fetch(`${baseUrl}/products/${createdProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 79.99 }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.strictEqual(updated.price, 79.99);
    console.log('✓ Product updated successfully');

    // Test 9: DELETE product
    console.log(`\n[9] Testing DELETE /products/${createdProduct.id} ...`);
    const deleteRes = await fetch(`${baseUrl}/products/${createdProduct.id}`, {
      method: 'DELETE',
    });
    assert.strictEqual(deleteRes.status, 204);
    console.log('✓ Product deleted successfully');

    // Verify product is gone
    const verifyDeleteRes = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(verifyDeleteRes.status, 404);
    console.log('✓ 404 confirmed for deleted product');

    console.log('\n========================================');
    console.log('All automated API tests passed successfully!');
    console.log('========================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  if (server) server.close();
  process.exit(1);
});
