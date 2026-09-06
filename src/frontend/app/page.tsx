"use client";
import { useState } from "react";
import {
  tokyoLocalDateInputToUTCISO,
  tokyoLocalDateTimeInputToUTCISO,
  utcIsoToTokyoDisplay,
} from "./timezone";
import { css } from "@emotion/react";
import { HomePage } from "./pages/HomePage";
import { TodaySchedule } from "./pages/TodaySchedule";
import { TomorrowSchedule } from "./pages/TomorrowSchedule";
import { EditSchedule } from "./pages/EditSchedule";
import { Settings } from "./pages/Settings";
import { useCurrentPage } from "./contexts/PageContext";
import { SideMenu } from "./pages/SideMenu";
import { useTodaySchedule } from "./contexts/TodayScheduleContext";
import { useTomorrowSchedule } from "./contexts/TomorrowScheduleContext";
import { ScheduleItem, ScheduleResponse } from "./dataStructures/Schedule";

function getInputValue(id: string): string {
  const input = document.getElementById(id) as HTMLInputElement | null;
  return input?.value ?? "";
}

export default function Home() {
  const [statusText, setStatusText] = useState("Ready");
  const { todaySchedule, setTodaySchedule } = useTodaySchedule();
  const { tomorrowSchedule, setTomorrowSchedule } = useTomorrowSchedule();
  const { currentPage, setCurrentPage } = useCurrentPage();

  function setSuccess(action: string, data: unknown) {
    setStatusText(`${action}: success`);
    console.log("Success:", data);
  }

  function setFailure(action: string, error: unknown) {
    setStatusText(`${action}: failed`);
    console.error("Error:", error);
  }

  function handleClickToGet() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ping`)
      .then((response) => response.json())
      .then((data) => setSuccess("Ping", data))
      .catch((error) => setFailure("Ping", error));
  }

  function handleClickToPost() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/echo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Hello from Next.js!" }),
    })
      .then((response) => response.json())
      .then((data) => setSuccess("Echo", data))
      .catch((error) => setFailure("Echo", error));
  }

  function handleClickToLogin() {
    const userId = getInputValue("user_id");
    const password = getInputValue("password");

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSuccess("Login", data);
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
      })
      .catch((error) => setFailure("Login", error));
  }

  function handleClickToJwtTest() {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatusText("JWT Test: no token");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/jwt-test`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setSuccess("JWT Test", data))
      .catch((error) => setFailure("JWT Test", error));
  }

  function handleClickToGetTodaySchedule() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-today-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTodaySchedule({ items: data.schedules ?? [] });
        setSuccess("Get Today", data);
      })
      .catch((error) => setFailure("Get Today", error));
  }

  function handleClickToGetTomorrowSchedule() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-tomorrow-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTomorrowSchedule({ items: data.schedules ?? [] });
        setSuccess("Get Tomorrow", data);
      })
      .catch((error) => setFailure("Get Tomorrow", error));
  }

  function handleClickToAddScheduleItem() {
    const startTime = getInputValue("scheduleItemStartTime");
    const task = getInputValue("task");
    let dtUTC: string;

    try {
      dtUTC = tokyoLocalDateTimeInputToUTCISO(startTime);
    } catch (error) {
      setFailure("Add Schedule (invalid startTime)", error);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add-schedule-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dt: dtUTC,
        task,
      }),
    })
      .then((response) => response.json())
      .then((data) => setSuccess("Add Schedule", data))
      .catch((error) => setFailure("Add Schedule", error));
  }

  function handleClickToUpdateScheduleItem() {
    const scheduleItemId = parseInt(getInputValue("updateScheduleItemId"), 10);
    const scheduleItemStartTime = getInputValue("updateScheduleItemStartTime");
    const scheduleItemStartTimeUTC = tokyoLocalDateTimeInputToUTCISO(
      scheduleItemStartTime,
    );
    const newTask = getInputValue("updateScheduleItemTask");

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/update-schedule-item-with-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: scheduleItemId,
          dt: scheduleItemStartTimeUTC,
          task: newTask,
        }),
      },
    )
      .then((response) => response.json())
      .then((data) => setSuccess("Update Schedule", data))
      .catch((error) => setFailure("Update Schedule", error));
  }

  function handleClickToDeleteScheduleItem() {
    const scheduleItemId = parseInt(getInputValue("deleteScheduleItemId"), 10);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-schedule-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: scheduleItemId,
      }),
    })
      .then((response) => response.json())
      .then((data) => setSuccess("Delete Schedule", data))
      .catch((error) => setFailure("Delete Schedule", error));
  }

  function handleClickToAddRecurringScheduleItem() {
    const startTime = getInputValue("recurringScheduleItemStartTime");
    const dayOfWeek = parseInt(
      getInputValue("recurringScheduleItemDayOfWeek"),
      10,
    );
    const startDate = getInputValue("recurringScheduleItemStartDate");
    const endDate = getInputValue("recurringScheduleItemEndDate");
    const task = getInputValue("recurringScheduleItemTask");

    const startTimeRFC3339 = tokyoLocalDateTimeInputToUTCISO(startTime);
    const startDateRFC3339 = tokyoLocalDateInputToUTCISO(startDate);
    const endDateRFC3339 = tokyoLocalDateInputToUTCISO(endDate);

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/add-recurring-schedule-item`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: startTimeRFC3339,
          day_of_week: dayOfWeek,
          start_date: startDateRFC3339,
          end_date: endDateRFC3339,
          task,
        }),
      },
    )
      .then((response) => response.json())
      .then((data) => setSuccess("Add Recurring", data))
      .catch((error) => setFailure("Add Recurring", error));
  }

  function handleClickToUpdateRecurringScheduleItemWithId() {
    const recurringScheduleItemId = parseInt(
      getInputValue("updateRecurringScheduleItemId"),
      10,
    );
    const startTime = getInputValue("updateRecurringScheduleItemStartTime");
    const dayOfWeek = parseInt(
      getInputValue("updateRecurringScheduleItemDayOfWeek"),
      10,
    );
    const startDate = getInputValue("updateRecurringScheduleItemStartDate");
    const endDate = getInputValue("updateRecurringScheduleItemEndDate");
    const task = getInputValue("updateRecurringScheduleItemTask");

    const startTimeRFC3339 = tokyoLocalDateTimeInputToUTCISO(startTime);
    const startDateRFC3339 = tokyoLocalDateInputToUTCISO(startDate);
    const endDateRFC3339 = tokyoLocalDateInputToUTCISO(endDate);

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/update-recurring-schedule-item-with-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: recurringScheduleItemId,
          start_time: startTimeRFC3339,
          day_of_week: dayOfWeek,
          start_date: startDateRFC3339,
          end_date: endDateRFC3339,
          task,
        }),
      },
    )
      .then((response) => response.json())
      .then((data) => setSuccess("Update Recurring", data))
      .catch((error) => setFailure("Update Recurring", error));
  }

  function handleClickToDeleteRecurringScheduleItem() {
    const recurringScheduleItemId = parseInt(
      getInputValue("deleteRecurringScheduleItemId"),
      10,
    );

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-recurring-schedule-item`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: recurringScheduleItemId,
        }),
      },
    )
      .then((response) => response.json())
      .then((data) => setSuccess("Delete Recurring", data))
      .catch((error) => setFailure("Delete Recurring", error));
  }

  function handleClickToChangePassword() {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatusText("Change Password: no token");
      return;
    }

    const userId = getInputValue("changePasswordUserId");
    const currentPassword = getInputValue("changePasswordCurrentPassword");
    const newPassword = getInputValue("changePasswordNewPassword");

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => setSuccess("Change Password", data))
      .catch((error) => setFailure("Change Password", error));
  }

  return (
    <div css={pageStyle}>
      {currentPage.pageId !== "Home" && (
        <div css={detailPageStyle}>
          <div css={leftPaneStyle}>
            <SideMenu />
          </div>
          <div css={rightPaneStyle}>
            {currentPage.pageId === "TodaySchedule" && <TodaySchedule />}
            {currentPage.pageId === "TomorrowSchedule" && <TomorrowSchedule />}
            {currentPage.pageId === "EditSchedule" && <EditSchedule />}
            {currentPage.pageId === "Settings" && <Settings />}
          </div>
        </div>
      )}
      {currentPage.pageId === "Home" && <HomePage />}
    </div>
  );
}

const pageBackground = "black";
const pageForeground = "#e0e0e0";
const pageTextPrimary = "#e0e0e0";
const pageTextSecondary = "#a0a0a0";
const pageButtonBg = "#0f766e";
const pageButtonHover = "#115e59";
const pageLine = "#e0e0e0";

const pageStyle = css`
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: var(--font-geist-sans);
  background-color: ${pageBackground};
  color: ${pageTextPrimary};
`;

const detailPageStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  // 左ペイン、右ペインの順で子要素を並べる。
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: nowrap;
`;

const leftPaneStyle = css`
  width: 384px;
  height: 100%;
  border-right: 1px solid ${pageLine};
`;

const rightPaneStyle = css`
  width: calc(100% - 384px);
  height: 100%;
`;
