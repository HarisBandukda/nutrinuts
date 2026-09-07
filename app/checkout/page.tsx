'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { CONFIG } from '@/lib/config';

const GOOGLE_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbzajJGRq456pL82TGsRATSjH8-exOeuBWdqxH7HQeMC6F1zOV_5HuLZiFUSaXHIbotbzA/exec';

const PAYMENT_METHODS = [
  { id: 'Cash on Delivery', icon: '💵' },
  { id: 'Bank Transfer', icon: '🏦' },
  { id: 'EasyPaisa', icon: '📱' },
];

function generateOrderId() {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('nutrinuts_last_order_id') : null;
  const lastId = parseInt(raw || '0', 10) || 0;
  const newId = lastId + 1;
  if (typeof window !== 'undefined') window.localStorage.setItem('nutrinuts_last_order_id', String(newId));
  return `NN-${String(newId).padStart(6, '0')}`;
}

async function saveToGoogleSheets(data: unknown) {
  return fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildWhatsAppMessage(data: any): string {
  const lines = [
    `🛒 *New Order: ${data.orderId}*`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    `*Customer:* ${data.customerName}`,
    `*Phone:* ${data.customerPhone}`,
    '━━━━━━━━━━━━━━━━━━',
    `*Receiver:* ${data.receiverName}`,
    `*Phone:* ${data.receiverPhone}`,
    `*Address:* ${data.deliveryAddress}`,
    data.mapsLink ? `*Maps:* ${data.mapsLink}` : '',
    '━━━━━━━━━━━━━━━━━━',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...data.items.map((i: any) => `*${i.productName}* × ${i.quantity} = Rs. ${i.lineTotal.toLocaleString()}`),
    data.discount > 0 ? `*Discount (${data.discountCode}):* −Rs. ${data.discount.toLocaleString()}` : '',
    '━━━━━━━━━━━━━━━━━━',
    '*Delivery:* To be confirmed',
    `*Grand Total:* Rs. ${data.grandTotal.toLocaleString()}`,
    `*Payment:* ${data.paymentMethod}`,
    data.specialInstructions ? `*Notes:* ${data.specialInstructions}` : '',
    '━━━━━━━━━━━━━━━━━━',
    `*Order Date:* ${data.dateTime}`,
  ];
  return encodeURIComponent(lines.filter(Boolean).join('\n'));
}

export default function CheckoutPage() {
  const { detailedItems, subtotal, discount, total, discountCode, discountApplied, clearCart, notify } = useCart();
  const [payment, setPayment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const mapsInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) || '').trim();

    const fieldDefs = [
      { key: 'customer-name', label: 'Customer Name' },
      { key: 'customer-phone', label: 'Customer Phone' },
      { key: 'receiver-name', label: 'Receiver Name' },
      { key: 'receiver-phone', label: 'Receiver Phone' },
      { key: 'delivery-address', label: 'Delivery Address' },
    ];

    const nextErrors: Record<string, string> = {};
    fieldDefs.forEach((f) => {
      if (!get(f.key)) nextErrors[f.key] = `${f.label} is required`;
    });

    const phone = get('customer-phone').replace(/\s/g, '');
    if (phone && !/^(\+92|0)?3\d{9}$/.test(phone)) {
      nextErrors['customer-phone'] = 'Enter a valid Pakistani phone number (e.g. 03XX-XXXXXXX)';
    }
    const rPhone = get('receiver-phone').replace(/\s/g, '');
    if (rPhone && !/^(\+92|0)?3\d{9}$/.test(rPhone)) {
      nextErrors['receiver-phone'] = 'Enter a valid Pakistani phone number';
    }

    if (!payment) notify('Please select a payment method', true);

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !payment) return;

    if (detailedItems.length === 0) {
      notify('Your cart is empty!', true);
      return;
    }

    setSubmitting(true);

    const orderData = {
      orderId: generateOrderId(),
      dateTime: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
      customerName: get('customer-name'),
      customerPhone: get('customer-phone'),
      receiverName: get('receiver-name'),
      receiverPhone: get('receiver-phone'),
      deliveryAddress: get('delivery-address'),
      mapsLink: get('maps-link'),
      specialInstructions: get('special-instructions'),
      paymentMethod: payment,
      paymentStatus: 'Pending',
      deliveryStatus: 'Pending',
      items: detailedItems.map((i) => ({
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.price,
        lineTotal: i.product.price * i.quantity,
      })),
      subtotal,
      discount: discountApplied ? discount : 0,
      discountCode: discountApplied ? discountCode : '',
      grandTotal: total,
    };

    try {
      await saveToGoogleSheets(orderData);
    } catch (err) {
      console.warn('Google Sheets save failed, continuing with WhatsApp:', err);
    }

    setSubmitting(false);
    setOrderId(orderData.orderId);
    window.location.href = `https://wa.me/${CONFIG.whatsapp}?text=${buildWhatsAppMessage(orderData)}`;
    clearCart();
    form.reset();
    setPayment('');
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Location detection not supported in your browser.');
      return;
    }
    setLocationStatus('Detecting location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        if (mapsInputRef.current) mapsInputRef.current.value = mapsUrl;
        setLocationStatus(`✓ Location detected! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationStatus('Location access denied. Please paste a Google Maps link manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationStatus('Location unavailable. Please paste a Google Maps link manually.');
            break;
          default:
            setLocationStatus('Could not detect location. Please paste a Google Maps link manually.');
        }
      },
    );
  }

  const fieldError = (key: string) => (errors[key] ? ' error' : '');

  return (
    <section className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="delivery-notice">
          <strong>Delivery Notice:</strong> Delivery charges will be calculated based on your location and confirmed before dispatch.
        </div>

        <div className="checkout-layout">
          <div>
            <form className="checkout-form" id="checkout-form" noValidate onSubmit={handleSubmit}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Customer Details</h3>
              <div className="form-row">
                <div className={'form-group' + fieldError('customer-name')}>
                  <label htmlFor="customer-name">Customer Name *</label>
                  <input type="text" id="customer-name" name="customer-name" placeholder="Full name" required />
                  <div className="form-error">{errors['customer-name'] || ''}</div>
                </div>
                <div className={'form-group' + fieldError('customer-phone')}>
                  <label htmlFor="customer-phone">Customer Phone *</label>
                  <input type="tel" id="customer-phone" name="customer-phone" placeholder="03XX-XXXXXXX" required />
                  <div className="form-error">{errors['customer-phone'] || ''}</div>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', margin: '1.5rem 0' }}>Receiver Details</h3>
              <div className="form-row">
                <div className={'form-group' + fieldError('receiver-name')}>
                  <label htmlFor="receiver-name">Receiver Name *</label>
                  <input type="text" id="receiver-name" name="receiver-name" placeholder="Full name" required />
                  <div className="form-error">{errors['receiver-name'] || ''}</div>
                </div>
                <div className={'form-group' + fieldError('receiver-phone')}>
                  <label htmlFor="receiver-phone">Receiver Phone *</label>
                  <input type="tel" id="receiver-phone" name="receiver-phone" placeholder="03XX-XXXXXXX" required />
                  <div className="form-error">{errors['receiver-phone'] || ''}</div>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', margin: '1.5rem 0 1rem' }}>Delivery Address</h3>
              <div className={'form-group' + fieldError('delivery-address')}>
                <label htmlFor="delivery-address">Delivery Address *</label>
                <textarea id="delivery-address" name="delivery-address" placeholder="Full address with landmarks" required />
                <div className="form-error">{errors['delivery-address'] || ''}</div>
              </div>
              <div className="form-group">
                <label htmlFor="maps-link">Google Maps Location <span className="optional">(optional)</span></label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="url" id="maps-link" name="maps-link" placeholder="https://maps.app.goo.gl/..." style={{ flex: 1 }} ref={mapsInputRef} />
                  <button type="button" className="btn btn-outline btn-sm" id="locate-btn" style={{ whiteSpace: 'nowrap' }} onClick={detectLocation}>📍 Detect</button>
                </div>
                <div id="location-status" style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{locationStatus}</div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', margin: '1.5rem 0 1rem' }}>Payment Method</h3>
              <div className="payment-methods">
                {PAYMENT_METHODS.map((m) => (
                  <div
                    key={m.id}
                    className={'payment-method' + (payment === m.id ? ' selected' : '')}
                    onClick={() => setPayment(m.id)}
                  >
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => {}} />
                    {m.icon} {m.id}
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', margin: '1.5rem 0 1rem' }}>Special Instructions</h3>
              <div className="form-group">
                <textarea id="special-instructions" name="special-instructions" placeholder="Any special requests or notes..." rows={3} />
              </div>
            </form>
          </div>

          <div>
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <div id="checkout-items">
                {detailedItems.length === 0 ? (
                  <p style={{ color: 'var(--color-text-light)' }}>Your cart is empty.</p>
                ) : (
                  detailedItems.map((item) => (
                    <div className="checkout-item" key={item.productId}>
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountApplied && (
                <div className="summary-row discount">
                  <span>Discount ({discountCode})</span>
                  <span>−Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row delivery">
                <span>Delivery</span>
                <span>To be confirmed</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <button type="submit" form="checkout-form" className="btn btn-secondary" id="place-order-btn" disabled={submitting}>
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: 12, textAlign: 'center' }}>
                By placing this order, you agree to our delivery policy. You will be redirected to WhatsApp to confirm your order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {orderId && (
        <div className="modal-overlay show" id="order-modal">
          <div className="modal">
            <div className="modal-icon">✅</div>
            <h2>Order Placed!</h2>
            <p>Your order has been recorded.</p>
            <div className="order-id">{orderId}</div>
            <p style={{ fontSize: '0.9rem' }}>Please send the WhatsApp message to confirm your order. We will contact you shortly to confirm delivery charges.</p>
            <Link href="/shop" className="btn btn-secondary" onClick={() => setOrderId(null)}>Continue Shopping</Link>
          </div>
        </div>
      )}
    </section>
  );
}
