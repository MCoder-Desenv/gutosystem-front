'use client'
import { useEffect, useState } from 'react'
import { Calendario, Evento } from '../../common/calendario'
import { Layout } from "../../../components/layout"
import { Tarefa } from "../../../app/models/tarefa";
import { useTarefaService } from "../../../app/services"
import { TarefaModalForm } from './modalForm';

export const CalendarioView: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const service = useTarefaService()

  useEffect(() => {
    console.log('teste de UseEffect')
    service.carregarTarefasPorFuncionario(1310)
      .then(res => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tarefasOrdenadas = [...res.data].sort((a: any, b: any) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
        // Converte para eventos com duração fixa de 1 hora
      const dadosConvertidos: Evento[] = tarefasOrdenadas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((tarefa: any) => tarefa.dataHora)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((tarefa: any) => {
        const inicio = new Date(tarefa.dataHora)
        const fim = new Date(inicio.getTime() + 60 * 60 * 1000) // +1 hora

            return {
              id: tarefa.id,
              title: tarefa.titulo,
              prioridade: tarefa.prioridade,
              start: inicio,
              end: fim,
            }
          })

        setEventos(dadosConvertidos)
      })
      .catch(err => console.error('Erro ao buscar tarefas:', err))
  }, [])

  const handleEventoClick = async (evento: Evento) => {
    try {
      const { data } = await service.carregarTarefa(evento.id)
      setTarefaSelecionada(data)
      setModalAberto(true)
    } catch (error) {
      console.error('Erro ao buscar detalhes da tarefa:', error)
    }
  }

  // const handleSubmit = (tar: Tarefa) => {
  //       console.log("oiiii")
  //       console.log("observacoesFuncionario: " + tar.observacoesFuncionario)
  // }

    const handleSubmit = async (tar: Tarefa) => {
      try {
          if (!tar.id) {
              console.warn("Tarefa sem ID, não é possível atualizar.");
              return;
          }

          // Apenas os campos permitidos (não precisa comparar com tarefaOriginal)
          const updates: Record<string, unknown> = {
              observacoesFuncionario: tar.observacoesFuncionario,
              status: tar.status,
          };

          // Se tiver arquivos, separamos os mantidos e novos
          const arquivosMantidos = (tar.arquivos ?? []).filter(arq => arq.id);
          const novosArquivos = (tar.arquivos ?? []).filter(arq => arq.file);

          const idsArquivosMantidos = arquivosMantidos.map(arq => Number(arq.id));
          const arquivos = novosArquivos.map(arq => arq.file!) as File[];

          const resposta = await service.atualizarParcial(
              tar.id,
              updates,
              idsArquivosMantidos,
              arquivos.length > 0 ? arquivos : undefined
          );

          console.log("Atualização bem-sucedida", resposta);
      } catch (err) {
          console.error("Erro ao atualizar tarefa:", err);
      }
  };

  return (
    <Layout titulo="Calendário">
      <Calendario
        eventos={eventos}
        onEventoClick={handleEventoClick}
      />

      {modalAberto && tarefaSelecionada && (
        <TarefaModalForm tarefa={tarefaSelecionada} onSubmit={handleSubmit} fechar={() => setModalAberto(false)} />

      )}
    </Layout>
  )
}
