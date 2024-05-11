import { escapeHtmlSpecialCharacters } from '../utils/text-utils';

/* eslint-disable max-len */
export const sharedEmailHeader = `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      table, td, div, h1, p {font-family: Arial, sans-serif;}
      p, ul, ol { margin:0 0 12px 0; }
      body, a { color: #fff; }
      #central-content { font-size:15px;line-height:24px;font-family:Arial,sans-serif; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#000;color:#fff;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#000;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:570px;border-collapse:collapse;background:#141414;border-spacing:0;text-align:left;">
            <tr>
              <td align="center">
                <img src="https://s3.us-east-1.amazonaws.com/cdn.theslasherapp.com/email/slasher-email-header-image-2023-05-18.png" alt="Slasher logo" style="width:100%;height:auto;display:block;" />
              </td>
            </tr>

            <tr>
              <td style="padding:36px 30px 24px 30px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                  <tr>
                    <td id="central-content">
`;

export const sharedEmailFooter = `
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

/* This renders an inline html button that works in most email clients, but NOT in outlook */
// export function renderEmailHtmlButtonLink(linkText: string, href: string) {
//   const linkTextEscapedForHtml = escapeHtmlSpecialCharacters(linkText);
//   return `
//     <a
//       style="color:#000000;background:#ff1800;border-radius:50px;text-decoration:none;padding:0.375rem 1rem;font-size:14px;font-weight:bold;"
//       href="${href}"
//     >${linkTextEscapedForHtml}</a>
//   `;
// }

/*
  This renders an inline html button that should work in most email clients, including Outlook,
  but the button must be on its own line.
*/
export function renderEmailHtmlButtonLink(linkText: string, href: string) {
  const linkTextEscapedForHtml = escapeHtmlSpecialCharacters(linkText);
  return `
  <!--[if mso]>
    <v:roundrect href="${href}" style="width:90px;height:26px;v-text-anchor:middle;" arcsize="50%" stroke="f" fillcolor="#FF1800" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:anchorlock/>
      <v:textbox inset="0,0,0,0">
        <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;color:#000000;">${linkTextEscapedForHtml}</center>
      </v:textbox>
    </v:roundrect>
  <![endif]-->
  <a
    style="mso-hide:all;color:#000000;background:#ff1800;border-radius:50px;text-decoration:none;padding:0.375rem .75rem;font-size:14px;font-weight:bold;"
    href="${href}"
  >${linkTextEscapedForHtml}</a>
  `;
}

// export function renderEmailHtmlButtonLinkAsTable(text: string, buttonLinkText: string, buttonLinkHref: string) {
//   return `
//   <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;margin-bottom:12px;">
//     <tr>
//       <td style="padding:0;">
//         ${escapeHtmlSpecialCharacters(text)}&nbsp;
//       </td>
//       <td style="padding:0 auto;">
//         ${renderEmailHtmlButtonLink(buttonLinkText, buttonLinkHref)}
//       </td>
//     </tr>
//   </table>
//   `;
// }
