export type NotificationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SENT"
  | "RETRY_SCHEDULED"
  | "DEAD_LETTER";

export type ChannelType = "EMAIL" | "SMS" | "PUSH";

export interface NotificationItem {
  notificationId: number;
  eventType: string;
  channelType: ChannelType;
  recipientKey: string;
  recipientValue?: string;
  title?: string;
  status: NotificationStatus;
  retryCnt: number;
  createdAt: string;
  sentAt?: string;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
}

export interface NotificationDetail {
  notificationId: number;
  eventType: string;
  channelType: ChannelType;
  recipientKey: string;
  recipientValue?: string;
  title?: string;
  body?: string;
  status: NotificationStatus;
  retryCnt: number;
  maxRetryCnt?: number;
  createdAt: string;
  sentAt?: string | null;
  nextRetryAt?: string | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
}

export interface DeliveryAttempt {
  attemptId: number;
  notificationId: number;
  attemptNo: number;
  attemptStatus: string;
  errorCode: string | null;
  errorMessage: string | null;
  providerResponse: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface AdminAction {
  logId: number;
  notificationId: number;
  adminId: string;
  actionType: string;
  actionReason: string | null;
  createdAt: string;
}