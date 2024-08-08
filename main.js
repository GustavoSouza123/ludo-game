import { Ludo } from './ludo/Ludo.js';

document.querySelectorAll('.mode').forEach((mode) => {
    mode.addEventListener('click', (e) => {
        const ludo = new Ludo(mode.getAttribute('mode'));
        document.querySelector('.choose-mode').style.display = 'none';
        document.querySelector('.ludo-container').style.display = 'block';
    });
});
