import { FC } from "react";
import { useCurrentPage } from "../contexts/PageContext";

export const HomePage: FC = () => {
  const { currentPage, setCurrentPage } = useCurrentPage();

  function gotoTodaySchedule() {
    setCurrentPage({ pageId: "TodaySchedule" });
  }

  return (
    <div onClick={gotoTodaySchedule}>
      <h1>Home Page</h1>
    </div>
  );
};
