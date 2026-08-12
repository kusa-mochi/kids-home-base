import { FC } from "react";
import { css } from "@emotion/react";
import { useCurrentPage } from "../contexts/PageContext";

export const SideMenu: FC = () => {
  const { currentPage, setCurrentPage } = useCurrentPage();

  return (
    <div css={sideMenuStyle}>
      <div
        onClick={() => setCurrentPage({ pageId: "Home" })}
        css={closeButtonStyle}
      >
        ×
      </div>
      <div
        onClick={() => setCurrentPage({ pageId: "TodaySchedule" })}
        css={menuItemStyle(currentPage.pageId === "TodaySchedule")}
      >
        今日のよてい
      </div>
      <div
        onClick={() => setCurrentPage({ pageId: "TomorrowSchedule" })}
        css={menuItemStyle(currentPage.pageId === "TomorrowSchedule")}
      >
        明日のよてい
      </div>
      <div
        onClick={() => setCurrentPage({ pageId: "EditSchedule" })}
        css={menuItemStyle(currentPage.pageId === "EditSchedule")}
      >
        けいかく
      </div>
      <div
        onClick={() => setCurrentPage({ pageId: "Settings" })}
        css={menuItemStyle(currentPage.pageId === "Settings")}
      >
        設定<span css={keyIconStyle}>🗝</span>
      </div>
    </div>
  );
};

const sideMenuStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 514px;
  height: 100%;
  background-color: black;
  color: white;
  border-right: 1px solid #cccccc;
`;

const closeButtonStyle = css`
  font-size: 72px;
`;

const menuItemStyle = (isCurrentPage: boolean) => css`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  font-size: 56px;
  width: 100%;
  height: 168px;
  background-color: ${isCurrentPage
    ? "rgba(255, 255, 255, 0.1)"
    : "transparent"};
`;

const keyIconStyle = css`
  color: yellow;
`;
