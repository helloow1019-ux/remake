import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('ReMake API Integration Tests', () => {
  const app = createApp();
  let guestCookie: string;
  let adminCookie: string;

  beforeAll(async () => {
    // Make sure admin exists
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    expect(admin).toBeDefined();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/session auto-provisions guest and returns cookie', async () => {
    const res = await request(app).get('/api/session');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.isGuest).toBe(true);
    expect(res.body.quota).toBeDefined();

    // Check cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    guestCookie = cookies[0].split(';')[0];
  });

  it('GET /api/waste-types returns 11 waste types', async () => {
    const res = await request(app).get('/api/waste-types');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(10);
    const bottle = res.body.find((w: any) => w.slug === 'plastic-bottle');
    expect(bottle).toBeDefined();
    expect(bottle.nameEn).toBe('Plastic bottle');
    expect(bottle.gramsPerPiece).toBe(20);
  });

  it('GET /api/ideas returns seeded ideas with pagination and filters', async () => {
    const res = await request(app).get('/api/ideas?waste=plastic-bottle');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    const first = res.body.items[0];
    expect(first.slug).toBeDefined();
    expect(first.titleEn).toBeDefined();
    expect(first.stats).toBeDefined();
  });

  it('GET /api/ideas/:slug returns full details with steps and materials', async () => {
    const res = await request(app).get('/api/ideas/bottle-cap-keychain');
    expect(res.status).toBe(200);
    expect(res.body.titleEn).toBe('Bottle Cap Keychain');
    expect(res.body.status).toBe('TESTED');
    expect(res.body.steps.length).toBeGreaterThanOrEqual(4);
    expect(res.body.materials.length).toBeGreaterThanOrEqual(1);
    expect(res.body.safetyNoteEn).toBeDefined();
  });

  it('POST /api/ideas/:id/save saves and unsaves idea', async () => {
    const idea = await prisma.idea.findFirst();
    expect(idea).toBeDefined();

    // Save
    const saveRes = await request(app)
      .post(`/api/ideas/${idea!.id}/save`)
      .set('Cookie', guestCookie);
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.saved).toBe(true);

    // Get saved
    const getSaved = await request(app)
      .get('/api/me/saved')
      .set('Cookie', guestCookie);
    expect(getSaved.status).toBe(200);
    expect(getSaved.body.items.some((i: any) => i.id === idea!.id)).toBe(true);

    // Unsave
    const unsaveRes = await request(app)
      .delete(`/api/ideas/${idea!.id}/save`)
      .set('Cookie', guestCookie);
    expect(unsaveRes.status).toBe(200);
    expect(unsaveRes.body.saved).toBe(false);
  });

  it('POST /api/ideas/:id/makes records a make, adds impact, and awards badges', async () => {
    const idea = await prisma.idea.findFirst({ where: { slug: 'bottle-cap-keychain' } });
    expect(idea).toBeDefined();

    const res = await request(app)
      .post(`/api/ideas/${idea!.id}/makes`)
      .set('Cookie', guestCookie)
      .field('outcome', 'WORKED')
      .field('timeTakenMin', '20')
      .field('difficultyFelt', '1')
      .field('rating', '5')
      .field('notes', 'Great project test!');

    expect(res.status).toBe(201);
    expect(res.body.make).toBeDefined();
    expect(res.body.impactAdded.wasteG).toBeGreaterThan(0);
    expect(res.body.newBadges).toBeDefined();

    // Check user impact summary
    const impactRes = await request(app)
      .get('/api/me/impact')
      .set('Cookie', guestCookie);
    expect(impactRes.status).toBe(200);
    expect(impactRes.body.totals.wasteG).toBeGreaterThan(0);
    expect(impactRes.body.totals.ideasMade).toBe(1);
    expect(impactRes.body.badges.some((b: any) => b.key === 'first-make' && b.earned)).toBe(true);
  });

  it('POST /api/auth/register upgrades guest account and retains makes', async () => {
    const email = `testmaker-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .set('Cookie', guestCookie)
      .send({
        name: 'Bilal Khan',
        email,
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.isGuest).toBe(false);
    expect(res.body.user.email).toBe(email);

    const newCookie = res.headers['set-cookie'][0].split(';')[0];

    // Verify makes are retained
    const makesRes = await request(app)
      .get('/api/me/makes')
      .set('Cookie', newCookie);
    expect(makesRes.status).toBe(200);
    expect(makesRes.body.makes.length).toBe(1);
  });

  it('Requires admin role for /api/admin/*', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', guestCookie);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Admin login works and can access /api/admin/dashboard', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@remake.local',
        password: 'change-me-now',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.role).toBe('ADMIN');
    const cookies = loginRes.headers['set-cookie'];
    adminCookie = (Array.isArray(cookies) ? cookies[cookies.length - 1] : cookies).split(';')[0];

    const dashRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', adminCookie);

    expect(dashRes.status).toBe(200);
    expect(dashRes.body.totals).toBeDefined();
    expect(dashRes.body.totals.ideas).toBeGreaterThanOrEqual(12);
  });

  it('GET /api/impact/method returns factor sources and formulas', async () => {
    const res = await request(app).get('/api/impact/method');
    expect(res.status).toBe(200);
    expect(res.body.wasteTypes.length).toBeGreaterThanOrEqual(10);
    expect(res.body.constants.reuseDisplacement).toBe(0.5);
    expect(res.body.wasteTypes[0].factorSource).toContain('Illustrative default');
  });
});
