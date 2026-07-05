import Button from "../ui/Button";
import type { Key } from "./keys";
import "./KeyPad.css";

export interface KeyPadProps {
    keys: Key[][];
    onPress: (symbol: string) => void;
}

function KeyPad({ keys, onPress }: KeyPadProps) {
    return (
        <div className="grid gap-2">
            {keys.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                    {row.map((key, colIndex) => (
                        key.label === ""
                            ? <Button key={colIndex} className="flex-1 btn-disabled btn-number" />
                            : <Button
                                key={colIndex}
                                className={`flex-1 ${key.variant === "symbol" ? "btn-symbol" : "btn-number"}${key.disabled ? " btn-disabled" : ""}${key.active ? " btn-active" : ""}`}
                                disabled={key.disabled}
                                onClick={() => onPress(key.label)}>
                                {key.label}
                            </Button>
                    ))}
                </div>
            ))}
        </div>
    );
}
export default KeyPad;
