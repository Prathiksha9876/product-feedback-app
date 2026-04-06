const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    try {
        const api = axios.create({ baseURL: 'http://localhost:5000/api' });

        const email = `test_${Date.now()}@example.com`;
        console.log(`Registering ${email}`);
        await api.post('/auth/signup', { name: 'Test Upload', email, password: 'password123' });

        console.log('Logging in...');
        const { data: authData } = await api.post('/auth/login', { email, password: 'password123' });
        const token = authData.token;

        console.log('Submitting feedback with image...');
        const formData = new FormData();
        formData.append('title', 'Testing Image Upload');
        formData.append('description', 'This has an image attached.');
        formData.append('category', 'Bug');
        formData.append('rating', 5);

        const imagePath = path.join(__dirname, 'test_image.png');
        fs.writeFileSync(imagePath, 'fake image content');
        formData.append('image', fs.createReadStream(imagePath));

        const { data: feedbackData } = await api.post('/feedback', formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Feedback submitted:', feedbackData);
        if (feedbackData.image) {
            console.log('SUCCESS: Image was uploaded! Path:', feedbackData.image);
        } else {
            console.error('FAIL: No image path returned.');
        }
        fs.unlinkSync(imagePath);
    } catch (err) {
        console.error('Error during test:', err.response?.data || err.message);
    }
}
testUpload();
