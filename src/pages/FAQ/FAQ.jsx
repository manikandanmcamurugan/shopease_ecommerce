import React, { useState } from 'react';
import './FAQ.css';

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept Visa, Mastercard, PayPal, and Apple Pay. We also offer buy now, pay later options through selected partners in certain regions."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Expedited shipping options are available at checkout for 1-2 day delivery."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping times vary depending on the destination and customs processing."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive a confirmation email with a tracking number and a link to trace your package."
  },
  {
    question: "Are your products authentic?",
    answer: "Absolutely. All items sold on ShopEase are 100% authentic and sourced directly from brands or authorized distributors."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page container section">
      <div className="page-header text-center">
        <h1>Frequently Asked Questions</h1>
        <p style={{marginTop:"10px"}}>Find answers to common questions about our products, shipping, and more.</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`} 
            key={index}
            onClick={() => toggleAccordion(index)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
