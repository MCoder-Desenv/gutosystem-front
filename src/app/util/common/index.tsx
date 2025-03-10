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