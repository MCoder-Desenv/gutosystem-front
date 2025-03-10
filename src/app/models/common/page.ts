export interface Page<T> {
    content: Array<T>;
    first: number; // Corrigido de "firts" para "first"
    size: number;
    number: number;
    totalElements: number;
}

export interface ApiResponse<T> {
    message: string;
    data: T;
    statusCode: number;
}