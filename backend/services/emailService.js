const nodemailer = require('nodemailer');

// ── Transporter (Gmail SMTP / STARTTLS) ───────
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

// ── Helpers ───────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

const buildItemRows = (items) =>
  items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #f5e6d3;">
            ${i.emoji || ''} ${i.name}
          </td>
          <td style="padding:8px 12px; border-bottom:1px solid #f5e6d3; text-align:center;">
            ${i.quantity}
          </td>
          <td style="padding:8px 12px; border-bottom:1px solid #f5e6d3; text-align:right;">
            ${formatCurrency(i.price * i.quantity)}
          </td>
        </tr>`
    )
    .join('');

const emailHtml = (order, type) => {
  const isOwner = type === 'owner';
  const title = isOwner
    ? `New Order Received — ${order.orderId}`
    : `Your Order is Confirmed — ${order.orderId}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#FDF8F3;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF8F3;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#fff;border-radius:12px;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1A1A1A;padding:28px 32px;text-align:center;">
              <p style="margin:0;color:#D4A853;font-size:28px;">🍛</p>
              <h1 style="margin:8px 0 0;color:#D4A853;font-size:22px;letter-spacing:1px;">
                ${process.env.RESTAURANT_NAME || 'Spice Garden'}
              </h1>
              <p style="margin:4px 0 0;color:#aaa;font-size:13px;">
                ${isOwner ? '🔔 New Order Alert' : 'Thank you for ordering!'}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <h2 style="margin-top:0;color:#1A1A1A;font-size:18px;">${title}</h2>

              <!-- Order meta -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FDF8F3;border-radius:8px;padding:14px;margin-bottom:20px;">
                <tr>
                  <td style="padding:4px 0;color:#555;font-size:14px;">
                    <strong>Order ID:</strong> ${order.orderId}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#555;font-size:14px;">
                    <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#555;font-size:14px;">
                    <strong>Customer:</strong> ${order.customer.name} &nbsp;|&nbsp;
                    📞 ${order.customer.mobile}
                    ${order.customer.email ? `&nbsp;|&nbsp; ${order.customer.email}` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#555;font-size:14px;">
                    <strong>Address:</strong> ${order.delivery.address}
                    ${order.delivery.landmark ? ` (${order.delivery.landmark})` : ''}
                  </td>
                </tr>
              </table>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="border-collapse:collapse;font-size:14px;">
                <thead>
                  <tr style="background:#1A1A1A;color:#D4A853;">
                    <th style="padding:10px 12px;text-align:left;border-radius:6px 0 0 0;">Item</th>
                    <th style="padding:10px 12px;text-align:center;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;border-radius:0 6px 0 0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemRows(order.items)}
                </tbody>
              </table>

              <!-- Pricing summary -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="font-size:14px;margin-top:8px;">
                <tr>
                  <td style="padding:6px 12px;color:#555;">Subtotal</td>
                  <td style="padding:6px 12px;text-align:right;color:#555;">
                    ${formatCurrency(order.pricing.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 12px;color:#555;">Delivery</td>
                  <td style="padding:4px 12px;text-align:right;color:#555;">
                    ${order.pricing.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.pricing.deliveryCharge)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 12px;color:#555;">GST (5%)</td>
                  <td style="padding:4px 12px;text-align:right;color:#555;">
                    ${formatCurrency(order.pricing.tax)}
                  </td>
                </tr>
                <tr style="background:#1A1A1A;color:#D4A853;font-weight:bold;font-size:16px;
                           border-radius:6px;">
                  <td style="padding:10px 12px;border-radius:6px 0 0 6px;">Total</td>
                  <td style="padding:10px 12px;text-align:right;border-radius:0 6px 6px 0;">
                    ${formatCurrency(order.pricing.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:16px 32px;text-align:center;
                       font-size:12px;color:#999;">
              © ${new Date().getFullYear()} ${process.env.RESTAURANT_NAME || 'Spice Garden'}.
              This is an automated email — please do not reply.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ── Public API ────────────────────────────────

/**
 * Send OTP to user (email only)
 */
const sendOtpEmail = async (toEmail, otp, name) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                background:#FDF8F3;border-radius:12px;">
      <h2 style="color:#1A1A1A;text-align:center;">🔐 Your OTP</h2>
      <p style="color:#555;text-align:center;">
        Hi ${name || 'there'}, use the code below to log in to Spice Garden.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;padding:16px 32px;background:#1A1A1A;
                     color:#D4A853;font-size:36px;font-weight:bold;border-radius:8px;
                     letter-spacing:8px;">${otp}</span>
      </div>
      <p style="color:#999;text-align:center;font-size:13px;">
        This code expires in <strong>10 minutes</strong>.<br/>
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>`;

  await getTransporter().sendMail({
    from: `"${process.env.RESTAURANT_NAME || 'Spice Garden'}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — Your Spice Garden Login OTP`,
    html,
  });
};

/**
 * Notify restaurant owner of a new order
 */
const sendNewOrderNotification = async (order) => {
  await getTransporter().sendMail({
    from: `"${process.env.RESTAURANT_NAME || 'Spice Garden'} Orders" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `🍛 New Order: ${order.orderId} — ${order.customer.name}`,
    html: emailHtml(order, 'owner'),
  });
};

/**
 * Send order confirmation to customer
 */
const sendOrderConfirmation = async (order) => {
  if (!order.customer.email) return; // no email provided
  await getTransporter().sendMail({
    from: `"${process.env.RESTAURANT_NAME || 'Spice Garden'}" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `✅ Order Confirmed — ${order.orderId}`,
    html: emailHtml(order, 'customer'),
  });
};

module.exports = { sendOtpEmail, sendNewOrderNotification, sendOrderConfirmation };
