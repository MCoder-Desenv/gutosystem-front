'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir o tipo de dados que serão armazenados no contexto
interface ManutencaoContextType {
  idPedido: string | null;
  setManutencaoData: (data: Partial<ManutencaoContextType>) => void;
}

// Criar o contexto com valores iniciais vazios
const ManutencaoContext = createContext<ManutencaoContextType | undefined>(undefined);

// Criar o provider que irá envolver o app
export const ManutencaoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [manutencaoData, setManutencaoDataInternal] = useState<ManutencaoContextType>({
    idPedido: null,
    setManutencaoData: () => {},
  });

  const setManutencaoData = (data: Partial<ManutencaoContextType>) => {
    setManutencaoDataInternal((prevData) => ({
      ...prevData, // Mantém os dados anteriores e atualiza os campos fornecidos
      ...data,
    }));
  };

  return (
    <ManutencaoContext.Provider value={{ ...manutencaoData, setManutencaoData }}>
      {children}
    </ManutencaoContext.Provider>
  );
};

// Hook para acessar o contexto
export const useManutencaoContext = () => {
  const context = useContext(ManutencaoContext);
  if (!context) {
    throw new Error('useManutencaoContext must be used within an ManutencaoProvider');
  }
  return context;
};
