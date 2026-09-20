import React from "react";
import { GraduationCap, BarChart3, BookOpen, Target, MessageSquareCode, School, Sparkles, RefreshCw } from "lucide-react";
import { StudentProfile } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onResetData: () => void;
}

export function Navbar({ activeTab, setActiveTab, profile, setProfile, onResetData }: NavbarProps) {
  const tabs = [
    { id: "dashboard", label: "학습 대시보드", icon: BarChart3 },
    { id: "grades", label: "성적 관리", icon: GraduationCap },
    { id: "wrongnotes", label: "오답 노트", icon: BookOpen },
    { id: "goals", label: "목표 & AI 플랜", icon: Target },
    { id: "parent", label: "학부모 알림톡", icon: MessageSquareCode },
  ];

  return (
    <header className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-white/40 dark:border-slate-700/40 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">EduGrade Pro</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30">
                  {profile.level === "middle" ? "중등 과정" : "고등 과정"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">중·고등 성적 및 학습 관리 플랫폼</p>
            </div>
          </div>

          {/* Student Profile Quick Switcher */}
          <div className="hidden md:flex items-center space-x-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-sm">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{profile.name} ({profile.schoolName})</p>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{profile.gradeLevel}</span>
                <span>•</span>
                <button
                  onClick={() =>
                    setProfile((prev) => ({
                      ...prev,
                      level: prev.level === "middle" ? "high" : "middle",
                      gradeLevel: prev.level === "middle" ? "고등학교 1학년" : "중학교 2학년",
                    }))
                  }
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  [과정 변경]
                </button>
              </div>
            </div>
            <button
              onClick={onResetData}
              title="샘플 데이터 초기화"
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-white/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700/40 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
