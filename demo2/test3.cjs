const axios = require('axios');
const testRegister = async () => {
  try {
    await axios.post('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1/auth/register/', {});
  } catch (e) {
    if (e.response && typeof e.response.data === 'string') {
      const exc = e.response.data.match(/<pre class="exception_value">(.*?)<\/pre>/s);
      if (exc) {
        console.log('EXCEPTION:', exc[1].replace(/<[^>]*>?/gm, '').trim());
      } else {
        console.log('No exception in HTML');
      }
    } else {
      console.log('Other error:', e.message);
    }
  }
};
testRegister();
