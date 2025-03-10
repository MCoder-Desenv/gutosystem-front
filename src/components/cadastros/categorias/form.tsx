import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ButtonType } from "@/components/common/button";
import { usePermissao } from "@/app/hooks/usePermissoes";
import { Input } from "@/components/common"
import { Categoria } from "@/app/models/categorias";
import { formatDateToBackend } from "@/app/util/formatData";
import { Dropdown } from "primereact/dropdown";

interface CategoriasFormProps {
  categoria: Categoria;
  onSubmit: (categoria: Categoria) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
  nome: Yup.string().trim().required(campoObrigatorio),
  status: Yup.string().required(campoObrigatorio),
});


export const CategoriaForm: React.FC<CategoriasFormProps> = ({ onSubmit, categoria }) => {
  const router = useRouter();
  
  const { podeCadastrar } = usePermissao("Categorias");

  //Status
  const statusOptions = [
    { label: 'Ativo', value: 'Ativo', className: 'status-Ativo' },
    { label: 'Inativo', value: 'Inativo', className: 'status-Inativo' }
  ];

  const formik = useFormik<Categoria>({
    initialValues: {
      id: categoria.id || null,
      nome: categoria.nome || null,
      status: categoria.status || null,
      dataCadastro: categoria.dataCadastro || null
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

  return (
    <form onSubmit={formik.handleSubmit}>
        {formik.values.id &&
            <div className="columns">
                <Input
                    id="id"
                    name="id"
                    label="Código: *"
                    value={formik.values.id || ''}
                    style={{
                        fontWeight: "bold", 
                        border: "2px solid rgb(0, 0, 0)", // Borda preta para destaque
                        padding: "8px",
                        borderRadius: "5px"
                    }}
                    columnClasses="column is-half"
                    autoComplete="off"
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
                name='nome'
                columnClasses="column is-two-thirds "
                label="Nome *"
                value={formik.values.nome || ''}
                type="text"
                onChange={formik.handleChange}
                placeholder="Digite o nome da Categoria"
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

        <div className="field is-grouped">
            <ButtonType 
                label={formik.values.id ? 'Atualizar' : 'Salvar'}
                className='button is-link'
                type='submit'
                disabled={!formik.dirty || !formik.isValid || !podeCadastrar} // Botão só habilita se houver alterações
            />
            <ButtonType 
                type="button"
                label={"Voltar"}
                className='button'
                onClick={() => router.push("/consultas/categorias")}
            />
        </div>
    </form>
  );
};
