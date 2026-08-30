"use client";
import { FC, useEffect, useState } from "react";
import { useTomorrowSchedule } from "../contexts/TomorrowScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { now } from "../timezone";

export const TomorrowSchedule: FC = () => {
  const { tomorrowSchedule, setTomorrowSchedule } = useTomorrowSchedule();

  const nowDateTime = now();
  const tomorrowDate = new Date(nowDateTime);
  tomorrowDate.setDate(nowDateTime.getDate() + 1);
  const [tomorrowMonth, setTomorrowMonth] = useState<number>(tomorrowDate.getMonth() + 1);
  const [tomorrowDay, setTomorrowDay] = useState<number>(tomorrowDate.getDate());

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
    <div css={componentStyle}>
      <div css={dateStyle}>{tomorrowMonth}月{tomorrowDay}日</div>
      <table css={tableStyle}>
        <tbody>
          {tomorrowSchedule.items.map((item, index) => {
            const itemDate = new Date(item.dt);
            const itemTime = itemDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            return (
              <tr key={index} css={tableRowStyle}>
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
