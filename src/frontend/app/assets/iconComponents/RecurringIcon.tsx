"use client";

import RecurringSvg from "@/app/assets/recurring.svg";
import type { ComponentProps } from "react";

type RecurringIconProps = ComponentProps<typeof RecurringSvg>;

export function RecurringIcon(props: RecurringIconProps) {
    return <RecurringSvg aria-hidden="true" focusable="false" {...props} />;
}
