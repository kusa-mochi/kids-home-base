"use client";
import { css } from "@emotion/react";

// 独自GUIで日付と時刻を入力する、タッチパネル専用コンポーネント
// 年月日と時刻を入力するGUIを提供する。
// 年月日の入力にはHTMLのinput要素のtype="date"を使用する。
// 時刻の入力には独自GUIを使用する。
// 独自GUIは、HourとMinuteをそれぞれ個別のスライダーで入力する。
// Hourのスライダーは0から23までの範囲で12時制で入力する。例：0は「午前0時」、1は「午前1時」、12は「午後0時」、23は「午後11時」、それ以外の時間も同様に変換される。
// Minuteのスライダーは0から55までの範囲で5分刻みで入力する。
// 入力した日時情報はコンポーネントのvalueプロパティに格納される。
export const DatetimeInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange?: (value: string) => void;
}) => {
  // valueは"YYYY-MM-DDTHH:MM"形式の文字列を想定している。
  // 年月日と時刻を分割して扱いやすくする。
  const [date, time] = value?.split("T") || ["", "00:00"];
  const [hour, minute] = time.split(":");
  return (
    <div css={componentStyle}>
      {/* 年月日の入力 */}
      <div>
        <input
          type="date"
          value={date}
          css={dateInputStyle}
          onChange={(e) => onChange?.(`${e.target.value}T${time}`)}
          aria-label="年月日入力"
        />
      </div>

      {/* 独自GUIによる時刻入力 */}
      <div css={timeInputStyle}>
        <div css={hourInputStyle}>
          <div>
            <label css={rangeLabelStyle}>
              {parseInt(hour) < 12 ? "午前" : "午後"}
              {parseInt(hour) % 12}時
            </label>
          </div>
          <div>
            <input
              type="range"
              min="0"
              max="23"
              value={parseInt(hour)}
              css={rangeInputStyle}
              onChange={(e) =>
                onChange?.(
                  `${date || "1970-01-01"}T${e.target.value.padStart(2, "0")}:${minute || "00"}`,
                )
              }
              aria-label="時入力"
            />
          </div>
        </div>
        <div css={minuteInputStyle}>
          <div>
            <label css={rangeLabelStyle}>{parseInt(minute)}分</label>
          </div>
          <div>
            <input
              type="range"
              min="0"
              max="55"
              step="5"
              value={parseInt(minute)}
              css={rangeInputStyle}
              onChange={(e) =>
                onChange?.(
                  `${date || "1970-01-01"}T${hour || "00"}:${e.target.value.padStart(2, "0")}`,
                )
              }
              aria-label="分入力"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const componentStyle = css`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
`;

const dateInputStyle = css`
  font-size: 40px;
  margin: 0 0 16px 0;
  padding: 8px 16px;
`;

const timeInputStyle = css`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;

  margin: 0 0 16px 0;
`;

const rangeLabelStyle = css`
  font-size: 40px;
`;

const rangeInputStyle = css`
  width: 400px;
  margin: 16px 0;
  font-size: 32px;

  color: #0070f3;
  --thumb-height: 1.125em;
  --track-height: 0.125em;
  --track-color: rgba(255, 255, 255, 0.5);
  --brightness-hover: 180%;
  --brightness-down: 80%;
  --clip-edges: 0.125em;

  position: relative;
  background: #fff0;
  overflow: hidden;

  &:active {
    cursor: grabbing;
  }

  &:disabled {
    filter: grayscale(1);
    opacity: 0.3;
    cursor: not-allowed;
  }

  &,
  &::-webkit-slider-runnable-track,
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    transition: all ease 100ms;
    height: var(--thumb-height);

    position: relative;
  }

  &::-webkit-slider-thumb {
    --thumb-radius: calc((var(--thumb-height) * 0.5) - 1px);
    --clip-top: calc((var(--thumb-height) - var(--track-height)) * 0.5 - 0.5px);
    --clip-bottom: calc(var(--thumb-height) - var(--clip-top));
    --clip-further: calc(100% + 1px);
    --box-fill: calc(-100vmax - var(--thumb-width, var(--thumb-height))) 0 0
      100vmax currentColor;

    width: var(--thumb-width, var(--thumb-height));
    background: linear-gradient(currentColor 0 0) scroll no-repeat left center /
      50% calc(var(--track-height) + 1px);
    background-color: currentColor;
    box-shadow: var(--box-fill);
    border-radius: var(--thumb-width, var(--thumb-height));

    filter: brightness(100%);
    clip-path: polygon(
      100% -1px,
      var(--clip-edges) -1px,
      0 var(--clip-top),
      -100vmax var(--clip-top),
      -100vmax var(--clip-bottom),
      0 var(--clip-bottom),
      var(--clip-edges) 100%,
      var(--clip-further) var(--clip-further)
    );
  }

  &:hover::-webkit-slider-thumb {
    filter: brightness(var(--brightness-hover));
    cursor: grab;
  }

  &:active::-webkit-slider-thumb {
    filter: brightness(var(--brightness-down));
    cursor: grabbing;
  }

  &:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  &::-webkit-slider-runnable-track {
    background: linear-gradient(var(--track-color) 0 0) scroll no-repeat
      center / 100% calc(var(--track-height) + 1px);
  }
`;

const hourInputStyle = css`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;

  margin: 0 32px 0 0;
`;

const minuteInputStyle = css`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
`;
