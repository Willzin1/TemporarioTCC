import { jsPDF } from "jspdf";

import { token, urlApi } from "../global/globalVariables";
import createLoadingDiv from "../modules/utils/createLoadingDiv";

/**
 * Busca e renderiza dados de pratos mais favoritados no dashboard do administrador.
 * 
 * Esta função principal:
 * 1. Busca dados da API de pratos favoritados
 * 2. Organiza os dados por categoria de pratos
 * 3. Configura os botões de exportação
 * 4. Renderiza os gráficos para cada categoria
 * 
 * @async
 * @function favoriteDishes
 * @returns {Promise<void>}
 * @throws {Error} Se houver erro na requisição à API
 */
export default async function favoriteDishes() {
    const container = document.querySelector('.containerGerente');

    if (!container) return;

    const loadingDiv = createLoadingDiv(container, 'Buscando pratos favoritados...');

    try {
        const charts = document.querySelectorAll('.dishesChart');

        if (!charts.length) return;

        const response = await axios.get(`${urlApi}/favoritos/favoritados`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const dishesByCategory = {
            'Bebidas': [],
            'Cardápio Infantil': [],
            'Cardápio Principal': [],
            'Entradas': [],
            'Sobremesas': []
        };

        response.data.most_favorited.forEach(item => {
            const categoria = item.prato.categoria;
            const categoryMap = {
                'Bebidas': 'Bebidas',
                'Cardapio infantil': 'Cardápio Infantil',
                'Prato principal': 'Cardápio Principal',
                'Entradas': 'Entradas',
                'Sobremesas': 'Sobremesas'
            };

            const mappedCategory = categoryMap[categoria];
            if (mappedCategory && dishesByCategory[mappedCategory]) {
                dishesByCategory[mappedCategory].push(item);
            }
        });

       handleExportButton(dishesByCategory);

       handleCharts(charts, dishesByCategory);

    } catch (error) {
        toastr.error('Erro ao buscar pratos');
    } finally {
        loadingDiv.remove();
    }
}

/**
 * Cria um gráfico de barras para visualização dos pratos mais favoritados.
 *
 * @function createChart
 * @param {Array<Object>} data - Array de objetos contendo dados dos pratos
 * @param {Object} data[].prato - Informações do prato
 * @param {string} data[].prato.nome - Nome do prato
 * @param {number} data[].total_favoritos - Quantidade de vezes que o prato foi favoritado
 * @param {HTMLCanvasElement} canvas - Elemento canvas onde o gráfico será renderizado
 * @param {string} categoryTitle - Título da categoria para o gráfico
 * @returns {Chart} Instância do gráfico criado
 */
function createChart(data, canvas, categoryTitle) {
    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.map(item => item.prato.nome),
            datasets: [{
                label: 'Total de favoritos',
                data: data.map(item => item.total_favoritos),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `${categoryTitle} mais favoritados`,
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: Math.ceil(Math.max(...data.map(item => item.total_favoritos || 0)) / 5) || 1
                    }
                }
            }
        }
    });

    return chart;
}

/**
 * Gerencia a criação e renderização dos gráficos para cada categoria.
 *
 * @function handleCharts
 * @param {NodeListOf<HTMLCanvasElement>} charts - Lista de elementos canvas para os gráficos
 * @param {Object.<string, Array>} dishesByCategory - Dados dos pratos agrupados por categoria
 * @param {Array} dishesByCategory[].prato - Array de pratos para cada categoria
 */
function handleCharts(charts, dishesByCategory) {
    charts.forEach(chart => {
        const categoryTitle = chart.closest('.stats-item').querySelector('h2').textContent.trim();
        const categoryData = dishesByCategory[categoryTitle] || [];
        createChart(categoryData, chart, categoryTitle);
    });
}

/**
 * Configura os botões de exportação para cada categoria de pratos.
 *
 * @function handleExportButton
 * @param {Object.<string, Array>} dishesByCategory - Dados dos pratos agrupados por categoria
 * @param {Array} dishesByCategory[].prato - Array de pratos para cada categoria
 */
function handleExportButton(dishesByCategory) {
    const exportButtons = document.querySelectorAll('.export-button');

    exportButtons.forEach(button => {
        const categoryTitle = button.closest('.stats-item').querySelector('h2').textContent.trim();
        button.addEventListener('click', (e) => {
            e.preventDefault();
            exportCategoryData(dishesByCategory[categoryTitle], categoryTitle);
        });
    });
}

/**
 * Gera e faz download de um arquivo PDF contendo relatório dos pratos favoritados.
 *
 * O PDF gerado inclui:
 * - Título do relatório
 * - Data e hora de geração
 * - Tabela com nome do prato, total de favoritos e descrição
 * - Total de pratos ao final do documento
 *
 * @function exportCategoryData
 * @param {Array<Object>} data - Dados dos pratos a serem incluídos no relatório
 * @param {Object} data[].prato - Informações do prato
 * @param {string} data[].prato.nome - Nome do prato
 * @param {string} data[].prato.descricao - Descrição do prato
 * @param {number} data[].total_favoritos - Quantidade de favoritos do prato
 * @param {string} categoryTitle - Título da categoria para o relatório
 */
function exportCategoryData(data, categoryTitle) {
    const doc = new jsPDF();

    // Adiciona título
    doc.setFontSize(16);
    doc.text(`Relatório de ${categoryTitle} Mais Favoritados`, 15, 15);

    // Adiciona data
    doc.setFontSize(10);
    doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 15, 25);
    doc.text(`Horário de impressão: ${new Date().toLocaleTimeString('pt-BR')}`, 15, 30);

    // Adiciona cabeçalho da tabela
    doc.setFontSize(12);
    const headers = ['Nome do Prato', 'Total de Favoritos', 'Descrição'];
    let y = 40;

    // Estilização do cabeçalho
    doc.setFont('helvetica', 'bold');
    doc.text(headers[0], 15, y);
    doc.text(headers[1], 100, y);
    doc.text(headers[2], 140, y);

    // Adiciona conteúdo
    doc.setFont('helvetica', 'normal');
    data.forEach((item, index) => {
        y += 10;

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        let nome = item.prato.nome;
        let total = item.total_favoritos.toString();
        let descricao = item.prato.descricao;

        // Lida com descrição comprida
        if (descricao.length > 30) {
            descricao = descricao.substring(0, 27) + '...';
        }
        if (nome.length > 30) {
            nome = nome.substring(0, 27) + '...';
        }

        doc.text(nome, 15, y);
        doc.text(total, 100, y);
        doc.text(descricao, 140, y);
    });

    // Adiciona footer com total de pratos
    doc.setFont('helvetica', 'bold');
    y += 20;
    if (y > 270) {
        doc.addPage();
        y = 20;
    }
    doc.text(`Total de pratos: ${data.length}`, 15, y);

    // Salva documento PDF
    doc.save(`relatorio_${categoryTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}
