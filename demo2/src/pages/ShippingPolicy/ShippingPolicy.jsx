import React from 'react';
import './Policy.css'; // Shared policy styles

const ShippingPolicy = () => {
  return (
    <div className="policy-page container section">
      <div className="page-header text-center">
        <h1>Shipping Policy</h1>
        <p style={{marginTop:"10px"}}>Everything you need to know about our shipping process.</p>
      </div>
      <div className="policy-content" style={{marginTop:"40px"}}>

        <section>
          <h2>Processing Time</h2>
          <p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
        </section>

        <section>
          <h2>Domestic Shipping Rates and Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout. We offer competitive rates for standard and expedited shipping across the country.</p>
          <ul>
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Express Shipping:</strong> 1-2 business days</li>
          </ul>
        </section>

        <section>
          <h2>International Shipping</h2>
          <p>We offer international shipping to most countries. Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. ShopEase is not responsible for these charges if they are applied and are your responsibility as the customer.</p>
        </section>

        <section>
          <h2>How do I check the status of my order?</h2>
          <p>When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
