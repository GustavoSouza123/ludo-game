import { COORDINATES_MAP, PLAYERS, STEP_LENGTH } from './constants.js';

const diceButtonElement = document.querySelector('#dice-btn');
const playerPiecesElements = {
    P1: document.querySelectorAll('[player-id="P1"].player-piece'),
    P2: document.querySelectorAll('[player-id="P2"].player-piece'),
    P3: document.querySelectorAll('[player-id="P3"].player-piece'),
    P4: document.querySelectorAll('[player-id="P4"].player-piece'),
};
const totalTurnsElement = document.querySelector('.total-turns span');

export class UI {
    static listenDiceClick(callback) {
        diceButtonElement.addEventListener('click', callback);
        window.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                callback();
            }
        });
    }

    static listenResetClick(callback) {
        document
            .querySelector('button#reset-btn')
            .addEventListener('click', callback);
    }

    static listenPieceClick(callback) {
        document
            .querySelector('.player-pieces')
            .addEventListener('click', callback);
    }

    /**
     *
     * @param {string} player
     * @param {Number} piece
     * @param {Number} newPosition
     */
    static setPiecePosition(player, piece, newPosition) {
        if (
            !playerPiecesElements[player] ||
            !playerPiecesElements[player][piece]
        ) {
            console.error(
                `Player element of given player: ${player} and piece: ${piece} not found`
            );
            return;
        }

        const [x, y] = COORDINATES_MAP[newPosition];

        const pieceElement = playerPiecesElements[player][piece];
        pieceElement.style.top = y * STEP_LENGTH + '%';
        pieceElement.style.left = x * STEP_LENGTH + '%';
    }

    static setTurn(index, totalTurns) {
        if (index < 0 || index >= PLAYERS.length) {
            console.error('index out of bound!');
            return;
        }

        const player = PLAYERS[index];

        let lastPlayer =
            player === 'P1'
                ? 'P4'
                : player === 'P2'
                ? 'P1'
                : player === 'P3'
                ? 'P2'
                : 'P3';

        // Display player ID
        document.querySelector('.active-player span').innerText = player;
        document.querySelector('.last-player span').innerText =
            totalTurns == 0 ? '-' : lastPlayer;

        const lastPlayerBase = document.querySelector('.player-base.highlight');
        if (lastPlayerBase) {
            lastPlayerBase.classList.remove('highlight');
        }
        // highlight
        document
            .querySelector(`[player-id="${player}"].player-base`)
            .classList.add('highlight');
    }

    static enableDice() {
        diceButtonElement.removeAttribute('disabled');
    }

    static disableDice() {
        diceButtonElement.setAttribute('disabled', '');
    }

    /**
     *
     * @param {string} player
     * @param {Number[]} pieces
     */
    static highlightPieces(player, pieces) {
        pieces.forEach((piece) => {
            const pieceElement = playerPiecesElements[player][piece];
            pieceElement.classList.add('highlight');
        });
    }

    static unhighlightPieces() {
        document.querySelectorAll('.player-piece.highlight').forEach((ele) => {
            ele.classList.remove('highlight');
        });
    }

    static setDiceValue(value) {
        document.querySelector('.dice-value').innerText = value;
    }

    static incrementTotalTurns(value) {
        totalTurnsElement.innerHTML = value;
    }

    static randomMoves(diceValue, currentPositions) {
        const activePlayer = document.querySelector('.active-player span').innerText;

        const isPlayersOnBoard = currentPositions[activePlayer].map(pos => pos.toString().length < 3);
        const playerNotOnBoard = isPlayersOnBoard.findIndex(player => !player);
        let playerToClick;

        diceButtonElement.click();
        if(playerNotOnBoard >= 0) {
            if(diceValue === 6) {
                console.log('SIX')
                console.log('not on board', playerNotOnBoard);

                playerToClick = isPlayersOnBoard.findIndex(player => !player);
                playerPiecesElements[activePlayer][playerToClick].click();
            }
        } else {
            playerToClick = isPlayersOnBoard.findIndex(player => player);
            playerPiecesElements[activePlayer][playerToClick].click();
        }
        
        console.log(isPlayersOnBoard)
        // console.log(currentPositions)
    }
}

// UI.setPiecePosition('P1', 0, 0);
// UI.setTurn(0);
// UI.setTurn(2);

// UI.disableDice();
// UI.enableDice();
// UI.highlightPieces('P1', [0]);
// UI.unhighlightPieces();
// UI.setDiceValue(5);
