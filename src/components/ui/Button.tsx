import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function Button({ className, ...props }: ButtonProps) {
    return <button className={`btn ${className ?? ""}`} {...props} />;
}
export default Button;
