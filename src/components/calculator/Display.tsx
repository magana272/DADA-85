import "./Display.css";

export interface DisplayProps {
    value: string;
}

function Display({ value }: DisplayProps) {
    return (<div role="status" className="calc-display w-full">{value}</div>)
}
export default Display;
