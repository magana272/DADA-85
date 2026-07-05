export interface CalcState {
    left: string;
    operator: string | null;
    right: string | null;
    prevOperation: string | null;
}

export type BinaryOperation = (left: number, right: number) => number;

export interface Engine<S extends CalcState = CalcState> {
    initialState: S;
    evaluate: (state: S) => string;
    input: (state: S, symbol: string) => S;
    parse: (value: string, state: S) => number;
    format: (value: number, state: S) => string;
}

export type Command<S extends CalcState = CalcState> = (state: S, engine: Engine<S>) => S;

export interface EngineConfig<S extends CalcState = CalcState> {
    operations: Record<string, BinaryOperation>;
    commands?: Record<string, Command<S>>;
    parseOperand?: (value: string, state: S) => number;
    formatResult?: (value: number, state: S) => string;
    initialState?: S;
}

export const INITIAL_STATE: CalcState = { left: "0", operator: null, right: null, prevOperation: "" };

export function appendDigit(current: string, symbol: string): string {
    if (symbol === "." && current.includes(".")) return current;
    if (current === "0" && symbol !== ".") return symbol;
    if (current === "-0") return "-" + symbol;
    return current + symbol;
}

export function popDigit(current: string): string {
    const res = current.slice(0, current.length - 1);
    if (res === "" || res === "-") {
        return "0";
    }
    return res;
}

export function negate(value: string): string {
    return value.startsWith("-") ? value.slice(1) : "-" + value;
}

function defaultParseOperand(value: string): number {
    return parseFloat(value);
}

function defaultFormatResult(value: number): string {
    if (!Number.isFinite(value)) return "Error";
    if (Number.isSafeInteger(value)) return String(value);
    return String(Number(value.toPrecision(12)));
}

export function unaryCommand<S extends CalcState = CalcState>(fn: (value: number) => number): Command<S> {
    return (state, engine) => {
        if (state.operator !== null) {
            const value = fn(engine.parse(state.right ?? state.left, state));
            return { ...state, right: engine.format(value, state) };
        }
        return { ...state, left: engine.format(fn(engine.parse(state.left, state)), state) };
    };
}

export function constantCommand<S extends CalcState = CalcState>(value: number): Command<S> {
    return (state, engine) => {
        if (state.operator !== null) {
            return { ...state, right: engine.format(value, state) };
        }
        return { ...state, left: engine.format(value, state) };
    };
}

function defaultCommands<S extends CalcState>(): Record<string, Command<S>> {
    return {
        "=": (state, engine) => ({
            ...state,
            left: engine.evaluate(state),
            operator: null,
            right: null,
            prevOperation: state.operator !== null
                ? state.left + state.operator + (state.right ?? "")
                : state.prevOperation,
        }),
        "+/-": (state) => {
            if (state.operator !== null) {
                return { ...state, right: negate(state.right ?? "0") };
            }
            return { ...state, left: negate(state.left) };
        },
        "AC": (_state, engine) => engine.initialState,
        "<-": (state) => {
            if (state.operator === null) {
                return { ...state, left: popDigit(state.left) };
            }
            return { ...state, right: popDigit(state.right ?? "0") };
        },
    };
}

function enterDigit<S extends CalcState>(state: S, symbol: string): S {
    if (state.operator === null && state.right === null && state.prevOperation !== "") {
        return { ...state, left: symbol };
    }
    if (state.operator === null) {
        return { ...state, left: appendDigit(state.left, symbol) };
    }
    return { ...state, right: appendDigit(state.right ?? "0", symbol) };
}

export function createEngine<S extends CalcState = CalcState>(config: EngineConfig<S>): Engine<S> {
    const operations = config.operations;
    const commands: Record<string, Command<S>> = { ...defaultCommands<S>(), ...config.commands };
    const parse = config.parseOperand ?? defaultParseOperand;
    const format = config.formatResult ?? defaultFormatResult;

    const engine: Engine<S> = {
        initialState: config.initialState ?? (INITIAL_STATE as S),
        parse,
        format,
        evaluate(state) {
            if (state.operator === null || state.right === null) return state.left;
            const operation = operations[state.operator];
            const result = operation(parse(state.left, state), parse(state.right, state));
            return format(result, state);
        },
        input(state, symbol) {
            const command = commands[symbol];
            if (command !== undefined) return command(state, engine);
            if (symbol in operations) {
                return { ...state, left: engine.evaluate(state), operator: symbol, right: null };
            }
            return enterDigit(state, symbol);
        },
    };
    return engine;
}
