'use strict';



const EASY              =   [ 9,  9,  10];
const MEDIUM            =   [16, 16,  40];
const HARD              =   [16, 30, 100];

const SOUND_SUCCESS     =   new Audio('sounds\\success.wav');
const SOUND_ERROR       =   new Audio('sounds\\error.wav');
const SOUND_VICTORY     =   new Audio('sounds\\victory.wav');
const SOUND_EXPLOSION   =   new Audio('sounds\\explosion.wav');




/**
 * Retrieves the query parameter from the URL and returns
 * the default values, based on the retrieved one.
 *
 * @returns {number[]} array composed by the number of rows, number
 *          of columns and the number of mines, of the board
 */
function getValues() {
    switch (new URLSearchParams(location.search).get('value')) {
        case '0': return EASY;
        case '1': return MEDIUM;
        case '2': return HARD;
    }
}


/**
 * Creates the minesweeper board.
 *
 * @param rowsNumber number of rows of the board
 * @param columnsNumber number of columns of the board
 * @returns {*[]} tiles of the board
 */
function createBoard(rowsNumber, columnsNumber) {
    let board = document.createElement('table');
    board.id = 'board';
    document.getElementById('board-container').appendChild(board);

    let rows = [];
    for (let i = 0; i < rowsNumber; i++) {
        rows[i] = document.createElement('tr');
        board.appendChild(rows[i]);
    }

    let tiles = [];
    for (let i = 0; i < rowsNumber; i++) {
        tiles[i] = [];
        for (let j = 0; j < columnsNumber; j++) {
            tiles[i][j] = document.createElement('td');
            tiles[i][j].classList.add(...['hidden', 'empty', 'not-flagged']);
            rows[i].appendChild(tiles[i][j]);
        }
    }

    return tiles;
}


/**
 * Adds mines to the board.
 *
 * @param tiles tiles of the board
 * @param minesNumber number of mines to add to the board
 * @param rowsNumber number of rows of the board
 * @param columnsNumber number of columns of the board
 */
function addMines(tiles, minesNumber, rowsNumber, columnsNumber) {
    let x = [];
    let y = [];

    for (let i = 0; i < minesNumber; i++) {
        x[i] = Math.floor(Math.random() * columnsNumber);
        y[i] = Math.floor(Math.random() * rowsNumber);

        if (tiles[y[i]][x[i]].classList.contains('empty')) {
            let mine = document.createElement('span');
            mine.id = 'mine';
            mine.innerHTML = '💣';
            tiles[y[i]][x[i]].appendChild(mine);
            tiles[y[i]][x[i]].classList.replace('empty', 'mine');
        }
        else i--;
    }
}


/**
 * Reveals the clicked tile and eventually, also the adjacent ones of the board.
 *
 * @param tiles tiles of the board
 * @param row row of the tile to reveal
 * @param column column of the tile to reveal
 * @param rowsNumber number of rows of the board
 * @param columnsNumber number of columns of the board
 * @param minesNumber number of mines of the board
 */
