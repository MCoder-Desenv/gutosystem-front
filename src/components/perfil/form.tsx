import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ButtonType } from "../common/button";
import { Input } from "../common/input"
import { Perfil } from "../../app/models/usuarios";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Ícones de olho


interface PerfilFormProps {
  perfil: Perfil;
  onSubmit: (perfil: Perfil) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
    name: Yup.string().trim().required(campoObrigatorio),
    senhaAnterior: Yup.string().trim()
        .nullable()
        .test("senhaAnterior", campoObrigatorio, function (value) {
        return !this.parent.senhaNova || !!value; // Se senhaNova estiver preenchida, senhaAnterior deve estar também
    }),
    senhaNova: Yup.string().trim()
        .nullable()
        .test("senhaNova", campoObrigatorio, function (value) {
        return !this.parent.senhaAnterior || !!value; // Se senhaAnterior estiver preenchida, senhaNova deve estar também
    }),
});

export const PerfilForm: React.FC<PerfilFormProps> = ({ onSubmit, perfil }) => {
  const router = useRouter();
  const [showSenhaAnterior, setShowSenhaAnterior] = useState(false);
  const [showSenhaNova, setShowSenhaNova] = useState(false);


  const formik = useFormik<Perfil>({
    initialValues: {
      id: perfil.id,
      email: perfil.email || null,
      name: perfil.name || null
    },
    onSubmit: (values, { resetForm }) => {
        const formattedValues = {
            ...values,
            senhaAnterior: values.senhaAnterior || null,
            senhaNova: values.senhaNova || null
        };
        
        onSubmit(formattedValues);
    
        // Após o envio, resetar os campos de senha para null
        resetForm({
            values: {
                ...values,
                senhaAnterior: null,
                senhaNova: null
            }
        });
    }
    ,
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
                    columnClasses="column is-2"
                    autoComplete="off"
                    disabled
                />
            </div>   
        }

        <div className="columns">
            <Input
                id="name"
                name='name'
                columnClasses="column is-half"
                label="Nome *"
                value={formik.values.name || ''}
                type="text"
                onChange={formik.handleChange}
                placeholder="Digite o nome"
                autoComplete="off"
            />
            <Input
                id="email"
                name='email'
                columnClasses="column is-half"
                label="Email *"
                value={formik.values.email || ''}
                type="text"
                autoComplete="off"
                disabled
                onChange={formik.handleChange}
                placeholder="Digite o email"
            />
        </div>

        <div className="columns">
            <Input
                id="senhaAnterior"
                name='senhaAnterior'
                columnClasses="column is-half"
                label="Senha anterior"
                value={formik.values.senhaAnterior || ''}
                type={showSenhaAnterior ? "text" : "password"}
                autoComplete="off"
                onChange={formik.handleChange}
                placeholder="Digite a Senha Anterior"
                iconRight={
                    <span onClick={() => setShowSenhaAnterior(!showSenhaAnterior)}>
                        {showSenhaAnterior ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                }
                erro={formik.errors.senhaAnterior}
            />
            <Input
                id="senhaNova"
                name='senhaNova'
                columnClasses="column is-half"
                label="Senha nova"
                type={showSenhaNova ? "text" : "password"}
                value={formik.values.senhaNova || ''}
                autoComplete="off"
                onChange={formik.handleChange}
                placeholder="Digite a Senha Nova"
                iconRight={
                    <span onClick={() => setShowSenhaNova(!showSenhaNova)}>
                        {showSenhaNova ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                }
                erro={formik.errors.senhaNova}
            />
        </div>

        <div className="field is-grouped">
            <ButtonType 
                label={formik.values.id ? 'Atualizar' : 'Salvar'}
                className='button is-link'
                type='submit'
                disabled={!formik.dirty || !formik.isValid} // Botão só habilita se houver alterações
            />
            <ButtonType 
                type="button"
                label={"Voltar (Tela de Consulta)"}
                className='button'
                onClick={() => router.push("/dashboard")}
            />
        </div>
    </form>
  );
};
