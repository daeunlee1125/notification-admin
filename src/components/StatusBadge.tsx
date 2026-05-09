import type { NotificationStatus } from "../types/notification";

type Props = {
  status: NotificationStatus;
};

export default function StatusBadge({ status }: Props) {
  const map: Record<NotificationStatus, string> = {
    PENDING: "badge badge-gray",
    IN_PROGRESS: "badge badge-blue",
    SENT: "badge badge-green",
    RETRY_SCHEDULED: "badge badge-yellow",
    DEAD_LETTER: "badge badge-red",
  };

  return <span className={map[status]}>{status}</span>;
}