"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type CurrentPage = {
    pageId: "Home" | "TodaySchedule" | "TomorrowSchedule" | "EditSchedule" | "Settings";
}

type CurrentPageContextType = {
    currentPage: CurrentPage;
    setCurrentPage: (page: CurrentPage) => void;
};

const CurrentPageContext = createContext<CurrentPageContextType | undefined>(undefined);

export function CurrentPageProvider({ children }: { children: ReactNode }) {
    const [currentPage, setCurrentPage] = useState<CurrentPage>({ pageId: "Home" });

    return (
        <CurrentPageContext.Provider value={{ currentPage, setCurrentPage }}>
            {children}
        </CurrentPageContext.Provider>
    );
}

export function useCurrentPage() {
    const context = useContext(CurrentPageContext);
    if (!context) {
        throw new Error("useCurrentPage must be used within a CurrentPageProvider");
    }
    return context;
}
