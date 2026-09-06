'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

const GOOGLE_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbzajJGRq456pL82TGsRATSjH8-exOeuBWdqxH7HQeMC6F1zOV_5HuLZiFUSaXHIbotbzA/exec';

export default function ContactForm() {
  const { notify } = useCart();
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          name: data.get('contact-name'),
          email: data.get('contact-email'),
          phone: data.get('contact-phone'),
          message: data.get('contact-message'),
        }),
      });
      notify('Thank you! Your message has been sent.');
      form.reset();
    } catch {
      notify('Failed to send message. Please try again.', true);
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      style={{
        background: 'var(--color-white)',
        padding: 28,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="form-group">
        <label htmlFor="contact-name">Your Name</label>
        <input type="text" id="contact-name" name="contact-name" placeholder="Enter your name" required />
      </div>
      <div className="form-group">
        <label htmlFor="contact-email">Email</label>
        <input type="email" id="contact-email" name="contact-email" placeholder="Enter your email" />
      </div>
      <div className="form-group">
        <label htmlFor="contact-phone">Phone</label>
        <input type="tel" id="contact-phone" name="contact-phone" placeholder="03XX-XXXXXXX" />
      </div>
      <div className="form-group">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="contact-message" placeholder="How can we help you?" rows={4} required />
      </div>
      <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
