"use client"
import { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { useDashboardService } from "@/app/services";
import { Layout } from "@/components/layout";
import { MESES } from "@/app/util/meses";
import { usePermissao } from "@/app/hooks/usePermissoes";
import React from "react";
import { Input } from "@/components/common";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DashboardTotaPorDia, DashboardTotaPorMesStatus } from "@/app/models/dashboard";

const Dashboard = () => {
  const dashboardService = useDashboardService();
  const [nextDashboard, setNextDashboard] = useState<string | null>(null);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [selectedCheckbox, setSelectedCheckbox] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [alertaData, setAlertaData] = useState<string>("");

  const handleTipoChange = (novoTipo: string) => {
    setNextDashboard(novoTipo);
    setSelectedButton(novoTipo);
  };

  const { podeCadastrar } = usePermissao("Dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fichasPorDia, setFichasPorDia] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pedidosPorDia, setPedidosPorDia] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [osmPorDia, setOsmPorDia] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fichasPorMesAno, setFichasPorMesAno] = useState<any[]>([]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pedidosPorMesAno, setPedidosPorMesAno] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [osmPorMesAno, setOsmPorMesAno] = useState<any[]>([]);

  // 🔹 Estados para as datas do filtro
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  useEffect(() => {
    setFichasPorDia([])
    setPedidosPorDia([])
    setOsmPorDia([])
    setFichasPorMesAno([])
    setPedidosPorMesAno([])
    setOsmPorMesAno([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedButton, selectedCheckbox]);


  const buscarPorDia = () => {
    if (!dataInicio || !dataFim) {
      alert("Selecione ambas as datas antes de pesquisar.");
      return;
    }
    setAlertaData("")
    if (!validarDatas(dataInicio, dataFim, selectedButton ?? '')) {
      setFichasPorDia([])
      setPedidosPorDia([])
      setOsmPorDia([])
      setAlertaData("O intervalo de datas não pode ser maior que 31 dias.")
      return;
    }

    // Convertendo as strings para objetos Date antes de enviar para o serviço
    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);
    // Filtrando os checkboxes marcados

    if(selectedCheckbox === 'fichaOrcamento'){
      dashboardService.getFichaPorDia(dataInicioDate, dataFimDate, selectedStatus).then(ret => setFichasPorDia(ret.data));
      console.log(fichasPorDia)
      setPedidosPorDia([])
      setOsmPorDia([])
    }
    else if(selectedCheckbox === 'pedidoOrcamento'){
      dashboardService.getPedidoPorDia(dataInicioDate, dataFimDate, selectedStatus).then(ret => setPedidosPorDia(ret.data));
      console.log(pedidosPorDia)
      setFichasPorDia([])
      setOsmPorDia([])
    }
    else if (selectedCheckbox === 'ordemServico'){
      dashboardService.getOsmPorDia(dataInicioDate, dataFimDate, selectedStatus).then(ret => setOsmPorDia(ret.data));
      console.log(osmPorDia)
      setFichasPorDia([])
      setPedidosPorDia([])
    }
  };

  const buscarPorMesAno = () => {
    if (!dataInicio || !dataFim) {
      alert("Selecione ambas as datas antes de pesquisar.");
      return;
    }
    setAlertaData("")
    if (!validarDatas(dataInicio, dataFim, selectedButton ?? '')) {
      //setFichasComPedidoPorDia([])
      setFichasPorMesAno([])
      setPedidosPorMesAno([])
      setOsmPorMesAno([])
      setAlertaData("O intervalo de datas não pode ser maior que um ano.")
      //alert("O intervalo de datas não pode ser maior que 31 dias.");
      return;
    }

    // Convertendo as strings para objetos Date antes de enviar para o serviço
    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);
    // Filtrando os checkboxes marcados

    setFichasPorDia([])
    setPedidosPorDia([])
    setOsmPorDia([])

    if(selectedCheckbox === 'fichaOrcamento'){
      dashboardService.getFichaPorMesStatus(dataInicioDate, dataFimDate, selectedStatus).then(ret => setFichasPorMesAno(ret.data));
      console.log(fichasPorDia)
      setPedidosPorMesAno([])
      setOsmPorMesAno([])
    }
    else if(selectedCheckbox === 'pedidoOrcamento'){
      dashboardService.getPedidoPorMesStatus(dataInicioDate, dataFimDate, selectedStatus).then(ret => setPedidosPorMesAno(ret.data));
      console.log(pedidosPorDia)
      setFichasPorMesAno([])
      setOsmPorMesAno([])
    }
    else if (selectedCheckbox === 'ordemServico'){
      dashboardService.getOsmPorMesStatus(dataInicioDate, dataFimDate, selectedStatus).then(ret => setOsmPorMesAno(ret.data));
      console.log(osmPorDia)
      setFichasPorMesAno([])
      setPedidosPorMesAno([])
    }
  };

  const getChartFichaPorMesAno = (data: DashboardTotaPorMesStatus[]) => {
    return {
      labels: data?.map((d) => MESES[d.mes - 1]),
      datasets: [
        {
          type: "bar", 
          label: "Total de Fichas",
          data: data.map((d) => d.total),
          backgroundColor: selectedStatus === 'Aberta' ? "rgb(29, 129, 3)" : selectedStatus === 'Encerrada' ? "rgb(0, 0, 0)" :
                           selectedStatus === 'Cancelada' ? "rgb(255, 21, 4)" : "rgb(214, 200, 7)",
          borderColor: selectedStatus === 'Aberta' ? "rgba(28, 129, 3, 0.59)" : selectedStatus === 'Encerrada' ? "rgba(0, 0, 0, 0.59)" :
                       selectedStatus === 'Cancelada' ? "rgba(255, 21, 4, 0.59)" : "rgba(214, 200, 7, 0.59)",
          borderWidth: 2,
        },
        {
          type: "line", // Linha conectando as barras de fichas
          label: "Evolução de Fichas",
          data: data.map((d) => d.total),
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  const getChartPedidoPorMesAno = (data: DashboardTotaPorMesStatus[]) => {
    return {
      labels: data?.map((d) => MESES[d.mes - 1]),
      datasets: [
        {
          type: "bar", 
          label: "Total de Pedidos",
          data: data.map((d) => d.total),
          backgroundColor: selectedStatus === 'Aberta' ? "rgb(29, 129, 3)" : selectedStatus === 'Encerrada' ? "rgb(0, 0, 0)" :
                           selectedStatus === 'Cancelada' ? "rgb(255, 21, 4)" : "rgb(214, 200, 7)",
          borderColor: selectedStatus === 'Aberta' ? "rgba(28, 129, 3, 0.59)" : selectedStatus === 'Encerrada' ? "rgba(0, 0, 0, 0.59)" :
                       selectedStatus === 'Cancelada' ? "rgba(255, 21, 4, 0.59)" : "rgba(214, 200, 7, 0.59)",
          borderWidth: 2,
        },
        {
          type: "line", // Linha conectando as barras de fichas
          label: "Evolução de Pedidos",
          data: data.map((d) => d.total),
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  const getChartOsmPorMesAno = (data: DashboardTotaPorMesStatus[]) => {
    return {
      labels: data?.map((d) => MESES[d.mes - 1]),
      datasets: [
        {
          type: "bar", 
          label: "Total de Ordem Serviço",
          data: data.map((d) => d.total),
          backgroundColor: selectedStatus === 'Aberta' ? "rgb(29, 129, 3)" : selectedStatus === 'Encerrada' ? "rgb(0, 0, 0)" :
                           selectedStatus === 'Cancelada' ? "rgb(255, 21, 4)" : "rgb(214, 200, 7)",
          borderColor: selectedStatus === 'Aberta' ? "rgba(28, 129, 3, 0.59)" : selectedStatus === 'Encerrada' ? "rgba(0, 0, 0, 0.59)" :
                       selectedStatus === 'Cancelada' ? "rgba(255, 21, 4, 0.59)" : "rgba(214, 200, 7, 0.59)",
          borderWidth: 2,
        },
        {
          type: "line", // Linha conectando as barras de fichas
          label: "Evolução de Ordem Serviço",
          data: data.map((d) => d.total),
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };


  const validarDatas = (dataInicio: string, dataFim: string, selectedButton: string): boolean => {
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
  
    // Calcula a diferença em dias
    const diffEmMs = fim.getTime() - inicio.getTime();
    const diffEmDias = diffEmMs / (1000 * 60 * 60 * 24);

    if (selectedButton === "DIA") {
      
  
      if (diffEmDias > 31) {
        return false; // Falha na validação
      }
    }
    else if (selectedButton === "MESANO") {
      // Verifica se o intervalo passou de um ano
      const umAnoEmMs = 1000 * 60 * 60 * 24 * 365;
      if (diffEmMs > umAnoEmMs) {
        return false; // Falha na validação
      }
    }
    return true; // Validação passou
  };

  const getChartFichaPorDia = (data: DashboardTotaPorDia[]) => {
    return {
      labels: data.map((d) => d.dia), // Dias no eixo X
      datasets: [
        {
          type: "bar", 
          label: "Total de Fichas",
          data: data.map((d) => d.total),
          backgroundColor: selectedStatus === 'Aberta' ? "rgb(29, 129, 3)" : selectedStatus === 'Encerrada' ? "rgb(0, 0, 0)" :
                           selectedStatus === 'Cancelada' ? "rgb(255, 21, 4)" : "rgb(214, 200, 7)",
          borderColor: selectedStatus === 'Aberta' ? "rgba(28, 129, 3, 0.59)" : selectedStatus === 'Encerrada' ? "rgba(0, 0, 0, 0.59)" :
                       selectedStatus === 'Cancelada' ? "rgba(255, 21, 4, 0.59)" : selectedStatus === 'Em-Andamento' ? "rgba(214, 200, 7, 0.59)" : '',  
          borderWidth: 2,
        },
        {
          type: "line", // Linha conectando as barras de fichas
          label: "Evolução de Fichas",
          data: data.map((d) => d.total),
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  const getChartPedidoPorDia = (data: DashboardTotaPorDia[]) => {
    return {
      labels: data.map((d) => d.dia), // Dias no eixo X
      datasets: [
        {
          type: "bar", 
          label: "Total de Pedidos",
          data: data.map((d) => d.total),
          backgroundColor: selectedStatus === 'Aberta' ? "rgb(29, 129, 3)" : selectedStatus === 'Encerrada' ? "rgb(0, 0, 0)" :
                           selectedStatus === 'Cancelada' ? "rgb(255, 21, 4)" : "rgb(214, 200, 7)",
          borderColor: selectedStatus === 'Aberta' ? "rgba(28, 129, 3, 0.59)" : selectedStatus === 'Encerrada' ? "rgba(0, 0, 0, 0.59)" :
                       selectedStatus === 'Cancelada' ? "rgba(255, 21, 4, 0.59)" : "rgba(214, 200, 7, 0.59)",
          borderWidth: 2,
        },
        {
          type: "line", // Linha conectando as barras de fichas
          label: "Evolução de Pedidos",
          data: data.map((d) => d.total),
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };

  const getChartOsmPorDia = (data: DashboardTotaPorDia[]) => {
    return {
      labels: data.map((d) => d.dia), // Dias no eixo X
      datasets: [
        {
          type: "bar", 
          label: "Total de Ordem Serviço",
          data: data.map((d) => d.total),
          backgroundColor: selectedStatus === 'Aberta' ? "rgb(29, 129, 3)" : selectedStatus === 'Encerrada' ? "rgb(0, 0, 0)" :
                           selectedStatus === 'Cancelada' ? "rgb(255, 21, 4)" : "rgb(214, 200, 7)",
          borderColor: selectedStatus === 'Aberta' ? "rgba(28, 129, 3, 0.59)" : selectedStatus === 'Encerrada' ? "rgba(0, 0, 0, 0.59)" :
                       selectedStatus === 'Cancelada' ? "rgba(255, 21, 4, 0.59)" : selectedStatus === 'Em-Andamento' ? "rgba(214, 200, 7, 0.59)" : '',   
          borderWidth: 2,
        },
        {
          type: "line", // Linha conectando as barras de fichas
          label: "Evolução de Ordem Serviço",
          data: data.map((d) => d.total),
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  };
  
  const exportToPDF = () => {
    const input = document.getElementById("relatorio");
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        
        pdf.setFontSize(18);
        pdf.text("Relatório de Dashboard", 10, 10);
        pdf.setFontSize(12);
        pdf.text(`Data: ${currentDate}`, 10, 20);
        
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);
        pdf.save(`relatorio_dashboard_${currentDate}.pdf`);
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSelectedCheckbox(selectedCheckbox === value ? "" : value); // Alterei null para ""
  };

  const handleCheckboxChangeStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSelectedStatus(selectedStatus === value ? "" : value); // Alterei null para ""
  };

  return (
    <Layout titulo="Dashboard">
      <div className="buttons mb-4">
        <button
          type="button"
          className={`button ${selectedButton === "DIA" ? "is-primary" : ""}`}
          onClick={() => handleTipoChange("DIA")}
          disabled={!podeCadastrar}
        >
          Diário
        </button>
        <button
          type="button"
          className={`button ${selectedButton === "MESANO" ? "is-primary" : ""}`}
          onClick={() => handleTipoChange("MESANO")}
          disabled={!podeCadastrar}
        >
          Mês/Anual
        </button>
      </div>

      <div className="columns is-flex is-align-items-center">
        <Input
          id="dataInicio"
          name="dataInicio"
          label="Data Início:"
          value={dataInicio}
          columnClasses="column is-two-fifths"
          autoComplete="off"
          type="date"
          onChange={(e) => setDataInicio(e.target.value)}
        />

        <Input
          id="dataFim" 
          name="dataFim"
          label="Data Fim:"
          autoComplete="off"
          type="date"
          columnClasses="column is-two-fifths"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />

        <button 
          className="button is-info ml-2 mt-5"
          type="button"
          disabled={!podeCadastrar || dataInicio === "" || dataFim === "" || (selectedButton === "DIA" && selectedCheckbox === '')}
          onClick={nextDashboard === "DIA" ? buscarPorDia: buscarPorMesAno}
        >
          Pesquisar
        </button>
      </div>
      {(nextDashboard === "DIA" || nextDashboard === "MESANO")&& alertaData !== '' && (
        <p className="help is-danger is-size-6">{alertaData}</p> // Tamanho grande
      )}
      {nextDashboard === "DIA" ? (
        <>
          <div className="field">
            <label className="label">Selecione um tipo:</label>
            <div className="control is-flex is-flex-wrap-wrap" style={{ gap: "1rem" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="tipo"
                  value="fichaOrcamento"
                  onChange={handleCheckboxChange}
                  disabled={!!selectedCheckbox && selectedCheckbox !== "fichaOrcamento"}
                />
                Ficha de Orçamento
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="tipo"
                  value="pedidoOrcamento"
                  onChange={handleCheckboxChange}
                  disabled={!!selectedCheckbox && selectedCheckbox !== "pedidoOrcamento"}
                />
                Pedido de Orçamento
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="tipo"
                  value="ordemServico"
                  onChange={handleCheckboxChange}
                  disabled={!!selectedCheckbox && selectedCheckbox !== "ordemServico"}
                />
                Ordem Serviço Manutenção
              </label>
            </div>
          </div>
          <div className="field">
            <label className="label">Selecione um Status:</label>
            <div className="control is-flex is-flex-wrap-wrap" style={{ gap: "1rem" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Aberta"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Aberta"}
                />
                Aberta
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Em-Andamento"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Em-Andamento"}
                />
                Em Andamento
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Encerrada"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Encerrada"}
                />
                Encerrada
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Cancelada"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Cancelada"}
                />
                Cancelada
              </label>
            </div>
          </div>
          <div id="relatorio">
          {fichasPorDia.length > 0 && 
            <div className="col-12">
              <h3>Total de Fichas por Dia</h3>
              <Chart 
                type="bar" 
                data={getChartFichaPorDia(fichasPorDia)} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Dias do Mês' // Título do eixo X
                      },
                      ticks: {
                        autoSkip: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      min: 0,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: { display: true }
                  },
                  barPercentage: 0.5,
                  categoryPercentage: 0.6
                }}
                style={{ height: "400px" }}
              />
            </div>
          }
          {pedidosPorDia.length > 0 && 
            <div className="col-12">
              <h3>Total de Pedidos por Dia</h3>
              <Chart 
                type="bar" 
                data={getChartPedidoPorDia(pedidosPorDia)} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Dias do Mês' // Título do eixo X
                      },
                      ticks: {
                        autoSkip: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      min: 0,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: { display: true }
                  },
                  barPercentage: 0.5,
                  categoryPercentage: 0.6
                }}
                style={{ height: "400px" }}
              />
            </div>
          }
          {osmPorDia.length > 0 && 
            <div className="col-12">
              <h3>Total de Ordem Serviço por Dia</h3>
              <Chart 
                type="bar" 
                data={getChartOsmPorDia(osmPorDia)} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Dias do Mês' // Título do eixo X
                      },
                      ticks: {
                        autoSkip: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      min: 0,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: { display: true }
                  },
                  barPercentage: 0.5,
                  categoryPercentage: 0.6
                }}
                style={{ height: "400px" }}
              />
            </div>
          }
          </div>
        </>
      ) 
      : nextDashboard === "MESANO" ? (
        <>
          <div className="field">
            <label className="label">Selecione um tipo:</label>
            <div className="control is-flex is-flex-wrap-wrap" style={{ gap: "1rem" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="tipo"
                  value="fichaOrcamento"
                  onChange={handleCheckboxChange}
                  disabled={!!selectedCheckbox && selectedCheckbox !== "fichaOrcamento"}
                />
                Ficha de Orçamento
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="tipo"
                  value="pedidoOrcamento"
                  onChange={handleCheckboxChange}
                  disabled={!!selectedCheckbox && selectedCheckbox !== "pedidoOrcamento"}
                />
                Pedido de Orçamento
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="tipo"
                  value="ordemServico"
                  onChange={handleCheckboxChange}
                  disabled={!!selectedCheckbox && selectedCheckbox !== "ordemServico"}
                />
                Ordem Serviço Manutenção
              </label>
            </div>
          </div>
          <div className="field">
            <label className="label">Selecione um Status:</label>
            <div className="control is-flex is-flex-wrap-wrap" style={{ gap: "1rem" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Aberta"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Aberta"}
                />
                Aberta
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Em-Andamento"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Em-Andamento"}
                />
                Em Andamento
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Encerrada"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Encerrada"}
                />
                Encerrada
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="status"
                  value="Cancelada"
                  onChange={handleCheckboxChangeStatus}
                  disabled={!!selectedStatus && selectedStatus !== "Cancelada"}
                />
                Cancelada
              </label>
            </div>
          </div>
          <div id="relatorio">
          {fichasPorMesAno.length > 0 && 
            <div className="col-12">
              <h3>Total de Fichas por Mês</h3>
              <Chart 
                type="bar" 
                data={getChartFichaPorMesAno(fichasPorMesAno)} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Mês' // Título do eixo X
                      },
                      ticks: {
                        autoSkip: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      min: 0,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: { display: true }
                  },
                  barPercentage: 0.5,
                  categoryPercentage: 0.6
                }}
                style={{ height: "400px" }}
              />
            </div>
          }
          {pedidosPorMesAno.length > 0 && 
            <div className="col-12">
              <h3>Total de Pedidos por Mês</h3>
              <Chart 
                type="bar" 
                data={getChartPedidoPorMesAno(pedidosPorMesAno)} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Mês' // Título do eixo X
                      },
                      ticks: {
                        autoSkip: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      min: 0,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: { display: true }
                  },
                  barPercentage: 0.5,
                  categoryPercentage: 0.6
                }}
                style={{ height: "400px" }}
              />
            </div>
          }
          {osmPorMesAno.length > 0 && 
            <div className="col-12">
              <h3>Total de Ordem Serviço por Mês</h3>
              <Chart 
                type="bar" 
                data={getChartOsmPorMesAno(osmPorMesAno)} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Mês' // Título do eixo X
                      },
                      ticks: {
                        autoSkip: false,
                      }
                    },
                    y: {
                      beginAtZero: true,
                      min: 0,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: { display: true }
                  },
                  barPercentage: 0.5,
                  categoryPercentage: 0.6
                }}
                style={{ height: "400px" }}
              />
            </div>
          }
          </div>
        </>
      ):
       null}
      <button 
        className="button is-primary mb-4"
        type="button"
        onClick={exportToPDF}
      >
        Exportar para PDF
      </button>
    </Layout>
  );
};

export default Dashboard;
