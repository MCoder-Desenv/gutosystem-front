import { formatReal } from "../../../app/util/money";
import { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { FormatUtils } from "@4us-dev/utils";

const formatUtils = new FormatUtils();

const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;
    
    return true;
};

const validarCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros[tamanho - i]) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos[0])) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros[tamanho - i]) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos[1])) return false;
    
    return true;
};

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

// export const InputCPF: React.FC<InputProps> = (props: InputProps) => {
//     return (
//         <Input {...props} formatter={formatUtils.formatCPF}/>
//     )
// }

export const InputCPF: React.FC<InputProps> = (props: InputProps) => {
    const cpfValue = String(props.value || ""); // Garante que seja string
    const erroValidacao = cpfValue && !validarCPF(cpfValue) ? "CPF inválido" : undefined;

    // Combina o erro do Formik e da validação de CPF
    const erroFinal = props.erro || erroValidacao;

    return <Input {...props} formatter={formatUtils.formatCPF} erro={erroFinal} />;
};


// export const InputCNPJ: React.FC<InputProps> = (props: InputProps) => {
//     return (
//         <Input {...props} formatter={formatUtils.formatCNPJ}/>
//     )
// }
export const InputCNPJ: React.FC<InputProps> = (props: InputProps) => {
    const cnpjValue = String(props.value || ""); // Garante que seja uma string
    const erroValidacao = cnpjValue && !validarCNPJ(cnpjValue) ? "CNPJ inválido" : undefined;

    // Combina o erro do Formik e da validação de CNPJ
    const erroFinal = props.erro || erroValidacao;

    return <Input {...props} formatter={formatUtils.formatCNPJ} erro={erroFinal} />;
};



export const InputCEP: React.FC<InputProps> = (props: InputProps) => {
    return (
        <Input {...props} formatter={formatUtils.formatCEP}/>
    )
}