const BASE_URL = 'https://sivaskirala.vercel.app';

const wrapper = (content: string) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sivas Kirala</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;">
          <a href="${BASE_URL}" style="color:#fff;font-size:22px;font-weight:900;text-decoration:none;letter-spacing:-0.5px;">Sivas Kirala</a>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">Bu e-posta <a href="${BASE_URL}" style="color:#16a34a;">sivaskirala.vercel.app</a> tarafından gönderilmiştir.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (text: string, url: string) =>
    `<a href="${url}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;margin-top:20px;">${text}</a>`;

export const emailTemplates = {
    listingApproved: (productTitle: string, productId: string) => ({
        subject: `✅ İlanınız Onaylandı: ${productTitle}`,
        html: wrapper(`
      <h2 style="margin:0 0 12px;color:#111;font-size:22px;">İlanınız yayında! 🎉</h2>
      <p style="color:#475569;line-height:1.6;">"<strong>${productTitle}</strong>" ilanınız admin onayından geçti ve artık Sivas Kirala'da yayında.</p>
      <p style="color:#475569;line-height:1.6;">Kiracılar artık ilanınızı görebilir ve kiralama talebinde bulunabilir.</p>
      ${btn('İlanımı Görüntüle', `${BASE_URL}/ilan/${productId}`)}
    `),
    }),

    listingRejected: (productTitle: string) => ({
        subject: `⛔ İlanınız Reddedildi: ${productTitle}`,
        html: wrapper(`
      <h2 style="margin:0 0 12px;color:#111;font-size:22px;">İlanınız onaylanmadı</h2>
      <p style="color:#475569;line-height:1.6;">"<strong>${productTitle}</strong>" ilanınız platform kurallarına uygun olmadığı için yayına alınamadı.</p>
      <p style="color:#475569;line-height:1.6;">İlanınızı düzenleyerek tekrar gönderebilirsiniz. Sorularınız için bize ulaşın.</p>
      ${btn('Hesabıma Git', `${BASE_URL}/hesabim`)}
    `),
    }),

    newMessage: (senderName: string, productTitle: string, convId: string) => ({
        subject: `💬 Yeni Mesaj: ${productTitle}`,
        html: wrapper(`
      <h2 style="margin:0 0 12px;color:#111;font-size:22px;">Yeni bir mesajınız var</h2>
      <p style="color:#475569;line-height:1.6;"><strong>${senderName}</strong>, "<strong>${productTitle}</strong>" ilanınız hakkında size mesaj gönderdi.</p>
      <p style="color:#475569;line-height:1.6;">Hızlı yanıt vererek kiralama şansınızı artırın!</p>
      ${btn('Mesajı Gör', `${BASE_URL}/mesajlar/${convId}`)}
    `),
    }),

    bookingRequest: (renterName: string, productTitle: string, startDate: string, endDate: string, totalPrice: number) => ({
        subject: `📅 Kiralama Talebi: ${productTitle}`,
        html: wrapper(`
      <h2 style="margin:0 0 12px;color:#111;font-size:22px;">Yeni kiralama talebi!</h2>
      <p style="color:#475569;line-height:1.6;"><strong>${renterName}</strong>, "<strong>${productTitle}</strong>" ilanınız için kiralama talebinde bulundu.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Tarih Aralığı</td><td style="padding:8px 0;font-weight:700;color:#111;">${startDate} → ${endDate}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Toplam Tutar</td><td style="padding:8px 0;font-weight:700;color:#16a34a;font-size:18px;">${totalPrice.toLocaleString('tr-TR')} ₺</td></tr>
      </table>
      ${btn('Talebi İncele', `${BASE_URL}/hesabim`)}
    `),
    }),
};

// Helper: send email via our API route (call from server-side or client-side)
export async function sendEmail(to: string, template: { subject: string; html: string }) {
    try {
        await fetch(`${BASE_URL}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject: template.subject, html: template.html }),
        });
    } catch (e) {
        console.error('[sendEmail]', e);
    }
}
