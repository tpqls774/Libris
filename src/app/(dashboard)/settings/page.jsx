"use client";

import { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";
import { requestNotificationPermission } from "../../utils/notifications";
import { saveInAppNotification } from "../../utils/notifications";

// SettingsPage 컴포넌트: 프로필, 알림, 데이터 관리 등 사용자 설정을 담당합니다.
export default function SettingsPage() {
  // 프로필 설정: 닉네임, 자기소개
  const [nickname, setNickname] = useState("tpqls774");
  const [introduction, setIntroduction] = useState("");

  // 알림 설정: 각종 알림 항목의 on/off 상태
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    monthlyReport: true,
    goalReminder: true,
    readingStreak: true,
    bookAdded: true,
    goalAchieved: true,
  });

  // 브라우저 알림 권한 상태
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  // 데이터 통계: 책/노트 개수, 마지막 백업일 등
  const [dataStats, setDataStats] = useState({
    books: 0,
    notes: 0,
    lastBackup: "",
  });

  // 컴포넌트 마운트 시 localStorage에서 설정 데이터 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 프로필 데이터
      const storedIntro = localStorage.getItem("bookshelf_intro");
      if (storedIntro) setIntroduction(storedIntro);

      // 닉네임 실시간 반영
      const storedNickname = localStorage.getItem("bookshelf_nickname");
      if (storedNickname) setNickname(storedNickname);
      const handleStorage = (e) => {
        if (e.key === "bookshelf_nickname") {
          setNickname(e.newValue || "tpqls774");
        }
      };
      window.addEventListener("storage", handleStorage);

      // 알림 설정 데이터
      const storedNotifications = localStorage.getItem(
        "bookshelf_notifications"
      );
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      // 브라우저 알림 권한 확인
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
      }

      // 테마 설정 (예시)
      const storedTheme = localStorage.getItem("bookshelf_theme");
      if (storedTheme) setTheme(storedTheme);

      // 데이터 통계: 책/노트 개수, 마지막 백업일
      const books = localStorage.getItem("bookshelf_books");
      const notes = localStorage.getItem("bookshelf_notes");
      setDataStats({
        books: books ? JSON.parse(books).length : 0,
        notes: notes ? JSON.parse(notes).length : 0,
        lastBackup: localStorage.getItem("bookshelf_last_backup") || "없음",
      });

      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  // 설정 저장 핸들러: localStorage에 key-value로 저장
  const handleSettingsSave = (key, value) => {
    localStorage.setItem(
      `bookshelf_${key}`,
      typeof value === "object" ? JSON.stringify(value) : value
    );
  };

  // 브라우저 알림 권한 요청 핸들러
  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission("granted");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 프로필 설정 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">프로필 설정</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  localStorage.setItem("bookshelf_nickname", e.target.value);
                }}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg
                  focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                한줄 소개
              </label>
              <input
                type="text"
                value={introduction}
                onChange={(e) => {
                  setIntroduction(e.target.value);
                  handleSettingsSave("intro", e.target.value);
                }}
                placeholder="자신을 소개해주세요"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg
                  focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 알림 설정 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" />
              <h2 className="text-base font-medium text-gray-900">알림 설정</h2>
            </div>
            {notificationPermission !== "granted" && (
              <button
                onClick={handleRequestNotificationPermission}
                className="px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
              >
                브라우저 알림 허용
              </button>
            )}
          </div>

          {notificationPermission !== "granted" && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                브라우저 알림을 받으려면 권한을 허용해주세요.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {[
              {
                key: "bookAdded",
                label: "책 추가 알림",
                description: "새 책이 추가될 때 알림",
              },
              {
                key: "goalAchieved",
                label: "목표 달성 알림",
                description: "독서 목표를 달성했을 때 알림",
              },
              {
                key: "readingStreak",
                label: "독서 스트릭 알림",
                description: "연속 독서 기록 달성 시 알림",
              },
              {
                key: "monthlyReport",
                label: "월간 독서 리포트",
                description: "매월 독서 통계 리포트",
              },
              {
                key: "goalReminder",
                label: "목표 리마인더",
                description: "독서 목표 달성 임박 시 알림",
              },
            ].map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {setting.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {setting.description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newSettings = {
                      ...notifications,
                      [setting.key]: !notifications[setting.key],
                    };
                    setNotifications(newSettings);
                    handleSettingsSave("notifications", newSettings);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${
                      notifications[setting.key]
                        ? "bg-emerald-600"
                        : "bg-gray-200"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${
                        notifications[setting.key]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 계정 초기화 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-medium text-red-600">계정 초기화</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            모든 독서 데이터(책장, 감상문, 설정 등)를 완전히 삭제합니다. <br />
            <span className="text-red-500 font-semibold">
              이 작업은 되돌릴 수 없습니다!
            </span>
          </p>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "정말로 모든 데이터를 삭제하고 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
                )
              ) {
                // 관련 localStorage 키 삭제
                [
                  "bookshelf_books",
                  "bookshelf_notes",
                  "bookshelf_intro",
                  "bookshelf_monthlyGoal",
                  "bookshelf_yearlyGoal",
                  "bookshelf_notifications",
                  "bookshelf_theme",
                  "bookshelf_last_backup",
                  "bookshelf_inapp_notifications",
                ].forEach((key) => localStorage.removeItem(key));
                saveInAppNotification({
                  type: "reset",
                  title: "계정 초기화 완료",
                  body: "계정 데이터가 모두 삭제되었습니다.",
                });
                window.location.href = "/";
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            계정 초기화
          </button>
        </div>
      </div>
    </main>
  );
}
