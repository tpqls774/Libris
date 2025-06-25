"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Book,
  Layers,
  Star,
} from "lucide-react";
import { sendGoalAchievedNotification } from "../../utils/notifications";

export default function ReadingStatsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // 실제 데이터 상태
  const [books, setBooks] = useState([]);
  const [goalBooks, setGoalBooks] = useState(50);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedBooks = localStorage.getItem("bookshelf_books");
      setBooks(storedBooks ? JSON.parse(storedBooks) : []);
      setGoalBooks(Number(localStorage.getItem("bookshelf_yearlyGoal")) || 50);
    }
  }, []);

  // 올해 완독 책만
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const booksThisYear = books.filter(b => b.date && b.date.startsWith(`${y}`) && b.status === "완독");
  const totalBooks = booksThisYear.length;
  const progressPercentage = Math.round((totalBooks / goalBooks) * 100);

  // 목표 달성 알림 체크
  useEffect(() => {
    if (totalBooks > 0 && totalBooks === goalBooks) {
      // 목표 달성 시 알림 발송
      sendGoalAchievedNotification("연간 독서", totalBooks, goalBooks);
    }
  }, [totalBooks, goalBooks]);

  // 월별 독서량(완독)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");
    const monthBooks = booksThisYear.filter(b => b.date && b.date.startsWith(`${y}-${month}`));
    const pages = monthBooks.reduce((sum, b) => sum + (b.pageCount || 0), 0);
    return {
      month: `${i + 1}월`,
      books: monthBooks.length,
      pages,
    };
  });
  const totalPages = monthlyData.reduce((sum, month) => sum + month.pages, 0);
  const avgPagesPerBook = Math.round(totalPages / (totalBooks || 1));

  // 총 독서 시간 계산
  const totalReadingTime = booksThisYear.reduce((sum, b) => {
    const hours = b.readingTime?.totalHours || 0;
    const minutes = b.readingTime?.totalMinutes || 0;
    return sum + (hours * 60 + minutes);
  }, 0);
  const totalHours = Math.floor(totalReadingTime / 60);
  const totalMinutes = totalReadingTime % 60;

  // 장르별 분포
  const genreMap = {};
  booksThisYear.forEach(b => {
    const genre = b.genre || "기타";
    genreMap[genre] = (genreMap[genre] || 0) + 1;
  });
  const genreData = Object.entries(genreMap).map(([name, value], i) => ({
    name,
    value,
    color: `hsl(${160 + i * 20}, 84%, ${30 + i * 10}%)`,
  }));

  // 최근 읽은 책(최신순 4권)
  const recentBooks = booksThisYear
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 4)
    .map(b => ({
      title: b.title,
      author: b.author,
      rating: b.rating || 0,
      date: b.date,
    }));

  // 주간 독서 시간(실제 입력된 시간 기준)
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weeklyReadingTime = weekDays.map((day, idx) => {
    const dayBooks = booksThisYear.filter(b => {
      if (!b.readingTime || !b.readingTime.endDate) return false;
      const d = new Date(b.readingTime.endDate);
      return d.getDay() === idx;
    });
    
    const totalMinutes = dayBooks.reduce((sum, b) => {
      const hours = b.readingTime?.totalHours || 0;
      const minutes = b.readingTime?.totalMinutes || 0;
      return sum + (hours * 60 + minutes);
    }, 0);
    
    return {
      day,
      time: totalMinutes
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border text-[#22223b]">
          <p className="font-semibold">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }}>
              {item.dataKey === "books"
                ? "읽은 책"
                : item.dataKey === "pages"
                ? "읽은 페이지"
                : "독서 시간"}
              : {item.value}
              {item.dataKey === "time"
                ? "분"
                : item.dataKey === "pages"
                ? "페이지"
                : "권"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        fill={i < rating ? "#facc15" : "none"}
      />
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-1.5 inline-flex gap-1 mb-6">
          {[
            { key: "overview", label: "개요", icon: Book },
            { key: "charts", label: "차트", icon: Layers },
            { key: "books", label: "최근 도서", icon: Award },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 h-9 rounded-md text-sm font-medium transition-colors
                ${
                  activeTab === tab.key
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* 주요 통계 카드들 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">올해 읽은 책</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {totalBooks}권
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">목표 달성률</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {progressPercentage}%
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">총 읽은 페이지</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {totalPages.toLocaleString()}p
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">평균 페이지/책</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {avgPagesPerBook}p
                </div>
              </div>
            </div>

            {/* 추가 통계 카드들 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">총 독서 시간</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {totalHours}시간 {totalMinutes}분
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">평균 독서시간/책</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {totalBooks > 0 ? Math.round(totalReadingTime / totalBooks) : 0}분
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">페이지당 독서시간</span>
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {totalPages > 0 ? (totalReadingTime / totalPages).toFixed(1) : 0}분
                </div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">
                    연간 독서 목표
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {totalBooks}/{goalBooks}권
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0권</span>
                <span>{goalBooks}권</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "charts" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 월별 독서량 차트 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">
                    월별 독서량
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="books" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 장르별 분포 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">
                    장르별 분포
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={genreData.map((item) => ({
                        ...item,
                        color: "#059669", // emerald-600
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${160 + index * 20}, 84%, ${
                            30 + index * 10
                          }%)`}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 페이지 수 트렌드 및 주간 독서시간 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">
                    월별 페이지 수
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="pages"
                      stroke="#059669"
                      fill="#dcfce7"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">
                    주간 독서시간
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={weeklyReadingTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="time"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === "books" && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">
                최근 읽은 책
              </h3>
            </div>
            <div className="space-y-3">
              {recentBooks.map((book, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-emerald-200"
                >
                  <div className="w-12 h-16 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900 truncate">
                      {book.title}
                    </h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500 mt-1">{book.date}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-0.5">
                      {renderStars(book.rating)}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {book.rating}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
