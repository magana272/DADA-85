import { k, backspaceKey } from "../../components/calculator";
import type { BinaryOperation, CalculatorConfig } from "../../components/calculator";

export const BASIC_OPERATIONS: Record<string, BinaryOperation> = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "x": (x, y) => x * y,
    "%": (x, y) => x % y,
    "/": (x, y) => x / y,
};

export const basicConfig: CalculatorConfig = {
    operations: BASIC_OPERATIONS,
    keypad: (state) => [
        [backspaceKey(state), k("+/-", "symbol"), k("%", "symbol"), k("/", "symbol")],
        [k("7"), k("8"), k("9"), k("x", "symbol")],
        [k("4"), k("5"), k("6"), k("-", "symbol")],
        [k("1"), k("2"), k("3"), k("+", "symbol")],
        [k(""), k("0"),  k(".", "symbol"), k("=", "symbol")],
    ],
};
