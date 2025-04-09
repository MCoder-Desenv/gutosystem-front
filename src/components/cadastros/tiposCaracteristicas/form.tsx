import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ButtonType } from "../../../components/common/button";
import { usePermissao } from "../../../app/hooks/usePermissoes";
import { TiposCaracteristicas } from "../../../app/models/tiposCaracteristicas";
import { Input } from "../../../components/common";
import { Checkbox } from "primereact/checkbox";
import { formatDateTimeToBackendToDate } from "../../../app/util/formatData";

interface TiposCaracteristicasFormProps {
  tipCar: TiposCaracteristicas;
  onSubmit: (tipCar: TiposCaracteristicas) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
  nome: Yup.string().trim().required(campoObrigatorio),
  status: Yup.string().required(campoObrigatorio),
});


export const TiposCaracteristicasForm: React.FC<TiposCaracteristicasFormProps> = ({ onSubmit, tipCar }) => {
  const router = useRouter();
  
  const { podeCadastrar } = usePermissao("Tipos Características");

  const formik = useFormik<TiposCaracteristicas>({
    initialValues: {
      id: tipCar.id || null,
      nome: tipCar.nome || null,
      status: tipCar.status || 'Ativo',
      dataCadastro: tipCar.dataCadastro || null
    },
    onSubmit: (values) => {
        const formattedValues = {
            ...values,
            nome: values.nome?.toUpperCase()
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
                    value={formatDateTimeToBackendToDate(formik.values.dataCadastro || '') || ''} />
            </div>   
        }

        <div className="columns">
            <Input
                id="nome"
                name='nome'
                columnClasses="column is-four-fifths"
                label="Nome *"
                value={formik.values.nome || ''}
                type="text"
                autoComplete='off'
                style={{ textTransform: 'uppercase' }} // Garante que o texto seja exibido em maiúsculas
                onChange={formik.handleChange}
                placeholder="Digite o nome do Tipo Caracteristica"
                erro={formik.errors.nome}
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
                onClick={() => router.push("/consultas/tiposCaracteristicas")}
            />
        </div>
    </form>
  );
};
