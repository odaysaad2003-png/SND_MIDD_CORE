export const AUDIT_ACTIONS = ["USER_SUSPENDED", "USER_REACTIVATED"] as const;
export type AuditAction = typeof AUDIT_ACTIONS[number];

export const AUDIT_TARGET_TYPES = ["user"] as const;
export type AuditTargetType = typeof AUDIT_TARGET_TYPES[number];
