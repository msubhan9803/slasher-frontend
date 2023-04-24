/* eslint-disable max-len */
export const verificationEmailTemplate = `
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 800px; font-size: 13px; background: #1D1A1A;">
    <tbody>
      <tr>
        <td style="vertical-align: top; height: 300px;">
          <table border="0" width="100%">
            <tr>
              <td align="center" style="padding: 0px; background-color:#000000;"> <img align="center" alt="Slasher header" src="[[ImageBaseUrl]]/profile/profile_6oth11662h.png" style="padding-bottom: 0; display: inline !important; vertical-align: bottom;" class="mcnImage"> </td>
            </tr >
          </table>
        </td >
      </tr>
      <tr>
        <td style="padding:5px; vertical-align: top;">
          <h1 style="color: #ffffff; margin: 0; padding: 20px ; font-size: 24px; font-weight: 400; text-align: center;">Activate Your Account</h1 >
          <h2 style="color: #ffffff; margin: 0; padding: 20px; font-size: 16px; font-weight: 400;"> Dear [[ReceiverName]],</h2>
          <p style="font-size:14px; color: #ffffff; padding: 0 20px; line-height: 18px"> Please click this link to confirm your email address and activate your account on Slasher:&nbsp;&nbsp;<a class="text-center" href="[[FRONTEND_URL]][[EmailVerificationPath]]" target="_blank" style="color: #F90000; text-decoration: none;"><u>Verify Email</u></a></p>
          <p style="font-size: 14px; color: #ffffff; padding: 0 20px; line-height: 18px"> Welcome to Slasher and thank you for being part of our community!  We"ve got such sights to show you!</p>
          <p style="font-size: 14px; color: #ffffff; padding: 0 20px; line-height: 18px">If you have any questions or suggestions to improve Slasher, you can contact us at: <a href="mailto:[[HELP_EMAIL]]" style="color: #F90000; text-decoration: none;">[[HELP_EMAIL]]</a></p>
        </td>
      </tr>
      <tr>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td></td>
      </tr>
      <tr>
        <td align="center" style="padding: 3px 5px; color: #fff; font-size: 14px;">
          <table width="100 %">
            <tr>
              <td colspan="2" style="font-size: 14px; color:#4d4d4d; text - align: center; padding - bottom: 5px;"> Download the Slasher app at: </td>
            </tr>
            <tr>
              <td width="50 %" align="right"><a href="https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en" target="_blank"><img align="center" alt="Slasher on Google Play" src="[[ImageBaseUrl]]/chat/chat__291kjo24qtq.png" style="padding-right: 5px; display: inline !important; vertical-align: bottom;"></a></td>
              <td width="50%" align="left"><a href="http://itunes.apple.com/app/id1458216326" target="_blank"><img align="center" alt="Slasher on the App Store" src="[[ImageBaseUrl]]/chat/chat__2zo5pyl9531.png" style="padding-left: 5px; display: inline !important; vertical-align: bottom;"></a></td>
            </tr>
          </table>
        </td >
      </tr>
    </tbody >
  </table>
`;

export const forgotPasswordEmailTemplate = `
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; min-height: 800px; font-size: 13px; background: #1D1A1A;">
    <tbody>
      <tr>
        <td style="vertical-align: top; height: 300px;">
          <table border="0" width="100%">
            <tr>
              <td align="center" style="padding: 0px; background-color:#000000;"> <img align="center" alt="Slasher header" src="[[ImageBaseUrl]]/profile/profile_6oth11662h.png" style="padding-bottom: 0; display: inline !important; vertical-align: bottom;" class="mcnImage"> </td>
            </tr >
          </table>
        </td >
      </tr>
      <tr>
        <td style="padding:5px; vertical-align: top;">
          <h1 style="color: #ffffff; margin: 0; padding: 20px ; font-size: 24px; font-weight: 400; text-align: center;">Reset Your Password</h1 >
          <h2 style="color: #ffffff; margin: 0; padding: 20px; font-size: 16px; font-weight: 400;"> Dear [[ReceiverName]],</h2>
          <p style="font-size:14px; color: #ffffff; padding: 0 20px; line-height: 18px"> A Forgot Password request has been submitted for the email address associated with your account.  Please click this link to reset your password on Slasher:&nbsp;&nbsp;<a class="text-center" href="[[FRONTEND_URL]][[ResetPasswordPath]]" target="_blank" style="color: #F90000; text-decoration: none;"><u>Reset Password</u></a></p>
          <p style="font-size: 14px; color: #ffffff; padding: 0 20px; line-height: 18px">If you did not initiate this request, you can contact us at: <a href="mailto:[[HELP_EMAIL]]" style="color: #F90000; text-decoration: none;">[[HELP_EMAIL]]</a></p>
        </td>
      </tr>
      <tr>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td></td>
      </tr>
      <tr>
        <td align="center" style="padding: 3px 5px; color: #fff; font-size: 14px;">
          <table width="100 %">
            <tr>
              <td colspan="2" style="font-size: 14px; color:#4d4d4d; text - align: center; padding - bottom: 5px;"> Download the Slasher app at: </td>
            </tr>
            <tr>
              <td width="50 %" align="right"><a href="https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en" target="_blank"><img align="center" alt="Slasher on Google Play" src="[[ImageBaseUrl]]/chat/chat__291kjo24qtq.png" style="padding-right: 5px; display: inline !important; vertical-align: bottom;"></a></td>
              <td width="50%" align="left"><a href="http://itunes.apple.com/app/id1458216326" target="_blank"><img align="center" alt="Slasher on the App Store" src="[[ImageBaseUrl]]/chat/chat__2zo5pyl9531.png" style="padding-left: 5px; display: inline !important; vertical-align: bottom;"></a></td>
            </tr>
          </table>
        </td >
      </tr>
    </tbody >
  </table>
`;
