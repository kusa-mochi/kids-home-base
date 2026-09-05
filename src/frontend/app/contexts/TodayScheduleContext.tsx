"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { ScheduleItem } from "../dataStructures/Schedule";

type TodaySchedule = {
  items: ScheduleItem[];
};

type TodayScheduleContextType = {
  todaySchedule: TodaySchedule;
  setTodaySchedule: (schedule: TodaySchedule) => void;
};

const TodayScheduleContext = createContext<TodayScheduleContextType | undefined>(undefined);

export function TodayScheduleProvider({ children }: { children: ReactNode }) {
    const [todaySchedule, setTodaySchedule] = useState<TodaySchedule>({ items: [] });

    return (
        <TodayScheduleContext.Provider value={{ todaySchedule, setTodaySchedule }}>
            {children}
        </TodayScheduleContext.Provider>
    );
}

export function useTodaySchedule() {
    const context = useContext(TodayScheduleContext);
    if (!context) {
        throw new Error("useTodaySchedule must be used within a TodayScheduleProvider");
    }
    return context;
}
