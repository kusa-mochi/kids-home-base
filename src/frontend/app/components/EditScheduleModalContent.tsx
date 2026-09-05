"use client";

import { css } from "@emotion/react";
import { FC, MouseEvent } from "react";
import { toDatetimeLocalValue } from "../timezone";
import { TrashIcon } from "../assets/iconComponents/TrashIcon";

type EditScheduleModalContentProps = {
  initialDatetime: Date;
  initialTask: string;
  handleSave: (e: MouseEvent<HTMLButtonElement>, datetime: Date, task: string) => void;
  handleCancel: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const EditScheduleModalContent: FC<EditScheduleModalContentProps> = ({ initialDatetime, initialTask, handleSave, handleCancel }) => {

  function handleStartSave(e: MouseEvent<HTMLButtonElement>) {
    // 入力値の検証
    const datetimeInput = document.getElementById("edit-schedule-datetime") as HTMLInputElement;
    const taskInput = document.getElementById("edit-schedule-task") as HTMLInputElement;
    if (!datetimeInput.value || !taskInput.value) {
      alert("にちじとタスクをりょうほう入力してください。");
      return;
    }

    handleSave(e, new Date(datetimeInput.value), taskInput.value);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  return (
    <div css={componentStyle}>
      <div css={trashIconStyle}>
        <TrashIcon />
      </div>
      <div>
        <input
          type="datetime-local"
          id="edit-schedule-datetime"
          name="edit-schedule-datetime"
          defaultValue={toDatetimeLocalValue(initialDatetime)}
          css={datetimeStyle}
        />
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
        <button onClick={handleStartSave}>ほぞん</button>
        <button onClick={handleCancel}>キャンセル</button>
      </div>
    </div>
  );
};

const componentStyle = css`
  position: relative;
  border: 1px solid white;
  background-color: black;
  padding: 16px;
  width: fit-content;
  height: fit-content;
`;

const trashIconStyle = css`
  width: 24px;
  height: 24px;
  cursor: pointer;

  position: absolute;
  top: 16px;
  right: 16px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const datetimeStyle = css`
  color-scheme: dark;
`;

const taskInputStyle = css`
  color-scheme: dark;
`;
