/**
 * Newsletter Email Template
 * Generates personalized newsletter emails for users
 */

function generateNewsletterEmail(newsletter, user) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const unsubscribeUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/user-data/${user.userToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #2c3e50; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #16a085 0%, #2ecc71 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23ffffff" opacity="0.1"/><circle cx="80" cy="40" r="1.5" fill="%23ffffff" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="%23ffffff" opacity="0.1"/></svg>'); }
    .date { font-size: 14px; opacity: 0.9; margin-bottom: 15px; font-weight: 300; }
    .title { font-size: 32px; font-weight: 700; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .subtitle { font-size: 18px; opacity: 0.95; font-weight: 300; line-height: 1.4; }
    .content-wrapper { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; color: #16a085; margin-bottom: 25px; }
    .content { margin-bottom: 25px; font-size: 16px; line-height: 1.8; color: #34495e; }
    .content p { margin-bottom: 15px; }
    .divider { height: 2px; background: linear-gradient(90deg, #16a085, #2ecc71); margin: 30px 0; border-radius: 1px; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #ecf0f1; }
    .unsubscribe { background: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e9ecef; margin-top: 20px; }
    .unsubscribe p { font-size: 13px; color: #7f8c8d; margin-bottom: 10px; }
    .unsubscribe a { display: inline-block; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-weight: 500; font-size: 12px; transition: transform 0.2s; }
    .unsubscribe a:hover { transform: translateY(-2px); }
    .brand { font-size: 12px; color: #95a5a6; margin-top: 15px; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .container { border-radius: 10px; }
      .header { padding: 30px 20px; }
      .title { font-size: 26px; }
      .content-wrapper { padding: 30px 20px; }
      .footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="date">📅 ${currentDate}</div>
      <h1 class="title">${newsletter.title}</h1>
      ${newsletter.subtitle ? `<div class="subtitle">${newsletter.subtitle}</div>` : ''}
    </div>

    <div class="content-wrapper">
      <div class="greeting">
        👋 Dear ${user.name} ${user.surname},
      </div>

      <div class="content">
        ${newsletter.message_part1.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
      </div>

      ${newsletter.message_part2 ? `
      <div class="content">
        ${newsletter.message_part2.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <div class="unsubscribe">
        <p>📧 Want to manage your subscription?</p>
        <a href="${unsubscribeUrl}">🔗 Unsubscribe & Delete Data</a>
      </div>
      <div class="brand">
        💌 Sent with care from our therapy practice
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

module.exports = { generateNewsletterEmail };