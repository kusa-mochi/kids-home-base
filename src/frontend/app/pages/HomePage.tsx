"use client";
import { FC, useEffect, useState } from "react";
import { useCurrentPage } from "../contexts/PageContext";
import { useTodaySchedule } from "../contexts/TodayScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";

export const HomePage: FC = () => {
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { todaySchedule, setTodaySchedule } = useTodaySchedule();
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [nextTask, setNextTask] = useState<string | null>(null);
  const [nextTaskTimeHour, setNextTaskTimeHour] = useState<string | null>(null);
  const [nextTaskTimeMinute, setNextTaskTimeMinute] = useState<string | null>(null);

  useEffect(() => {
    // バックエンドの /get-today-schedule API から今日のスケジュールを取得する。
    fetch("http://localhost:21226/get-today-schedule")
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTodaySchedule({ items: data.schedules ?? [] });
        
        // 現在日時（東京時間）に基づいて、現在のタスクを決定する。
        // バックエンドから取得したスケジュールの dt は UTC 形式の標準時間であるため、比較の際には timezone.ts の関数を使ってローカル時間（日本時間）に変換する。
        // このフロントエンドでも、現在日時の取得には timezone.ts の関数を使って、UTC から日本時間に変換する。
        const now = new Date();
        const nowTokyo = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        for (const item of data.schedules) {
          const itemTokyo = new Date(item.dt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
          // 現在のタスクは、現在日時よりも前のタスクの中で最も新しいものとする。
          // 次のタスクは、現在日時よりも後のタスクの中で最も古いものとする。
          // ここでは、現在のタスクと次のタスクを決定するために、現在日時とスケジュールの dt を比較するため、
          // itemTokyo と nowTokyo をそれぞれ Date オブジェクトに変換して比較する。
          if (new Date(itemTokyo) <= new Date(nowTokyo)) {
            setCurrentTask(item.task);
          } else {
            setNextTask(item.task);
            const [hour, minute] = itemTokyo.split(" ")[1].split(":");
            setNextTaskTimeHour(hour);
            setNextTaskTimeMinute(minute);
            break; // 最初の次のタスクが見つかったらループを抜ける
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching today's schedule:", error);
      });
  }, []);

  function gotoTodaySchedule() {
    setCurrentPage({ pageId: "TodaySchedule" });
  }

  return (
    <div onClick={gotoTodaySchedule}>
      <div>
        <div>Current Task: {currentTask}</div>
        <div>Next Task: {nextTaskTimeHour}時{nextTaskTimeMinute}分から {nextTask}</div>
      </div>
    </div>
  );
};
