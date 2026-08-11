"use client";

import { useState } from "react";
import styles from "./page.module.css";
import {
  tokyoLocalDateInputToUTCISO,
  tokyoLocalDateTimeInputToUTCISO,
  utcIsoToTokyoDisplay,
} from "./timezone";

type Schedule = {
  id: number;
  dt: string;
  task: string;
};

type ScheduleResponse = {
  success: boolean;
  message: string;
  schedules: Schedule[];
};

function getInputValue(id: string): string {
  const input = document.getElementById(id) as HTMLInputElement | null;
  return input?.value ?? "";
}

export default function Home() {
  const [statusText, setStatusText] = useState("Ready");
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [tomorrowSchedules, setTomorrowSchedules] = useState<Schedule[]>([]);

  function setSuccess(action: string, data: unknown) {
    setStatusText(`${action}: success`);
    console.log("Success:", data);
  }

  function setFailure(action: string, error: unknown) {
    setStatusText(`${action}: failed`);
    console.error("Error:", error);
  }

  function handleClickToGet() {
    fetch("http://localhost:21226/ping")
      .then((response) => response.json())
      .then((data) => setSuccess("Ping", data))
      .catch((error) => setFailure("Ping", error));
  }

  function handleClickToPost() {
    fetch("http://localhost:21226/echo", {
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

    fetch("http://localhost:21226/login", {
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

    fetch("http://localhost:21226/auth/jwt-test", {
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
    fetch("http://localhost:21226/get-today-schedule")
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTodaySchedules(data.schedules ?? []);
        setSuccess("Get Today", data);
      })
      .catch((error) => setFailure("Get Today", error));
  }

  function handleClickToGetTomorrowSchedule() {
    fetch("http://localhost:21226/get-tomorrow-schedule")
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTomorrowSchedules(data.schedules ?? []);
        setSuccess("Get Tomorrow", data);
      })
      .catch((error) => setFailure("Get Tomorrow", error));
  }

  function handleClickToAddScheduleItem() {
    const startTime = getInputValue("scheduleItemStartTime");
    const task = getInputValue("task");

    const dtUTC = tokyoLocalDateTimeInputToUTCISO(startTime);

    fetch("http://localhost:21226/add-schedule-item", {
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
    const scheduleItemStartTimeUTC =
      tokyoLocalDateTimeInputToUTCISO(scheduleItemStartTime);
    const newTask = getInputValue("updateScheduleItemTask");

    fetch("http://localhost:21226/update-schedule-item-with-id", {
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

    fetch("http://localhost:21226/delete-schedule-item", {
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
    const dayOfWeek = parseInt(getInputValue("recurringScheduleItemDayOfWeek"), 10);
    const startDate = getInputValue("recurringScheduleItemStartDate");
    const endDate = getInputValue("recurringScheduleItemEndDate");
    const task = getInputValue("recurringScheduleItemTask");

    const startTimeRFC3339 = tokyoLocalDateTimeInputToUTCISO(startTime);
    const startDateRFC3339 = tokyoLocalDateInputToUTCISO(startDate);
    const endDateRFC3339 = tokyoLocalDateInputToUTCISO(endDate);

    fetch("http://localhost:21226/add-recurring-schedule-item", {
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

    fetch("http://localhost:21226/update-recurring-schedule-item-with-id", {
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

    fetch("http://localhost:21226/delete-recurring-schedule-item", {
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

    fetch("http://localhost:21226/auth/change-password", {
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
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Kids Home Base</h1>
        <p className={styles.status}>Status: {statusText}</p>

        <section className={styles.section}>
          <h2>Basic</h2>
          <div className={styles.row}>
            <button className={styles.actionButton} onClick={handleClickToGet}>
              Ping
            </button>
            <button className={styles.actionButton} onClick={handleClickToPost}>
              Echo
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Auth</h2>
          <div className={styles.row}>
            <input id="user_id" type="text" placeholder="User ID" />
            <input id="password" type="password" placeholder="Password" />
          </div>
          <div className={styles.row}>
            <button className={styles.actionButton} onClick={handleClickToLogin}>
              Login
            </button>
            <button className={styles.actionButton} onClick={handleClickToJwtTest}>
              JWT Test
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Schedule</h2>
          <div className={styles.row}>
            <button
              className={styles.actionButton}
              onClick={handleClickToGetTodaySchedule}
            >
              Get Today
            </button>
            <button
              className={styles.actionButton}
              onClick={handleClickToGetTomorrowSchedule}
            >
              Get Tomorrow
            </button>
          </div>
          <div className={styles.row}>
            <input id="scheduleItemStartTime" type="datetime-local" />
            <input id="task" type="text" placeholder="Task" />
            <button
              className={styles.actionButton}
              onClick={handleClickToAddScheduleItem}
            >
              Add
            </button>
          </div>
          <div className={styles.row}>
            <input
              id="updateScheduleItemId"
              type="number"
              min="0"
              placeholder="ID"
            />
            <input id="updateScheduleItemStartTime" type="datetime-local" />
            <input id="updateScheduleItemTask" type="text" placeholder="Task" />
            <button
              className={styles.actionButton}
              onClick={handleClickToUpdateScheduleItem}
            >
              Update
            </button>
          </div>
          <div className={styles.row}>
            <input
              id="deleteScheduleItemId"
              type="number"
              min="0"
              placeholder="ID"
            />
            <button
              className={styles.actionButton}
              onClick={handleClickToDeleteScheduleItem}
            >
              Delete
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Recurring Schedule</h2>
          <div className={styles.row}>
            <input id="recurringScheduleItemStartTime" type="datetime-local" />
            <input
              id="recurringScheduleItemDayOfWeek"
              type="number"
              min="0"
              max="6"
              placeholder="Day 0-6"
            />
            <input id="recurringScheduleItemStartDate" type="date" />
            <input id="recurringScheduleItemEndDate" type="date" />
            <input id="recurringScheduleItemTask" type="text" placeholder="Task" />
            <button
              className={styles.actionButton}
              onClick={handleClickToAddRecurringScheduleItem}
            >
              Add
            </button>
          </div>
          <div className={styles.row}>
            <input
              id="updateRecurringScheduleItemId"
              type="number"
              min="0"
              placeholder="ID"
            />
            <input
              id="updateRecurringScheduleItemStartTime"
              type="datetime-local"
            />
            <input
              id="updateRecurringScheduleItemDayOfWeek"
              type="number"
              min="0"
              max="6"
              placeholder="Day 0-6"
            />
            <input id="updateRecurringScheduleItemStartDate" type="date" />
            <input id="updateRecurringScheduleItemEndDate" type="date" />
            <input id="updateRecurringScheduleItemTask" type="text" placeholder="Task" />
            <button
              className={styles.actionButton}
              onClick={handleClickToUpdateRecurringScheduleItemWithId}
            >
              Update
            </button>
          </div>
          <div className={styles.row}>
            <input
              id="deleteRecurringScheduleItemId"
              type="number"
              min="0"
              placeholder="ID"
            />
            <button
              className={styles.actionButton}
              onClick={handleClickToDeleteRecurringScheduleItem}
            >
              Delete
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Password</h2>
          <div className={styles.row}>
            <input
              id="changePasswordUserId"
              type="text"
              placeholder="User ID"
            />
            <input
              id="changePasswordCurrentPassword"
              type="password"
              placeholder="Current Password"
            />
            <input
              id="changePasswordNewPassword"
              type="password"
              placeholder="New Password"
            />
            <button
              className={styles.actionButton}
              onClick={handleClickToChangePassword}
            >
              Change Password
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Today (Asia/Tokyo)</h2>
          <ul className={styles.list}>
            {todaySchedules.map((s) => (
              <li key={`today-${s.id}`}>
                [{s.id}] {utcIsoToTokyoDisplay(s.dt)} - {s.task}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Tomorrow (Asia/Tokyo)</h2>
          <ul className={styles.list}>
            {tomorrowSchedules.map((s) => (
              <li key={`tomorrow-${s.id}`}>
                [{s.id}] {utcIsoToTokyoDisplay(s.dt)} - {s.task}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
