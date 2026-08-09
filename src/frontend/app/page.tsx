"use client";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  function handleClickToGet() {
    // :21226/ping APIにGETリクエストを送信する。
    fetch("http://localhost:21226/ping")
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function handleClickToPost() {
    // :21226/echo APIにPOSTリクエストを送信する。
    fetch("http://localhost:21226/echo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Hello from Next.js!" }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToLogin() {
    const userIdElement = document.getElementById(
      "user_id",
    ) as HTMLInputElement | null;
    const passwordElement = document.getElementById(
      "password",
    ) as HTMLInputElement | null;
    if (!userIdElement || !passwordElement) {
      console.error("User ID or Password input element not found.");
      return;
    }
    const userId = userIdElement.value;
    const password = passwordElement.value;

    // :21226/login APIにPOSTリクエストを送信する。
    fetch("http://localhost:21226/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        // レスポンスからトークンを取得してlocalStorageに保存する
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function handleClickToJwtTest() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    // :21226/auth/jwt-test APIにGETリクエストを送信する。
    fetch("http://localhost:21226/auth/jwt-test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToGetTodaySchedule() {
    // :21226/getTodaySchedule APIにGETリクエストを送信する。
    fetch("http://localhost:21226/get-today-schedule")
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToGetTomorrowSchedule() {
    // :21226/getTomorrowSchedule APIにGETリクエストを送信する。
    fetch("http://localhost:21226/get-tomorrow-schedule")
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToAddScheduleItem() {
    // :21226/addScheduleItem APIにPOSTリクエストを送信する。
    const currentDateTime = (
      document.getElementById("currentDateTime") as HTMLInputElement
    ).value;
    const task = (document.getElementById("task") as HTMLInputElement).value;

    // currentDateTime を RFC3339 形式に変換する。
    const currentDateTimeRFC3339 = new Date(currentDateTime).toISOString();

    fetch("http://localhost:21226/add-schedule-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dt: currentDateTimeRFC3339,
        task: task,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToUpdateScheduleItem() {
    // :21226/updateScheduleItemWithId APIにPOSTリクエストを送信する。
    const scheduleItemId = parseInt(
      (document.getElementById("updateScheduleItemId") as HTMLInputElement)
        .value,
      10,
    );
    // ユーザーが入力した日時を日本時間をとして解釈し、UTCに変換する。
    const scheduleItemStartTime = (
      document.getElementById("updateScheduleItemStartTime") as HTMLInputElement
    ).value;
    const scheduleItemStartTimeUTC = new Date(scheduleItemStartTime).toISOString();
    
    const newTask = (
      document.getElementById("updateScheduleItemTask") as HTMLInputElement
    ).value;

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
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToDeleteScheduleItem() {
    // :21226/deleteScheduleItemWithId APIにPOSTリクエストを送信する。
    const scheduleItemId = parseInt(
      (document.getElementById("deleteScheduleItemId") as HTMLInputElement)
        .value,
      10,
    );
    console.log("Deleting schedule item ID:", scheduleItemId);

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
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToAddRecurringScheduleItem() {
    // :21226/addRecurringScheduleItem APIにPOSTリクエストを送信する。
    const startTime = (
      document.getElementById(
        "recurringScheduleItemStartTime",
      ) as HTMLInputElement
    ).value;
    const dayOfWeek = (
      document.getElementById(
        "recurringScheduleItemDayOfWeek",
      ) as HTMLInputElement
    ).value;
    const startDate = (
      document.getElementById(
        "recurringScheduleItemStartDate",
      ) as HTMLInputElement
    ).value;
    const endDate = (
      document.getElementById(
        "recurringScheduleItemEndDate",
      ) as HTMLInputElement
    ).value;
    const task = (
      document.getElementById("recurringScheduleItemTask") as HTMLInputElement
    ).value;

    // startTime, startDate, endDate を RFC3339 形式に変換する。
    const startTimeRFC3339 = new Date(startTime).toISOString();
    const startDateRFC3339 = new Date(startDate).toISOString();
    const endDateRFC3339 = new Date(endDate).toISOString();

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
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToUpdateRecurringScheduleItemWithId() {
    // :21226/updateRecurringScheduleItemWithId APIにPOSTリクエストを送信する。
    const recurringScheduleItemIdString = (
      document.getElementById(
        "updateRecurringScheduleItemId",
      ) as HTMLInputElement
    ).value;
    const recurringScheduleItemId = parseInt(recurringScheduleItemIdString, 10);
    const startTime = (
      document.getElementById(
        "updateRecurringScheduleItemStartTime",
      ) as HTMLInputElement
    ).value;
    const dayOfWeek = (
      document.getElementById(
        "updateRecurringScheduleItemDayOfWeek",
      ) as HTMLInputElement
    ).value;
    const startDate = (
      document.getElementById(
        "updateRecurringScheduleItemStartDate",
      ) as HTMLInputElement
    ).value;
    const endDate = (
      document.getElementById(
        "updateRecurringScheduleItemEndDate",
      ) as HTMLInputElement
    ).value;
    const task = (
      document.getElementById(
        "updateRecurringScheduleItemTask",
      ) as HTMLInputElement
    ).value;

    // startTime, startDate, endDate を RFC3339 形式に変換する。
    const startTimeRFC3339 = new Date(startTime).toISOString();
    const startDateRFC3339 = new Date(startDate).toISOString();
    const endDateRFC3339 = new Date(endDate).toISOString();

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
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToDeleteRecurringScheduleItem() {
    // :21226/deleteRecurringScheduleItemWithId APIにPOSTリクエストを送信する。
    const recurringScheduleItemId = (
      document.getElementById(
        "deleteRecurringScheduleItemId",
      ) as HTMLInputElement
    ).value;

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
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleClickToChangePassword() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    // :21226/changePassword APIにPOSTリクエストを送信する。
    const userId = (
      document.getElementById("changePasswordUserId") as HTMLInputElement
    ).value;
    const currentPassword = (
      document.getElementById(
        "changePasswordCurrentPassword",
      ) as HTMLInputElement
    ).value;
    const newPassword = (
      document.getElementById("changePasswordNewPassword") as HTMLInputElement
    ).value;

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
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <div onClick={() => handleClickToGet()}>
            <Image
              className={styles.logo}
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToPost()}
            >
              POST test
            </button>
          </div>
        </div>

        <div>
          <div>
            <input id="user_id" type="text" placeholder="User ID" />
            <input id="password" type="password" placeholder="Password" />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToLogin()}
            >
              LOGIN test
            </button>
          </div>
        </div>

        <div>
          <button
            className={styles.logoButton}
            onClick={() => handleClickToJwtTest()}
          >
            JWT Test
          </button>
        </div>

        <div>
          <button
            className={styles.logoButton}
            onClick={() => handleClickToGetTodaySchedule()}
          >
            get today schedule
          </button>
        </div>

        <div>
          <button
            className={styles.logoButton}
            onClick={() => handleClickToGetTomorrowSchedule()}
          >
            get tomorrow schedule
          </button>
        </div>

        <div>
          <div>
            <input id="scheduleItemStartTime" type="datetime-local" />
            <input id="task" type="text" placeholder="Task" />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToAddScheduleItem()}
            >
              Add Schedule Item
            </button>
          </div>
        </div>

        <div>
          <div>
            <input
              id="updateScheduleItemId"
              type="number"
              min="0"
              placeholder="Schedule Item ID to Update"
            />
            <input
              id="updateScheduleItemStartTime"
              type="datetime-local"
            />
            <input            
              id="updateScheduleItemTask"
              type="text"
              placeholder="New Task for Update"
            />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToUpdateScheduleItem()}
            >
              Update Schedule Item
            </button>
          </div>
        </div>

        <div>
          <div>
            <input
              id="deleteScheduleItemId"
              type="number"
              min="0"
              placeholder="Schedule Item ID to Delete"
            />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToDeleteScheduleItem()}
            >
              Delete Schedule Item
            </button>
          </div>
        </div>

        <div>
          <div>
            <input id="recurringScheduleItemStartTime" type="datetime-local" />
            <input
              id="recurringScheduleItemDayOfWeek"
              type="text"
              placeholder="Day of Week (0-6)"
            />
            <input id="recurringScheduleItemStartDate" type="date" />
            <input id="recurringScheduleItemEndDate" type="date" />
            <input
              id="recurringScheduleItemTask"
              type="text"
              placeholder="Task for Recurring Item"
            />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToAddRecurringScheduleItem()}
            >
              Add Recurring Schedule Item
            </button>
          </div>
        </div>

        <div>
          <div>
            <input
              id="updateRecurringScheduleItemId"
              type="number"
              min="0"
              placeholder="Recurring Schedule Item ID to Update"
            />
            <input
              id="updateRecurringScheduleItemStartTime"
              type="datetime-local"
            />
            <input
              id="updateRecurringScheduleItemDayOfWeek"
              type="text"
              placeholder="Day of Week (0-6)"
            />
            <input id="updateRecurringScheduleItemStartDate" type="date" />
            <input id="updateRecurringScheduleItemEndDate" type="date" />
            <input
              id="updateRecurringScheduleItemTask"
              type="text"
              placeholder="Task for Recurring Item"
            />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToUpdateRecurringScheduleItemWithId()}
            >
              Update Recurring Schedule Item with its ID
            </button>
          </div>
        </div>

        <div>
          <div>
            <input
              id="deleteRecurringScheduleItemId"
              type="number"
              min="0"
              placeholder="Recurring Schedule Item ID to Delete"
            />
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToDeleteRecurringScheduleItem()}
            >
              Delete Recurring Schedule Item
            </button>
          </div>
        </div>

        <div>
          <div>
            <input
              id="changePasswordUserId"
              type="text"
              placeholder="User ID for Password Change"
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
          </div>
          <div>
            <button
              className={styles.logoButton}
              onClick={() => handleClickToChangePassword()}
            >
              Change Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
