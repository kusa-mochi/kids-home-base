"use client";
import { FC, useEffect } from "react";
import { useUpcomingSchedule } from "../contexts/UpcomingScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
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
    <div css={componentStyle}>
      {upcomingSchedule.items.map((item, index) => {
        const itemDate = new Date(item.dt);
        const itemTime = itemDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
        return (
          <div key={index} css={tableRowStyle}>
            <span>{itemTime}</span>
            <span>{item.task}</span>
          </div>
        );
      })}
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
