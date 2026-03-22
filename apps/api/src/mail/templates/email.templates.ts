export const AdminInviteTemplate = (setupLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { font-size: 12px; color: #888; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to Taksh Admin Portal</h2>
    <p>You've been invited to manage operations at Taksh Store.</p>
    <p>Please click the button below to securely set up your password and access your dashboard. This link will expire shortly.</p>
    <a href="${setupLink}" class="btn">Establish Access</a>
    <p>If you cannot click the button, copy and paste this URL into your browser:<br/>
    <span style="color:#666; font-size:12px;">${setupLink}</span></p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Taksh Store. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export const CanvasOrderReceipt = (orderDetails: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .box { background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; }
    .footer { font-size: 12px; color: #888; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Order Confirmed!</h2>
    <p>Thank you for choosing Taksh Canvas Art. Your physical print is now being prepared in our facility.</p>
    <div class="box">
      <strong>Order Summary:</strong><br/>
      ${orderDetails}
    </div>
    <p>We will email you the tracking details the moment your canvas ships. If you need any support, simply reply to this email.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Taksh Store. Abstract structural paintings shipped globally.
    </div>
  </div>
</body>
</html>
`;

export const DigitalInviteAccess = (customizerLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #059669; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { font-size: 12px; color: #888; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Blueprint is Ready!</h2>
    <p>Your digital customizer is ready! Click the secure link below to add your photos, music, and venue details.</p>
    <a href="${customizerLink}" class="btn">Open Customizer Matrix</a>
    <p><strong>Note:</strong> You have exactly 90 days to finalize your details before the structure locks permanently.</p>
    <p>Direct Link: <br/><span style="color:#666; font-size:12px;">${customizerLink}</span></p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Taksh Digital Staging.
    </div>
  </div>
</body>
</html>
`;

export const OrderShippedNotification = (trackingUrl: string | null) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { font-size: 12px; color: #888; margin-top: 40px; }
    .box { background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Canvas is on the way!</h2>
    <p>Great news! Your abstract physical canvas has officially shipped from our facility and is en route to your destination.</p>
    ${trackingUrl ? `<a href="${trackingUrl}" target="_blank" class="btn">Track Your Package</a><p>Alternatively, copy constraints directly:<br/><span style="color:#666; font-size:12px;">${trackingUrl}</span></p>` : `<div class="box"><p>Tracking details will be updated shortly or dispatched by local courier routing.</p></div>`}
    <p>If you encounter any logistical issues, simply reply directly to this thread.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Taksh Store. Abstract structural paintings shipped globally.
    </div>
  </div>
</body>
</html>
`;
