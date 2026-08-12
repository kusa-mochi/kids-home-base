import { FC } from "react";
import { css } from "@emotion/react";

export const SideMenu: FC = () => {
  return <div css={sideMenuStyle}>Side Menu</div>;
};

const sideMenuStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 514px;
  height: 100%;
  background-color: black;
  color: white;
  padding: 20px;
  border-right: 1px solid #cccccc;
`;
