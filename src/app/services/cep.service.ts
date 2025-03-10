import axios from 'axios';

export const buscarCEP = async (cep: string) => {
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        alert("Erro ao buscar o CEP: " + error);
        console.error("Erro ao buscar o CEP: ", error);
        throw new Error("Não foi possível buscar o CEP.");
    }
};