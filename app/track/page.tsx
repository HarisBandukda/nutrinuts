'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CONFIG, GAS_URL, ORDER_STEPS } from '@/lib/config';

interface TrackItem {
  name: string;
  quantity: number;
  lineTotal: number;
}

interface TrackOrder {
  orderId: string;
  dateTime: string;
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryStatus: string;
  grandTotal: number;
  items: TrackItem[];
}

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackOrder | null>(null);

  useEffect(() => {
    // Prefill from ?order= & ?phone= query params, falling back to the last
    // order stored by checkout.
    const params = new URLSearchParams(window.location.search);
    const qOrder = params.get('order') || params.get('orderId') || '';
    const qPhone = params.get('phone') || '';
    if (qOrder) setOrderId(qOrder);
    if (qPhone) setPhone(qPhone);
    if (!qOrder) {
      try {
        const last = JSON.parse(window.localStorage.getItem('nutrinuts_last_order') || 'null');
        if (last && last.orderId) {
          setOrderId(last.orderId);
          if (last.phone) setPhone(last.phone);
        }
      } catch {
        /* ignore malformed storage */
      }
    }
  }, []);

  async function handleTrack(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setOrder(null);

    const id = orderId.trim();
    const ph = phone.trim();
    if (!id || !ph) {
      setError('Please enter both your Order ID and phone number.');
      return;
    }

    setLoading(true);
    try {
      const url = `${GAS_URL}?action=track&orderId=${encodeURIComponent(id)}&phone=${encodeURIComponent(ph)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else if (data.error === 'invalid-phone') {
        setError('The phone number does not match this order. Please check and try again.');
      } else if (data.error === 'not-found') {
        setError('No order found with that ID. Please check your Order ID (e.g. NN-240914-7F3K).');
      } else {
        setError('We could not look up this order right now. Please try again, or contact us on WhatsApp.');
      }
    } catch {
      setError('Network error — could not reach the order system. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const cancelled = order?.deliveryStatus === 'Cancelled';
  const currentStep = cancelled ? -1 : ORDER_STEPS.indexOf(order?.deliveryStatus || '');

  return (
    <section className="track-page">
      <div className="container">
        <h1>Track Your Order</h1>
        <p className="track-subtitle">Enter your Order ID and the phone number you used at checkout.</p>

        <form className="track-form" onSubmit={handleTrack}>
          <div className="track-fields">
            <div className="form-group">
              <label htmlFor="track-order-id">Order ID</label>
              <input
                id="track-order-id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. NN-240914-7F3K"
              />
            </div>
            <div className="form-group">
              <label htmlFor="track-phone">Phone Number</label>
              <input
                id="track-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                inputMode="tel"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? 'Checking…' : 'Track Order'}
          </button>
        </form>

        {error && <div className="track-error">{error}</div>}

        {order && !cancelled && currentStep >= 0 && (
          <div className="track-result">
            <div className="track-order-head">
              <div>
                <div className="track-order-id">{order.orderId}</div>
                <div className="track-order-date">Placed {order.dateTime}</div>
              </div>
              <div className="track-total">Rs. {order.grandTotal.toLocaleString()}</div>
            </div>

            <div className="stepper">
              {ORDER_STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} className={'step' + (done ? ' done' : '') + (active ? ' active' : '')}>
                    <div className="step-dot">{done ? '✓' : i + 1}</div>
                    <div className="step-label">{step}</div>
                  </div>
                );
              })}
            </div>

            <div className="track-details">
              <h3>Order Summary</h3>
              {order.items.map((it, idx) => (
                <div key={idx} className="track-item">
                  <span>{it.name} × {it.quantity}</span>
                  <span>Rs. {it.lineTotal.toLocaleString()}</span>
                </div>
              ))}
              <div className="track-payment">Payment: {order.paymentMethod} · {order.paymentStatus}</div>
            </div>
          </div>
        )}

        {order && cancelled && (
          <div className="track-result track-cancelled">
            <div className="track-order-id">{order.orderId}</div>
            <p>This order has been cancelled. If you believe this is a mistake, please contact us on WhatsApp.</p>
            <a className="btn btn-outline" href={`https://wa.me/${CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer">
              Contact on WhatsApp
            </a>
          </div>
        )}

        <p className="track-help">
          Need help? <Link href="/contact">Contact us</Link> or message us on WhatsApp.
        </p>
      </div>
    </section>
  );
}
