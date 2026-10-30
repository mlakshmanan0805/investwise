import test, { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { getDatabase } from '../src/database/db.js';

describe('InvestWise API Integration & Security Test Suite', () => {
  let userTokenA = '';
  let userAId = null;
  let userTokenB = '';
  let userBId = null;
  let investmentAId = null;

  before(() => {
    // Ensure DB is initialized
    getDatabase();
  });

  it('Health Check endpoint returns status healthy', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  it('User Registration creates new user account and returns JWT token', async () => {
    const uniqueEmail = `user_a_${Date.now()}@investwise.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
        full_name: 'Aditi Sharma',
        risk_tolerance: 'Moderate'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token, 'Must return JWT token');
    assert.equal(res.body.user.email, uniqueEmail);
    userTokenA = res.body.token;
    userAId = res.body.user.id;
  });

  it('User Registration rejects duplicate email addresses with 409 Conflict', async () => {
    const duplicateEmail = `user_dup_${Date.now()}@investwise.edu`;
    // Register first time
    await request(app)
      .post('/api/auth/register')
      .send({
        email: duplicateEmail,
        password: 'Password123!',
        full_name: 'Test Student'
      });

    // Try registering same email again
    const dupRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: duplicateEmail,
        password: 'Password456!',
        full_name: 'Duplicate Attempt'
      });

    assert.equal(dupRes.status, 409);
    assert.equal(dupRes.body.success, false);
    assert.match(dupRes.body.error, /already exists/i);
  });

  it('User Login rejects invalid credentials with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent_user@investwise.edu',
        password: 'WrongPassword'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('User B registers to test multi-user isolation', async () => {
    const emailB = `user_b_${Date.now()}@investwise.edu`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: emailB,
        password: 'Password123!',
        full_name: 'Rohan Verma',
        risk_tolerance: 'Conservative'
      });

    assert.equal(res.status, 201);
    userTokenB = res.body.token;
    userBId = res.body.user.id;
  });

  it('User A can create an investment record', async () => {
    const res = await request(app)
      .post('/api/portfolio')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Bluechip Equity Portfolio',
        asset_category: 'Equity',
        initial_amount: 50000,
        expected_return: 14.5,
        expected_volatility: 16.0,
        duration_years: 5,
        risk_tolerance: 'Moderate',
        notes: 'Tech & Financial sector leaders'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.investment.id);
    investmentAId = res.body.investment.id;
  });

  it('Test 10: Multi-user isolation - User B CANNOT view, edit, or delete User A investment', async () => {
    // 1. User B tries to get User A's investment
    const getRes = await request(app)
      .get(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    assert.equal(getRes.status, 404, 'User B must not be able to view User A investment');

    // 2. User B tries to update User A's investment
    const putRes = await request(app)
      .put(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenB}`)
      .send({
        name: 'Hacked Investment Name',
        initial_amount: 1000
      });
    assert.equal(putRes.status, 404, 'User B must not be able to modify User A investment');

    // 3. User B tries to delete User A's investment
    const delRes = await request(app)
      .delete(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenB}`);
    assert.equal(delRes.status, 404, 'User B must not be able to delete User A investment');
  });

  it('User A can update their investment', async () => {
    const res = await request(app)
      .put(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Bluechip Equity Portfolio (Updated)',
        expected_return: 15.0
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.investment.name, 'Bluechip Equity Portfolio (Updated)');
    assert.equal(res.body.investment.expected_return, 15.0);
  });

  it('Dashboard summary calculates portfolio metrics from persisted investments', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.summary.investmentCount, 1);
    assert.equal(res.body.summary.totalInvested, 50000);
    assert.ok(res.body.charts.categoryAllocation.length > 0);
  });

  it('Investment activities records additional contribution and updates total', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        investment_id: investmentAId,
        activity_type: 'Additional Contribution',
        amount: 10000,
        activity_date: '2026-10-29',
        notes: 'Quarterly bonus infusion'
      });

    assert.equal(res.status, 201);

    // Verify investment principal was updated to 60,000
    const invRes = await request(app)
      .get(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    assert.equal(invRes.body.investment.initial_amount, 60000);
  });

  it('Reports endpoint exports portfolio CSV format correctly with quotes and headers', async () => {
    const res = await request(app)
      .get('/api/reports/export/csv')
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /text\/csv/);
    assert.match(res.text, /Investment ID,Investment Name,Asset Category/);
    assert.match(res.text, /Bluechip Equity Portfolio \(Updated\)/);
  });

  it('Quiz API serves questions and scores submissions with feedback', async () => {
    const questionsRes = await request(app).get('/api/education/quiz');
    assert.equal(questionsRes.status, 200);
    assert.equal(questionsRes.body.totalQuestions, 10);

    const submitRes = await request(app)
      .post('/api/education/quiz/submit')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        answers: {
          1: 0,
          2: 1,
          3: 1,
          4: 0,
          5: 1
        }
      });

    assert.equal(submitRes.status, 200);
    assert.equal(submitRes.body.score, 5);
    assert.equal(submitRes.body.percentage, 50.0);
    assert.ok(submitRes.body.feedback);
  });

  it('User A can safely delete their investment', async () => {
    const res = await request(app)
      .delete(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenA}`);

    assert.equal(res.status, 200);

    const checkRes = await request(app)
      .get(`/api/portfolio/${investmentAId}`)
      .set('Authorization', `Bearer ${userTokenA}`);
    assert.equal(checkRes.status, 404);
  });
});