function revealTile(tiles, row, column, rowsNumber, columnsNumber, minesNumber) {
    if (row < 0 || row >= rowsNumber || column < 0 || column >= columnsNumber
        || tiles[row][column].classList.contains('visible')
        || tiles[row][column].classList.contains('mine')
        || tiles[row][column].classList.contains('flagged')) return;

    if (tiles[row][column].classList.contains('not-flagged')) {
        tiles[row][column].classList.replace('hidden', 'visible');
        tiles[row][column].style.border = '1px solid transparent';
        tiles[row][column].style.backgroundColor = 'transparent';
        revealedNum++;
    }

    let mines;

    if (row === 0 && column === 0)
        mines = adjacentMines(tiles, row, column, 5, 7, 8);
    else if (row === 0 && column === columnsNumber - 1)
        mines = adjacentMines(tiles, row, column, 4, 6, 7);
    else if (row === rowsNumber - 1 && column === 0)
        mines = adjacentMines(tiles, row, column, 2, 3, 5);
    else if (row === rowsNumber - 1 && column === columnsNumber - 1)
        mines = adjacentMines(tiles, row, column, 1, 2, 4);
    else if (row === 0)
        mines = adjacentMines(tiles, row, column, 4, 5, 6, 7, 8);
    else if (row === rowsNumber - 1)
        mines = adjacentMines(tiles, row, column, 1, 2, 3, 4, 5);
    else if (column === 0)
        mines = adjacentMines(tiles, row, column, 2, 3, 5, 7, 8);
    else if (column === columnsNumber - 1)
        mines = adjacentMines(tiles, row, column, 1, 2, 4, 6, 7);
    else mines = adjacentMines(tiles, row, column, 1, 2, 3, 4, 5, 6, 7, 8);

    if (mines > 0 && tiles[row][column].classList.contains('not-flagged')) {
        let number = document.createElement('span');
        number.id = 'number';
        number.innerHTML = mines.toString();
        tiles[row][column].appendChild(number);
        tiles[row][column].classList.replace('empty', 'num' + mines);
    }
    else
        for (let r = row - 1; r <= row + 1; r++)
            for (let c = column - 1; c <= column + 1; c++) {
                if (r === row && c === column) continue;
                revealTile(tiles, r, c, rowsNumber, columnsNumber);
            }

    // if the number of revealed tiles is equal to the revealable ones, calls the victory function
    if (revealedNum === rowsNumber * columnsNumber - minesNumber)
        victory(tiles, rowsNumber, columnsNumber, minesNumber);
}


/**
 * Returns the number of adjacent mines of the given tile.
 *
 * @param tiles tiles of the board
 * @param row row of the tile to check
 * @param column column of the tile to check
 * @param positions specifiers of the tiles to check
 * @returns {number} number of adjacent mines of the given tile
 */
function adjacentMines(tiles, row, column, ...positions) {
    let minesNumber = 0;

    for (let k = 0; k < positions.length; k++) {

        switch (positions[k]) {
            case 1:
                if (tiles[row - 1][column - 1].classList.contains('mine'))
                    minesNumber++;
                break;
            case 2:
                if (tiles[row - 1][column].classList.contains('mine'))
                    minesNumber++;
                break;
            case 3:
                if (tiles[row - 1][column + 1].classList.contains('mine'))
                    minesNumber++;
                break;
            case 4:
                if (tiles[row][column - 1].classList.contains('mine'))
                    minesNumber++;
                break;
            case 5:
                if (tiles[row][column + 1].classList.contains('mine'))
                    minesNumber++;
                break;
            case 6:
                if (tiles[row + 1][column - 1].classList.contains('mine'))
                    minesNumber++;
                break;
            case 7:
                if (tiles[row + 1][column].classList.contains('mine'))
                    minesNumber++;
                break;
            case 8:
                if (tiles[row + 1][column + 1].classList.contains('mine'))
                    minesNumber++;
                break;
        }
    }

    return minesNumber;
}


/**
 * Shows a victory message.
 *
 * @param tiles tiles of the board
 * @param rowsNumber number of rows of the board
 * @param columnsNumber number of columns of the board
 */
function victory(tiles, rowsNumber, columnsNumber) {
    SOUND_VICTORY.play();

    for (let i = 0; i < rowsNumber; i++)
        for (let j = 0; j < columnsNumber; j++) {
            tiles[i][j].classList.replace('hidden', 'visible');

            if (tiles[i][j].classList.contains('mine')) {
                tiles[i][j].style.border = '1px solid #01449f';
                tiles[i][j].style.backgroundColor = '#011f44';

                if (tiles[i][j].classList.contains('mine') && tiles[i][j].classList.contains('not-flagged'))
                    tiles[i][j].querySelector('#mine').style.display = 'contents';
            }
        }

    let message = document.getElementById('message');
    message.innerHTML = 'VICTORY';
    message.style.letterSpacing = '0px';
    message.style.color = '#0166ff';
    document.getElementById('flags-number').innerHTML = '';
}


