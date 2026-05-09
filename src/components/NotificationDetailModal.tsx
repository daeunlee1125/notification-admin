import { useEffect, useState } from "react";
import {
  getAdminActions,
  getAttempts,
  getNotificationDetail,
  retryNotification,
} from "../api/notificationApi";
import type {
  AdminAction,
  DeliveryAttempt,
  NotificationDetail,
} from "../types/notification";
import StatusBadge from "./StatusBadge";

type Props = {
  notificationId: number;
  onClose: () => void;
  onRetrySuccess: () => void;
};

type TabType = "attempts" | "adminActions";

export default function NotificationDetailModal({
  notificationId,
  onClose,
  onRetrySuccess,
}: Props) {
  const [detail, setDetail] = useState<NotificationDetail | null>(null);
  const [attempts, setAttempts] = useState<DeliveryAttempt[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("attempts");
  const [loading, setLoading] = useState(false);

  const canRetry =
    detail?.status === "DEAD_LETTER" || detail?.status === "RETRY_SCHEDULED";

  const loadDetail = async () => {
    try {
      setLoading(true);

      const [detailData, attemptsData, adminActionsData] = await Promise.all([
        getNotificationDetail(notificationId),
        getAttempts(notificationId),
        getAdminActions(notificationId),
      ]);

      setDetail(detailData);
      setAttempts(attemptsData.attempts ?? []);
      setAdminActions(adminActionsData.actions ?? []);
    } catch (error) {
      console.error("상세 조회 실패", error);
      alert("상세 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!detail) return;

    try {
      await retryNotification(detail.notificationId, {
        adminId: "admin",
        reason: "상세 모달에서 재시도",
      });

      alert("재시도 요청이 완료되었습니다.");
      await loadDetail();
      onRetrySuccess();
    } catch (error) {
      console.error("재시도 실패", error);
      alert("재시도 요청에 실패했습니다.");
    }
  };

  useEffect(() => {
    loadDetail();
  }, [notificationId]);

  const maskRecipientValue = (value?: string | null) => {
    if (!value) return "-";

    // 이메일 마스킹
    if (value.includes("@")) {
      const [localPart, domain] = value.split("@");

      if (!localPart || !domain) return value;

      const visible = localPart.slice(0, 2);
      return `${visible}${"*".repeat(Math.max(localPart.length - 2, 3))}@${domain}`;
    }

    // 전화번호 숫자만 추출
    const onlyNumbers = value.replace(/\D/g, "");

    if (onlyNumbers.length === 11) {
      return `${onlyNumbers.slice(0, 3)}-****-${onlyNumbers.slice(7)}`;
    }

    if (onlyNumbers.length === 10) {
      return `${onlyNumbers.slice(0, 3)}-***-${onlyNumbers.slice(6)}`;
    }

    return value;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {loading && <p className="loading-text">상세 정보를 불러오는 중...</p>}

        {detail && (
          <>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Notification Detail</p>
                <h2>Notification #{detail.notificationId}</h2>
              </div>

              <div className="modal-header-actions">
                <StatusBadge status={detail.status} />

                {canRetry && (
                  <button className="retry-button" onClick={handleRetry}>
                    retry
                  </button>
                )}

                <button className="close-button" onClick={onClose}>
                  닫기
                </button>
              </div>
            </div>

            <div className="detail-grid">
              <section className="detail-card">
                <h3>기본 정보</h3>

                <div className="detail-row">
                  <span>이벤트 유형</span>
                  <strong>{detail.eventType}</strong>
                </div>
                <div className="detail-row">
                  <span>채널</span>
                  <strong>{detail.channelType}</strong>
                </div>
                <div className="detail-row">
                  <span>수신자 키</span>
                  <strong>{detail.recipientKey}</strong>
                </div>
                <div className="detail-row">
                  <span>수신자 정보</span>
                  <strong>{maskRecipientValue(detail.recipientValue) ?? "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>제목</span>
                  <strong>{detail.title ?? "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>본문</span>
                  <strong className="body-text">{detail.body ?? "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>재시도 횟수</span>
                  <strong>
                    {detail.retryCnt} / {detail.maxRetryCnt ?? "-"}
                  </strong>
                </div>
              </section>

              <section className="detail-card">
                <h3>시간 / 에러 정보</h3>

                <div className="detail-row">
                  <span>생성 시간</span>
                  <strong>{detail.createdAt}</strong>
                </div>
                <div className="detail-row">
                  <span>발송 시간</span>
                  <strong>{detail.sentAt ?? "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>재시도 예정 시간</span>
                  <strong>{detail.nextRetryAt ?? "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>최근 오류 코드</span>
                  <strong className={detail.lastErrorCode ? "error-text" : ""}>
                    {detail.lastErrorCode ?? "-"}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>최근 오류 메시지</span>
                  <strong className={detail.lastErrorMessage ? "error-text body-text" : "body-text"}>
                    {detail.lastErrorMessage ?? "-"}
                  </strong>
                </div>
              </section>
            </div>

            <div className="tab-card">
              <div className="tabs">
                <button
                  className={activeTab === "attempts" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("attempts")}
                >
                  발송 이력
                </button>
                <button
                  className={
                    activeTab === "adminActions" ? "tab active" : "tab"
                  }
                  onClick={() => setActiveTab("adminActions")}
                >
                  관리자 조치 이력
                </button>
              </div>

              {activeTab === "attempts" && (
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>상태</th>
                      <th>시작 시간</th>
                      <th>종료 시간</th>
                      <th>오류 코드</th>
                      <th>오류 메시지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.length === 0 ? (
                      <tr>
                        <td colSpan={6}>발송 시도 이력이 없습니다.</td>
                      </tr>
                    ) : (
                      attempts.map((attempt) => (
                        <tr key={attempt.attemptId}>
                          <td>{attempt.attemptNo}</td>
                          <td>{attempt.attemptStatus}</td>
                          <td>{attempt.startedAt ?? "-"}</td>
                          <td>{attempt.finishedAt ?? "-"}</td>
                          <td>{attempt.errorCode ?? "-"}</td>
                          <td>{attempt.errorMessage ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === "adminActions" && (
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>관리자 ID</th>
                      <th>조치 유형</th>
                      <th>사유</th>
                      <th>처리 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminActions.length === 0 ? (
                      <tr>
                        <td colSpan={4}>관리자 액션 이력이 없습니다.</td>
                      </tr>
                    ) : (
                      adminActions.map((action) => (
                          <tr key={action.logId}>
                          <td>{action.adminId}</td>
                          <td>{action.actionType}</td>
                          <td>{action.actionReason ?? "-"}</td>
                          <td>{action.createdAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}