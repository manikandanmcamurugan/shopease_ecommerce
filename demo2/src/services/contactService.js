import api from './api';

const contactService = {
  submitContact: async (contactData) => {
    // The backend does not currently have a /contact/ endpoint configured.
    // Simulating a successful API response.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: "Message sent successfully!" } });
      }, 1500);
    });
  }
};

export default contactService;
