"use client";
import { FC, useEffect } from "react";
import { useTodaySchedule } from "../contexts/TodayScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";

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
    <div css={componentStyle}>
      <table css={tableStyle}>
        <tbody>
          {todaySchedule.items.map((item, index) => {
            const itemDate = new Date(item.dt);
            const itemTime = itemDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            return (
              <tr key={item.id} css={tableRowStyle}>
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

const componentStyle = css`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const tableStyle = css`
  width: 100%;
  margin-left: 16px;
  font-size: 56px;
`;

const tableRowStyle = css`
  height: 48px;
`;
