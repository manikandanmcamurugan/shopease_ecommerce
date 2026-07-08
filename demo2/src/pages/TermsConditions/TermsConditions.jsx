import React from 'react';
import '../ShippingPolicy/Policy.css';

const TermsConditions = () => {
  return (
    <div className="policy-page container section">
      <div className="page-header text-center">
        <h1>Terms & Conditions</h1>
        <p style={{marginTop:"10px"}}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="policy-content" style={{marginTop:"40px"}}>
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
        </section>
        
        <section>
          <h2>2. Accounts</h2>
          <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
        </section>
        
        <section>
          <h2>3. Purchases</h2>
          <p>If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
