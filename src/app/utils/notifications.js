// 알림 유틸리티 함수들

// 브라우저 알림 권한 요청
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

// 브라우저 알림 발송
export function sendBrowserNotification(title, body, icon = '/next.svg') {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { 
      body, 
      icon,
      badge: '/next.svg',
      tag: 'libris-notification'
    });
  }
}

// 앱 내 알림 저장
export function saveInAppNotification(notification) {
  if (typeof window === 'undefined') return;
  
  const notifications = JSON.parse(localStorage.getItem('bookshelf_inapp_notifications') || '[]');
  const newNotification = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  
  notifications.unshift(newNotification);
  
  // 최대 50개까지만 저장
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  localStorage.setItem('bookshelf_inapp_notifications', JSON.stringify(notifications));
  
  // 알림 개수 업데이트
  updateNotificationBadge();
  
  // 이벤트 디스패치로 헤더 알림 업데이트
  window.dispatchEvent(new Event('notification-update'));
}

// 알림 배지 업데이트
export function updateNotificationBadge() {
  if (typeof window === 'undefined') return;
  
  const notifications = JSON.parse(localStorage.getItem('bookshelf_inapp_notifications') || '[]');
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // 브라우저 탭 제목에 알림 개수 표시
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) Libris`;
  } else {
    document.title = 'Libris';
  }
}

// 알림 설정 가져오기
export function getNotificationSettings() {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem('bookshelf_notifications');
  return stored ? JSON.parse(stored) : {
    emailNotifications: true,
    monthlyReport: true,
    goalReminder: true,
    readingStreak: true,
    bookAdded: true,
    goalAchieved: true
  };
}

// 목표 달성 알림
export function sendGoalAchievedNotification(goalType, currentValue, targetValue) {
  const settings = getNotificationSettings();
  if (!settings.goalAchieved) return;
  
  const title = '🎉 목표 달성!';
  const body = `${goalType} 목표를 달성했습니다! (${currentValue}/${targetValue})`;
  
  sendBrowserNotification(title, body);
  saveInAppNotification({
    type: 'goal_achieved',
    title,
    body,
    goalType,
    currentValue,
    targetValue
  });
}

// 책 추가 알림
export function sendBookAddedNotification(bookTitle) {
  const settings = getNotificationSettings();
  if (!settings.bookAdded) return;
  
  const title = '📚 새 책 추가됨';
  const body = `"${bookTitle}"이(가) 책장에 추가되었습니다.`;
  
  sendBrowserNotification(title, body);
  saveInAppNotification({
    type: 'book_added',
    title,
    body,
    bookTitle
  });
}

// 독서 스트릭 알림
export function sendReadingStreakNotification(streakDays) {
  const settings = getNotificationSettings();
  if (!settings.readingStreak) return;
  
  const title = '🔥 독서 스트릭!';
  const body = `${streakDays}일 연속으로 독서를 하고 있습니다!`;
  
  sendBrowserNotification(title, body);
  saveInAppNotification({
    type: 'reading_streak',
    title,
    body,
    streakDays
  });
}

// 월간 리포트 알림
export function sendMonthlyReportNotification(month, booksRead) {
  const settings = getNotificationSettings();
  if (!settings.monthlyReport) return;
  
  const title = '📊 월간 독서 리포트';
  const body = `${month}월에 ${booksRead}권의 책을 읽었습니다.`;
  
  sendBrowserNotification(title, body);
  saveInAppNotification({
    type: 'monthly_report',
    title,
    body,
    month,
    booksRead
  });
}

// 알림 읽음 처리
export function markNotificationAsRead(notificationId) {
  if (typeof window === 'undefined') return;
  
  const notifications = JSON.parse(localStorage.getItem('bookshelf_inapp_notifications') || '[]');
  const updatedNotifications = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  
  localStorage.setItem('bookshelf_inapp_notifications', JSON.stringify(updatedNotifications));
  updateNotificationBadge();
  
  // 이벤트 디스패치로 헤더 알림 업데이트
  window.dispatchEvent(new Event('notification-update'));
}

// 모든 알림 읽음 처리
export function markAllNotificationsAsRead() {
  if (typeof window === 'undefined') return;
  
  const notifications = JSON.parse(localStorage.getItem('bookshelf_inapp_notifications') || '[]');
  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
  
  localStorage.setItem('bookshelf_inapp_notifications', JSON.stringify(updatedNotifications));
  updateNotificationBadge();
  
  // 이벤트 디스패치로 헤더 알림 업데이트
  window.dispatchEvent(new Event('notification-update'));
}

// 알림 목록 가져오기
export function getNotifications() {
  if (typeof window === 'undefined') return [];
  
  return JSON.parse(localStorage.getItem('bookshelf_inapp_notifications') || '[]');
}

// 읽지 않은 알림 개수
export function getUnreadNotificationCount() {
  if (typeof window === 'undefined') return 0;
  
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
} 