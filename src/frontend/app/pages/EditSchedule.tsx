"use client";

import { FC, Fragment, useEffect, useState, MouseEvent } from "react";
import { useUpcomingSchedule } from "../contexts/UpcomingScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { EditScheduleModalContent } from "../components/EditScheduleModalContent";
import {
  now,
  tokyoLocalDateToUTCISOString,
  utcIsoToTokyoDate,
} from "../timezone";
import { AddScheduleItemButton } from "../components/AddScheduleItemButton";

export const EditSchedule: FC = () => {
  const { upcomingSchedule, setUpcomingSchedule } = useUpcomingSchedule();

  const [modalVisible, setModalVisible] = useState(false);
  const [trashConfirmVisible, setTrashConfirmVisible] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null,
  );
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<
    number | null
  >(null);
  const [editingScheduleDatetime, setEditingScheduleDatetime] =
    useState<Date | null>(null);

  useEffect(() => {
    refreshUpcomingSchedule();
  }, []);

  function refreshUpcomingSchedule() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-upcoming-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setUpcomingSchedule({ items: data.schedules ?? [] });
      })
      .catch((error) => {
        console.error("Error fetching upcoming schedule:", error);
      });
  }

  function handleEditSchedule(
    e: MouseEvent<HTMLDivElement>,
    scheduleId: number | null,
    scheduleIndex: number,
  ) {
    setEditingScheduleId(scheduleId);
    setEditingScheduleIndex(scheduleIndex);
    setEditingScheduleDatetime(
      utcIsoToTokyoDate(upcomingSchedule.items[scheduleIndex].dt),
    );
    setModalVisible(true);
    setTrashConfirmVisible(false);
  }

  function handleCloseModal(e: MouseEvent<HTMLDivElement>) {
    setModalVisible(false);
    setTrashConfirmVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleSave(
    e: MouseEvent<HTMLButtonElement>,
    datetime: Date,
    task: string,
  ) {
    const utcDatetime = tokyoLocalDateToUTCISOString(datetime);

    // editingScheduleId が null の場合は新規追加、それ以外は更新
    if (editingScheduleId === null) {
      // /add-schedule-item API に datetime と task を送信する。
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add-schedule-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dt: utcDatetime,
          task,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Add response:", data);
          refreshUpcomingSchedule();
        })
        .catch((error) => {
          console.error("Error adding schedule item:", error);
        });
    } else {
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
          refreshUpcomingSchedule();
        })
        .catch((error) => {
          console.error("Error updating schedule item:", error);
        });
    }

    setModalVisible(false);
    setTrashConfirmVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleCancel(e: MouseEvent<HTMLButtonElement>) {
    setModalVisible(false);
    setTrashConfirmVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleTrash(e: MouseEvent<HTMLButtonElement>) {
    setModalVisible(false);
    setTrashConfirmVisible(true);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleConfirmTrash(e: MouseEvent<HTMLButtonElement>) {
    // Implement the actual trash functionality here
    if (editingScheduleId !== null) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-schedule-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editingScheduleId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Delete response:", data);
          refreshUpcomingSchedule();
        })
        .catch((error) => {
          console.error("Error deleting schedule item:", error);
        });
    }
    
    setTrashConfirmVisible(false);
    setModalVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleCancelTrash(e: MouseEvent<HTMLButtonElement>) {
    setTrashConfirmVisible(false);
    setModalVisible(false);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  function handleAddScheduleItem(e: MouseEvent<HTMLButtonElement>) {
    setEditingScheduleId(null);
    setEditingScheduleIndex(null);
    setEditingScheduleDatetime(now());
    setModalVisible(true);
    setTrashConfirmVisible(false);
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
                <span css={itemTimeStyle}>{itemTime}</span>
                <span css={itemTaskStyle}>{item.task}</span>
              </div>
            </Fragment>
          );
        });
      })()}
      <AddScheduleItemButton onClick={handleAddScheduleItem} />
      {modalVisible && (
        <div css={modalBackdropStyle} onClick={handleCloseModal}>
          <div css={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <EditScheduleModalContent
              initialDatetime={editingScheduleDatetime ?? new Date(2000, 0, 1)}
              initialTask={
                editingScheduleIndex !== null
                  ? upcomingSchedule.items[editingScheduleIndex].task
                  : ""
              }
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleTrash={handleTrash}
              canTrash={editingScheduleIndex !== null}
            />
          </div>
        </div>
      )}
      {trashConfirmVisible && (
        <div css={modalBackdropStyle} onClick={() => setTrashConfirmVisible(false)}>
          <div css={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <p>{upcomingSchedule.items[editingScheduleIndex ?? 0].task}を削除してもよろしいですか？</p>
            <button onClick={handleConfirmTrash}>はい</button>
            <button onClick={handleCancelTrash}>いいえ</button>
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
  margin: 0 16px 0 8px;
  font-size: 56px;
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
