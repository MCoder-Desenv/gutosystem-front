'use client'
import { TerceiroFichaOrcamento } from '../../app/models/terceiros';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir o tipo de dados que serão armazenados no contexto
interface OrcamentoContextType {
  idFichaVsIdOrdemMnt: string | null;
  cliente?: TerceiroFichaOrcamento | null;
  enderecoCliente: string | null;
  telefoneCliente: string | null;
  tela: string | null;
  setOrcamentoData: (data: Partial<OrcamentoContextType>) => void;
}

// Criar o contexto com valores iniciais vazios
const OrcamentoContext = createContext<OrcamentoContextType | undefined>(undefined);

// Criar o provider que irá envolver o app
export const OrcamentoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orcamentoData, setOrcamentoDataInternal] = useState<OrcamentoContextType>({
    idFichaVsIdOrdemMnt: null,
    cliente: {},
    enderecoCliente: null,
    telefoneCliente: null,
    tela: null,
    setOrcamentoData: () => {},
  });

  const setOrcamentoData = (data: Partial<OrcamentoContextType>) => {
    setOrcamentoDataInternal((prevData) => ({
      ...prevData, // Mantém os dados anteriores e atualiza os campos fornecidos
      ...data,
    }));
  };

  return (
    <OrcamentoContext.Provider value={{ ...orcamentoData, setOrcamentoData }}>
      {children}
    </OrcamentoContext.Provider>
  );
};

// Hook para acessar o contexto
export const useOrcamentoContext = () => {
  const context = useContext(OrcamentoContext);
  if (!context) {
    throw new Error('useOrcamentoContext must be used within an OrcamentoProvider');
  }
  return context;
};
