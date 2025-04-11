export const updateArray = <T extends { id?: string; tempId?: string }>(array: T[], updatedItem: T): T[] => {
        // Se o item tem 'id', verifica se já existe no array, caso contrário, usa o 'tempId'
        const existingIndex = array.findIndex((el) =>
            (el.id && el.id === updatedItem.id) ||
            (el.tempId && el.tempId === updatedItem.tempId)
        );
    
        if (existingIndex !== -1) {
            // Se o item já existir, atualiza ele
            const updatedArray = [...array];
            updatedArray[existingIndex] = { ...updatedArray[existingIndex], ...updatedItem };
            return updatedArray;
        }
    
        // Caso não exista, adiciona o novo item
        return [...array, updatedItem];
    };

export const deleteFromArray = <T extends { id?: string; tempId?: string }>(
        array: T[],
        item: T
    ): T[] => {
        return array.filter(
            (el) =>
                !(el.id === item.id && item.id) && // Só compara `id` se ele existir
                !(el.tempId === item.tempId && item.tempId) // Só compara `tempId` se ele existir
        );
    };

// utils/estados.ts
export const ESTADOS_BR = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
];
  