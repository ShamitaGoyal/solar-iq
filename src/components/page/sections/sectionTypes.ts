import type { MutableRefObject } from "react";

export type SetSectionRef = (i: number) => (el: HTMLElement | null) => void;
export type SectionElRef = MutableRefObject<HTMLElement | null>;

