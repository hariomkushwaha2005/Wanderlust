import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../app.js';

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
