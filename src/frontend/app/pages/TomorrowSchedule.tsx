"use client";
import { FC, useEffect } from "react";
import { useTomorrowSchedule } from "../contexts/TomorrowScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";

export const TomorrowSchedule: FC = () => {
  const { tomorrowSchedule, setTomorrowSchedule } = useTomorrowSchedule();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-tomorrow-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTomorrowSchedule({ items: data.schedules ?? [] });
      })
      .catch((error) => {
        console.error("Error fetching tomorrow's schedule:", error);
      });
  }, []);

  return (
    <div>
      <table>
        <tbody>
          {tomorrowSchedule.items.map((item, index) => {
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
