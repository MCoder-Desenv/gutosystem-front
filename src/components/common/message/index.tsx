interface MessageProps {
    tipo: string;
    texto: string;
    field?: string;
}

export interface Alert {
    tipo: string;
    texto: string;
    field?: string;
}

export const Message: React.FC<MessageProps> = ({
    texto,
    tipo,
    field
}) => {
    return (
        <article className={`message is-${tipo}`}>
            <div className='message-body'>
                {field && `${field} :`}{texto}
            </div>
        </article>
    )
}