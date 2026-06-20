const axios = require('axios');
const fs = require('fs');

const testRegister = async () => {
  try {
    const res = await axios.post('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1/auth/register/', {
      username: 'testuser123',
      email: 'test1234@example.com',
      mobile_number: '1234567890',
      password: 'password123'
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('Success register/', res.data);
  } catch (e) {
    if (e.response) {
      if (typeof e.response.data === 'string' && e.response.data.includes('<html')) {
        const matchTitle = e.response.data.match(/<title>(.*?)<\/title>/);
        const matchExc = e.response.data.match(/<pre class="exception_value">(.*?)<\/pre>/s);
        console.log('Title:', matchTitle ? matchTitle[1] : 'No title');
        console.log('Exception:', matchExc ? matchExc[1].trim() : 'No exception text');
      } else {
        console.log('Failed register/', e.response.status, e.response.data);
      }
    } else {
      console.log('Error:', e.message);
    }
  }
};
testRegister();
