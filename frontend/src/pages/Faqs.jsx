import React, { useState } from 'react';

function Faqs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqsData = [
    {
      id: 1,
      question: 'What makes our products certified organic?',
      answer: 'Our products are grown without synthetic pesticides, herbicides, GMOs, or chemical fertilizers. They adhere to strict organic standards certified by APEDA and other recognized authorities in India.',
      category: 'Organic Certification'
    },
    {
      id: 2,
      question: 'What is your delivery area and schedule?',
      answer: 'We deliver within 10 km from our store: TS Organic Mall, Kishor Plaza, Anand. Deliveries are strictly schedule-based. Check available slots at checkout. Live tracking in Orders with agent details.',
      category: 'Delivery'
    },
    {
      id: 3,
      question: 'What is your return and refund policy?',
      answer: 'Full refund available if order is cancelled before agent acceptance. After agent acceptance: No cancellation. For delivered damaged/spoiled fresh produce: 48hrs return window with photo proof via Support. Processed in 3 working days.',
      category: 'Returns'
    },
    {
      id: 4,
      question: 'Is there a minimum order value requirement?',
      answer: 'No minimum. Free delivery on orders above ₹999.',
      category: 'Ordering'
    },
    {
      id: 5,
      question: 'Do you offer subscription boxes?',
      answer: 'Currently, we do not offer subscription boxes. You can place orders anytime based on your needs through our app or website.',
      category: 'Orders'
    },
    {
      id: 6,
      question: 'How can I track my order?',
      answer: 'You can track your order in the Orders page, where you will see real-time status updates such as Pending, Picked Up, Out for Delivery, Failed, or Delivered. You can also view the scheduled time and contact the delivery agent directly if needed.',
      category: 'Delivery'
    },
    {
      id: 7,
      question: 'Are payments secure and what options available?',
      answer: 'Razorpay PCI-DSS Level 1 certified. UPI/Cards/Netbanking/Wallets. SSL encrypted. 100% safe with fraud monitoring.',
      category: 'Payments'
    },
    {
      id: 8,
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order only if it has not been accepted by a delivery agent. You can check the status in the Orders page. Once the order is accepted, cancellation is not possible. If cancelled early, the refund is processed within 12 hrs.',
      category: 'Ordering'
    }
  ];

  const filteredFaqs = faqsData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <br /><br /><br /><br />

      <section className="py-4">
        <div className="container">

          {/* Search Bar */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-7">
              <div className="input-group input-group-lg shadow rounded-pill overflow-hidden">
                <span className="input-group-text bg-white border-0 px-4">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none"
                  placeholder="Search FAQs... (delivery, returns, organic)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn bg-white border-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times text-muted"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="text-center mb-4">
            <button
              className={`btn ${searchTerm === '' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 me-2 mb-2`}
              onClick={() => setSearchTerm('')}
            >
              All
            </button>

            <button
              className={`btn ${searchTerm === 'delivery' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 me-2 mb-2`}
              onClick={() => setSearchTerm('delivery')}
            >
              Delivery
            </button>

            <button
              className={`btn ${searchTerm === 'organic' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 me-2 mb-2`}
              onClick={() => setSearchTerm('organic')}
            >
              Organic
            </button>

            <button
              className={`btn ${searchTerm === 'return' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 mb-2`}
              onClick={() => setSearchTerm('return')}
            >
              Returns
            </button>
          </div>

          {/* FAQ LIST */}
          <div className="faq-list">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`faq-item mb-3 ${openIndex === faq.id ? 'active' : ''}`}
              >
                <div
                  className="faq-header d-flex justify-content-between align-items-center"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <h6 className="mb-0 fw-semibold">{faq.question}</h6>
                  <i className={`fas fa-chevron-down ${openIndex === faq.id ? 'rotate' : ''}`}></i>
                </div>

                <div className={`faq-body ${openIndex === faq.id ? 'show' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5>No FAQs found</h5>
              <button className="btn btn-primary mt-3" onClick={() => setSearchTerm('')}>
                Show All
              </button>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .faq-item {
          border-radius: 16px;
          background: #fff;
          border: 1px solid #eee;
          transition: all 0.4s ease;
          box-shadow: 0 5px 10px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .faq-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 3px 5px #3bb81564;
        }

        .faq-item.active {
          border-color: #3CB815;
          box-shadow: 0 3px 5px #3bb81564;
        }

        .faq-header {
          padding: 16px 15px;
          cursor: pointer;
          background: #3bb81548;
          transition: 0.3s;
        }

        .faq-header:hover {
          background: #3bb81564;
        }

        .faq-header i {
          transition: transform 0.3s ease;
        }

        .faq-header i.rotate {
          transform: rotate(180deg);
        }

        .faq-body {
          max-height: 0;
          overflow: hidden;
          transition: all 0.4s ease;
          padding: 0 20px;
        }

        .faq-body.show {
          max-height: 200px;
          padding: 15px 20px 20px;
        }

        .faq-body p {
          margin: 0;
          color: #555;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .faq-header {
            padding: 14px;
          }
        }
      `}</style>
    </>
  );
}

export default Faqs;