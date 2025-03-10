import { formatReal } from "../../../app/util/money";
import { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { FormatUtils } from "@4us-dev/utils";

const formatUtils = new FormatUtils();

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    columnClasses?: string;
    erro?: string;
    formatter?: (value: string) => string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    iconRight?: ReactNode; // Ícone à direita do input
}

export const Input: React.FC<InputProps> = ({
    label,
    columnClasses,
    id,
    erro,
    formatter,
    iconRight, // Novo parâmetro para ícone dentro do input
    onChange,
    ...inputProps
}: InputProps) => {

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!onChange) return;

        const value = event.target.value;
        const formattedValue = formatter ? formatter(value) : value;

        // Cria um novo evento mantendo a referência ao elemento original
        const newEvent = Object.assign({}, event, {
            target: Object.assign({}, event.target, {
                value: formattedValue,
                name: event.target.name || id // Importante para o Formik
            })
        });

        onChange(newEvent as ChangeEvent<HTMLInputElement>);
    }

    return (
        <div className={`${columnClasses ?? ''}`}>
            <label className="label" htmlFor={id}>{label}</label>
            <div className="control" style={{ position: "relative" }}>
                <input
                    className="input"
                    id={id}
                    name={id} // Importante: adicionar o name igual ao id
                    style={{ paddingRight: iconRight ? "2rem" : undefined }} // Ajuste para evitar sobreposição
                    {...inputProps}
                    onChange={onInputChange}
                />
                {iconRight && (
                    <span
                        className="icon is-small is-right"
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "57%", // Garante alinhamento vertical com o input
                            transform: "translateY(-50%)", // Ajusta para centralizar
                            //pointerEvents: "none", // Evita que o ícone interfira na digitação
                            cursor:'pointer',
                            zIndex: 2, // Mantém o ícone acima de qualquer outro elemento
                        }}
                    >
                        {iconRight}
                    </span>
                )}
                {erro && (
                    <p className="help is-danger" style={{
                        marginTop: "4px", // Pequeno espaço para evitar tocar no input
                        position: "absolute",
                        bottom: "-20px", // Mantém o erro abaixo do input sem afetar o layout
                    }}>{erro}</p>
                )}
            </div>
        </div>
    );
};

export const InputMoney: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Input {...props} formatter={formatReal}/>
    )
}

export const InputPhone: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Input {...props} formatter={formatUtils.formatPhone}/>
    )
}

export const InputCPF: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Input {...props} formatter={formatUtils.formatCPF}/>
    )
}

export const InputCNPJ: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Input {...props} formatter={formatUtils.formatCNPJ}/>
    )
}

export const InputCEP: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Input {...props} formatter={formatUtils.formatCEP}/>
    )
}