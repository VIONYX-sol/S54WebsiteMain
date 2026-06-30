const ADMIN_EMAIL_DEFAULT = 'administracion@gruposofia54.com';
const BRAND_NAME = 'Grupo SOFIA54';
const BRAND_COLOR = '#2246f5';

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const sendEmail = async (payload, apiKey) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend error (${response.status}): ${detail}`);
  }
};

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const adminEmail = process.env.CONTACT_ADMIN_EMAIL || ADMIN_EMAIL_DEFAULT;
  const logoUrl = process.env.CONTACT_LOGO_URL || 'https://gruposofia54.com/assets/logo-azul.png';

  if (!apiKey || !fromEmail) {
    context.log.error('Missing CONTACT_FROM_EMAIL or RESEND_API_KEY env vars.');
    context.res = { status: 500, jsonBody: { ok: false } };
    return;
  }

  const body = req.body || {};
  const nombre = escapeHtml((body.nombre || '').trim());
  const email = escapeHtml((body.email || '').trim());
  const telefono = escapeHtml((body.telefono || '').trim());
  const mensaje = escapeHtml((body.mensaje || '').trim());

  if (!nombre || !email || !mensaje) {
    context.res = { status: 400, jsonBody: { ok: false, error: 'Datos incompletos' } };
    return;
  }

  const adminHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f7fc;padding:28px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5eaf5;border-radius:14px;padding:24px;">
        <img src="${logoUrl}" alt="${BRAND_NAME}" style="max-width:200px;height:auto;display:block;margin-bottom:18px;" />
        <h2 style="margin:0 0 16px;color:#111827;">Nuevo formulario web recibido</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
          <tr><td style="padding:8px 0;font-weight:bold;">Nombre</td><td style="padding:8px 0;">${nombre}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Email</td><td style="padding:8px 0;">${email}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;">Teléfono</td><td style="padding:8px 0;">${telefono || '-'}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;vertical-align:top;">Mensaje</td><td style="padding:8px 0;">${mensaje}</td></tr>
        </table>
      </div>
    </div>`;

  const clientHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f7fc;padding:28px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5eaf5;border-radius:14px;padding:24px;">
        <img src="${logoUrl}" alt="${BRAND_NAME}" style="max-width:200px;height:auto;display:block;margin-bottom:16px;" />
        <h2 style="margin:0 0 10px;color:#111827;">Hemos recibido tu solicitud</h2>
        <p style="margin:0 0 14px;color:#334155;line-height:1.6;">
          Hola ${nombre}, gracias por contactar con ${BRAND_NAME}. Nuestro equipo revisará tu solicitud y te responderá lo antes posible.
        </p>
        <div style="border:1px solid #d8e1f6;background:#f8faff;border-radius:10px;padding:14px 16px;">
          <p style="margin:0 0 8px;color:${BRAND_COLOR};font-weight:700;">Resumen de datos enviados</p>
          <p style="margin:0 0 6px;color:#334155;">Email: ${email}</p>
          <p style="margin:0 0 6px;color:#334155;">Teléfono: ${telefono || '-'}</p>
          <p style="margin:0;color:#334155;">Mensaje: ${mensaje}</p>
        </div>
      </div>
    </div>`;

  try {
    await sendEmail(
      {
        from: fromEmail,
        to: [adminEmail],
        reply_to: email,
        subject: `Nueva consulta web — ${nombre}`,
        html: adminHtml,
      },
      apiKey
    );

    await sendEmail(
      {
        from: fromEmail,
        to: [email],
        subject: 'Hemos recibido tu solicitud — Grupo SOFIA54',
        html: clientHtml,
      },
      apiKey
    );

    context.res = { status: 200, jsonBody: { ok: true } };
  } catch (error) {
    context.log.error(error.message);
    context.res = { status: 502, jsonBody: { ok: false } };
  }
};
