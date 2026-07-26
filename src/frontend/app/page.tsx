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
        <button className={styles.logoButton} onClick={() => handleClickToPost()}>
          POST test
        </button>
      </main>
    </div>
  );
}
