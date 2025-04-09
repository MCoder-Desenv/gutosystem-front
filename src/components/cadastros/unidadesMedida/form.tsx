import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ButtonType } from "../../common/button";
import { usePermissao } from "../../../app/hooks/usePermissoes";
import { UnidadeMedida } from "../../../app/models/unidadeMedida";
import { Input } from "../../common";
import { Checkbox } from "primereact/checkbox";

interface UnidadeMedidaFormProps {
    uniMed: UnidadeMedida;
  onSubmit: (uniMed: UnidadeMedida) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
  unidade: Yup.string().trim().required(campoObrigatorio),
  descricao: Yup.string().trim().required(campoObrigatorio),
  status: Yup.string().required(campoObrigatorio),
});


export const UnidadeMedidaForm: React.FC<UnidadeMedidaFormProps> = ({ onSubmit, uniMed }) => {
  const router = useRouter();
  
  const { podeCadastrar } = usePermissao("Unidade Medida");

  const formik = useFormik<UnidadeMedida>({
    initialValues: {
      id: uniMed.id || null,
      descricao: uniMed.descricao || null,
      unidade: uniMed.unidade || null,
      status: uniMed.status || 'Ativo'
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
            </div>   
        }

        <div className="columns">
            <Input
                id="unidade"
                name='unidade'
                columnClasses="column is-four-fifths"
                label="Unidade *"
                value={formik.values.unidade || ''}
                type="text"
                onChange={formik.handleChange}
                autoComplete="off"
                placeholder="Digite a Unidade de Medida"
                erro={formik.errors.unidade}
                disabled={!podeCadastrar}
            />
            <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor="status" style={{ marginRight: '8px' }}>
                    Status
                </label>
                <Checkbox
                    inputId="status"
                    name='status'
                    autoComplete='off'
                    checked={formik.values.status === 'Ativo'}
                    onChange={(e) => formik.setFieldValue("status", e.checked ? 'Ativo' : 'Inativo')}
                    disabled={!podeCadastrar}
                />
            </div>
        </div>

        <div className="columns">
            <Input
                id="descricao"
                name='descricao'
                columnClasses="column is-full"
                label="Descrição *"
                value={formik.values.descricao || ''}
                type="text"
                autoComplete="off"
                onChange={formik.handleChange}
                placeholder="Digite a Descrição da Unidade de Medida"
                erro={formik.errors.descricao}
                disabled={!podeCadastrar}
            />
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
                label={"Voltar (Tela de Consulta)"}
                className='button'
                onClick={() => router.push("/consultas/unidadesMedida")}
            />
        </div>
    </form>
  );
};
