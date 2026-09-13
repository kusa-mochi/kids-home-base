"use client";
import { FC, Fragment, useEffect, useState } from "react";
import { useTomorrowSchedule } from "../contexts/TomorrowScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { now } from "../timezone";

export const TomorrowSchedule: FC = () => {
  const { tomorrowSchedule, setTomorrowSchedule } = useTomorrowSchedule();

  const nowDateTime = now();
  const tomorrowDate = new Date(nowDateTime);
  tomorrowDate.setDate(nowDateTime.getDate() + 1);
  const [tomorrowMonth, setTomorrowMonth] = useState<number>(
    tomorrowDate.getMonth() + 1,
  );
  const [tomorrowDay, setTomorrowDay] = useState<number>(
    tomorrowDate.getDate(),
  );

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
      <div css={dateStyle}>
        {tomorrowMonth}月{tomorrowDay}日
      </div>
      {(() => {
        return tomorrowSchedule.items.map((item, index) => {
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
