// For shared types

export const VALID_REPORT_TYPES = ['profile', 'post', 'comment', 'reply'] as const; // "as const" makes it readonly
export type ReportType = typeof VALID_REPORT_TYPES[number];
