import type { CalcState } from "./engine";

export type KeyVariant = "number" | "symbol";

export interface Key {
    label: string;
    variant: KeyVariant;
    disabled?: boolean;
    active?: boolean;
}

export type KeyPadLayout<S extends CalcState = CalcState> = Key[][] | ((state: S) => Key[][]);

export function k(label: string, variant: KeyVariant = "number", opts?: Pick<Key, "disabled" | "active">): Key {
    return { label, variant, ...opts };
}

export function backspaceKey(state: CalcState): Key {
    return k(state.prevOperation ? "AC" : "<-");
}
