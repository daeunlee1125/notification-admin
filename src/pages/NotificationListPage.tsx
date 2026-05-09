import { useEffect, useState } from "react";
import type { NotificationItem } from "../types/notification";
import { getNotifications, retryNotification } from "../api/notificationApi";
import StatusBadge from "../components/StatusBadge";
import NotificationDetailModal from "../components/NotificationDetailModal";

export default function NotificationListPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications({});

      setNotifications(data.items ?? []);
    } catch (error) {
      console.error("알림 목록 조회 실패", error);
      alert("알림 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (notificationId: number) => {
        try {
        await retryNotification(notificationId, {
            adminId: "admin",
            reason: "관리자 화면에서 재시도",
        });

        alert("재시도 요청 완료");
        loadNotifications();
        } catch (error) {
        console.error("재시도 실패", error);
        alert("재시도 요청 실패");
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    return (
    <div className="page">
        <div className="admin-shell">
        <div className="page-header">
            <div>
            <p className="eyebrow">Notification System</p>
            <h1>Notification Admin Console</h1>
            <p className="page-subtitle">
                발송 상태, 실패 이력, 재시도 대상을 관리합니다.
            </p>
            </div>

            <button className="refresh-button" onClick={loadNotifications}>
            새로고침
            </button>
        </div>

        <div className="summary-grid">
            <div className="summary-card">
            <span>전체</span>
            <strong>{notifications.length}</strong>
            </div>
            <div className="summary-card">
            <span>발송 완료</span>
            <strong>{notifications.filter((n) => n.status === "SENT").length}</strong>
            </div>
            <div className="summary-card danger">
            <span>실패 종료</span>
            <strong>
                {notifications.filter((n) => n.status === "DEAD_LETTER").length}
            </strong>
            </div>
            <div className="summary-card">
            <span>재시도 대기</span>
            <strong>
                {notifications.filter((n) => n.status === "RETRY_SCHEDULED").length}
            </strong>
            </div>
        </div>

        {loading && <p className="loading-text">불러오는 중...</p>}

        <div className="table-card">
            <table className="notification-table">
            <thead>
                <tr>
                <th>알림 ID</th>
                <th>채널</th>
                <th>수신자</th>
                <th>상태</th>
                <th>재시도</th>
                <th>생성 시간</th>
                <th>최근 오류</th>
                <th>상세</th>
                <th>재시도</th>
                </tr>
            </thead>

            <tbody>
                {notifications.map((item) => (
                <tr key={item.notificationId}>
                    <td className="id-cell">#{item.notificationId}</td>
                    <td>{item.channelType}</td>
                    <td>{item.recipientValue ?? item.recipientKey}</td>
                    <td>
                        <StatusBadge status={item.status} />
                    </td>
                    <td>{item.retryCnt}</td>
                    <td>{item.createdAt}</td>
                    <td className={item.lastErrorMessage ? "error-cell" : ""}>
                        {item.lastErrorMessage || "-"}
                    </td>
                    <td>
                        <button className="detail-button" onClick={() => setSelectedNotificationId(item.notificationId)}>
                        상세
                        </button>
                    </td>
                    <td>
                    {item.status === "DEAD_LETTER" || item.status === "RETRY_SCHEDULED" ? (
                        <button
                        className="retry-button"
                        onClick={() => handleRetry(item.notificationId)}
                        >
                        retry
                        </button>
                    ) : (
                        <span className="muted-text">-</span>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
        // 상세 모달
        {selectedNotificationId && (
        <NotificationDetailModal
            notificationId={selectedNotificationId}
            onClose={() => setSelectedNotificationId(null)}
            onRetrySuccess={loadNotifications}
        />
        )}
    </div>

    
    );
}