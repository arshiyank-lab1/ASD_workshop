const assert = require('assert');
const app = require('./server');
const { cache, TTL_MS } = require('./middleware/cache.middleware');

const TEST_PORT = 3456;
let server;

async function runTests() {
  console.log('--- Starting ASD Workshop API Test Suite ---');

  server = app.listen(TEST_PORT, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // Test 1: Root endpoint
    console.log('\n[1] Testing GET / (Overview) ...');
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

    // Test 4: Cache HIT on second GET /products
    console.log('\n[4] Testing GET /products (Cache HIT) ...');
    const getRes2 = await fetch(`${baseUrl}/products`);
    assert.strictEqual(getRes2.status, 200);
    assert.strictEqual(getRes2.headers.get('x-cache'), 'HIT');
    console.log('✓ Cache hit verified (X-Cache: HIT)');

    // Test 5: Verify TTL expiration (1 minute)
    console.log('\n[5] Testing TTL expiration for cached data (> 1 minute) ...');
    assert(cache['/products'], 'Cache entry for /products must exist');
    assert(cache['/products'].createdAt, 'Cache entry must have createdAt timestamp');
    // Artificially age the cache entry beyond the 1-minute TTL
    cache['/products'].createdAt = Date.now() - (TTL_MS + 5000);
    const getResExpired = await fetch(`${baseUrl}/products`);
    assert.strictEqual(getResExpired.status, 200);
    assert.strictEqual(getResExpired.headers.get('x-cache'), 'MISS', 'Expired entry should return MISS and refetch');
    console.log('✓ Expired cache entry successfully evicted and refreshed with fresh data');

    // Test 6: Input validation for POST /products (invalid data)
    console.log('\n[6] Testing POST /products validation ...');
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

    // Test 7: Create new product & verify cache invalidation
    console.log('\n[7] Testing POST /products creation & cache invalidation ...');
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
    assert.strictEqual(afterCreateRes.headers.get('x-cache'), 'MISS', 'Cache should be invalidated after POST');
    console.log('✓ Cache invalidation verified after POST');

    // Test 8: GET product by ID (Cache MISS and HIT)
    console.log(`\n[8] Testing GET /products/${createdProduct.id} (Cache MISS & HIT) ...`);
    const getByIdMiss = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(getByIdMiss.status, 200);
    assert.strictEqual(getByIdMiss.headers.get('x-cache'), 'MISS');
    const fetchedProduct = await getByIdMiss.json();
    assert.strictEqual(fetchedProduct.id, createdProduct.id);

    const getByIdHit = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(getByIdHit.status, 200);
    assert.strictEqual(getByIdHit.headers.get('x-cache'), 'HIT');
    console.log('✓ GET /products/:id caching verified (MISS on first call, HIT on second call)');

    // Test 9: UPDATE product via PUT & verify cache invalidation
    console.log(`\n[9] Testing PUT /products/${createdProduct.id} & cache invalidation ...`);
    const updateRes = await fetch(`${baseUrl}/products/${createdProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 79.99 }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.strictEqual(updated.price, 79.99);

    const afterPutRes = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(afterPutRes.headers.get('x-cache'), 'MISS', 'Cache should be invalidated after PUT');
    console.log('✓ Product updated and cache invalidation verified after PUT');

    // Test 10: UPDATE product via PATCH & verify cache invalidation
    console.log(`\n[10] Testing PATCH /products/${createdProduct.id} & cache invalidation ...`);
    const patchRes = await fetch(`${baseUrl}/products/${createdProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Mechanical Keyboard' }),
    });
    assert.strictEqual(patchRes.status, 200);
    const patched = await patchRes.json();
    assert.strictEqual(patched.name, 'Updated Mechanical Keyboard');

    const afterPatchRes = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(afterPatchRes.headers.get('x-cache'), 'MISS', 'Cache should be invalidated after PATCH');
    console.log('✓ Product patched and cache invalidation verified after PATCH');

    // Test 11: DELETE product & verify cache invalidation
    console.log(`\n[11] Testing DELETE /products/${createdProduct.id} & cache invalidation ...`);
    const deleteRes = await fetch(`${baseUrl}/products/${createdProduct.id}`, {
      method: 'DELETE',
    });
    assert.strictEqual(deleteRes.status, 204);
    console.log('✓ Product deleted successfully');

    // Verify product is gone (404)
    const verifyDeleteRes = await fetch(`${baseUrl}/products/${createdProduct.id}`);
    assert.strictEqual(verifyDeleteRes.status, 404);
    console.log('✓ 404 confirmed for deleted product');

    console.log('\n======================================================');
    console.log('All 11 automated API, Caching & TTL tests passed successfully!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  if (server) server.close();
  process.exit(1);
});
