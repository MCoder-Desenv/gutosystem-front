import { CategoriaProduto, Produto } from "@/app/models/produtos";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCategoriaService } from "@/app/services";
import { useRouter } from "next/navigation";
import { SelectGenerico } from "@/components/common/selectGenerico";
import { ButtonType } from "@/components/common/button";
import { useEffect, useMemo, useState } from "react";
import { usePermissao } from "@/app/hooks/usePermissoes";
import { Dropdown } from "primereact/dropdown";

interface ProdutosFormProps {
  produto: Produto;
  onSubmit: (produto: Produto) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
  descricao: Yup.string().trim().required(campoObrigatorio),
  categoria: Yup.object()
    .nullable()
    .test("not-empty", campoObrigatorio, (value) => {
      return value !== null && Object.keys(value).length > 0; // Verifica se o objeto não está vazio
    })
    .required(campoObrigatorio),
  status: Yup.string().required(campoObrigatorio),
});


export const ProdutosForm: React.FC<ProdutosFormProps> = ({ onSubmit, produto }) => {
  const serviceCategoria = useCategoriaService();
  const router = useRouter();

  //Status  
  const statusOptions = [
    { label: 'Ativo', value: 'Ativo', className: 'status-Ativo' },
    { label: 'Inativo', value: 'Inativo', className: 'status-Inativo' }
  ];
  
  const { podeCadastrar } = usePermissao("Produtos");

  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [erroCategorias, setErroCategorias] = useState('');

  useEffect(() => {
    const carregarCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const result = await serviceCategoria.findAllCategoriaProduto();
        setErroCategorias('')
        setCategorias(result.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setErroCategorias("Erro ao carregar categorias:" + error?.message);
      } finally {
        setLoadingCategorias(false);
        setErroCategorias('')
      }
    };
    
    carregarCategorias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Esse useEffect só roda uma vez ao montar o componente

  const formik = useFormik<Produto>({
    initialValues: {
      id: produto.id || '',
      descricao: produto.descricao || null,
      categoria: produto.categoria || null,
      status: produto.status || 'Ativo'
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

  const categoriaSelecionada = useMemo(() => {
    return formik.values.categoria && formik.values.categoria.id
      ? formik.values.categoria
      : null;
  }, [formik.values.categoria]); // Só atualiza se `categoria` mudar

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="columns">
        <SelectGenerico
          value={categoriaSelecionada}
          onChange={(categoria) => formik.setFieldValue("categoria", categoria)}
          items={categorias} // Passando os itens diretamente
          getLabel={(categoria) => `${categoria.id} - ${categoria.nome}`}
          getId={(categoria) => String(categoria.id)}
          label="Categoria"
          loading={loadingCategorias} // Adicionando estado de loading
          error={formik.errors?.categoria || erroCategorias}
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
        <div className="column">
          <label htmlFor="descricao" className="label">Nome do Produto: *</label>
            <input
              id="descricao"
              name="descricao"
              value={formik.values.descricao || ''}
              onChange={formik.handleChange}
              placeholder="Digite o nome do produto"
              className={`input ${formik.errors.descricao ? "is-danger" : ""}`}
              disabled={!podeCadastrar}
            />
            {formik.errors.descricao && (
              <p className="help is-danger">{formik.errors.descricao}</p>
            )}
        </div>
      </div>

      <div className="field is-grouped">
          <ButtonType 
              label={formik.values.id ? 'Atualizar' : 'Salvar'}
              className='button is-link'
              type='submit'
              disabled={!formik.dirty || !formik.isValid ||  !podeCadastrar} // Botão só habilita se houver alterações
          />
          <ButtonType 
              type="button"
              label={"Voltar"}
              className='button'
              onClick={() => router.push("/consultas/produtos")}
          />  
      </div>
    </form>
  );
};
