"use client";
import { css } from "@emotion/react";
import Link from "next/link";

const containerStyle = css`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  text-align: center;
`;

const titleStyle = css`
  font-size: 4rem;
  margin: 0;
`;

const messageStyle = css`
  font-size: 1.25rem;
  margin: 0;
`;

const linkStyle = css`
  margin-top: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  background: #171717;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.1rem;
`;

export default function NotFound() {
  return (
    <div css={containerStyle}>
      <p css={titleStyle}>404</p>
      <p css={messageStyle}>{"ページが見つかりませんでした。m9(^Д^)"}</p>
      <Link href="/" css={linkStyle}>
        ホームにもどる
      </Link>
    </div>
  );
}
