
export interface Produto {
    id?: string;
    categoria?: CategoriaProduto | null;
    descricao?: string | null;
    status?: string | null;
}

export interface CategoriaProduto {
    id?: string;
    nome?: string;
    status?: string;
}