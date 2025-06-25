"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Target,
  Calendar as CalendarIcon,
  Star,
  Pen,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import { sendGoalAchievedNotification } from "../../utils/notifications";

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

function ReadingCalendar({ books }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const readingDates = books
    .filter(
      (b) =>
        b.date &&
        b.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
    )
    .map((b) => {
      const [y, m, d] = b.date.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
    });

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isRead = readingDates.some(
        (rd) =>
          rd.getFullYear() === date.getFullYear() &&
          rd.getMonth() === date.getMonth() &&
          rd.getDate() === date.getDate()
      );
      return isRead ? "reading-day" : null;
    }
    return null;
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-[#6366f1]" />
        <span className="text-lg font-semibold text-[#22223b]">
          {year}년 {month + 1}월 독서 달력
        </span>
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 w-full flex justify-center">
        <Calendar
          locale="ko-KR"
          calendarType="gregory"
          tileClassName={tileClassName}
          prev2Label={null}
          next2Label={null}
          formatDay={(_, date) => date.getDate()}
        />
      </div>
      <style jsx global>{`
        .reading-day {
          background: #6366f1 !important;
          color: #fff !important;
          border-radius: 50%;
          font-weight: bold;
        }
        .react-calendar {
          border: none !important;
          font-family: inherit;
          width: 100%;
          max-width: 350px;
          background: none;
        }
        .react-calendar__tile {
          border-radius: 0.75rem !important;
          transition: background 0.15s, color 0.15s;
          font-weight: 500;
          font-size: 1rem;
        }
        .react-calendar__tile--active {
          background: #a5b4fc !important;
          color: #22223b !important;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: #eef2ff !important;
          color: #6366f1 !important;
        }
        .react-calendar__navigation button {
          color: #6366f1;
          min-width: 36px;
          background: none;
          font-size: 1.1em;
          margin: 0 2px;
          border-radius: 0.5rem;
          transition: background 0.15s;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background: #eef2ff;
        }
        .react-calendar__month-view__days__day {
          padding: 8px 0 !important;
        }
        .react-calendar__tile--now {
          background: #f59e42 !important;
          color: #fff !important;
          font-weight: bold;
        }
      `}</style>
      <div className="mt-3 text-sm text-[#6366f1] text-center">
        ● 색칠된 날짜에 책을 한 권 이상 읽었습니다.
      </div>
    </div>
  );
}

