import './bootstrap';
import * as reservas from './modules/reservas/reservas';
import horas from './modules/reservas/horas';
import data from './modules/reservas/data';
import scrollButtons from './modules/scrollButtons';

function init() {
    scrollButtons();
    horas();
    data();

    document.getElementById('quantidade_cadeiras')
        ?.addEventListener('change', reservas.mostrarInputCustomizado);
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});
