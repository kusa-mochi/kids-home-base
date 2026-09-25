// 独自GUIで日付と時刻を入力する、タッチパネル専用コンポーネント
// 年月日と時刻を入力するGUIを提供する。
// 年月日の入力にはHTMLのinput要素のtype="date"を使用する。
// 時刻の入力には独自GUIを使用する。
// 独自GUIは、HourとMinuteをそれぞれ個別のスライダーで入力する。
// Hourのスライダーは0から23までの範囲で12時制で入力する。例：0は「午後12時」、1は「午前1時」、13は「午後1時」、23は「午後11時」、それ以外の時間も同様に変換される。
// Minuteのスライダーは0から55までの範囲で5分刻みで入力する。
// 入力した日時情報はコンポーネントのvalueプロパティに格納される。
export const DatetimeInput = ({ value, onChange }: { value: string; onChange?: (value: string) => void }) => {
    // valueは"YYYY-MM-DDTHH:MM"形式の文字列を想定している。
    // 年月日と時刻を分割して扱いやすくする。
    const [date, time] = value?.split('T') || ['','00:00'];
    const [hour, minute] = time.split(':');
    return (
        <div>
            {/* 年月日の入力 */}
            <input type="date" value={date} onChange={e => onChange?.(`${e.target.value}T${time}`)} />
            {/* 独自GUIによる時刻入力 */}
            <div>
                <label>時</label>
                <input type="range" min="0" max="23" value={parseInt(hour)} onChange={e => onChange?.(`${date || '1970-01-01'}T${e.target.value.padStart(2, '0')}:${minute || '00'}`)} />
            </div>
            <div>
                <label>分</label>
                <input type="range" min="0" max="55" step="5" value={parseInt(minute)} onChange={e => onChange?.(`${date || '1970-01-01'}T${hour || '00'}:${e.target.value.padStart(2, '0')}`)} />
            </div>
        </div>
    );
};
