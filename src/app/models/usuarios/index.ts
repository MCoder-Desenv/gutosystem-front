export interface Usuarios {
    id?: string | null;
    email?: string | null;
    password?: string | null;
    name?: string | null;
    role?: string | null;
    usuarioFuncionario?: UsuarioFuncionario | null;
    usuariosFuncoes?: UsuarioFuncao[];
}

export interface UsuarioFuncionario {
    id?: string | null;
    userId?: string | null;
    funcionario?: FuncionarioUsuario | null;
    funcionarioId?: string | null;
    funcionarioNome?: string | null;
}

export interface FuncionarioUsuario {
    id?: string | null;
    nome?: string | null;
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