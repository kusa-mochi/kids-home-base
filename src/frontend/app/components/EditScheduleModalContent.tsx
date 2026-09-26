"use client";

import { css } from "@emotion/react";
import { FC, MouseEvent, useState } from "react";
import { toDatetimeLocalValue } from "../timezone";
import { TrashIcon } from "../assets/iconComponents/TrashIcon";
import { DatetimeInput } from "./DatetimeInput";

type EditScheduleModalContentProps = {
  initialDatetime: Date;
  initialTask: string;
  handleSave: (
    e: MouseEvent<HTMLButtonElement>,
    datetime: Date,
    task: string,
  ) => void;
  handleCancel: (e: MouseEvent<HTMLButtonElement>) => void;
  handleTrash: (e: MouseEvent<HTMLButtonElement>) => void;
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
  const [datetime, setDatetime] = useState(
    toDatetimeLocalValue(initialDatetime),
  );

  function handleStartSave(e: MouseEvent<HTMLButtonElement>) {
    // 入力値の検証
    const taskInput = document.getElementById(
      "edit-schedule-task",
    ) as HTMLInputElement;
    if (Number.isNaN(new Date(datetime).getTime()) || !taskInput.value) {
      alert("にちじとタスクをりょうほう入力してください。");
      return;
    }

    handleSave(e, new Date(datetime), taskInput.value);
    e.stopPropagation(); // Prevent the click event from propagating to the backdrop
  }

  return (
    <div css={componentStyle}>
      <div css={modalHeaderStyle}>
        <DatetimeInput
          value={datetime}
          onChange={(e: string) => {
            setDatetime(e);
          }}
        />
        {canTrash && (
          <button
            type="button"
            css={trashIconStyle}
            onClick={handleTrash}
            aria-label="予定を削除する"
          >
            <TrashIcon />
          </button>
        )}
      </div>
      <div css={taskInputContainerStyle}>
        <input
          type="text"
          id="edit-schedule-task"
          name="edit-schedule-task"
          defaultValue={initialTask}
          css={taskInputStyle}
        />
      </div>
      <div>
        <button
          type="button"
          css={saveButtonStyle}
          onClick={handleStartSave}
          aria-label="予定を保存する"
        >
          ほぞん
        </button>
        <button
          type="button"
          css={cancelButtonStyle}
          onClick={handleCancel}
          aria-label="予定の編集をキャンセルする"
        >
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
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
`;

const trashIconStyle = css`
  width: 48px;
  height: 48px;
  padding: 0;
  background-color: black;
  border: none;
`;

const taskInputContainerStyle = css`
  margin: 0 0 24px 0;
`;

const taskInputStyle = css`
  color-scheme: dark;

  font-size: 48px;
  width: 800px;
  padding: 8px 16px;
`;

const saveButtonStyle = css`
  font-size: 48px;
  margin-right: 16px;
  padding: 8px 16px;
`;

const cancelButtonStyle = css`
  font-size: 48px;
  margin: 0;
  padding: 8px 16px;
`;
