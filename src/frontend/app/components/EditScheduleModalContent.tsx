"use client";

import { css } from "@emotion/react";
import { FC } from "react";
import { TrashIcon } from "../assets/iconComponents/TrashIcon";

export const EditScheduleModalContent: FC = () => {
  return (
    <div css={componentStyle}>
      <div css={trashIconStyle}>
        <TrashIcon />
      </div>
    </div>
  );
};

const componentStyle = css`
  position: relative;
  width: 1240px;
  height: 700px;
`;

const trashIconStyle = css`
  width: 24px;
  height: 24px;
  cursor: pointer;

  position: absolute;
  top: 16px;
  right: 16px;
`;
