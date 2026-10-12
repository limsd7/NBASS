/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { GradeManager } from "./components/GradeManager";
import { WrongNotes } from "./components/WrongNotes";
import { GoalsAndAIPlan } from "./components/GoalsAndAIPlan";
import { ParentKakaoTalk } from "./components/ParentKakaoTalk";
import { SubjectGrade, WrongNote, SubjectGoal, NotificationSetting, StudentProfile, CareType } from "./types";
import { initialGrades, initialWrongNotes, initialGoals, initialNotification, initialProfile } from "./data/initialData";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Persistent State with localStorage
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("edugrade_profile");
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [grades, setGrades] = useState<SubjectGrade[]>(() => {
    const saved = localStorage.getItem("edugrade_grades");
    return saved ? JSON.parse(saved) : initialGrades;
  });

  const [wrongNotes, setWrongNotes] = useState<WrongNote[]>(() => {
    const saved = localStorage.getItem("edugrade_wrongnotes");
    return saved ? JSON.parse(saved) : initialWrongNotes;
  });

  const [goals, setGoals] = useState<SubjectGoal[]>(() => {
    const saved = localStorage.getItem("edugrade_goals");
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [notification, setNotification] = useState<NotificationSetting>(() => {
    const saved = localStorage.getItem("edugrade_notification");
    return saved ? JSON.parse(saved) : initialNotification;
  });

  useEffect(() => {
    localStorage.setItem("edugrade_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("edugrade_grades", JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem("edugrade_wrongnotes", JSON.stringify(wrongNotes));
  }, [wrongNotes]);

  useEffect(() => {
    localStorage.setItem("edugrade_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("edugrade_notification", JSON.stringify(notification));
  }, [notification]);

  const handleResetData = () => {
    if (confirm("모든 데이터를 샘플 초기 상태로 되돌리시겠습니까?")) {
      setProfile(initialProfile);
      setGrades(initialGrades);
      setWrongNotes(initialWrongNotes);
      setGoals(initialGoals);
      setNotification(initialNotification);
      localStorage.clear();
      alert("데이터가 초기화되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        setProfile={setProfile}
        onResetData={handleResetData}
      />

      <main className="flex-1 pb-16">
        {activeTab === "dashboard" && (
          <Dashboard
            grades={grades}
            wrongNotes={wrongNotes}
            goals={goals}
            profile={profile}
            setProfile={setProfile}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "grades" && (
          <GradeManager grades={grades} setGrades={setGrades} profile={profile} />
        )}
        {activeTab === "wrongnotes" && (
          <WrongNotes
            wrongNotes={wrongNotes}
            setWrongNotes={setWrongNotes}
            careType={profile.careType ? (CareType[profile.careType as keyof typeof CareType] || CareType.HEALTHY) : CareType.HEALTHY}
          />
        )}
        {activeTab === "goals" && (
          <GoalsAndAIPlan
            goals={goals}
            setGoals={setGoals}
            grades={grades}
            wrongNotes={wrongNotes}
            notification={notification}
            setNotification={setNotification}
            profile={profile}
            setProfile={setProfile}
          />
        )}
        {activeTab === "parent" && (
          <ParentKakaoTalk
            grades={grades}
            wrongNotes={wrongNotes}
            goals={goals}
            notification={notification}
            profile={profile}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 EduGrade Pro - 중·고등 학생 성적 및 학습 관리 플랫폼. All rights reserved.</p>
      </footer>
    </div>
  );
}
