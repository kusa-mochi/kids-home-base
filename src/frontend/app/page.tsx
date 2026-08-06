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
    const userId = (document.getElementById("user_id") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
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
        <button
          className={styles.logoButton}
          onClick={() => handleClickToPost()}
        >
          POST test
        </button>
        <input id="user_id" type="text" placeholder="User ID" />
        <input id="password" type="password" placeholder="Password" />
        <button
          className={styles.logoButton}
          onClick={() => handleClickToLogin()}
        >
          LOGIN test
        </button>
        <button
          className={styles.logoButton}
          onClick={() => handleClickToJwtTest()}
        >
          JWT Test
        </button>
      </main>
    </div>
  );
}
