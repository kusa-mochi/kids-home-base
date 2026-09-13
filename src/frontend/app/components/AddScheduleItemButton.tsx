"use client";

import { css } from "@emotion/react";

export const AddScheduleItemButton = ({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) => {
  return (
    <button css={buttonStyle} onClick={onClick}>+</button>
  );
};

const buttonStyle = css`
  font-size: 56px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background-color: #0070f3;
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 16px;
  right: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;

  &:hover {
    background-color: #005bb5;
  }
`;
