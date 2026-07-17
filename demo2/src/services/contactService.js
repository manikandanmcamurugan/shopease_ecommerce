import api from './api';

const contactService = {
  submitContact: async (contactData) => {
    return api.post('/contact/', contactData);
  }
};

export default contactService;
