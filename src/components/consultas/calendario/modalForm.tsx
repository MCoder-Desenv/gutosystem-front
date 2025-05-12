'use client';
import { Tarefa } from '../../../app/models/tarefa';
import { useMediaService } from '../../../app/services';
import { Input } from '../../../components';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { Dropdown } from 'primereact/dropdown';
import { ButtonType } from '../../../components/common/button';
import { Galleria } from 'primereact/galleria';
import { TemplateImagem } from '../../common/templateImagem';
import { Arquivo } from '../../../app/models/arquivos';
import styles from './calendario.module.css';

interface TarefaFormProps {
    tarefa: Tarefa;
    onSubmit: (tarefa: Tarefa) => void;
    fechar: () => void; // <- aqui
}
//const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({});

// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4", "image/heic", "image/heif"];

export const TarefaModalForm: React.FC<TarefaFormProps> = ({
    tarefa,
    onSubmit,
    fechar
}) => {

    //Services
    // const router = useRouter();
    const mediaService = useMediaService();

    const statusOptions = [
        { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
        { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
        { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
        { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
    ];

    const galleria = useRef<Galleria | null>(null); // Define o tipo correto
    const [indiceAtual, setIndiceAtual] = useState(0);
    
    const formik = useFormik<Tarefa>({
        initialValues: {
            id: tarefa.id || null,
            criadoPor: tarefa.criadoPor || null,
            dataHoraAtividade: tarefa.dataHoraAtividade || null,
            descricao: tarefa.descricao || null,
            ficha: tarefa.ficha || null,
            observacoes: tarefa.observacoes || null,
            titulo: tarefa.titulo || null,
            status: tarefa.status || null,
            prioridade: tarefa.prioridade || null,
            local: tarefa.local || null,
            observacoesFuncionario: tarefa.observacoesFuncionario || null,
            arquivos: tarefa.arquivos ? tarefa.arquivos.map(arquivo => ({
                id: arquivo.id || undefined,  // Alterado de null para undefined
                nome: arquivo.nome || '',
                caminho: arquivo.caminho || '',
                tipo: arquivo.tipo || '',
                file: arquivo.file
            })) : [],
            novosArquivos: tarefa.novosArquivos || [],
        },
        onSubmit: (values) => {
            const formattedValues = {
                ...values 
            };
            onSubmit(formattedValues);
        },
        enableReinitialize: true,
        validationSchema: validationScheme
    });

    console.log('tezxtefsdfds')

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(event.target.files || []);
          if (!files.length) return; // Se não houver arquivos, não faz nada
      
          // Criando objetos para os arquivos válidos
          const novosArquivos: Arquivo[] = files.map(file => ({
              id: undefined, // Arquivo ainda não salvo
              tempId: uuidv4(), // Gerando um tempId único
              nome: file.name,
              tipo: file.type,
              caminho: '',
              file,
              status: 'Pronto para envio', // Status automático
          }));
      
          // Atualiza o campo 'arquivos' no formik
          formik.setFieldValue('arquivos', [...(formik.values?.arquivos || []), ...novosArquivos]);
      };
          
      const handleRemove = (tempId: string) => {
          formik.setFieldValue(
              'arquivos',
              (formik.values?.arquivos ?? []).filter(file => file.tempId !== tempId)
          );
      };
    
      const carregarMidia = async (arquivo: Arquivo) => {
          if (arquivo.tipo.startsWith("video/")) {
              return mediaService.carregarVideo(arquivo.caminho);
          }
          if (arquivo.tipo.startsWith("image/")) {
              return mediaService.carregarImagem(arquivo.caminho);
          }
          if (arquivo.tipo.startsWith("application/")) {
              return mediaService.carregarDocumento(arquivo.caminho);
          }
          return null;
      };
          
      
      const handleRemoveArquivos = (id: string) => {
          const arquivosAtuais = formik.values?.arquivos ?? [];
          const novoArquivos = arquivosAtuais.filter(arquivo => arquivo.id !== id);
      
          if (novoArquivos.length > 0) {
              const indexAtual = arquivosAtuais.findIndex(arquivo => arquivo.id === id);
              const proximoIndex = indexAtual >= novoArquivos.length ? novoArquivos.length - 1 : indexAtual;
              setIndiceAtual(proximoIndex); // Atualiza o índice antes de remover
          } else {
              setIndiceAtual(0); // Se não houver imagens restantes, resetar para 0
          }
      
          formik.setFieldValue("arquivos", novoArquivos);
      };
      
      const totalSizeMB = (formik.values.arquivos ?? [])
      .filter(file => file?.file && !file?.id) // Apenas arquivos novos e válidos
      .reduce((acc, file) => acc + (file?.file?.size ?? 0), 0) / (1024 * 1024);
    
      const isTotalTooLarge = totalSizeMB > 350; // Verifica se passou de 500MB
    
      const hasLargeFile = (formik.values.arquivos ?? []).some(file => 
          file?.file && file.file.size / (1024 * 1024) > 100
      );// Verifica se cada arquivo passou de 100MB
      
    
      const handleRemoveAll = () => {
          formik.setFieldValue("arquivos", formik.values.arquivos?.filter(file => file.id)); // Mantém apenas arquivos já enviados
      };

      console.log(formik.values.arquivos?.length)

    return (
        <div className="modal is-active">
          <div className="modal-background" onClick={fechar}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{formik.values.titulo}</p>
              <button
                className="delete"
                aria-label="close"
                onClick={fechar}
              ></button>
            </header>
            <form onSubmit={formik.handleSubmit}>
                <section className="modal-card-body">
                    <div className="columns">
                        <Input
                            id="prioridade"
                            label="Prioridade:"
                            value={formik.values.prioridade || ''}
                            columnClasses="column is-half"
                            onChange={formik.handleChange}
                            className={`input`}
                            autoComplete="off"
                            disabled
                            type='text'
                        />
                        <div className="column is-half">
                            <label htmlFor="status" className="label">Status: *</label>
                            <div className={`control dropdown-${formik.values.status || 'default'}`} /* Adiciona classe dinâmica ao contêiner com um fallback */> 
                                <Dropdown
                                    id="status"
                                    name="status"
                                    value={formik.values.status}
                                    options={statusOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    autoComplete='off'
                                    onChange={(e) => formik.setFieldValue('status', e.value)}
                                    placeholder="Selecione o status"
                                    className={`w-full custom-dropdown-height editable-dropdown ${
                                        formik.errors.status && 'border border-red-500'}`}
                                    editable
                                    //disabled={!podeCadastrar}
                                />
                            </div>
                            {formik.errors.status && (
                                <p className="help is-danger">{formik.errors.status}</p>
                            )}
                        </div>
                    </div>
                    <div className="columns">
                        <Input
                            id="dataHoraAtividade"
                            label="Data Ínicio:"
                            value={formik.values.dataHoraAtividade || ''}
                            columnClasses="column is-one-third"
                            onChange={formik.handleChange}
                            className={`input`}
                            autoComplete="off"
                            disabled
                            type='datetime-local'
                        />
                    </div>
                    <div className="columns">
                        <Input
                            id="descricao"
                            label="Descrição:"
                            value={formik.values.descricao || ''}
                            columnClasses="column is-full"
                            onChange={formik.handleChange}
                            className={`input`}
                            autoComplete="off"
                            disabled
                            type='text'
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="observacoes" className="label">
                            Observações:
                        </label>
                        <textarea
                            className="textarea"
                            id="observacoes"
                            name="observacoes"
                            value={formik.values.observacoes || ''}
                            autoComplete='off'
                            placeholder="Digite as Observações"
                            onChange={formik.handleChange}
                            disabled
                        ></textarea>
                    </div>
                    <div className="columns">
                        <Input
                            id="local"
                            label="Local:"
                            value={formik.values.local || ''}
                            columnClasses="column is-full"
                            onChange={formik.handleChange}
                            className={`input`}
                            autoComplete="off"
                            disabled
                            type='text'
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="observacoes" className="label">
                            Observações do Serviço:
                        </label>
                        <textarea
                            className="textarea"
                            id="observacoesFuncionario"
                            name="observacoesFuncionario"
                            value={formik.values.observacoesFuncionario || ''}
                            autoComplete='off'
                            placeholder="Digite as Observações relacionada ao Serviço Prestado"
                            onChange={formik.handleChange}
                        ></textarea>
                    </div>
                    {/* <h4>Arquivos Vinculados</h4> */}
                          <Galleria
                              ref={galleria}
                              value={formik.values.arquivos?.filter(arquivo => arquivo.id)}
                              numVisible={5}
                              activeIndex={indiceAtual}
                              onItemChange={(e) => setIndiceAtual(e.index)}
                              circular
                              fullScreen
                              showItemNavigators
                              showThumbnails={false}
                              item={(arquivo) => (
                                  <TemplateImagem
                                      arquivo={arquivo}
                                      podeCadastrar={true}
                                      onRemoveArquivo={() => handleRemoveArquivos(arquivo.id ?? "")} // Agora remove corretamente
                                      carregarMidia={carregarMidia}
                                  />
                              )}
                              style={{ maxWidth: "50%" }}
                          />
                    
                          <div className="file-upload-container">
                              <label>Arquivos:</label>
                              <div className="upload-actions">  {/* Container flexível para botões */}
                                  <label className="choose-button">
                                      <i className="pi pi-plus"></i> Upload
                                      <input type="file" multiple onChange={handleFileChange} accept="image/*,video/mp4, application/*" hidden />
                                  </label>
                    
                                  {/* Botão Cancel (Remove Todos os Arquivos) */}
                                  <label className="cancel-button" onClick={handleRemoveAll}>
                                      <i className="pi pi-times"></i> Cancelar
                                  </label>
                                  
                                  {/* Botão "Show" agora como label */}
                                  <label 
                                    className={`show-button ${((tarefa.arquivos?.length ?? formik.values.arquivos?.length ?? 0) < 1) ? styles.disabled : ''}`} onClick={() => galleria.current?.show()}
                                  >
                                      <i className="pi pi-folder-open"></i> Show
                                  </label>
                    
                              </div>
                              {(formik.values.arquivos ?? []).filter(file => file?.file && !file?.id).length > 0 && (
                                <div className={styles.fileList}>
                                    {(formik.values.arquivos ?? [])
                                        .filter(file => file?.file && !file?.id) // Apenas arquivos novos com file definido
                                        .map((file) => {
                                            const fileSizeMB = file.file ? (file.file.size / (1024 * 1024)).toFixed(2) : "0.00"; // Converte para MB
                                            const isTooLarge = parseFloat(fileSizeMB) > 100; // Converte para número antes da comparação
                    
                                            return (
                                                <div key={file.tempId} className={`${styles.fileItem} ${isTooLarge ? styles.tooLarge : ''}`}>
                                                    {file.file && file.tipo?.startsWith('image') ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={URL.createObjectURL(file.file)} alt={file.nome} className={styles.thumbnail} />
                                                    ) : file.file && file.tipo?.startsWith('video') ? (
                                                        <video width="50" height="50" controls>
                                                            <source src={URL.createObjectURL(file.file)} type={file.tipo} />
                                                        </video>
                                                    ) : file.file && file.tipo?.startsWith('application/') ? (
                                                        <a href={URL.createObjectURL(file.file)} target="_blank" rel="noopener noreferrer">
                                                            Abrir {file.nome}
                                                        </a>
                                                    ): 
                                                    (
                                                        <span>{file.nome}</span>
                                                    )}
                    
                                                    <div className={styles.fileInfo}>
                                                        <span className={styles.fileName}>{file.nome} ({fileSizeMB} MB)</span>
                                                        {isTooLarge ? (
                                                            <span className={`${styles.status} ${styles.error}`}>Erro: Arquivo maior que 100MB</span>
                                                        ) : (
                                                            <span className={`${styles.status} ${styles.uploaded}`}>Pronto para envio</span>
                                                        )}
                                                    </div>
                    
                                                    <button onClick={() => handleRemove(file.tempId || '')} type='button' className={styles.removeButton}>❌</button>
                                                </div>
                                            );
                                    })}
                    
                                    {/* Exibição do tamanho total de todos os arquivos */}
                                    <div className={styles.totalSize}>
                                        <strong>Total:</strong> {totalSizeMB.toFixed(2)} MB
                                    </div>
                    
                                    {/* Exibir erro se o total ultrapassar 500MB */}
                                    {isTotalTooLarge && (
                                        <div className={`${styles.status} ${styles.error}`}>
                                            Erro: O total dos arquivos não pode ultrapassar 350MB!
                                        </div>
                                    )}
                    
                                    {/* Exibir erro caso o usuário tente adicionar mais de 7 arquivos */}
                                    {(formik.values.arquivos ?? []).filter(file => file?.file && !file?.id).length > 7 && (
                                        <div className={`${styles.status} ${styles.error}`}>
                                            Erro: Você pode enviar no máximo 7 arquivos!
                                        </div>
                                    )}
                                </div>
                              )}
                          </div>
                </section>
                <footer className="modal-card-foot">
                    <div className="field is-grouped">
                        <ButtonType 
                            label={formik.values.id ? 'Atualizar' : 'Salvar'}
                            className='button is-link'
                            type="submit"
                            style={{ padding: '10px 20px', fontSize: '1rem' }}
                            disabled={
                            hasLargeFile ||
                            !formik.dirty ||
                            !formik.isValid
                            }
                        />
                        <ButtonType 
                            label={'Fechar'}
                            type="button"
                            className='button'
                            style={{ padding: '10px 20px', fontSize: '1rem' }}
                            onClick={fechar}
                        />
                    </div>
                </footer>
            </form>
          </div>
        </div>
    );
};