/**
 * Shows a defeat message.
 *
 * @param tiles tiles of the board
 * @param rowsNumber number of rows of the board
 * @param columnsNumber number of columns of the board
 */
function gameOver(tiles, rowsNumber, columnsNumber) {
    SOUND_EXPLOSION.play();

    for (let i = 0; i < rowsNumber; i++)
        for (let j = 0; j < columnsNumber; j++) {
            tiles[i][j].classList.replace('hidden', 'visible');

            if (tiles[i][j].classList.contains('mine')) {
                tiles[i][j].style.border = '1px solid #9f0101';
                tiles[i][j].style.backgroundColor = '#440101';
            }

            if (tiles[i][j].classList[1].includes('num') && tiles[i][j].classList.contains('not-flagged'))
                tiles[i][j].querySelector('#number').style.display = 'contents';
            else if (tiles[i][j].classList.contains('mine') && tiles[i][j].classList.contains('not-flagged'))
                tiles[i][j].querySelector('#mine').style.display = 'contents';
        }

    let message = document.getElementById('message');
    message.innerHTML = 'GAME OVER';
    message.style.letterSpacing = '0px';
    message.style.color = '#ff0101';
    document.getElementById('flags-number').innerHTML = '';
}




/* <----------------------------------------------------- MAIN -----------------------------------------------------> */
/* __________________________________________________________________________________________________________________ */


let restartButton = document.getElementById('restart');
restartButton.onclick = function() {
    // restarts the game by reloading the page
    location.reload();
};

let menuButton = document.getElementById('return-menu');
menuButton.onclick = function() {
    // redirects to the main menu, 'index.html'
    location.href = 'index.html';
};

let rowsNum, columnsNum, minesNum;

// if getValues function fails, sets the default values of the 'easy' difficulty
try {
    [rowsNum, columnsNum, minesNum] = getValues();
}
catch (e) {
    [rowsNum, columnsNum, minesNum] = EASY;
}

let flagsNum = minesNum;
var revealedNum = 0;

let flagsSpan = document.getElementById('flags-number');
flagsSpan.innerHTML = flagsNum;

let tiles = createBoard(rowsNum, columnsNum);
addMines(tiles, minesNum, rowsNum, columnsNum);


for (let i = 0; i < rowsNum; i++)
    for (let j = 0; j < columnsNum; j++) {


        tiles[i][j].addEventListener('click', function() {
            if (tiles[i][j].classList.contains('flagged')) {
                SOUND_ERROR.play();
                return;
            }

            if (tiles[i][j].classList.contains('mine'))
                gameOver(tiles, rowsNum, columnsNum);

            SOUND_SUCCESS.play();
            revealTile(tiles, i, j, rowsNum, columnsNum, minesNum);
        });


        tiles[i][j].addEventListener('contextmenu', function() {
            if (flagsNum > 0 && tiles[i][j].classList.contains('not-flagged')) {
                tiles[i][j].classList.replace('not-flagged', 'flagged');
                let flag = document.createElement('span');
                flag.id = 'flag';
                flag.innerHTML = '🚩';
                tiles[i][j].appendChild(flag);
                flagsSpan.innerHTML = (--flagsNum).toString();
                if (flagsNum <= 3)
                    flagsSpan.style.color = '#f8302e';
            }

            else if (tiles[i][j].classList.contains('flagged')) {
                tiles[i][j].classList.replace('flagged', 'not-flagged');
                tiles[i][j].querySelector('#flag').remove();
                flagsSpan.innerHTML = (++flagsNum).toString();
                if (flagsNum > 3)
                    flagsSpan.style.color = '#f1f1f1';
            }

            else SOUND_ERROR.play();
        });

    }
