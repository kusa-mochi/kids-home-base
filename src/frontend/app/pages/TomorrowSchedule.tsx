"use client";
import { FC, Fragment, useEffect, useState } from "react";
import { useTomorrowSchedule } from "../contexts/TomorrowScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { now } from "../timezone";
import { apiPath } from "../api";

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
    fetch(apiPath("/get-tomorrow-schedule"))
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
        let lastPeriod: "午前" | "午後" | null = null;
        return tomorrowSchedule.items.map((item, index) => {
          const itemDate = new Date(item.dt);
          const itemDateKey = itemDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const itemTime = itemDate.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            hour12: true,
            minute: "2-digit",
          }).replace(/^午前|^午後/, "");
          return (
            <Fragment key={item.id}>
              {/* 見出し "午前" または "午後" を表示する場合はここに追加。最初の午前の予定の直前に "午前" を表示する。最初の午後の予定の直前に "午後" を表示する。 */}
              {(() => {
                const period = itemDate.getHours() < 12 ? "午前" : "午後";
                if (period !== lastPeriod) {
                  lastPeriod = period;
                  return <div css={ampmStyle}>{period}</div>;
                }
                return null;
              })()}
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

const ampmStyle = css`
  font-size: 48px;
  margin: 16px 0;
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
