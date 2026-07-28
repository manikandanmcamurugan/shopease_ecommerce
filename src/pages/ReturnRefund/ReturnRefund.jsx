import React from 'react';
import '../ShippingPolicy/Policy.css'; // Shared styles

const ReturnRefund = () => {
  return (
    <div className="policy-page container section">
      <div className="page-header text-center">
        <h1>Return & Refund Policy</h1>
        <p style={{marginTop:"10px"}}>Our commitment to your satisfaction.</p>
      </div>

      <div className="policy-content" style={{marginTop:"40px"}}>
        <section>
          <h2>Returns</h2>
          <p>We accept returns up to 30 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.</p>
        </section>

        <section>
          <h2>Refunds</h2>
          <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.</p>
        </section>

        <section>
          <h2>Exchanges</h2>
          <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at support@shopease.com.</p>
        </section>

        <section>
          <h2>Condition of Items</h2>
          <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging. Some types of goods are exempt from being returned, such as perishable goods or intimate or sanitary goods.</p>
        </section>
      </div>
    </div>
  );
};

export default ReturnRefund;
