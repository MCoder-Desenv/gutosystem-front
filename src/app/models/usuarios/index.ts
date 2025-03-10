export interface Usuarios {
    id?: string;
    email?: string | null;
    password?: string | null;
    name?: string | null;
    role?: string | null;
    usuariosFuncoes?: UsuarioFuncao[];
}

export interface Perfil {
    id?: string;
    email?: string | null;
    name?: string | null;
    senhaAnterior?: string | null;
    senhaNova?: string | null;
}

export interface UsuarioProjection {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
}

export interface UsuarioFuncao {
    id: string | null;
    userId?: string | null;
    funcao?: Funcao;
    podeCadastrar?: boolean | null;
    podeConsultar?: boolean | null;
}

export interface Funcao {
    id?: string | null;
    nome?: string | null;
}