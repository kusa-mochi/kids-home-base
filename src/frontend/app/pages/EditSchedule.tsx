"use client";

import { FC, Fragment, useEffect, useState, MouseEvent } from "react";
import { useUpcomingSchedule } from "../contexts/UpcomingScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { EditScheduleModalContent } from "../components/EditScheduleModalContent";
import { tokyoLocalDateToUTCISOString, utcIsoToTokyoDate } from "../timezone";

export const EditSchedule: FC = () => {
  const { upcomingSchedule, setUpcomingSchedule } = useUpcomingSchedule();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null,
  );
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(
    null,
  );
  const [editingScheduleDatetime, setEditingScheduleDatetime] = useState<Date | null>(
    null,
  );

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

  function handleEditSchedule(
    e: MouseEvent<HTMLDivElement>,
    scheduleId: number | null,
    scheduleIndex: number,
  ) {
    setEditingScheduleId(scheduleId);
    setEditingScheduleIndex(scheduleIndex);
    setEditingScheduleDatetime(utcIsoToTokyoDate(upcomingSchedule.items[scheduleIndex].dt));
    setModalVisible(true);
  }

  function handleCloseModal(e: MouseEvent<HTMLDivElement>) {
    setModalVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleSave(
    e: MouseEvent<HTMLButtonElement>,
    datetime: Date,
    task: string,
  ) {
    const utcDatetime = tokyoLocalDateToUTCISOString(datetime);

    // /update-schedule-item-with-id API に datetime と task を送信する。
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/update-schedule-item-with-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingScheduleId,
          dt: utcDatetime,
          task,
        }),
      },
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Update response:", data);
      })
      .catch((error) => {
        console.error("Error updating schedule item:", error);
      });

    setModalVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleCancel(e: MouseEvent<HTMLButtonElement>) {
    setModalVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  return (
    <div css={componentStyle}>
      {(() => {
        let lastDateKey = "";
        return upcomingSchedule.items.map((item, index) => {
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
          const showDateHeader = itemDateKey !== lastDateKey;
          if (showDateHeader) {
            lastDateKey = itemDateKey;
          }

          return (
            <Fragment key={item.id}>
              {showDateHeader && <div css={dateHeaderStyle}>{itemDateKey}</div>}
              <div
                css={tableRowStyle}
                onClick={(e) => handleEditSchedule(e, item.id ?? null, index)}
              >
                <span>{itemTime}</span>
                <span>{item.task}</span>
              </div>
            </Fragment>
          );
        });
      })()}
      {modalVisible && (
        <div css={modalBackdropStyle} onClick={handleCloseModal}>
          <div css={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <EditScheduleModalContent
              initialDatetime={editingScheduleDatetime ?? new Date(2000, 0, 1)}
              initialTask={upcomingSchedule.items[editingScheduleIndex ?? 0].task}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
          </div>
        </div>
      )}
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

const tableStyle = css`
  width: 100%;
  margin-left: 16px;
  font-size: 56px;
`;

const tableRowStyle = css`
  font-size: 48px;
  height: 56px;
`;

const modalBackdropStyle = css`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const modalContentStyle = css`
  position: relative;
  width: fit-content;
  height: fit-content;
`;
