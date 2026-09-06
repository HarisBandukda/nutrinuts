import ContactForm from '@/components/ContactForm';
import { CONFIG, waLink } from '@/lib/config';

export const metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Get in Touch</h1>
          <p style={{ color: 'var(--color-text-light)' }}>We&apos;d love to hear from you</p>
        </div>
      </div>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Contact Information</h2>
              <div className="contact-detail">
                <div className="contact-detail-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>{CONFIG.phone}</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">✉️</div>
                <div>
                  <h4>Email</h4>
                  <p>{CONFIG.email}</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">📍</div>
                <div>
                  <h4>Location</h4>
                  <p>{CONFIG.address}</p>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <a href={waLink()} target="_blank" rel="noreferrer" className="whatsapp-btn">
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="contact-form-wrap">
              <h2>Send us a Message</h2>
              <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                For quick orders, use WhatsApp. For general inquiries, fill the form below.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
