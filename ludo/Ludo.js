import {
    BASE_POSITIONS,
    HOME_ENTRANCE,
    HOME_POSITIONS,
    PLAYERS,
    SAFE_POSITIONS,
    START_POSITIONS,
    STATE,
    TURNING_POINTS,
} from './constants.js';
import { UI } from './UI.js';

export class Ludo {
    currentPositions = {
        P1: [],
        P2: [],
        P3: [],
        P4: [],
    };

    _diceValue;
    get diceValue() {
        return this._diceValue;
    }
    set diceValue(value) {
        this._diceValue = value;

        UI.setDiceValue(value);
    }

    _turn;
    get turn() {
        return this._turn;
    }
    set turn(value) {
        this._turn = value;
        this.totalTurns++;
        UI.incrementTotalTurns(this.totalTurns);
        UI.setTurn(value, this.totalTurns);
    }

    _state;
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;

        if (value === STATE.DICE_NOT_ROLLED) {
            UI.enableDice();
            UI.unhighlightPieces();
        } else {
            UI.disableDice();
        }
    }

    gameMode;
    constructor(gameMode) {
        this.gameMode = parseInt(gameMode);

        console.log('Hello World! Lets play Ludo!');
        console.log('Game mode:', this.gameMode);

        this.listenDiceClick();
        this.listenResetClick();
        this.listenPieceClick();

        this.resetGame();

        this.totalTurns = 0;
        UI.incrementTotalTurns(this.totalTurns);
        UI.setTurn(0, this.totalTurns);

        // random moves
        // setInterval(() => {
        //     UI.randomMoves(this.diceValue, this.currentPositions);
        // }, 500);

        // this.diceValue = 1;
        // this.turn = 3;
        // this.setPiecePosition('P1', 0, 103);
        // this.setPiecePosition('P2', 0, 203);
        // this.setPiecePosition('P3', 0, 303);
        // this.setPiecePosition('P4', 0, 403);
        // document.querySelector('#dice-btn').click();
    }

    listenDiceClick() {
        UI.listenDiceClick(this.onDiceClick.bind(this));
    }

    onDiceClick() {
        this.diceValue = 1 + Math.floor(Math.random() * 6);
        // this.diceValue = 2;
        this.state = STATE.DICE_ROLLED;

        this.checkForEligiblePieces();
    }

    checkForEligiblePieces() {
        const player = PLAYERS[this.turn];

        // eligible pieces of given player
        let eligiblePieces;
        if (this.gameMode === 0) {
            eligiblePieces = this.getEligiblePieces(player);

            if (eligiblePieces.length) {
                // highlight the pieces
                UI.highlightPieces(player, eligiblePieces);
            } else {
                this.incrementTurn();
            }
        } else if (this.gameMode === 1) {
            eligiblePieces = [];
            PLAYERS.forEach((player) =>
                eligiblePieces.push(this.getEligiblePieces(player))
            );

            if (eligiblePieces.some(pieces => pieces.length)) {
                // highlight the pieces
                PLAYERS.forEach((player, id) => {
                    UI.highlightPieces(player, eligiblePieces[id]);
                    console.log(player, id);
                });
            } else {
                this.incrementTurn();
            }
        }
        console.log(eligiblePieces);
    }

    incrementTurn() {
        if (this.turn === 3) {
            this.turn = 0;
        } else {
            this.turn++;
        }
        this.state = STATE.DICE_NOT_ROLLED;
        // console.log(this.currentPositions);
    }

    getEligiblePieces(player) {
        return [0, 1, 2, 3].filter((piece) => {
            const currentPosition = this.currentPositions[player][piece];

            if (currentPosition === HOME_POSITIONS[player]) {
                return false;
            }

            if (
                BASE_POSITIONS[player].includes(currentPosition) &&
                this.diceValue !== 6
            ) {
                return false;
            }

            if (
                HOME_ENTRANCE[player].includes(currentPosition) &&
                this.diceValue > HOME_POSITIONS[player] - currentPosition
            ) {
                return false;
            }

            return true;
        });
    }

    listenResetClick() {
        UI.listenResetClick(this.resetGame.bind(this));
    }

    resetGame() {
        // if (confirm('Are you sure you want to reset this game')) {
        console.log('reset game');
        this.currentPositions = structuredClone(BASE_POSITIONS);

        PLAYERS.forEach((player) => {
            [0, 1, 2, 3].forEach((piece) => {
                this.setPiecePosition(
                    player,
                    piece,
                    this.currentPositions[player][piece]
                );
            });
        });

        this.turn = 0;
        this.state = STATE.DICE_NOT_ROLLED;
        // }
    }

    listenPieceClick() {
        UI.listenPieceClick(this.onPieceClick.bind(this));
    }

    onPieceClick(event) {
        const target = event.target;

        if (
            !target.classList.contains('player-piece') ||
            !target.classList.contains('highlight')
        ) {
            return;
        }
        console.log('piece clicked');

        const player = target.getAttribute('player-id');
        const piece = target.getAttribute('piece');
        this.handlePieceClick(player, piece);
    }

    handlePieceClick(player, piece) {
        console.log(player, piece);
        const currentPosition = this.currentPositions[player][piece];

        if (BASE_POSITIONS[player].includes(currentPosition)) {
            this.setPiecePosition(player, piece, START_POSITIONS[player]);
            this.state = STATE.DICE_NOT_ROLLED;
            return;
        }

        UI.unhighlightPieces();
        this.movePiece(player, piece, this.diceValue);
    }

    setPiecePosition(player, piece, newPosition) {
        this.currentPositions[player][piece] = newPosition;
        UI.setPiecePosition(player, piece, newPosition);
    }

    movePiece(player, piece, moveBy) {
        // this.setPiecePosition(player, piece, this.currentPositions[player][piece] + moveBy)
        const interval = setInterval(() => {
            this.incrementPiecePosition(player, piece);
            moveBy--;

            if (moveBy === 0) {
                clearInterval(interval);

                // check if player won
                if (this.hasPlayerWon(player)) {
                    alert(`Player: ${player} has won!`);
                    this.resetGame();
                    return;
                }

                const isKill = this.checkForKill(player, piece);
                const currentPosition = this.currentPositions[player][piece];

                if (
                    this.diceValue === 6 ||
                    isKill ||
                    currentPosition === HOME_POSITIONS[player]
                ) {
                    this.state = STATE.DICE_NOT_ROLLED;
                    return;
                }

                this.incrementTurn();
            }
        }, 200);
    }

    checkForKill(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        let isOpponentInPosition = [];
        for (let i = 1; i <= 4; i++) {
            if (`P${i}` != player) {
                isOpponentInPosition.push(
                    this.currentPositions[`P${i}`].some(
                        (pos) => pos === currentPosition
                    )
                );
            } else {
                isOpponentInPosition.push('');
            }
        }

        const opponent = `P${
            isOpponentInPosition.findIndex((value) => value) + 1
        }`;
        console.log('isOpponentInPosition', isOpponentInPosition);
        console.log(opponent);

        let kill = false;

        if (
            opponent == 'P1' ||
            opponent == 'P2' ||
            opponent == 'P3' ||
            opponent == 'P4'
        ) {
            [0, 1, 2, 3].forEach((piece) => {
                const opponentPosition = this.currentPositions[opponent][piece];

                if (
                    currentPosition === opponentPosition &&
                    !SAFE_POSITIONS.includes(currentPosition)
                ) {
                    this.setPiecePosition(
                        opponent,
                        piece,
                        BASE_POSITIONS[opponent][piece]
                    );
                    kill = true;
                }
            });
        }

        return kill;
    }

    hasPlayerWon(player) {
        return [0, 1, 2, 3].every(
            (piece) =>
                this.currentPositions[player][piece] === HOME_POSITIONS[player]
        );
    }

    incrementPiecePosition(player, piece) {
        this.setPiecePosition(
            player,
            piece,
            this.getIncrementedPosition(player, piece)
        );
    }

    getIncrementedPosition(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        if (currentPosition === TURNING_POINTS[player]) {
            return HOME_ENTRANCE[player][0];
        } else if (currentPosition === 51) {
            return 0;
        }
        return currentPosition + 1;
    }
}
