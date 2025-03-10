"use client";
import { Funcao } from "../../../app/models/funcoes";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ButtonType } from "../../../components/common/button";
import GridComponent from "../../common/GridComponent";

interface FuncaoFormProps {
  funcoes: Funcao[];
  onSubmit: (funcao: Funcao[]) => void;
}

const campoObrigatorio = "Campo Obrigatório";

// Validação do array de funções
const validationScheme = Yup.object().shape({
  funcoes: Yup.array().of(
    Yup.object().shape({
      nome: Yup.string().required(campoObrigatorio), // Nome é obrigatório
      status: Yup.boolean().required(campoObrigatorio), // Status é obrigatório
    })
  ),
});

export const FuncoesForm: React.FC<FuncaoFormProps> = ({ onSubmit, funcoes }) => {

  const formik = useFormik({
    initialValues: {
      items: funcoes
    },
    onSubmit: (values) => {
      onSubmit(values.items);
    },
    enableReinitialize: true,
    validationSchema: validationScheme,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <GridComponent<Funcao>
          tituloBotaoParent={"Adicionar Função"}
          parentColumns={[
            { key: "nome", label: "Nome", type: "text" },
            { key: "status", label: "Status", type: "checkbox" },
          ]}
          data={formik.values.items.map((item) => ({
            ...item
          }))} 
          setData={(newData) => { 
            formik.setValues((prevValues) => ({
              ...prevValues,
              items: (typeof newData === "function" ? newData(prevValues.items) : newData).map((item) => ({
                ...item
              })),
            }));
          }}                     
          formik={formik}
        />
      <br />
      <div className="field is-grouped">
        <ButtonType
          label={"Salvar"}
          className="button is-link"
          type="submit"
          disabled={!formik.dirty || !formik.isValid} // Botão habilitado apenas se houver alterações e a validação estiver ok
        />
      </div>
    </form>
  );
};
