'use client';
import { Terceiro, TerceirosCaracteristicas, TerceirosEnderecos } from '../../../app/models/terceiros';
import { Input, InputCPF } from '../../../components';
import { Checkbox } from 'primereact/checkbox'; // Importando o Checkbox do PrimeReact
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { useEffect, useRef, useState } from 'react';
import { buscarCEP } from '../../../app/services/cep.service';
import { deleteFromArray, updateArray } from '../../../app/util/common';
import { TiposCaracteristicas } from '../../../app/models/tiposCaracteristicas';
import { useTerceiroService, useTipoCaracteristicaService } from '../../../app/services';
import VMasker from 'vanilla-masker';
import { ButtonType } from '../../../components/common/button';
import { usePermissao } from '../../../app/hooks/usePermissoes';
import { formatDateToBackend } from '../../../app/util/formatData';
import { Dropdown } from 'primereact/dropdown';


interface FuncionarioFormProps {
    funcionario: Terceiro;
    onSubmit: (funcionario: Terceiro) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
    nome: Yup.string().trim().required(campoObrigatorio),
    cpf: Yup.string().required(campoObrigatorio),
    dataNascimento: Yup.date().required(campoObrigatorio)
});

export const FuncionarioForm: React.FC<FuncionarioFormProps> = ({
    funcionario,
    onSubmit
}) => {
    const [enderecoDialog, setEnderecoDialog] = useState(false);
    const [currentEndereco, setCurrentEndereco] = useState<TerceirosEnderecos | null>(null);
    const [caracteristicaDialog, setCaracteristicaDialog] = useState(false);
    const [currentCaracteristica, setCurrentCaracteristica] = useState<TerceirosCaracteristicas | null>(null);
    const [erroTiposCaracteristicas, setErroTiposCaracteristicas] = useState('');

    const { podeCadastrar } = usePermissao("Funcionários");

    //Status
    const statusOptions = [
        { label: 'Ativo', value: 'Ativo', className: 'status-Ativo' },
        { label: 'Inativo', value: 'Inativo', className: 'status-Inativo' }
    ];

    //Deletar Caracteristica
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [caracteristicaToDelete, setCaracteristicaToDelete] = useState<TerceirosCaracteristicas | null>(null);
    const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);

    const [tipoCar, setTipoCar] = useState<TiposCaracteristicas[]>([]); // Define o tipo explicitamente
    
    const service = useTerceiroService();
    const servicetipoCar = useTipoCaracteristicaService();

    const cepInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    useEffect(() => {
        const carregarTipoCaracteristicas = async () => {
            try {
                const result = await servicetipoCar.findAllStatusList('Ativo');
                const tipoCarConvertido = result.map(tipCar => ({
                    ...tipCar,
                    tipo: String(tipCar.nome), // Converte `id` para string, se necessário
                }));
                setTipoCar(tipoCarConvertido);
                setErroTiposCaracteristicas('')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                setErroTiposCaracteristicas("Erro ao carregar Tipos:" + error?.message);
            }
        };
        carregarTipoCaracteristicas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Array vazio, significa que será chamado apenas uma vez ao montar o componente

    const formik = useFormik<Terceiro>({
        initialValues: {
            id: funcionario.id || '',
            nome: funcionario.nome || '',
            cpf: funcionario.cpf || '',
            dataCadastro: funcionario.dataCadastro || null,
            dataNascimento: funcionario.dataNascimento || null,
            tipoTerceiro: funcionario.tipoTerceiro || '1',
            status: funcionario.status || 'Ativo', // Define o valor padrão como "Ativo"
            caracteristicas: funcionario.caracteristicas,
            enderecos: funcionario.enderecos
        },
        onSubmit: (values) => {
            const formattedValues = {
                ...values,
                endereco: values.enderecos || [],
                caracteristicas: values.caracteristicas || [],
                tipoTerceiro: '1'
            };
            onSubmit(formattedValues);
        },
        enableReinitialize: true,
        validationSchema: validationScheme
    });

    // Endereço Handlers
    const openNewEndereco = () => {
        setCurrentEndereco({
            id: '',
            bairro: '',
            cep: '',
            endereco: '',
            numero: '',
            cidade: '',
            complemento: '',
            estado: '',
            pais: 'Brasil',
            status: 'Ativo',
            tipoEndereco: '',
            idTerceiro: formik.values.id,
            tempId: `temp-${Date.now()}`
        });
        setEnderecoDialog(true);
    };

    // Colocando o foco no primeiro campo do Dialog sempre que ele for aberto
    useEffect(() => {
        if (enderecoDialog && cepInputRef.current) {
            cepInputRef.current.focus(); // Coloca o foco no campo de CEP
        }
    }, [enderecoDialog]); // Executa sempre que o modal for aberto

    const hideEnderecoDialog = () => {
        setEnderecoDialog(false);
        setCurrentEndereco(null);
    };

    const saveEndereco = () => {
        if (currentEndereco?.cep && 
            currentEndereco?.endereco &&
            currentEndereco?.numero &&
            currentEndereco?.bairro &&
            currentEndereco?.cidade &&
            currentEndereco?.estado &&
            currentEndereco?.pais) {
    
            // Atualiza o array de endereços
            const updatedEnderecos = updateArray(formik.values.enderecos || [], currentEndereco);

            // Setando o valor atualizado no Formik
            formik.setFieldValue('enderecos', updatedEnderecos);
    
            setEnderecoDialog(false);
            setCurrentEndereco(null);
        }
    };   

    const editEndereco = (endereco: TerceirosEnderecos) => {
        setCurrentEndereco({ ...endereco });
        setEnderecoDialog(true);
    };
    

    // Característica Handlers
    const openNewCaracteristica = () => {
        setCurrentCaracteristica({
            id: '',
            tipo: '',
            descricao: '',
            idTerceiro: formik.values.id,
            tempId: `temp-${Date.now()}`
        });
        setCaracteristicaDialog(true);
    };

    const hideCaracteristicaDialog = () => {
        setCaracteristicaDialog(false);
        setCurrentCaracteristica(null);
    };

    const saveCaracteristica = () => {
        if (currentCaracteristica) {
            // Atualiza o array de características
            formik.setFieldValue(
                'caracteristicas',
                updateArray(formik.values.caracteristicas || [], currentCaracteristica)
            );
    
            setCaracteristicaDialog(false);
            setCurrentCaracteristica(null);
        }
    };
    
    // Função para abrir o diálogo de exclusão
    const confirmDeleteCaracteristica = (caracteristica: TerceirosCaracteristicas) => {
        setCaracteristicaToDelete(caracteristica);
        setShowDeleteDialog(true);
    };

    // Função para fechar o diálogo sem excluir
    const cancelDelete = () => {
        setCaracteristicaToDelete(null);
        setShowDeleteDialog(false);
    };

    // Função para confirmar a exclusão
    const confirmDelete = () => {
        if (caracteristicaToDelete) {
            deleteCaracteristica(caracteristicaToDelete);
        }
        setCaracteristicaToDelete(null);
        setShowDeleteDialog(false);
    };

    const deleteCaracteristica = (caracteristica: TerceirosCaracteristicas) => {
        if (caracteristica.id != null && caracteristica.id != '' && caracteristica.id != undefined ) {
            const updatedCaracteristicas = deleteFromArray(
                formik.values.caracteristicas || [],
                caracteristica
            );
            formik.setFieldValue('caracteristicas', updatedCaracteristicas);
            service.deletarCar(caracteristica.id)
            // Exibe o modal de sucesso
            setShowDeleteSuccessDialog(true);
        }
        else {
            const updatedCaracteristicas = deleteFromArray(
                formik.values.caracteristicas || [],
                caracteristica
            );
            formik.setFieldValue('caracteristicas', updatedCaracteristicas);
        }
    };
    
    const closeSuccessDialog = () => {
        setShowDeleteSuccessDialog(false);
    };

    const deleteEndereco = (endereco: TerceirosEnderecos) => {
        const updatedEnderecos = deleteFromArray(
            formik.values.enderecos || [],
            endereco
        );
        formik.setFieldValue('enderecos', updatedEnderecos);
    };

    const editCaracteristica = (caracteristica: TerceirosCaracteristicas) => {
        setCurrentCaracteristica({ ...caracteristica });
        setCaracteristicaDialog(true);
    };

    // Função para buscar o CEP e preencher os campos
    const buscarDadosPorCEP = async () => {
        if (!currentEndereco?.cep) {
            alert("Por favor, digite um CEP válido.");
            return;
        }

        try {
            const dadosCEP = await buscarCEP(currentEndereco.cep);
            setCurrentEndereco((prev) => ({
                ...prev,
                endereco: dadosCEP.logradouro || '',
                bairro: dadosCEP.bairro || '',
                cidade: dadosCEP.localidade || '',
                estado: dadosCEP.uf || ''
            }));
        } catch (error) {
            alert("Erro ao buscar informações do CEP. " + error);
        }
    };


    const formatarCEP = (valor: string): string => {
        return valor
            .replace(/\D/g, '') // Remove todos os caracteres que não sejam dígitos
            .replace(/^(\d{5})(\d)/, '$1-$2') // Insere o '-' após o quinto dígito
            .substring(0, 9); // Limita o tamanho a 9 caracteres
    };

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit();
            }} 
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Impede que o Enter acione algo indesejado
                }
            }}
        >
            {formik.values.id &&
                <div className="columns">
                    <Input
                        id="codigoFuncionario"
                        name="codigoFuncionario"
                        label="Código: *"
                        value={formik.values.id || ''}
                        columnClasses="column is-half"
                        autoComplete="off"
                        style={{
                            fontWeight: "bold", 
                            border: "2px solid rgb(0, 0, 0)", // Borda preta para destaque
                            padding: "8px",
                            borderRadius: "5px"
                        }}
                        disabled
                    />

                    <Input
                        id="dataCadastro" 
                        name="dataCadastro"
                        label="Data Cadastro: "
                        autoComplete="off" 
                        disabled
                        columnClasses="column is-half"
                        value={formatDateToBackend(formik.values.dataCadastro || '') || ''} />
                </div>   
            }
            <div className="columns">
                <Input
                    id="nome"
                    name="nome"
                    label="Nome: *"
                    value={formik.values.nome || ''}
                    columnClasses="column is-two-thirds"
                    onChange={formik.handleChange}
                    placeholder="Digite o Nome"
                    autoComplete="off"
                    erro={formik.errors.nome}
                    disabled={!podeCadastrar}
                />
                <div className="column">
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
                            className="w-full custom-dropdown-height"
                            disabled={!podeCadastrar}
                        />
                    </div>
                    {formik.errors.status && (
                        <p className="help is-danger">{formik.errors.status}</p>
                    )}
                </div>
            </div>
            <div className="columns">
                <InputCPF
                    id="cpf"
                    label="CPF: *"
                    value={formik.values.cpf || ''}
                    columnClasses="column is-half"
                    type="text"
                    onChange={formik.handleChange}
                    placeholder="Digite o CPF"
                    autoComplete="off"
                    erro={formik.errors.cpf}
                    disabled={!podeCadastrar}
                />
                <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    label="Data de Nascimento: "
                    value={formik.values.dataNascimento || ''}
                    columnClasses="column is-half"
                    onChange={formik.handleChange}
                    placeholder="Digite a Data de Nascimento"
                    autoComplete="off"
                    type="date"
                    erro={formik.errors.dataNascimento}
                    disabled={!podeCadastrar}
                />
            </div>

            <div className="table-container">
                <table className="table is-striped is-fullwidth">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center', width: '50px' }}>
                                <button
                                    type="button"
                                    className="button is-small is-primary"
                                    onClick={openNewEndereco}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            openNewEndereco(); // Aciona a busca ao pressionar Enter
                                        }
                                    }}
                                    style={{ borderRadius: '50%' }}
                                    disabled={!podeCadastrar}
                                >
                                    <span className="icon">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                </button>
                            </th>
                            <th>CEP</th>
                            <th>Endereço</th>
                            <th>Número</th>
                            <th>Bairro</th>
                            <th>Cidade</th>
                            <th>Estado</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(formik.values.enderecos || []).map((endereco, index, array) => {
                            // Criar chave única (CEP + Endereço + Número) sem considerar id ou tempId
                            const chave = `${endereco.cep?.toLowerCase()}|${endereco.endereco?.toLowerCase()}|${endereco.numero?.toLowerCase()}`;

                            // Contar quantas vezes essa chave aparece no array
                            const isDuplicated = array.filter(e => 
                                `${e.cep?.toLowerCase()}|${e.endereco?.toLowerCase()}|${e.numero?.toLowerCase()}` === chave
                            ).length > 1;

                            // Se for duplicado e não tiver ID, aplicar classe extra
                            const className = `${isDuplicated ? "linha-duplicada" : ""} ${isDuplicated && !endereco.id ? "linha-nao-salva" : ""}`;

                            return (
                                <tr key={endereco.id || endereco.tempId} className={className}>
                                    <td></td>
                                    <td>{endereco.cep}</td>
                                    <td>{endereco.endereco}</td>
                                    <td>{endereco.numero}</td>
                                    <td>{endereco.bairro}</td>
                                    <td>{endereco.cidade}</td>
                                    <td>{endereco.estado}</td>
                                    <td style={{ textAlign: 'start' }}>
                                        <input
                                            type="checkbox"
                                            checked={endereco.status === 'Ativo'}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="button is-warning is-small"
                                            onClick={() => editEndereco(endereco)}
                                        >
                                            {!podeCadastrar ? 'Visualizar' : 'Editar'}
                                        </button>
                                        {endereco.tempId != null && endereco.id == '' &&
                                            <button
                                                className="button is-danger is-small ml-2"
                                                onClick={() => deleteEndereco(endereco)}
                                                disabled={!podeCadastrar}
                                            >
                                                Remover
                                            </button>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {enderecoDialog && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={hideEnderecoDialog}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Endereço</p>
                            <button
                                className="delete"
                                aria-label="close"
                                type='button'
                                onClick={hideEnderecoDialog}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="field">
                                <label className="label">CEP</label>
                                <div className="control has-icons-right">
                                    <input
                                        className="input"
                                        type="text"
                                        value={currentEndereco?.cep || ''}
                                        ref={cepInputRef} // Referência ao campo de CEP
                                        autoComplete='off'
                                        onChange={(e) =>
                                            setCurrentEndereco({
                                                ...currentEndereco,
                                                cep: formatarCEP(e.target.value),
                                            })
                                        }
                                        placeholder="00000-000"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                buscarDadosPorCEP(); // Aciona a busca ao pressionar Enter
                                            }
                                        }}
                                        disabled={!podeCadastrar}
                                    />
                                    <span
                                        className="icon is-right is-clickable"
                                        onClick={buscarDadosPorCEP}
                                    >
                                        <i className="fas fa-search"></i>
                                    </span>
                                </div>
                            </div>
                            <div className="columns">
                                <Input
                                    id="enderecoEnd"
                                    label="Endereço: *"
                                    value={currentEndereco?.endereco || ''}
                                    columnClasses="column is-three-quarters"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            endereco: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o Endereço"
                                    autoComplete="off"
                                    erro={
                                        currentEndereco?.endereco === '' || currentEndereco?.endereco == null
                                            ? 'O Endereço é obrigatório.'
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                                <div className="column">
                                    <label className="label">Status</label>
                                    <div className="control">
                                        <Checkbox
                                            inputId="statusEnd"
                                            autoComplete='off'
                                            checked={currentEndereco?.status === 'Ativo'}
                                            onChange={(e) => 
                                                setCurrentEndereco({
                                                    ...currentEndereco,
                                                    status: e.checked ? 'Ativo' : 'Inativo',
                                                })
                                            }
                                            disabled={!podeCadastrar}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="columns">
                                <Input
                                    id="numeroEnd"
                                    label="Número: *"
                                    value={currentEndereco?.numero || ''}
                                    columnClasses="column is-half"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            numero: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o Número"
                                    autoComplete="off"
                                    erro={
                                        currentEndereco?.numero === '' || currentEndereco?.numero == null
                                            ? 'O Número é obrigatório.'
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                                <Input
                                    id="cidadeEnd"
                                    label="Cidade: *"
                                    value={currentEndereco?.cidade || ''}
                                    columnClasses="column is-half"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            cidade: e.target.value,
                                        })
                                    }
                                    placeholder="Digite a Cidade"
                                    autoComplete="off"
                                    erro={
                                        currentEndereco?.cidade === '' || currentEndereco?.cidade == null
                                            ? 'A Cidade é obrigatória.'
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                            </div>
                            <div className="columns">
                                <Input
                                    id="bairroEnd"
                                    label="Bairro: *"
                                    value={currentEndereco?.bairro || ''}
                                    columnClasses="column is-full"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            bairro: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o Bairro"
                                    autoComplete="off"
                                    erro={
                                        currentEndereco?.bairro === '' || currentEndereco?.bairro == null
                                            ? 'O Bairro é obrigatório.'
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                            </div>

                            <div className="columns">
                                <Input
                                    id="estadoEnd"
                                    label="Estado: *"
                                    value={currentEndereco?.estado || ''}
                                    columnClasses="column is-half"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            estado: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o Estado"
                                    autoComplete="off"
                                    erro={
                                        currentEndereco?.estado === '' || currentEndereco?.estado == null
                                            ? 'O Estado é obrigatório.'
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                                <Input
                                    id="paisEnd"
                                    label="País: *"
                                    value={currentEndereco?.pais || ''}
                                    columnClasses="column is-half"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            pais: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o País"
                                    autoComplete="off"
                                    erro={
                                        currentEndereco?.pais === '' || currentEndereco?.pais == null
                                            ? 'O País é obrigatório.'
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                            </div>
                            <div className="columns">
                                <Input
                                    id="complementoEnd"
                                    label="Complemento:"
                                    value={currentEndereco?.complemento || ''}
                                    columnClasses="column is-half"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            complemento: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o Complemento"
                                    autoComplete="off"
                                    disabled={!podeCadastrar}
                                />
                                <Input
                                    id="tipoEnderecoEnd"
                                    label="Tipo Endereço:"
                                    value={currentEndereco?.tipoEndereco || ''}
                                    columnClasses="column is-half"
                                    type="text"
                                    onChange={(e) =>
                                        setCurrentEndereco({
                                            ...currentEndereco,
                                            tipoEndereco: e.target.value,
                                        })
                                    }
                                    placeholder="Digite o Tipo de Endereço"
                                    autoComplete="off"
                                    disabled={!podeCadastrar}
                                />
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-success" onClick={saveEndereco} type='button' disabled={!podeCadastrar}>
                                Adicionar
                            </button>
                            <button className="button" onClick={hideEnderecoDialog} type='button' disabled={!podeCadastrar}>
                                Cancelar
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="table is-striped is-fullwidth">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center', width: '50px' }}>
                                <button
                                    type="button"
                                    className="button is-small is-primary"
                                    onClick={openNewCaracteristica}
                                    style={{ borderRadius: '50%' }}
                                    disabled={!podeCadastrar}
                                >
                                    <span className="icon">
                                        <i className="fas fa-plus"></i>
                                    </span>
                                </button>
                            </th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(formik.values.caracteristicas) &&
                            formik.values.caracteristicas.map((caracteristica, index, array) => {
                                // Criar chave única (tipo + descrição) sem considerar tempId ou id
                                const chave = `${caracteristica.tipo?.toLowerCase()}|${caracteristica.descricao?.toLowerCase()}`;

                                // Contar quantas vezes essa chave aparece no array
                                const isDuplicated = array.filter(c => 
                                    `${c.tipo?.toLowerCase()}|${c.descricao?.toLowerCase()}` === chave
                                ).length > 1;

                                // Se for duplicado e não tiver ID, aplicar classe extra
                                const className = `${isDuplicated ? "linha-duplicada" : ""} ${isDuplicated && !caracteristica.id ? "linha-nao-salva" : ""}`;

                                return (
                                    <tr 
                                        key={caracteristica.id || caracteristica.tempId} 
                                        className={className}
                                    >
                                        <td></td>
                                        <td>{caracteristica.tipo}</td>
                                        <td>{caracteristica.descricao}</td>
                                        <td>
                                            <button
                                                className="button is-warning is-small"
                                                onClick={() => editCaracteristica(caracteristica)}
                                            >
                                                {!podeCadastrar ? 'Visualizar' : 'Editar'}
                                            </button>
                                            <button
                                                className="button is-danger is-small ml-2"
                                                disabled={!podeCadastrar}
                                                onClick={() => caracteristica.id ?  
                                                    confirmDeleteCaracteristica(caracteristica) : deleteCaracteristica(caracteristica)}
                                            > 
                                                {caracteristica.id ? 'Excluir' : 'Remover'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {caracteristicaDialog && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={hideCaracteristicaDialog}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Informações Complementares</p>
                            <button
                                className="delete"
                                aria-label="close"
                                onClick={hideCaracteristicaDialog}
                                type='button'
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="columns">
                                <div className="column">
                                    <label htmlFor="tipoCar" className="label">Tipo: *</label>
                                    <div className="select is-fullwidth">
                                        <select
                                            id="tipoCar"
                                            value={currentCaracteristica?.tipo || ''}
                                            onChange={(e) => setCurrentCaracteristica({
                                                ...currentCaracteristica,
                                                tipo: e.target.value,
                                            }) }
                                            disabled={!podeCadastrar}
                                            >
                                            <option value="" disabled>Selecione um Tipo</option>
                                            {tipoCar.map((tipCar) => (
                                                <option key={tipCar.nome} value={tipCar.nome || ''}>
                                                {tipCar.nome}
                                                </option>
                                            ))}
                                        </select>
                                
                                        {currentCaracteristica?.tipo === '' || currentCaracteristica?.tipo == null
                                                    ? <p className="help is-danger">O Tipo é obrigatório.</p> :
                                                    erroTiposCaracteristicas !== '' ? <p className="help is-danger">{erroTiposCaracteristicas}</p>
                                                    : undefined
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="columns">
                                <Input
                                    id="descricaoCar"
                                    name="descricaoCar"
                                    label="Descrição: *"
                                    value={currentCaracteristica?.descricao || ''}
                                    columnClasses="column is-full"
                                    type="text"
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        const maskedValue = currentCaracteristica?.tipo === "TELEFONE"
                                            ? VMasker.toPattern(valor, "(99)9999-9999")
                                            : currentCaracteristica?.tipo === "CELULAR"
                                            ? VMasker.toPattern(valor, "(99)99999-9999")
                                            : valor;
                                        
                                        setCurrentCaracteristica({
                                            ...currentCaracteristica,
                                            descricao: maskedValue,
                                        });
                                    }}
                                    placeholder="Digite a Descrição"
                                    autoComplete="off"
                                    erro={
                                        !currentCaracteristica?.descricao 
                                            ? 'O Tipo é obrigatório.' 
                                            : undefined
                                    }
                                    disabled={!podeCadastrar}
                                />
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-success" onClick={saveCaracteristica} type='button' disabled={!podeCadastrar}>
                                Adicionar
                            </button>
                            <button className="button" onClick={hideCaracteristicaDialog} type='button' disabled={!podeCadastrar}>
                                Cancelar
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Modal de confirmação */}
            {showDeleteDialog && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={cancelDelete}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Confirmação</p>
                            <button
                                className="delete"
                                aria-label="close"
                                type='button'
                                onClick={cancelDelete}
                                disabled={!podeCadastrar}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <p>
                                Você tem certeza que deseja remover a característica{' '}
                                <strong>{caracteristicaToDelete?.descricao}</strong>?
                            </p>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-danger" onClick={confirmDelete} type='button' disabled={!podeCadastrar}>
                                Sim
                            </button>
                            <button className="button" onClick={cancelDelete} type='button' disabled={!podeCadastrar}>
                                Não
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Modal de sucesso */}
            {showDeleteSuccessDialog && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={closeSuccessDialog}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Sucesso</p>
                            <button
                                type='button'
                                className="delete"
                                aria-label="close"
                                onClick={closeSuccessDialog}
                                disabled={!podeCadastrar}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <p>Característica removida com sucesso!</p>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-primary" onClick={closeSuccessDialog} type='button' disabled={!podeCadastrar}>
                                OK
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <div className="field is-grouped">
                <ButtonType 
                    label={formik.values.id ? 'Atualizar' : 'Salvar'}
                    className='button is-link'
                    type='submit'
                    disabled={!formik.dirty || !formik.isValid || !podeCadastrar} // Botão só habilita se houver alterações
                    //onClick={() => formik.handleSubmit()}
                />
                <ButtonType 
                    type="button"
                    label={"Voltar"}
                    className='button'
                    onClick={() => router.push("/consultas/funcionarios")}
                /> 
            </div>
        </form>
    );
};
