import React from 'react';
import '../ShippingPolicy/Policy.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page container section">
      <div className="page-header text-center">
        <h1>Privacy Policy</h1>
        <p style={{marginTop:"10px"}}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="policy-content" style={{marginTop:"40px"}}>
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
        </section>
        
        <section>
          <h2>2. Use of Information</h2>
          <p>We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.</p>
        </section>
        
        <section>
          <h2>3. Sharing of Information</h2>
          <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including with third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
