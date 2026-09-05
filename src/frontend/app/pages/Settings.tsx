"use client";
import { FC } from "react";
import { useLoginData } from "../contexts/LoginContext";

export const Settings: FC = () => {
  const { loginData, setLoginData } = useLoginData();

  function handleLogin() {
    const userIdInput = document.getElementById("userId") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const userId = userIdInput.value;
    const password = passwordInput.value;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "user_id": userId,
        "password": password
      })
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
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}>
        <input id="userId" type="text" placeholder="Your User ID" />
        <input id="password" type="password" placeholder="Your Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
