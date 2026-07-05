import { useEffect, useMemo, useRef, useState } from "react";
import "./Calculator.css";
import { createEngine, type CalcState, type EngineConfig } from "./engine";
import type { Key, KeyPadLayout } from "./keys";
import Display from "./Display";
import OperationView from "./OperationView";
import KeyPad from "./KeyPad";

export interface CalculatorConfig<S extends CalcState = CalcState> extends EngineConfig<S> {
    keypad: KeyPadLayout<S>;
    keyBindings?: Record<string, string>;
    className?: string;
}

export interface CalculatorProps<S extends CalcState = CalcState> {
    config: CalculatorConfig<S>;
}

const DEFAULT_KEY_BINDINGS: Record<string, string> = {
    "Enter": "=",
    "=": "=",
    "Backspace": "<-",
    "Escape": "AC",
    "*": "x",
};

function layoutFor<S extends CalcState>(keypad: KeyPadLayout<S>, state: S): Key[][] {
    return typeof keypad === "function" ? keypad(state) : keypad;
}

function Calculator<S extends CalcState = CalcState>({ config }: CalculatorProps<S>) {
    const engine = useMemo(() => createEngine(config), [config]);
    const [state, setState] = useState<S>(engine.initialState);

    const keys = layoutFor(config.keypad, state).map((row) =>
        row.map((key) => key.label === state.operator ? { ...key, active: true } : key)
    );

    const keysRef = useRef(keys);
    keysRef.current = keys;

    useEffect(() => {
        const bindings = { ...DEFAULT_KEY_BINDINGS, ...config.keyBindings };

        function onKeyDown(event: KeyboardEvent) {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            let symbol = bindings[event.key];
            if (symbol === undefined) {
                const match = keysRef.current.flat().find(
                    (key) => key.label !== "" && !key.disabled && key.label.toLowerCase() === event.key.toLowerCase()
                );
                if (match === undefined) return;
                symbol = match.label;
            }

            event.preventDefault();
            setState((prev) => engine.input(prev, symbol));
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [engine, config.keyBindings]);

    return (
        <div className={`calculator flex flex-col ${config.className ?? "w-70"}`}>
            <OperationView value={state.operator !== null ? `${state.left} ${state.operator}` : state.prevOperation ?? ""} />
            <Display value={state.right ?? state.left} />
            <KeyPad keys={keys} onPress={(symbol) => setState((prev) => engine.input(prev, symbol))} />
        </div>
    );
}
export default Calculator;
