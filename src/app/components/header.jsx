"use client";

import { Library, Bell, User, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { 
  getUnreadNotificationCount, 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  updateNotificationBadge
} from "../utils/notifications";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const unreadCount = getUnreadNotificationCount();
  const [mounted, setMounted] = useState(false);

  // 최초 마운트 시 알림 로드
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setNotifications(getNotifications());
    }
  }, []);

  // 알림 추가/수정 이벤트 리스너
  useEffect(() => {
    function handleNotificationUpdate() {
      setNotifications(getNotifications());
      updateNotificationBadge();
    }
    window.addEventListener("notification-update", handleNotificationUpdate);
    return () => window.removeEventListener("notification-update", handleNotificationUpdate);
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // 알림 읽음 처리
  const handleNotificationRead = useCallback((id) => {
    markNotificationAsRead(id);
    setNotifications(getNotifications());
  }, []);

  // 모든 알림 읽음 처리
  const handleReadAll = useCallback(() => {
    markAllNotificationsAsRead();
    setNotifications(getNotifications());
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center px-8 fixed top-0 left-0 w-full z-30">
      <a
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <Library className="w-6 h-6 text-[#22223b]" />
        <span className="font-semibold text-xl text-[#22223b] tracking-tight">
          Libris
        </span>
      </a>
      <div className="ml-auto flex items-center gap-3 relative">
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-2 hover:bg-[#f3f4f6] rounded transition-colors relative"
            aria-label="알림"
            onClick={() => setOpen((v) => !v)}
          >
            <Bell className="w-5 h-5 text-[#22223b]" />
            {mounted && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
          {mounted && open && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e5e7eb] rounded-xl shadow-lg z-50 animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-[#f3f4f6] font-semibold text-[#22223b]">
                <span>알림</span>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-blue-600 hover:underline px-2 py-1 rounded"
                    onClick={handleReadAll}
                    disabled={notifications.length === 0}
                  >
                    모두 읽음
                  </button>
                </div>
              </div>
              <ul className="max-h-60 overflow-y-auto divide-y divide-[#f3f4f6]">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`px-4 py-3 text-sm flex items-start gap-2 group ${
                        notification.read
                          ? "bg-[#f9f9fa] text-[#bdbdbd]"
                          : "text-[#22223b] bg-white"
                      }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationRead(notification.id)}
                      >
                        <div
                          className={`font-medium ${
                            notification.read ? "line-through" : ""
                          }`}
                        >
                          {notification.title}
                        </div>
                        <div className="text-xs mt-1 text-gray-500">
                          {notification.body}
                        </div>
                        <div className="text-xs mt-1">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          className="p-1 rounded hover:bg-blue-50 text-blue-600"
                          title="확인"
                          onClick={() => handleNotificationRead(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-[#bdbdbd] text-sm">
                    알림이 없습니다.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <Link href="/profile" aria-label="마이페이지">
          <span className="p-2 hover:bg-[#f3f4f6] rounded transition-colors inline-flex">
            <User className="w-5 h-5 text-[#22223b]" />
          </span>
        </Link>
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.18s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
