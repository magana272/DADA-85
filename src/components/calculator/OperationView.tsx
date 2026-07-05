import "./OperationView.css";

export interface OperationViewProps {
    value: string;
}

function OperationView({ value }: OperationViewProps) {
    return (<div className="OperationView w-full">{value}</div>)
}
export default OperationView;
