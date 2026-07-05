import { k, backspaceKey, unaryCommand, constantCommand } from "../../components/calculator";
import type { CalculatorConfig } from "../../components/calculator";
import { BASIC_OPERATIONS } from "../BasicCalculator/config";

export const scientificConfig: CalculatorConfig = {
    operations: {
        ...BASIC_OPERATIONS,
        "^": (x, y) => Math.pow(x, y),
    },
    commands: {
        "x²": unaryCommand((x) => x * x),
        "√": unaryCommand(Math.sqrt),
        "sin": unaryCommand(Math.sin),
        "cos": unaryCommand(Math.cos),
        "π": constantCommand(Math.PI),
    },
    className: "w-96",
    keypad: (state) => [
        [k("x²", "symbol"), backspaceKey(state), k("+/-", "symbol"), k("%", "symbol"), k("/", "symbol")],
        [k("√", "symbol"), k("7"), k("8"), k("9"), k("x", "symbol")],
        [k("sin", "symbol"), k("4"), k("5"), k("6"), k("-", "symbol")],
        [k("cos", "symbol"), k("1"), k("2"), k("3"), k("+", "symbol")],
        [k("π", "symbol"), k("^", "symbol"), k("0"), k(".", "symbol"), k("=", "symbol")],
    ],
};
