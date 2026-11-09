// Email templates. Built for email clients, not browsers: table layout, inline styles, system fonts (web fonts do
// not load in Gmail/Outlook), 560px wide, light colour scheme only, and a plain-text twin for every message.
// The code is one unbroken string (spacing comes from letter-spacing) so copy-paste gives exactly 6 digits.
// Colours are FlipOne's: paper #F5F4F0, ink #17150F, kraft #CDAE80, tag red #D3261C.

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const DISPLAY = "'Arial Narrow','Helvetica Neue Condensed',Arial,sans-serif";

/** Shared frame: wordmark, white card, quiet footer. `preheader` is the inbox preview line. */
const layout = ({ preheader, body, footer }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>FlipOne</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F5F4F0;">${escapeHtml(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F5F4F0;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
        <tr>
          <td style="padding:0 4px 18px;font-family:${DISPLAY};font-size:28px;line-height:28px;font-weight:700;letter-spacing:0.5px;color:#17150F;">
            FlipOne<span style="display:inline-block;width:7px;height:7px;margin-left:3px;background:#D3261C;border-radius:1px;"></span>
          </td>
        </tr>
        <tr>
          <td style="background:#FFFFFF;border:1px solid #DEDCD6;border-radius:8px;padding:36px 36px 32px;font-family:${FONT};color:#17150F;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 4px 0;font-family:${FONT};font-size:12.5px;line-height:19px;color:#5C584F;">
            ${footer}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

/**
 * The sign-up verification email: the 6-digit code as the one thing to look at.
 * @returns {{ subject: string, html: string, text: string }}
 */
export const verificationEmail = ({ name, code, minutes }) => {
  const first = String(name ?? '').trim().split(/\s+/)[0] || 'there';
  const subject = `${code} is your FlipOne code`;

  const body = `
            <h1 style="margin:0 0 10px;font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.3px;color:#17150F;">Confirm your email</h1>
            <p style="margin:0 0 26px;font-size:15px;line-height:23px;color:#3B372F;">Hi ${escapeHtml(first)}, enter this code in FlipOne to finish creating your account.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="background:#F5F4F0;border:1px dashed #C4C2BC;border-radius:6px;padding:22px 12px;">
                  <div style="font-family:${DISPLAY};font-size:38px;line-height:40px;font-weight:700;letter-spacing:12px;padding-left:12px;color:#17150F;">${escapeHtml(code)}</div>
                </td>
              </tr>
            </table>
            <p style="margin:18px 0 0;font-size:14px;line-height:21px;color:#5C584F;">The code expires in <strong style="color:#17150F;">${minutes} minutes</strong>. FlipOne will never ask you for it by phone or chat.</p>`;

  const footer = `Didn&rsquo;t sign up for FlipOne? You can ignore this email: the account stays inactive without the code.`;

  const text = [
    `Confirm your email`,
    ``,
    `Hi ${first}, enter this code in FlipOne to finish creating your account:`,
    ``,
    `    ${code}`,
    ``,
    `The code expires in ${minutes} minutes. FlipOne will never ask you for it by phone or chat.`,
    ``,
    `Didn't sign up for FlipOne? You can ignore this email: the account stays inactive without the code.`,
  ].join('\n');

  return { subject, html: layout({ preheader: `Your code is ${code}. It expires in ${minutes} minutes.`, body, footer }), text };
};
