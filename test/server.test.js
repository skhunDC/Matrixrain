const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../server');

test('GET /images returns array', async t => {
  const server = app.listen(0);
  const port = server.address().port;
  const data = await new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port, path: '/images' }, res => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    }).on('error', reject);
  });
  server.close();
  assert.equal(data.status, 200);
  const parsed = JSON.parse(data.body);
  assert.ok(Array.isArray(parsed.images));
});
