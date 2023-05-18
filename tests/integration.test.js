import request from "supertest"
import app from "../app.js"

describe('Work Time Tracking App Integration Tests', () => {
  let authToken;

  let employerToken;

  const logInEmployee = async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'mihai.maxim@thinslices.com', password: 'password' })

    authToken = response.body.token
  }

  const logInEmployer = async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'boss@thinslices.com', password: 'password' })

    employerToken = response.body.token
  }


  const logOutEmployee = async () => {
    await request(app)
      .post('/logout')
      .set('Authorization', `Bearer ${authToken}`)
  }

  const logOutEmployer = async () => {
    await request(app)
      .post('/logout')
      .set('Authorization', `Bearer ${employerToken}`)
  }



  // Login endpoint tests
  describe('POST /login', () => {
    test('should return an authorization token with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'mihai.maxim@thinslices.com', password: 'password' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy()
      
      authToken = response.body.token;
    });

    test('should return 401 with invalid credentials', async () => {
      await request(app)
        .post('/login')
        .send({ email: 'invalid@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    test('should return 400 if credentials are not provided', async () => {
      await request(app).post('/login').expect(400);
    });

    test('should return 400 if credentials are not using the right format', async () => {
      await request(app)
        .post('/login')
        .send({ eml: 'mihai.maxim@thinslices.com', psd: 'password' })
        .expect(400);
    });
  });

  // Logout endpoint tests
  describe('POST /logout', () => {
    test('should log out the user and return 200 with a valid Authorization header', async () => {
      await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    test('should return 400 if Authorization header is not provided', async () => {
      await request(app).post('/logout').expect(400);
    });

    test('should return 400 if Authorization header is invalid/expired', async () => {
      await request(app)
        .set('Authorization', `Bearer ${"hello there"}`)
        .post('/logout').expect(400);
    });
  });

  // Check-in endpoint tests
  describe('POST /check-in', () => {

    test('should allow an employee to check-in and return 200', async () => {
      await logInEmployee()
      const response = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('check_in_date');
    });

    test('should return 403 for employers trying to check-in', async () => {
      await logInEmployer()
      await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(403);
    });

    test('should return 200 with success: false if employee is already checked-in', async () => {
      await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(async (response) => {
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('check_in_date');
        });
    });
  });

  // Check-out endpoint tests
  describe('POST /check-out', () => {

    test('should return 400 if description is not provided', async () => {
      await request(app)
        .post('/check-out')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should allow an employee to check-out with a description and return 200', async () => {
      const response = await request(app)
        .post('/check-out')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Completed task XYZ' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('start_date');
      expect(response.body).toHaveProperty('end_date');
      expect(response.body).toHaveProperty('description', 'Completed task XYZ');
    });

    test('should return 403 for employers trying to check-out', async () => {
      await request(app)
        .post('/check-out')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ description: 'Completed task XYZ' })
        .expect(403);
    });


    test('should return 200 with success: false if employee is not checked-in', async () => {
      await request(app)
        .post('/check-out')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Completed task XYZ' })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('success', false);
          expect(response.body).toHaveProperty('error', 'You are not checked in');
        });
    });

  });

  // History endpoint tests
  describe('GET /history', () => {
    test('should allow employees to view their own work history and return 200', async () => {
      const response = await request(app)
        .get('/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
  
      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.history.length).toBeGreaterThan(0);
  

      const userHistoryItem = response.body.history[0];
      expect(userHistoryItem).toHaveProperty('email');
      expect(userHistoryItem).toHaveProperty('start_date');
      expect(userHistoryItem).toHaveProperty('end_date');
      expect(userHistoryItem).toHaveProperty('description');
    });
  
    test('should allow the employer to view the work history of all employees and return 200', async () => {
      const response = await request(app)
        .get('/history')
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);
  
      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.history.length).toBeGreaterThan(0);
  
  
      const userHistoryItem = response.body.history[0];
      expect(userHistoryItem).toHaveProperty('email');
      expect(userHistoryItem).toHaveProperty('start_date');
      expect(userHistoryItem).toHaveProperty('end_date');
      expect(userHistoryItem).toHaveProperty('description');
    });

    test('should return the work history of a specific employee when q query parameter is provided', async () => {
      const email = 'mihai.maxim@thinslices.com';
      const response = await request(app)
        .get(`/history?q=${email}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);
    
      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.history.length).toBeGreaterThan(0);
    
      const userHistoryItem = response.body.history.find((item) => item.email === email);
      expect(userHistoryItem).toBeDefined();
      expect(userHistoryItem).toHaveProperty('email', email);
      expect(userHistoryItem).toHaveProperty('start_date');
      expect(userHistoryItem).toHaveProperty('end_date');
      
      const lastEntryIndex = response.body.history.length - 1;
      const lastEntry = response.body.history[lastEntryIndex];
      expect(lastEntry).toHaveProperty('description', 'Completed task XYZ');
    });
  
    test('should return 403 for employees trying to use the q query parameter', async () => {
      await request(app)
        .get('/history?q=employee@example.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  
    test('should return 404 if no employee with the specified email address is found', async () => {
      await request(app)
        .get('/history?q=nonexistent@example.com')
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(404);

      await logOutEmployee()
      await logOutEmployer()
    });

  });

});
