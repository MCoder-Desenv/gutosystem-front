export interface DashboardData {
    mes: number;
    totalfichas: number;
}

export interface DashboardStatus {
    status: string;
    total: number;
}

export interface DashboardTotalFichaPeido {
    total: number;
    totalped: number;
}

export interface DashboardTotalFichaPeidoPorDia {
    dia: number;
    total: number;
    totalped: number;
}

export interface DashboardTotaPorDia {
    dia: number;
    total: number;
}

export interface DashboardTotaPorMesStatus {
    mes: number;
    total: number;
}

export interface DashboardTotalFichaPeidoCliente {
    total: number;
    totalped: number;
    totalcli: number;
}

export interface DashboardTotal {
    total: number;
    totalfichas: number;
}