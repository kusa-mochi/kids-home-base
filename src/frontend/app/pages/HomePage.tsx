"use client";
import { FC, useEffect, useState } from "react";
import { useCurrentPage } from "../contexts/PageContext";
import { useTodaySchedule } from "../contexts/TodayScheduleContext";
import { ScheduleResponse } from "../dataStructures/Schedule";
import { now, utcIsoToTokyoDisplay } from "../timezone";
import { css } from "@emotion/react";
import { WeatherIconMap } from "../dataStructures/weatherIconMap";

export const HomePage: FC = () => {
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { todaySchedule, setTodaySchedule } = useTodaySchedule();
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [nextTask, setNextTask] = useState<string | null>(null);
  const [nextTaskTimeHour, setNextTaskTimeHour] = useState<string | null>(null);
  const [nextTaskTimeMinute, setNextTaskTimeMinute] = useState<string | null>(
    null,
  );
  const [maxTemperature, setMaxTemperature] = useState<number | null>(null);
  const [minTemperature, setMinTemperature] = useState<number | null>(null);
  const [weatherIconFilename, setWeatherIconFilename] = useState<string | null>(
    null,
  );

  // 気象庁の天気予報サイトから天気情報を取得し表示する。
  function fetchWeather() {
    const url = process.env.NEXT_PUBLIC_WEATHER_FORECAST_URL;
    if (!url) {
      console.error("Weather forecast URL is not defined.");
      return;
    }

    // URLからJSONデータを取得し、その中の天気予報情報を抽出する。
    // URL例：https://www.jma.go.jp/bosai/forecast/data/forecast/260000.json
    fetch(url, { method: "GET" })
      .then((response) => response.json())
      .then((jsonData) => {
        console.log("jsonData:", jsonData);
        const timeDefined = jsonData[0]?.timeSeries[0]?.timeDefines?.[0];
        const weatherIconCode =
          jsonData[0]?.timeSeries[0]?.areas[0]?.weatherCodes?.[0];
        const maxTemperatureValue =
          jsonData[0]?.timeSeries[2]?.areas[0]?.temps?.[1];
        if (!timeDefined || !weatherIconCode || !maxTemperatureValue) {
          console.error("Failed to extract weather information from JSON data.");
          return;
        }

        // 日中かどうか。
        // timeDefined の時刻が 06:00 から 18:00 の間であれば日中と判断する。
        const timeObj = new Date(timeDefined);
        const hour = timeObj.getHours();
        const isDaytime = hour >= 6 && hour < 18;

        // 天気アイコンコードに基づいて、天気アイコンのファイル名を決定する。
        // weatherIconCode が WeatherIconMap のキーに存在する場合は、日中か夜間かに応じて適切なアイコンコードを選択する。
        if (WeatherIconMap[weatherIconCode]) {
          const iconCodes = WeatherIconMap[weatherIconCode];
          const selectedIconCode = isDaytime ? iconCodes[0] : iconCodes[1];
          setWeatherIconFilename(selectedIconCode);
        } else {
          setWeatherIconFilename(weatherIconCode);
        }

        setMaxTemperature(maxTemperatureValue);
      });
  }

  useEffect(() => {
    // バックエンドの /get-today-schedule API から今日のスケジュールを取得する。
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-today-schedule`)
      .then((response) => response.json())
      .then((data: ScheduleResponse) => {
        setTodaySchedule({ items: data.schedules ?? [] });

        // 現在日時（東京時間）に基づいて、現在のタスクを決定する。
        // バックエンドから取得したスケジュールの dt は UTC 形式の標準時間であるため、比較の際には timezone.ts の関数を使ってローカル時間（日本時間）に変換する。
        // このフロントエンドでも、現在日時の取得には timezone.ts の関数を使って、UTC から日本時間に変換する。
        const currentTime = now();
        for (const item of data.schedules) {
          const itemTime = new Date(item.dt);
          // 現在のタスクは、現在日時よりも前のタスクの中で最も新しいものとする。
          // 次のタスクは、現在日時よりも後のタスクの中で最も古いものとする。
          console.log(
            "Comparing item date:",
            itemTime,
            "with current time:",
            currentTime,
          );
          if (itemTime <= currentTime) {
            console.log("Setting current task:", item.task);
            setCurrentTask(item.task);
          } else {
            console.log("Setting next task:", item.task);
            const tokyoDisplay = utcIsoToTokyoDisplay(item.dt);
            const [, timePart] = tokyoDisplay.split(" ");
            const [hour, minute] = timePart.split(":");
            setNextTask(item.task);
            setNextTaskTimeHour(hour);
            setNextTaskTimeMinute(minute);
            break; // 最初の次のタスクが見つかったらループを抜ける
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching today's schedule:", error);
      });

    // 天気情報を取得する。
    fetchWeather();
  }, []);

  function gotoTodaySchedule() {
    setCurrentPage({ pageId: "TodaySchedule" });
  }

  return (
    <div onClick={gotoTodaySchedule} css={containerStyle}>
      <div css={nowStyle}>いまは</div>
      <div>
        <div css={taskStyle}>{currentTask}</div> <span>をする時間だよ。</span>
      </div>
      <div>
        <div css={nextTaskStyle}>
          つぎのよてい: {nextTaskTimeHour}時{nextTaskTimeMinute}分から{" "}
          {nextTask}
        </div>
      </div>
      <div css={weatherStyle}>
        <div>
          <img
            src={`https://www.jma.go.jp/bosai/forecast/img/${weatherIconFilename}.svg`}
          />
        </div>
        <div>さいこうきおん&nbsp;{maxTemperature}℃</div>
      </div>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const nowStyle = css`
  font-size: 18px;
  margin-bottom: 8px;
`;

const taskStyle = css`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const nextTaskStyle = css`
  font-size: 16px;
`;

const weatherStyle = css`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
`;
