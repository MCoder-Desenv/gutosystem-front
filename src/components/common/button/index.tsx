import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { // Alterado de Input para Button
    label?: ReactNode; // Aceita string ou elementos JSX
    field?: string;
}

export const ButtonType: React.FC<ButtonProps> = ({
    label,
    ...buttonProps
}: ButtonProps) => {
    return (
        <div className="control is-link">
            <button 
                {...buttonProps}
            >
                {label}
            </button>
        </div>
    );
};
