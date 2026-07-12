export const AUDIT_ACTIONS = [
    "USER_SUSPENDED",
    "USER_REACTIVATED",
    "POST_HIDDEN",
    "POST_RESTORED",
    "REPORT_REVIEWED",
    "REPORT_DISMISSED",
    "REPORT_ACTIONED",
] as const;
export type AuditAction = typeof AUDIT_ACTIONS[number];

export const AUDIT_TARGET_TYPES = ["user", "post", "report"] as const;
export type AuditTargetType = typeof AUDIT_TARGET_TYPES[number];
