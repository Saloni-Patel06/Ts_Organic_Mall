import React, { useState } from 'react';
import { useToast } from "../Context/ToastContext";
import { apiFetch } from '../utils/apiFetch';

const Contact = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      userId: localStorage.getItem("userId") || null
    };

    try {
      const response = await apiFetch("/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("Message sent successfully!","success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        showToast("Failed to send message", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Server error", "error");
    }
  };

  return (
    <>
      {/* <Toaster position="top-right" /> */}

      <div className="container-fluid page-header mb-5">
        <div className="container"><br />
          <h1 className="display-3 mb-3" style={{ fontSize: "60px" }}>Contact Us</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a className="text-body" href="/">Home</a></li>
              <li className="breadcrumb-item"><a className="text-body" href="/">Pages</a></li>
              <li className="breadcrumb-item text-dark active" aria-current="page">Contact Us</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container-xxl py-3">
        <div className="section-header text-center mx-auto mb-5" style={{ maxWidth: 800 }}>
          <h1 className="display-5 mb-3">Contact Us</h1>
        </div>

        <div className="row g-5 justify-content-center">
          <div className="col-lg-5 col-md-12">
            <iframe
              className="w-100"
              style={{ height: 450, border: 0 }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58956.92440787993!2d72.9447341!3d22.5488724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4e7efd0c8885%3A0xa9a0b93c0c4b5215!2sAnand%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1768024074332"
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen title="Anand Location Map" />
          </div>

          <div className="col-lg-7 col-md-12">
            <p className="mb-4">Connect with our team for inquiries, support, or collaboration opportunities.</p>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="name">Your Name</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="email"
                      className="form-control rounded-0"
                      id="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="email">Your Email</label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      className="form-control rounded-0"
                      id="message"
                      name="message"
                      placeholder="Leave a message here"
                      style={{ height: 200 }}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                    <label htmlFor="message">Message</label>
                  </div>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary rounded-0 py-3 px-5" type="submit">Send Message</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
