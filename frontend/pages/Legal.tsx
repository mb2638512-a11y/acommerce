import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LegalPage = 'privacy' | 'terms' | 'refund';

const Legal: React.FC = () => {
 const navigate = useNavigate();
 const [currentPage, setCurrentPage] = useState<LegalPage>('privacy');

 const renderContent = () => {
  switch (currentPage) {
   case 'privacy':
    return (
     <div className="legal-content">
      <h1>Privacy Policy</h1>
      <p className="last-updated">Last Updated: March 2026</p>

      <section>
       <h2>1. Introduction</h2>
       <p>
        At ACommerce, we take your privacy seriously. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you use our multi-vendor e-commerce platform.
       </p>
      </section>

      <section>
       <h2>2. Information We Collect</h2>
       <h3>Personal Information</h3>
       <ul>
        <li>Name and email address</li>
        <li>Phone number</li>
        <li>Shipping and billing addresses</li>
        <li>Payment information (processed securely through Stripe)</li>
        <li>Government-issued ID (for seller verification)</li>
       </ul>
       <h3>Automatically Collected Information</h3>
       <ul>
        <li>Device information (IP address, browser type, operating system)</li>
        <li>Usage data (pages visited, time spent, links clicked)</li>
        <li>Cookies and tracking technologies</li>
       </ul>
      </section>

      <section>
       <h2>3. How We Use Your Information</h2>
       <ul>
        <li>To provide and maintain our services</li>
        <li>To process transactions and send related information</li>
        <li>To verify seller identity and enable marketplace features</li>
        <li>To communicate with you about updates, promotions, and support</li>
        <li>To analyze usage patterns and improve user experience</li>
        <li>To prevent fraud and ensure platform security</li>
       </ul>
      </section>

      <section>
       <h2>4. Information Sharing</h2>
       <p>We may share your information with:</p>
       <ul>
        <li><strong>Sellers:</strong> Order details necessary for fulfillment</li>
        <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
        <li><strong>Service Providers:</strong> Hosting, analytics, and customer support</li>
        <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
       </ul>
      </section>

      <section>
       <h2>5. Data Security</h2>
       <p>
        We implement appropriate technical and organizational measures to protect your personal information,
        including encryption of sensitive data, secure socket layer (SSL) technology, and regular security audits.
       </p>
      </section>

      <section>
       <h2>6. Your Rights</h2>
       <ul>
        <li>Access and request a copy of your personal data</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your personal data</li>
        <li>Object to processing of your personal data</li>
        <li>Request restriction of processing</li>
        <li>Data portability</li>
       </ul>
      </section>

      <section>
       <h2>7. Cookies</h2>
       <p>
        We use cookies to enhance your experience. You can control cookies through your browser settings,
        but disabling them may affect platform functionality.
       </p>
      </section>

      <section>
       <h2>8. Children's Privacy</h2>
       <p>
        Our platform is not intended for children under 13. We do not knowingly collect personal information
        from children under 13.
       </p>
      </section>

      <section>
       <h2>9. Changes to This Policy</h2>
       <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting
        the new policy on this page and updating the "Last Updated" date.
       </p>
      </section>

      <section>
       <h2>10. Contact Us</h2>
       <p>
        If you have questions about this Privacy Policy, please contact us at privacy@acommerce.com
       </p>
      </section>
     </div>
    );

   case 'terms':
    return (
     <div className="legal-content">
      <h1>Terms of Service</h1>
      <p className="last-updated">Last Updated: March 2026</p>

      <section>
       <h2>1. Acceptance of Terms</h2>
       <p>
        By accessing and using ACommerce, you accept and agree to be bound by the terms and provision
        of this agreement. If you do not agree to these terms, please do not use our platform.
       </p>
      </section>

      <section>
       <h2>2. Platform Overview</h2>
       <p>
        ACommerce is a multi-vendor e-commerce platform that connects buyers with independent sellers.
        We provide the infrastructure for sellers to list and sell products, and for buyers to discover
        and purchase items from various vendors.
       </p>
      </section>

      <section>
       <h2>3. User Accounts</h2>
       <h3>Registration</h3>
       <ul>
        <li>You must provide accurate and complete registration information</li>
        <li>You are responsible for maintaining the security of your account</li>
        <li>You must be at least 18 years old to create an account</li>
        <li>One account per person/entity</li>
       </ul>
       <h3>Seller Accounts</h3>
       <ul>
        <li>Sellers must complete identity verification</li>
        <li>Sellers must link a valid bank account via Stripe Connect</li>
        <li>Sellers agree to platform commission structure</li>
        <li>Sellers must comply with all applicable laws and regulations</li>
       </ul>
      </section>

      <section>
       <h2>4. Buying and Selling</h2>
       <h3>Buyer Responsibilities</h3>
       <ul>
        <li>Provide accurate shipping information</li>
        <li>Pay for items purchased</li>
        <li>Report issues within 14 days of delivery</li>
        <li>Not engage in fraudulent activities</li>
       </ul>
       <h3>Seller Responsibilities</h3>
       <ul>
        <li>Accurately describe products and shipping times</li>
        <li>Ship products within stated timeframe</li>
        <li>Honor all sales and return policies</li>
        <li>Respond to buyer inquiries within 48 hours</li>
        <li>Comply with tax collection and remittance requirements</li>
       </ul>
      </section>

      <section>
       <h2>5. Prohibited Activities</h2>
       <ul>
        <li>Fraudulent or illegal transactions</li>
        <li>Sale of prohibited or restricted items</li>
        <li>Manipulation of prices or reviews</li>
        <li>Harassment or abuse of other users</li>
        <li>Unauthorized access to other accounts</li>
        <li>Distribution of malware or viruses</li>
       </ul>
      </section>

      <section>
       <h2>6. Fees and Payments</h2>
       <ul>
        <li>Sellers pay a commission on each sale (varies by plan)</li>
        <li>Buyers pay the listed price plus applicable shipping and taxes</li>
        <li>Payments are processed through Stripe</li>
        <li>Refunds are subject to seller policies and dispute resolution</li>
       </ul>
      </section>

      <section>
       <h2>7. Intellectual Property</h2>
       <p>
        Users retain ownership of content they post but grant ACommerce a license to use such content
        for platform purposes. Sellers warrant they have rights to sell listed products.
       </p>
      </section>

      <section>
       <h2>8. Disputes Between Users</h2>
       <p>
        ACommerce provides a dispute resolution system for buyer-seller disagreements. Users agree
        to participate in good faith dispute resolution processes.
       </p>
      </section>

      <section>
       <h2>9. Limitation of Liability</h2>
       <p>
        ACommerce is not liable for indirect, incidental, or consequential damages. Our total liability
        is limited to the amount paid for the transaction in question.
       </p>
      </section>

      <section>
       <h2>10. Termination</h2>
       <p>
        We may terminate or suspend accounts that violate these terms, engage in illegal activity,
        or for other reasons at our discretion.
       </p>
      </section>

      <section>
       <h2>11. Changes to Terms</h2>
       <p>
        We may modify these terms at any time. Continued use of the platform constitutes acceptance
        of updated terms.
       </p>
      </section>

      <section>
       <h2>12. Governing Law</h2>
       <p>
        These terms are governed by applicable law. Any disputes will be resolved in the appropriate
        jurisdiction.
       </p>
      </section>
     </div>
    );

   case 'refund':
    return (
     <div className="legal-content">
      <h1>Refund Policy</h1>
      <p className="last-updated">Last Updated: March 2026</p>

      <section>
       <h2>1. Overview</h2>
       <p>
        This Refund Policy outlines the terms for refunds on purchases made through the ACommerce
        multi-vendor platform. Different sellers may have different policies, which will be clearly
        communicated at the time of purchase.
       </p>
      </section>

      <section>
       <h2>2. Buyer Protection Period</h2>
       <ul>
        <li>Buyers have 14 days from delivery to initiate a return or dispute</li>
        <li>Items must be unused and in original packaging</li>
        <li>Proof of purchase is required for all refund requests</li>
       </ul>
      </section>

      <section>
       <h2>3. Types of Refunds</h2>
       <h3>Full Refund</h3>
       <ul>
        <li>Item not received</li>
        <li>Item significantly not as described</li>
        <li>Item arrived damaged</li>
        <li>Seller agreed to return</li>
       </ul>
       <h3>Partial Refund</h3>
       <ul>
        <li>Item returned in used condition</li>
        <li>Missing accessories or parts</li>
        <li>Buyer changed mind (seller discretion)</li>
       </ul>
      </section>

      <section>
       <h2>4. Non-Refundable Items</h2>
       <ul>
        <li>Digital products once downloaded</li>
        <li>Personalized or custom-made items</li>
        <li>Perishable goods</li>
        <li>Hygiene products opened after delivery</li>
        <li>Items marked as "final sale"</li>
       </ul>
      </section>

      <section>
       <h2>5. Return Process</h2>
       <ol>
        <li>Contact the seller within 14 days of delivery</li>
        <li>Provide order number and reason for return</li>
        <li>Wait for seller to approve return request</li>
        <li>Ship item back within 7 days of approval</li>
        <li>Provide tracking information</li>
        <li>Receive refund within 14 days of seller receiving item</li>
       </ol>
      </section>

      <section>
       <h2>6. Shipping Costs</h2>
       <ul>
        <li><strong>Defective/Not as Described:</strong> Seller pays return shipping</li>
        <li><strong>Changed Mind:</strong> Buyer pays return shipping</li>
        <li><strong>Item Not Received:</strong> Full refund including original shipping</li>
       </ul>
      </section>

      <section>
       <h2>7. Refund Timeline</h2>
       <ul>
        <li>Seller has 7 days to respond to return request</li>
        <li>Buyer has 7 days to ship return after approval</li>
        <li>Seller has 14 days to process refund after receiving return</li>
        <li>Refund appears in account within 5-10 business days</li>
       </ul>
      </section>

      <section>
       <h2>8. Dispute Resolution</h2>
       <p>
        If you and the seller cannot agree on a refund, you may open a dispute through our
        resolution center. Our team will review evidence from both parties and make a
        final decision within 7 business days.
       </p>
      </section>

      <section>
       <h2>9. Seller Policies</h2>
       <p>
        Individual sellers may have their own return policies that are more or less generous
        than this policy. Always review the seller's specific return policy before making
        a purchase. Seller policies must be clearly displayed on their store page.
       </p>
      </section>

      <section>
       <h2>10. Platform Fee Refunds</h2>
       <p>
        Platform fees (commission) are non-refundable unless the entire transaction is
        cancelled due to seller non-delivery or fraud.
       </p>
      </section>

      <section>
       <h2>11. How to Request a Refund</h2>
       <ol>
        <li>Go to your Order History</li>
        <li>Find the order and click "Request Refund"</li>
        <li>Select reason and provide details</li>
        <li>Submit and wait for seller response</li>
        <li>If unresolved, escalate to dispute resolution</li>
       </ol>
      </section>

      <section>
       <h2>12. Contact Us</h2>
       <p>
        For questions about this policy, contact support@acommerce.com
       </p>
      </section>
     </div>
    );
  }
 };

 return (
  <div className="legal-page">
   <div className="legal-nav">
    <button
     className={currentPage === 'privacy' ? 'active' : ''}
     onClick={() => setCurrentPage('privacy')}
    >
     Privacy Policy
    </button>
    <button
     className={currentPage === 'terms' ? 'active' : ''}
     onClick={() => setCurrentPage('terms')}
    >
     Terms of Service
    </button>
    <button
     className={currentPage === 'refund' ? 'active' : ''}
     onClick={() => setCurrentPage('refund')}
    >
     Refund Policy
    </button>
   </div>

   <div className="legal-container">
    {renderContent()}
   </div>

   <div className="legal-footer">
    <button onClick={() => navigate(-1)} className="back-btn">
     ← Back
    </button>
   </div>

   <style>{`
        .legal-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .legal-nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1rem;
        }

        .legal-nav button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .legal-nav button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .legal-nav button.active {
          background: #4f46e5;
          color: white;
        }

        .legal-container {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .legal-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .legal-content .last-updated {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .legal-content section {
          margin-bottom: 2rem;
        }

        .legal-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          margin-top: 1.5rem;
        }

        .legal-content p {
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .legal-content ul, .legal-content ol {
          color: #4b5563;
          line-height: 1.7;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .legal-content li {
          margin-bottom: 0.5rem;
        }

        .legal-footer {
          margin-top: 2rem;
        }

        .back-btn {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #e5e7eb;
        }

        @media (max-width: 640px) {
          .legal-page {
            padding: 1rem;
          }

          .legal-nav {
            flex-direction: column;
            gap: 0.5rem;
          }

          .legal-nav button {
            width: 100%;
            text-align: center;
          }

          .legal-container {
            padding: 1.5rem;
          }
        }
      `}</style>
  </div>
 );
};

export default Legal;
