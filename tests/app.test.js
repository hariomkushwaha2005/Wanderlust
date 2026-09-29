import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.SECRET = 'test-secret';

const { app } = await import('../app.js');

const startServer = async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.on('listening', resolve));
  return server;
};

test('GET / redirects to /listings', async () => {
  const server = await startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`, {
      redirect: 'manual',
    });

    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/listings');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test('GET /missing returns 404 error page', async () => {
  const server = await startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/missing`);
    assert.equal(response.status, 404);
    const text = await response.text();
    assert.match(text, /Page Not Found|Something went wrong/i);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test('GET /login ignores external redirect targets', async () => {
  const server = await startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/login?returnTo=https://evil.example/steal`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.doesNotMatch(html, /value="https:\/\/evil\.example\/steal"/);
    assert.match(html, /value="\/listings"/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test('GET /login rejects backslash-based external redirect targets', async () => {
  const server = await startServer();
  try {
    const url = new URL(`http://127.0.0.1:${server.address().port}/login`);
    url.searchParams.set('returnTo', '/\\evil.example/steal');
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /value="\/listings"/);
    assert.doesNotMatch(html, /evil\.example/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
