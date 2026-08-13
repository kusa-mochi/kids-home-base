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

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/update-schedule-item-with-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: scheduleItemId,
        dt: scheduleItemStartTimeUTC,
        task: newTask,
      }),
    })
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

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add-recurring-schedule-item`, {
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
    })
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

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/update-recurring-schedule-item-with-id`, {
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
    })
      .then((response) => response.json())
      .then((data) => setSuccess("Update Recurring", data))
      .catch((error) => setFailure("Update Recurring", error));
  }

  function handleClickToDeleteRecurringScheduleItem() {
    const recurringScheduleItemId = parseInt(
      getInputValue("deleteRecurringScheduleItemId"),
      10,
    );

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-recurring-schedule-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: recurringScheduleItemId,
      }),
    })
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
      {currentPage.pageId === "Home" && (
        <HomePage />
      )}
      {currentPage.pageId === "TodaySchedule" && (
        <TodaySchedule />
      )}
      {currentPage.pageId === "TomorrowSchedule" && (
        <TomorrowSchedule />
      )}
      {currentPage.pageId === "EditSchedule" && (
        <EditSchedule />
      )}
      {currentPage.pageId === "Settings" && (
        <Settings />
      )}
      {currentPage.pageId !== "Home" && (
        <SideMenu />
      )}
    </div>
  );
}

const pageBackground = "#f7f4ea";
const pageForeground = "#fffaf2";
const pageTextPrimary = "#2f2418";
const pageTextSecondary = "#6a5a44";
const pageButtonBg = "#0f766e";
const pageButtonHover = "#115e59";
const pageLine = "#e6dbc9";

const pageStyle = css({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  fontFamily: "var(--font-geist-sans)",
  background: `radial-gradient(circle at top right, #e6f8f6 0%, ${pageBackground} 52%)`,
  color: `${pageTextPrimary}`,
});

const mainStyle = css({
  display: "flex",
  width: "min(1100px, 100%)",
  margin: "40px 0",
  border: `1px solid ${pageLine}`,
  borderRadius: "18px",
  boxShadow: "0 24px 60px rgba(47, 36, 24, 0.08)",
  backgroundColor: pageForeground,
  padding: "32px",
  gap: "18px",
  boxSizing: "border-box",
  flexDirection: "column",
  "@media (max-width: 720px)": {
    margin: 0,
    minHeight: "100vh",
    border: 0,
    borderRadius: 0,
    boxShadow: "none",
    padding: "18px",
  },
});

const mainH1Style = css({
  margin: 0,
  fontSize: "32px",
  "@media (max-width: 720px)": {
    fontSize: "28px",
  },
});

const statusStyle = css({
  margin: 0,
  color: `${pageTextSecondary}`,
});

const sectionStyle = css({
  width: "100%",
  borderTop: `1px solid ${pageLine}`,
  paddingTop: "16px",
});

const sectionH2Style = css({
  margin: "0 0 12px",
  fontSize: "19px",
});

const rowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "10px",
});

const rowInputStyle = css({
  height: "38px",
  border: `1px solid ${pageLine}`,
  borderRadius: "10px",
  padding: "0 10px",
  fontSize: "14px",
});

const actionButtonStyle = css({
  height: "38px",
  padding: "0 14px",
  border: 0,
  borderRadius: "10px",
  background: `${pageButtonBg}`,
  "&:hover": {
    background: `${pageButtonHover}`,
  },
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
});

const listStyle = css({
  margin: 0,
  paddingLeft: "20px",
});

const listItemStyle = css({
  marginBottom: "6px",
  color: `${pageTextSecondary}`,
});
