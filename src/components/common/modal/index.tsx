/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';
import { useEffect, useState } from 'react';
import styles from './ModalCard.module.css'; // Importando CSS Module

interface ModalCardProps {
    mensagem: string;
    tipo?: 'success' | 'error' | 'info' | 'loading'; // Adicionando 'loading'
    tempoAutoFechamento?: number; // Tempo para fechar automaticamente (ms)
    onClose?: () => void;
}

export const ModalCard: React.FC<ModalCardProps> = ({ mensagem, tipo = 'info', tempoAutoFechamento, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (tempoAutoFechamento && tempoAutoFechamento > 0 && tipo !== 'loading') {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
            }, tempoAutoFechamento);
            return () => clearTimeout(timer);
        }
    }, [tempoAutoFechamento, onClose, tipo]);
    
    if (!isVisible) return null;

    const getModalClass = () => {
        switch (tipo) {
            case 'success': return 'is-success';
            case 'error': return 'is-danger';
            case 'loading': return 'is-warning';
            default: return 'is-info';
        }
    };

    return (
        <div className={`modal is-active`}>
            <div className="modal-background" onClick={() => { setIsVisible(false); onClose && onClose(); }}></div>
            <div className="modal-card">
                <header className={`modal-card-head ${getModalClass()}`}>
                    <p className="modal-card-title">
                        {tipo === 'success' ? 'Sucesso ✅' : 
                         tipo === 'error' ? 'Erro ❌' : 
                         tipo === 'loading' ? 'Carregando... ⏳' : 'Aviso ⚠️'}
                    </p>
                    {tipo !== 'loading' && (
                        <button className="delete" aria-label="close" onClick={() => { setIsVisible(false); onClose && onClose(); }}></button>
                    )}
                </header>
                <section className="modal-card-body">
                    {tipo === 'loading' ? (
                        <div className={styles.modalLoadingContainer}>
                            <div className={styles.loader}></div>
                            <p>{mensagem}</p>
                        </div>
                    ) : (
                        mensagem?.split("\n")?.map((linha, index) => (
                            <p key={index}>{linha}</p>
                        ))
                    )}
                </section>
                {tipo !== 'loading' && (
                    <footer className="modal-card-foot">
                        <button className="button is-primary" onClick={() => { setIsVisible(false); onClose && onClose(); }}>OK</button>
                    </footer>
                )}
            </div>
        </div>
    );
};
