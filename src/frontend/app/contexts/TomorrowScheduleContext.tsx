"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { ScheduleItem } from "../dataStructures/Schedule";

type TomorrowSchedule = {
  items: ScheduleItem[];
};

type TomorrowScheduleContextType = {
  tomorrowSchedule: TomorrowSchedule;
  setTomorrowSchedule: (schedule: TomorrowSchedule) => void;
};

const TomorrowScheduleContext = createContext<TomorrowScheduleContextType | undefined>(undefined);

export function TomorrowScheduleProvider({ children }: { children: ReactNode }) {
    const [tomorrowSchedule, setTomorrowSchedule] = useState<TomorrowSchedule>({ items: [] });

    return (
        <TomorrowScheduleContext.Provider value={{ tomorrowSchedule, setTomorrowSchedule }}>
            {children}
        </TomorrowScheduleContext.Provider>
    );
}

export function useTomorrowSchedule() {
    const context = useContext(TomorrowScheduleContext);
    if (!context) {
        throw new Error("useTomorrowSchedule must be used within a TomorrowScheduleProvider");
    }
    return context;
}
