"use client";
import { FC, useEffect, useState } from "react";
import { useTodaySchedule } from "../contexts/TodayScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { now } from "../timezone";

export const TodaySchedule: FC = () => {
  const { todaySchedule, setTodaySchedule } = useTodaySchedule();

  const nowDateTime = now();
  const [todayMonth, setTodayMonth] = useState<number>(nowDateTime.getMonth() + 1);
  const [todayDay, setTodayDay] = useState<number>(nowDateTime.getDate());
  
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
      <div css={dateStyle}>{todayMonth}月{todayDay}日</div>
      <table css={tableStyle}>
        <tbody>
          {todaySchedule.items.map((item, index) => {
            const itemDate = new Date(item.dt);
            const itemTime = itemDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            return (
              <tr key={item.id} css={tableRowStyle}>
                <td css={itemTimeStyle} valign="top">{itemTime}</td>
                <td valign="top">{item.task}</td>
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

const dateStyle = css`
  font-size: 56px;
  margin: 16px;
`;

const tableStyle = css`
  width: 100%;
  margin-left: 16px;
  font-size: 48px;
`;

const tableRowStyle = css`
  height: 48px;
`;

const itemTimeStyle = css`
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
`;
