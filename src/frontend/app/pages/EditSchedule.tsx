"use client";
import { FC, useEffect } from "react";
import { useUpcomingSchedule } from "../contexts/UpcomingScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";

export const EditSchedule: FC = () => {
  const { upcomingSchedule, setUpcomingSchedule } = useUpcomingSchedule();
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-upcoming-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setUpcomingSchedule({ items: data.schedules ?? [] });
      })
      .catch((error) => {
        console.error("Error fetching upcoming schedule:", error);
      });
  }, []);

  return (
    <div>
      {upcomingSchedule.items.map((item, index) => {
        const itemDate = new Date(item.dt);
        const itemTime = itemDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
        return (
          <div key={index}>
            <span>{itemTime}</span>
            <span>{item.task}</span>
          </div>
        );
      })}
    </div>
  );
};
