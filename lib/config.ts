// Business configuration — single source of truth for contact details.
// NOTE: `email` is still a placeholder (Tier 1 item #8) — update to
// info@nutrinuts.pk once the custom-domain mailbox is set up.
export const CONFIG = {
  phone: '0309-6887474',
  whatsapp: '923096887474',
  email: 'Coming Soon',
  address: 'A-202, Ajmer Pride, 2nd Floor, Block-12 Gulistan-e-Johar, Karachi, Pakistan',
  notificationEmail: 'nutrinutspk@gmail.com',
};

export function waLink(msg?: string) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || '');
}
