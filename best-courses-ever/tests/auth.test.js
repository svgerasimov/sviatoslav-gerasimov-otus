const request = require('supertest');
const app = require('../src/app');

describe('Auth JSON API', () => {
  it('POST /api/register → 201 & id', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Ann', email: 'ann@mail.io', password: '123' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /api/login → 501', () =>
    request(app).post('/api/login').expect(501));
});