export default function Profile() {
  const [monthlyGoal, setMonthlyGoal] = useState(15);
  const [yearlyGoal, setYearlyGoal] = useState(50);
  const [showToast, setShowToast] = useState(false);
  const [books, setBooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [nickname, setNickname] = useState("tpqls774");
  const joinDate = "2024-01-01";
  const [intro, setIntro] = useState("독서를 사랑하는 개발자입니다.");
  const [avatar, setAvatar] = useState("");

  function handleGoalSubmit(e) {
    e.preventDefault();
    localStorage.setItem("bookshelf_monthlyGoal", monthlyGoal);
    localStorage.setItem("bookshelf_yearlyGoal", yearlyGoal);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  function handleIntroSave() {
    localStorage.setItem("bookshelf_intro", intro);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMonthlyGoal(
        Number(localStorage.getItem("bookshelf_monthlyGoal")) || 15
      );
      setYearlyGoal(Number(localStorage.getItem("bookshelf_yearlyGoal")) || 50);

      const storedBooks = localStorage.getItem("bookshelf_books");
      if (storedBooks) setBooks(JSON.parse(storedBooks));
      const storedNotes = localStorage.getItem("bookshelf_notes");
      if (storedNotes) setNotes(JSON.parse(storedNotes));

      setIntro(
        localStorage.getItem("bookshelf_intro") ||
          "독서를 사랑하는 개발자입니다."
      );

      let activities = [];
      if (storedNotes) {
        const sortedNotes = JSON.parse(storedNotes).sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        activities = [
          ...sortedNotes
            .slice(0, 3)
            .map((n) => ({ date: n.date, title: n.title, type: "note" })),
        ];
      }
      if (storedBooks) {
        const recentRead = JSON.parse(storedBooks)
          .filter((b) => b.status === "완독" && b.date)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 3)
          .map((b) => ({ date: b.date, title: b.title, type: "book" }));
        activities = [...activities, ...recentRead];
      }
      activities.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setRecentActivity(activities.slice(0, 5));

      if (storedBooks) {
        const arr = JSON.parse(storedBooks).filter((b) => b.rating);
        if (arr.length > 0) {
          setAvgRating(
            (
              arr.reduce((a, b) => a + (Number(b.rating) || 0), 0) / arr.length
            ).toFixed(1)
          );
        } else setAvgRating(0);
      }

      // 목표 달성 체크
      const y = new Date().getFullYear();
      const m = String(new Date().getMonth() + 1).padStart(2, "0");
      const books = JSON.parse(localStorage.getItem("bookshelf_books") || "[]");
      const booksThisYear = books.filter(
        (b) => b.date && b.date.startsWith(`${y}`)
      ).length;
      const booksThisMonth = books.filter(
        (b) => b.date && b.date.startsWith(`${y}-${m}`)
      ).length;
      const monthlyGoal =
        Number(localStorage.getItem("bookshelf_monthlyGoal")) || 15;
      const yearlyGoal =
        Number(localStorage.getItem("bookshelf_yearlyGoal")) || 50;
      if (booksThisMonth >= monthlyGoal) {
        sendGoalAchievedNotification("월간 독서", booksThisMonth, monthlyGoal);
      }
      if (booksThisYear >= yearlyGoal) {
        sendGoalAchievedNotification("연간 독서", booksThisYear, yearlyGoal);
      }

      // 닉네임 불러오기
      setNickname(localStorage.getItem("bookshelf_nickname") || "tpqls774");
      // storage 이벤트로 닉네임 실시간 반영
      const handleStorage = (e) => {
        if (e.key === "bookshelf_nickname") {
          setNickname(e.newValue || "tpqls774");
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const booksThisYear = books.filter(
    (b) => b.date && b.date.startsWith(`${y}`)
  ).length;
  const booksThisMonth = books.filter(
    (b) => b.date && b.date.startsWith(`${y}-${m}`)
  ).length;
  const totalBooks = books.length;
  const completedBooks = books.filter((b) => b.status === "완독").length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm z-50 animate-fade-in">
            저장되었습니다
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-medium text-emerald-600 overflow-hidden">
              {avatar ? (
                <Image src={avatar} alt="avatar" width={80} height={80} />
              ) : (
                <span>T</span>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                <h1 className="text-xl font-medium text-gray-900">
                  {nickname}
                </h1>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <User className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                가입일: {joinDate}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleIntroSave();
                }}
                className="flex flex-col md:flex-row gap-2"
              >
                <input
                  className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-gray-50"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  maxLength={50}
                  placeholder="한줄 소개를 입력해주세요"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Pen className="w-4 h-4" /> 저장
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "전체 도서", value: totalBooks },
            { label: "올해", value: booksThisYear },
            { label: "이번 달", value: booksThisMonth },
            { label: "완독", value: completedBooks },
            { label: "평균 별점", value: avgRating, icon: Star },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="text-xl font-medium text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                {stat.icon && <stat.icon className="w-4 h-4 text-gray-400" />}{" "}
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-400" />
              <h2 className="text-base font-medium text-gray-900">목표 설정</h2>
            </div>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              {[
                {
                  label: "월간 목표",
                  value: monthlyGoal,
                  setValue: setMonthlyGoal,
                },
                {
                  label: "연간 목표",
                  value: yearlyGoal,
                  setValue: setYearlyGoal,
                },
              ].map((goal, i) => (
                <div key={i} className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 w-20">
                    {goal.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      className="w-20 h-9 px-2 text-center border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                      value={goal.value}
                      onChange={(e) => goal.setValue(e.target.value)}
                    />
                    <span className="text-sm text-gray-500">권</span>
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="w-full h-10 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                저장
              </button>
            </form>
          </div>

          <style jsx global>{`
            .reading-day {
              background: #059669 !important;
              color: white !important;
            }
            .react-calendar__tile--active {
              background: #d1fae5 !important;
              color: #059669 !important;
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background: #ecfdf5 !important;
              color: #059669 !important;
            }
            .react-calendar__navigation button {
              color: #059669;
            }
            .react-calendar__tile--now {
              background: #059669 !important;
              color: white !important;
            }
          `}</style>

          <ReadingCalendar books={books} />

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-base font-medium text-gray-900">최근 활동</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                    <div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{a.title}</span>{" "}
                        {a.type === "note" ? "독서 노트 작성" : "완독"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {a.date}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">
                  아직 활동 내역이 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
