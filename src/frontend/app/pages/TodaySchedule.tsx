"use client";
import { FC, useEffect } from "react";
import { useTodaySchedule } from "../contexts/TodayScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";

export const TodaySchedule: FC = () => {
  const { todaySchedule, setTodaySchedule } = useTodaySchedule();
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-today-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTodaySchedule({ items: data.schedules ?? [] });
      })
      .catch((error) => {
        console.error("Error fetching today's schedule:", error);
      });
  }, []);

  return (
    <div>
      <table>
        <tbody>
          {todaySchedule.items.map((item, index) => {
            const itemDate = new Date(item.dt);
            const itemTime = itemDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            return (
              <tr key={index}>
                <td>{itemTime}</td>
                <td>{item.task}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
