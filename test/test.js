const request = require('supertest');
const app = require('../app');

describe('Health Check API', () => {
    it('should return 200 OK if connection is successful', async () => {
        const res = await request(app).get('/healthz');
        expect(res.statusCode).toBe(200);
    });

    it('should return 400 Bad Request if request includes any payload', async () => {
        const res = await request(app).get('/healthz').send({ key: "value" });
        expect(res.statusCode).toBe(400);
    });

    it('should return 405 Method Not Allowed for non-GET requests', async () => {
        const res = await request(app).post('/healthz');
        expect(res.statusCode).toBe(405);
    });

    it('should return 404 for non-existent routes', async () => {
        const res = await request(app).get('/non-existent');
        expect(res.statusCode).toEqual(404);
    });
});
