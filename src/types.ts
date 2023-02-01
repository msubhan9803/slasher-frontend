// For shared types

export const VALID_REPORT_TYPES = ['profile', 'post', 'comment', 'reply'] as const; // "as const" makes it readonly
export type ReportType = typeof VALID_REPORT_TYPES[number];

export type RegisterUser = Partial<
{
  firstName: string,
  userName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  securityQuestion: string,
  securityAnswer: string,
  dob: string,
}>;
