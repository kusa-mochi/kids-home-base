"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type LoginData = {
    userId: string;
    accessToken: string;
}

type LoginContextType = {
    loginData: LoginData | null;
    setLoginData: (data: LoginData | null) => void;
};

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
    const [loginData, setLoginData] = useState<LoginData | null>(null);
    return (
        <LoginContext.Provider value={{ loginData, setLoginData }}>
            {children}
        </LoginContext.Provider>
    );
}

export function useLoginData() {
    const context = useContext(LoginContext);
    if (!context) {
        throw new Error("useLoginData must be used within a LoginProvider");
    }
    return context;
}
