export const REPORT_TARGET_TYPES = ["post", "comment"] as const;

export const REPORT_REASONS = [
    "spam",
    "harassment",
    "hate_speech",
    "violence",
    "scam",
    "sexual_content",
    "misinformation",
    "other",
] as const;

export const REPORT_STATUSES = ["pending", "reviewed", "dismissed", "actioned"] as const;
export const REPORT_REVIEW_STATUSES = ["reviewed", "dismissed", "actioned"] as const;

export type ReportTargetType = typeof REPORT_TARGET_TYPES[number];
export type ReportReason = typeof REPORT_REASONS[number];
export type ReportStatus = typeof REPORT_STATUSES[number];
export type ReportReviewStatus = typeof REPORT_REVIEW_STATUSES[number];
