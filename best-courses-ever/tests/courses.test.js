const request = require('supertest');
const app = require('../src/app');
const { courseRepo } = require('../src/repositories');

describe('Courses API', () => {
  /**
   * Перед каждым тестом очищаем in‑memory‑репозиторий,
   * чтобы тесты не зависели друг от друга
   */
  beforeEach(() => courseRepo._clear());

  it('POST /courses/api → 201 + возвращает объект с id', async () => {
    const res = await request(app)
      .post('/courses/api')
      .send({
        title: 'JS Basics',
        description: 'start here',
        authorId: 1,
      })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('JS Basics');
  });

  it('GET /courses/api → массив содержит ранее созданный курс', async () => {
    const course = courseRepo.create({
      title: 'Node',
      description: 'intro',
      authorId: 2,
    });

    const res = await request(app).get('/courses/api').expect(200);

    const ids = res.body.map((c) => c.id);
    expect(ids).toContain(course.id);
  });

  it('DELETE /courses/api/:id → 204, затем 404 при повторном запросе', async () => {
    const { id } = courseRepo.create({
      title: 'To delete',
      description: '',
      authorId: 4,
    });

    await request(app).delete(`/courses/api/${id}`).expect(204);
    await request(app).get(`/courses/api/${id}`).expect(404);
  });
});
