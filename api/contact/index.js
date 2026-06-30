'use strict';

const BRAND_NAME = 'Grupo SOFIA54';
const BRAND_COLOR = '#2246f5';
const ADMIN_EMAIL = process.env.CONTACT_ADMIN_EMAIL || 'administracion@gruposofia54.com';
const SENDER_UPN = process.env.CONTACT_SENDER_EMAIL;
const LOGO_URL = process.env.CONTACT_LOGO_URL || 'https://gruposofia54.com/assets/logo-azul.png';
const TENANT_ID = process.env.GRAPH_TENANT_ID;
const CLIENT_ID = process.env.GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;

const escapeHtml = (v = '') =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

async function getGraphToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Graph token error ${res.status}: ${detail}`);
  }

  const json = await res.json();
  return json.access_token;
}

async function sendMail({ token, to, subject, html, replyTo }) {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER_UPN)}/sendMail`;
  const payload = {
    message: {
      subject,
      body: { contentType: 'HTML', content: html },
      toRecipients: [{ emailAddress: { address: to } }],
      ...(replyTo ? { replyTo: [{ emailAddress: { address: replyTo } }] } : {}),
    },
    saveToSentItems: false,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok && res.status !== 202) {
    const detail = await res.text();
    throw new Error(`Graph sendMail error ${res.status}: ${detail}`);
  }
}

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://gruposofia54.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
    return;
  }

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !SENDER_UPN) {
    context.log.error('Missing env vars: GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, CONTACT_SENDER_EMAIL');
    context.res = {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': 'https://gruposofia54.com' },
      jsonBody: { ok: false, error: 'Server configuration error' },
    };
    return;
  }

  const body = req.body || {};
  const nombre = escapeHtml((body.nombre || '').trim());
  const email = escapeHtml((body.email || '').trim());
  const telefono = escapeHtml((body.telefono || '').trim());
  const mensaje = escapeHtml((body.mensaje || '').trim());

  if (!nombre || !email || !mensaje) {
    context.res = {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': 'https://gruposofia54.com' },
      jsonBody: { ok: false, error: 'Campos obligatorios incompletos' },
    };
    return;
  }

  const adminHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:32px 16px;">
