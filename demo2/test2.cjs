const fs = require('fs');
const axios = require('axios');
const testRegister = async () => {
  try {
    await axios.post('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1/auth/register/', {
      username: 'testuser123',
      email: 'test1234@example.com',
      mobile_number: '1234567890',
      password: 'password123'
    });
  } catch (e) {
    if (e.response && typeof e.response.data === 'string') {
      const title = e.response.data.match(/<title>(.*?)<\/title>/);
      const exc = e.response.data.match(/<pre class="exception_value">(.*?)<\/pre>/s);
      if (title) console.log('TITLE:', title[1]);
      if (exc) {
        const text = exc[1].replace(/<[^>]*>?/gm, '').trim();
        console.log('EXCEPTION:', text);
      }
    } else {
      console.log('Other error:', e.message, e.response?.data);
    }
  }
};
testRegister();
