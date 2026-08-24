"use client";

import { FC, Fragment, useEffect, useState, MouseEvent } from "react";
import { useUpcomingSchedule } from "../contexts/UpcomingScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { css } from "@emotion/react";
import { EditScheduleModalContent } from "../components/EditScheduleModalContent";

export const EditSchedule: FC = () => {
  const { upcomingSchedule, setUpcomingSchedule } = useUpcomingSchedule();
  
  const [modalVisible, setModalVisible] = useState(false);

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

  function handleEditSchedule(e: MouseEvent<HTMLDivElement>) {
    setModalVisible(true);
  }

  function handleCloseModal(e: MouseEvent<HTMLDivElement>) {
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
            <Fragment key={item.id ?? index}>
              {showDateHeader && <div css={dateHeaderStyle}>{itemDateKey}</div>}
              <div css={tableRowStyle} onClick={handleEditSchedule}>
                <span>{itemTime}</span>
                <span>{item.task}</span>
              </div>
            </Fragment>
          );
        });
      })()}
      {modalVisible && (
        <div css={modalBackdropStyle} onClick={handleCloseModal}>
          <div css={modalContentStyle}>
            <EditScheduleModalContent />
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
  height: 48px;
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
  width: 1240px;
  height: 700px;
`;
