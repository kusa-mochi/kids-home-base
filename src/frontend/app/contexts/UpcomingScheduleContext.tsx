"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { ScheduleItem } from "../dataStructures/Schedule";

type UpcomingSchedule = {
  items: ScheduleItem[];
};

type UpcomingScheduleContextType = {
  upcomingSchedule: UpcomingSchedule;
  setUpcomingSchedule: (schedule: UpcomingSchedule) => void;
};

const UpcomingScheduleContext = createContext<UpcomingScheduleContextType | undefined>(undefined);

export function UpcomingScheduleProvider({ children }: { children: ReactNode }) {
    const [upcomingSchedule, setUpcomingSchedule] = useState<UpcomingSchedule>({ items: [] });

    return (
        <UpcomingScheduleContext.Provider value={{ upcomingSchedule, setUpcomingSchedule }}>
            {children}
        </UpcomingScheduleContext.Provider>
    );
}

export function useUpcomingSchedule() {
    const context = useContext(UpcomingScheduleContext);
    if (!context) {
        throw new Error("useUpcomingSchedule must be used within an UpcomingScheduleProvider");
    }
    return context;
}
