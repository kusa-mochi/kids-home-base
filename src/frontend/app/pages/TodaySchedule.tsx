"use client";
import { FC, Fragment, useEffect, useState } from "react";
import { useTodaySchedule } from "../contexts/TodayScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { now } from "../timezone";

export const TodaySchedule: FC = () => {
  const { todaySchedule, setTodaySchedule } = useTodaySchedule();

  const nowDateTime = now();
  const [todayMonth, setTodayMonth] = useState<number>(
    nowDateTime.getMonth() + 1,
  );
  const [todayDay, setTodayDay] = useState<number>(nowDateTime.getDate());

  useEffect(() => {
    fetch(`/get-today-schedule`)
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
      <div css={dateHeaderStyle}>{`${todayMonth}月${todayDay}日`}</div>
      {(() => {
        return todaySchedule.items.map((item, index) => {
          const itemDate = new Date(item.dt);
          const itemDateKey = itemDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const itemTime = itemDate.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Fragment key={item.id}>
              <div css={tableRowStyle}>
                <span css={itemTimeStyle}>{itemTime}</span>
                <span css={itemTaskStyle}>{item.task}</span>
              </div>
            </Fragment>
          );
        });
      })()}
    </div>
  );
};

const componentStyle = css`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

const dateHeaderStyle = css`
  font-size: 56px;
  margin: 16px;
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
  font-size: 48px;
  height: 56px;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
`;

const itemTimeStyle = css`
  height: 72px;
  margin-right: 16px;
  font-family:
    SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
`;

const itemTaskStyle = css`
  height: 72px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
`;
