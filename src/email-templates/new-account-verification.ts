import { sharedEmailHeader, sharedEmailFooter } from './shared';

/* eslint-disable max-len */
export const templateForNewAccountVerification = `
  ${sharedEmailHeader}
    <p>Hello!</p>

    <p>
      Click the button to activate your Slasher account:
      <!--[if mso]>
      <v:roundrect href="[[EMAIL_VERIFICATION_LINK]]" style="width:84px;height:26px;v-text-anchor:middle;" arcsize="50%" stroke="f" fillcolor="#FF1800" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word">
          <w:anchorlock/>
          <v:textbox inset="0,0,0,0">
          <center>
      <![endif]-->
      <a
        style="color:#000000;background:#ff1800;text-decoration:none;padding:0.375rem .75rem;font-size:14px;font-weight:bold;"
        href="[[EMAIL_VERIFICATION_LINK]]"
      >Click here</a>
      <!--[if mso]>
          </center>
          </v:textbox>
      </v:roundrect>
      <![endif]-->
    </p>

    <p>We look forward to you being a part of our community. We've got such sights to show you!</p>
    <br />
    <p>Slasher Support</p>
  ${sharedEmailFooter}
`;
