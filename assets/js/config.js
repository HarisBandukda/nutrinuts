const CONFIG = {
  phone: '0309-6887474',
  whatsapp: '923096887474',
  email: 'Coming Soon',
  address: 'Pakistan',
  notificationEmail: 'nutrinutspk@gmail.com'
};

function waLink(msg) {
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg || '');
}
