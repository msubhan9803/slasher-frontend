/* eslint-disable max-lines */
import {
  Body,
  Controller, HttpException, HttpStatus, Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { EmailChangeConfirmDto } from './dto/email-change/email-change-confirm.dto';
import { EmailChangeRevertDto } from './dto/email-change/email-change-revert.dto';
import { UsersService } from './providers/users.service';
import { EmailRevertTokensService } from '../email-revert-tokens/providers/email-revert-tokens.service';
import { Public } from '../app/guards/auth.guard';

@Controller({ path: 'users/email-change', version: ['1'] })
export class UsersEmailChangeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailRevertTokensService: EmailRevertTokensService,
    private readonly config: ConfigService,
  ) { }

  @Post('confirm')
  @Public()
  async confirm(@Body() emailChangeConfirmDto: EmailChangeConfirmDto) {
    let user = await this.usersService.findById(emailChangeConfirmDto.userId, true);

    if (!user || user.emailChangeToken !== emailChangeConfirmDto.token) {
      throw new HttpException('Invalid token.', HttpStatus.BAD_REQUEST);
    }

    // If we got here, then we want to go through with the confirmation
    user = await this.usersService.update(user.id, {
      // Clear change token
      emailChangeToken: null,
      // Assign pending email address to main address field
      email: user.unverifiedNewEmail,
      // Clear unverified email field
      unverifiedNewEmail: null,
    });

    return {
      message: `Your new email address (${user.email}) has been confirmed.`,
    };
  }

  @Post('revert')
  @Public()
  async revert(@Body() emailChangeRevertDto: EmailChangeRevertDto) {
    // Any EmailRevertTokens older than 30 days should be considered expired
    const numberOfDaysRevertTokenIsValid = 30;
    const earliestValidIssueDate = DateTime.now().minus({ days: numberOfDaysRevertTokenIsValid }).toJSDate();

    const emailRevertToken = await this.emailRevertTokensService.findToken(
      emailChangeRevertDto.userId,
      emailChangeRevertDto.token,
      earliestValidIssueDate,
    );

    if (!emailRevertToken) {
      throw new HttpException('Invalid token.', HttpStatus.BAD_REQUEST);
    }

    // If we got here, the token is valid, so we'll apply the email revert operation

    await this.usersService.update(emailChangeRevertDto.userId, {
      // Revert email
      email: emailRevertToken.emailToRevertTo,
      // Clear out any unverified email value
      unverifiedNewEmail: null,
      // Clear out any current emailChangeToken, to prevent any simultaneous change attempt from
      // going through (in case an unauthorized person was attempting to change the email address).
      emailChangeToken: null,
    });

    // And we'll also clear out the used revert token and any later-issued revert tokens
    await this.emailRevertTokensService.deleteTokenAndLaterIssuedTokens(
      emailChangeRevertDto.userId,
      emailChangeRevertDto.token,
    );

    return {
      message: `Your email address has been restored to: ${emailRevertToken.emailToRevertTo}`,
    };
  }
}
