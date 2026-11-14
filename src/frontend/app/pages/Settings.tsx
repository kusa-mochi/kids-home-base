"use client";
import { FC, useState } from "react";
import { useLoginData } from "../contexts/LoginContext";
import { apiPath } from "../api";
import { css } from "@emotion/react";
import { RecurringScheduleItem } from "../dataStructures/Schedule";

// 現在の設定ページを表す型
type SettingPage = "login" | "recurringSchedules";

export const Settings: FC = () => {
  const { loginData, setLoginData } = useLoginData();
  const [currentSettingPage, setCurrentSettingPage] = useState<SettingPage>("login");
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringScheduleItem[]>([]);

  function handleLogin() {
    const userIdInput = document.getElementById("userId") as HTMLInputElement;
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    const userId = userIdInput.value;
    const password = passwordInput.value;
    fetch(apiPath("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        password: password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Login failed");
        }
        return response.json();
      })
      .then((data) => {
        // アクセストークンを取得する。
        const accessToken = data.access_token;
        setLoginData({ userId, accessToken });
        console.log("login successful and got access token");

        // 定期的なスケジュールの一覧ページに遷移する。
        setCurrentSettingPage("recurringSchedules");

        // 定期的なスケジュールをすべて取得する。
        fetch(apiPath("/auth/get-recurring-schedule"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to get recurring schedule");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Recurring schedule data:", data.recurring_schedules);
          setRecurringSchedules(data.recurring_schedules);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div>
      {currentSettingPage === "login" && (
        <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            id="userId"
            type="text"
            placeholder="Your User ID"
            css={loginInputStyle}
          />
          <input
            id="password"
            type="password"
            placeholder="Your Password"
            css={loginInputStyle}
          />
          <button type="submit" css={loginButtonStyle}>
            Login
          </button>
        </form>
      </div>
      )} 
      {currentSettingPage === "recurringSchedules" && (
        <div>
          {recurringSchedules.map((item, index) => (
            <div key={index}>
              <p>{item.task}</p>
              <p>{new Date(item.schedule_time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const loginInputStyle = css`
  margin: 8px 0;
  padding: 8px 16px;
  font-size: 32px;
`;

const loginButtonStyle = css`
  margin: 8px 0;
  padding: 8px 16px;
  font-size: 32px;
  cursor: pointer;
`;