<tr><td><table width="100%" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0e3ef;border-radius:12px;overflow:hidden;">
  <tr><td style="background:${BRAND_COLOR};padding:28px 32px;">
    <img src="${LOGO_URL}" alt="${BRAND_NAME}" style="max-width:160px;height:auto;display:block;filter:brightness(0) invert(1);" />
  </td></tr>
  <tr><td style="padding:32px;">
    <h2 style="margin:0 0 20px;color:#1a1d2e;font-size:1.15rem;">📬 Nueva consulta desde gruposofia54.com</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1a1d2e;">
      <tr style="border-bottom:1px solid #f0f1f6;">
        <td style="padding:10px 0;font-weight:700;width:100px;">Nombre</td>
        <td style="padding:10px 0;">${nombre}</td>
      </tr>
      <tr style="border-bottom:1px solid #f0f1f6;">
        <td style="padding:10px 0;font-weight:700;">Email</td>
        <td style="padding:10px 0;"><a href="mailto:${email}" style="color:${BRAND_COLOR};text-decoration:none;">${email}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #f0f1f6;">
        <td style="padding:10px 0;font-weight:700;">Teléfono</td>
        <td style="padding:10px 0;">${telefono || '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-weight:700;vertical-align:top;">Mensaje</td>
        <td style="padding:10px 0;line-height:1.65;">${mensaje}</td>
      </tr>
    </table>
    <div style="margin-top:26px;">
      <a href="mailto:${email}?subject=Re%3A%20Consulta%20nave%20industrial"
         style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:0.88rem;text-decoration:none;padding:12px 22px;border-radius:7px;">
        Responder a ${nombre} →
      </a>
    </div>
  </td></tr>
  <tr><td style="background:#0a0c10;padding:18px 32px;text-align:center;">
    <p style="color:rgba(255,255,255,0.3);font-size:0.75rem;margin:0;">
      © 2026 Grupo Sofía54 · gruposofia54.com — Infraestructura por VIONYX
    </p>
  </td></tr>
</table></td></tr>
</table></body></html>`;

  const clientHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 16px;">
<tr><td><table width="100%" style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
  <tr><td style="background:${BRAND_COLOR};padding:32px 40px;text-align:center;">
    <p style="color:#fff;font-size:1.5rem;font-weight:900;letter-spacing:-0.03em;margin:0;">GRUPO SOFÍA 54</p>
    <p style="color:rgba(255,255,255,0.62);font-size:0.78rem;margin:8px 0 0;letter-spacing:0.14em;text-transform:uppercase;">
      Espacios Industriales · Comunidad de Madrid
    </p>
  </td></tr>
  <tr><td style="padding:40px;">
    <h1 style="color:#1a1d2e;font-size:1.3rem;font-weight:800;margin:0 0 14px;">
      Hemos recibido tu consulta
    </h1>
    <p style="color:#5a5f78;font-size:0.95rem;line-height:1.75;margin:0 0 24px;">
      Hola <strong style="color:#1a1d2e;">${nombre}</strong>, gracias por ponerte en contacto con nosotros.<br>
      Tu mensaje ha sido recibido correctamente. Uno de nuestros responsables se pondrá en contacto contigo
      en un plazo máximo de <strong style="color:#1a1d2e;">24 horas laborables</strong>.
    </p>
    <div style="background:#f5f6fa;border-radius:10px;padding:20px 24px;margin:0 0 28px;border-left:4px solid ${BRAND_COLOR};">
      <p style="color:${BRAND_COLOR};font-size:0.76rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">
        Datos registrados
      </p>
      <p style="color:#5a5f78;font-size:0.88rem;margin:0;line-height:1.7;">
        Email: ${email}<br>
        ${telefono ? 'Teléfono: ' + telefono + '<br>' : ''}
        Mensaje: ${mensaje}
      </p>
    </div>
    <table cellpadding="0" cellspacing="0"><tr>
      <td>
        <a href="https://gruposofia54.com/nuestras-naves/"
           style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:0.88rem;text-decoration:none;padding:13px 24px;border-radius:7px;">
          Ver nuestras naves →
        </a>
      </td>
      <td style="padding-left:16px;">
        <a href="tel:+34914475113"
           style="display:inline-block;color:${BRAND_COLOR};font-weight:600;font-size:0.88rem;text-decoration:none;padding:13px 0;">
          O llámanos: +34 914 475 113
        </a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#1a1d2e;padding:24px 40px;text-align:center;">
    <p style="color:rgba(255,255,255,0.3);font-size:0.75rem;margin:0;">
      © 2026 Grupo Sofía54 · Calle Rodríguez San Pedro 23, Bajo B, 28015 Madrid<br>
      <a href="https://gruposofia54.com" style="color:rgba(255,255,255,0.28);text-decoration:none;">gruposofia54.com</a>
      &nbsp;·&nbsp;
      <a href="https://vionyx.com" style="color:rgba(255,255,255,0.28);text-decoration:none;">Infraestructura por VIONYX</a>
    </p>
  </td></tr>
</table></td></tr>
</table></body></html>`;

  try {
    const token = await getGraphToken();

    await sendMail({
      token,
      to: ADMIN_EMAIL,
      subject: `Nueva consulta web — ${nombre}`,
      html: adminHtml,
      replyTo: email,
    });

    await sendMail({
      token,
      to: email,
      subject: 'Hemos recibido tu consulta — Grupo SOFIA54',
      html: clientHtml,
    });

    context.res = {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': 'https://gruposofia54.com' },
      jsonBody: { ok: true },
    };
  } catch (err) {
    context.log.error('sendMail failed:', err.message);
    context.res = {
      status: 502,
      headers: { 'Access-Control-Allow-Origin': 'https://gruposofia54.com' },
      jsonBody: { ok: false },
    };
  }
};
