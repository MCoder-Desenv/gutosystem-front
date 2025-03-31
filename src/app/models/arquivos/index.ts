export interface Arquivo {
    id?: string; // ID do arquivo no banco de dados
    nome: string; // Nome do arquivo
    tipo: string; // Tipo do arquivo ("imagem", "video", etc.)
    caminho: string; // Caminho completo do arquivo no servidor
    file?: File | null; // Arquivo no frontend para upload
    status?: string;
    tempId?: string;
    videoUrl?: string | null;
}