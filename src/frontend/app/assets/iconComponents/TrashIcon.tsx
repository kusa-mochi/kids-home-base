"use client";

import TrashSvg from "@/app/assets/trash.svg";
import type { ComponentProps } from "react";

type TrashIconProps = ComponentProps<typeof TrashSvg>;

export function TrashIcon(props: TrashIconProps) {
    return <TrashSvg aria-hidden="true" focusable="false" {...props} />;
}
