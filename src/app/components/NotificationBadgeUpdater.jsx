"use client";

import { useEffect } from "react";
import { updateNotificationBadge } from "../utils/notifications";

export default function NotificationBadgeUpdater() {
  useEffect(() => {
    // 앱 시작 시 알림 배지 업데이트
    updateNotificationBadge();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
