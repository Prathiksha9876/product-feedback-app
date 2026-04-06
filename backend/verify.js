const API = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${endpoint}`, options);
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    const error = new Error(data?.message || res.statusText);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  try {
    console.log('--- Starting Integration Tests ---');
    
    // 1. Signup Admin
    console.log('1. Signing up Admin...');
    let adminToken;
    try {
      const adminRes = await request('/auth/signup', 'POST', {
        name: 'Admin User',
        email: 'admin@admin.com',
        password: 'password123'
      });
      adminToken = adminRes.token;
    } catch (e) {
      if(e.status === 400) {
        console.log('Admin may already exist. Logging in...');
        const loginRes = await request('/auth/login', 'POST', { email: 'admin@admin.com', password: 'password123' });
        adminToken = loginRes.token;
      } else {
        throw e;
      }
    }
    console.log('Admin Auth OK.');

    // 2. Signup User
    console.log('\n2. Signing up Regular User...');
    const userEmail = `user_${Date.now()}@test.com`;
    const userRes = await request('/auth/signup', 'POST', {
      name: 'Test User',
      email: userEmail,
      password: 'password123'
    });
    const userToken = userRes.token;
    console.log('User Auth OK.');

    // 3. Create Feedback
    console.log('\n3. Creating Feedback...');
    const feedbackTitle = `Fix dark mode bug ${Date.now()}`;
    const fbRes = await request('/feedback', 'POST', {
      title: feedbackTitle,
      description: 'The dark mode toggle is not working on mobile.',
      category: 'Bug'
    }, userToken);
    const feedbackId = fbRes._id;
    console.log('Feedback Created:', feedbackId);

    // 4. Duplicate Test
    console.log('\n4. Testing Duplicate Detection...');
    try {
      await request('/feedback', 'POST', {
        title: feedbackTitle,
        description: 'Dark mode is broken on my phone.',
        category: 'Bug'
      }, userToken);
      console.log('FAILED: Duplicate was allowed when it should be blocked.');
    } catch (err) {
      if (err.status === 409) {
        console.log('Duplicate appropriately detected with 409 status.');
      } else {
        throw err;
      }
    }

    // 5. Upvote Feedback
    console.log('\n5. Upvoting Feedback...');
    await request(`/feedback/${feedbackId}/vote`, 'PUT', {}, adminToken);
    console.log('Vote OK.');

    // 6. Add Comment
    console.log('\n6. Adding Comment...');
    await request(`/comments/${feedbackId}`, 'POST', {
      text: 'Thanks for reporting, we will look into it!'
    }, adminToken);
    console.log('Comment OK.');

    // 7. Get Dashboard Stats (Admin)
    console.log('\n7. Fetching Admin Dashboard Stats...');
    const statsRes = await request('/admin/dashboard', 'GET', null, adminToken);
    console.log('Admin Dashboard active and returned data:', !!statsRes);

    // 8. Update Status
    console.log('\n8. Updating Feedback Status to In Progress...');
    await request(`/feedback/${feedbackId}/status`, 'PUT', {
      status: 'In Progress'
    }, adminToken);
    console.log('Update Status OK.');

    console.log('\n--- ALL TESTS PASSED ---');

  } catch (error) {
    console.error('\nTest Failed:', error.message);
    if(error.data) console.log(error.data);
  }
}

runTests();
