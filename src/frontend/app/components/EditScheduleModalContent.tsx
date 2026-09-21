"use client";

import { css } from "@emotion/react";
import { FC, MouseEvent } from "react";
import { toDatetimeLocalValue } from "../timezone";
import { TrashIcon } from "../assets/iconComponents/TrashIcon";

type EditScheduleModalContentProps = {
  initialDatetime: Date;
  initialTask: string;
  handleSave: (
    e: MouseEvent<HTMLButtonElement>,
    datetime: Date,
    task: string,
  ) => void;
  handleCancel: (e: MouseEvent<HTMLButtonElement>) => void;
  handleTrash: (e: MouseEvent<HTMLDivElement>) => void;
  canTrash: boolean;
};

export const EditScheduleModalContent: FC<EditScheduleModalContentProps> = ({
  initialDatetime,
  initialTask,
  handleSave,
  handleCancel,
  handleTrash,
  canTrash,
}) => {
  function handleStartSave(e: MouseEvent<HTMLButtonElement>) {
    // 入力値の検証
    const datetimeInput = document.getElementById(
      "edit-schedule-datetime",
    ) as HTMLInputElement;
    const taskInput = document.getElementById(
      "edit-schedule-task",
    ) as HTMLInputElement;
    if (!datetimeInput.value || !taskInput.value) {
      alert("にちじとタスクをりょうほう入力してください。");
      return;
    }

    handleSave(e, new Date(datetimeInput.value), taskInput.value);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  return (
    <div css={componentStyle}>
      <div css={modalHeaderStyle}>
        <input
          type="datetime-local"
          id="edit-schedule-datetime"
          name="edit-schedule-datetime"
          defaultValue={toDatetimeLocalValue(initialDatetime)}
          css={datetimeStyle}
        />
        {canTrash && (
          <span css={trashIconStyle} onClick={handleTrash}>
            <TrashIcon />
          </span>
        )}
      </div>
      <div>
        <input
          type="text"
          id="edit-schedule-task"
          name="edit-schedule-task"
          defaultValue={initialTask}
          css={taskInputStyle}
        />
      </div>
      <div>
        <button css={saveButtonStyle} onClick={handleStartSave}>
          ほぞん
        </button>
        <button css={cancelButtonStyle} onClick={handleCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
};

const componentStyle = css`
  position: relative;
  border: 1px solid white;
  background-color: black;
  padding: 24px;
  width: fit-content;
  height: fit-content;
`;

const modalHeaderStyle = css`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const trashIconStyle = css`
  width: 48px;
  height: 48px;
  padding: 0;
  margin: -16px 0 0 0;
  cursor: pointer;

  // display: flex;
  // flex-direction: row;
  // justify-content: center;
  // align-items: center;
`;

const datetimeStyle = css`
  color-scheme: dark;

  font-size: 48px;
  margin-bottom: 16px;
`;

const taskInputStyle = css`
  color-scheme: dark;

  font-size: 48px;
  margin-bottom: 16px;
  width: 720px;
`;

const saveButtonStyle = css`
  font-size: 48px;
  margin-right: 16px;
`;

const cancelButtonStyle = css`
  font-size: 48px;
  margin: 0;
`;
