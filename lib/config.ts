// Business configuration — single source of truth for contact details.
// `email` is the public address (info@nutrinuts.pk), forwarded to the
// Gmail in `notificationEmail` via ImprovMX.
export const CONFIG = {
  phone: '0309-6887474',
  whatsapp: '923096887474',
  email: 'info@nutrinuts.pk',
  address: 'Gulistan-e-Johar, Karachi, Pakistan',
  notificationEmail: 'nutrinutspk@gmail.com',
};

export function waLink(msg?: string) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || '');
}

// Single sitewide discount code (Tier 2 #15). Change here to update everywhere.
export const DISCOUNT = {
  code: 'NUTRI5',
  percent: 5,
};
