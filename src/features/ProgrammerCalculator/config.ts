import { k, backspaceKey } from "../../components/calculator";
import type { CalcState, CalculatorConfig, Command, Key } from "../../components/calculator";

export interface ProgrammerState extends CalcState {
    base: 2 | 10 | 16;
}

const INITIAL_PROGRAMMER_STATE: ProgrammerState = {
    left: "0",
    operator: null,
    right: null,
    prevOperation: "",
    base: 10,
};

function baseCommand(base: ProgrammerState["base"]): Command<ProgrammerState> {
    return (state, engine) => {
        const next = { ...state, base };
        return {
            ...next,
            left: engine.format(engine.parse(state.left, state), next),
            right: state.right === null ? null : engine.format(engine.parse(state.right, state), next),
        };
    };
}

function digit(label: string, state: ProgrammerState): Key {
    return k(label, "number", { disabled: parseInt(label, 16) >= state.base });
}

function baseKey(label: string, base: ProgrammerState["base"], state: ProgrammerState): Key {
    return k(label, "symbol", { active: state.base === base });
}

export const programmerConfig: CalculatorConfig<ProgrammerState> = {
    initialState: INITIAL_PROGRAMMER_STATE,
    operations: {
        "AND": (x, y) => x & y,
        "OR": (x, y) => x | y,
        "XOR": (x, y) => x ^ y,
        "<<": (x, y) => x << y,
        ">>": (x, y) => x >> y,
        "+": (x, y) => (x + y) | 0,
        "-": (x, y) => (x - y) | 0,
    },
    parseOperand: (value, state) => value === "Error" ? NaN : parseInt(value, state.base),
    formatResult: (value, state) =>
        Number.isFinite(value) ? Math.trunc(value).toString(state.base).toUpperCase() : "Error",
    commands: {
        "HEX": baseCommand(16),
        "DEC": baseCommand(10),
        "BIN": baseCommand(2),
        "AC": (state, engine) => ({ ...engine.initialState, base: state.base }),
    },
    keyBindings: { "&": "AND", "|": "OR", "^": "XOR" },
    className: "w-96",
    keypad: (state) => [
        [baseKey("HEX", 16, state), baseKey("DEC", 10, state), baseKey("BIN", 2, state), k("+/-", "symbol"), backspaceKey(state)],
        [digit("D", state), digit("E", state), digit("F", state), k("AND", "symbol"), k("<<", "symbol")],
        [digit("A", state), digit("B", state), digit("C", state), k("OR", "symbol"), k(">>", "symbol")],
        [digit("7", state), digit("8", state), digit("9", state), k("XOR", "symbol"), k("-", "symbol")],
        [digit("4", state), digit("5", state), digit("6", state), k("AC", "symbol"), k("+", "symbol")],
        [digit("1", state), digit("2", state), digit("3", state), digit("0", state), k("=", "symbol")],
    ],
};
