const canvas = document.getElementById('canvas');
const drawingPanel = canvas.getContext('2d');

//key value != key code
const SPACE_BAR = ' ';
const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';
const ARROW_LEFT = 'ArrowLeft';
const ARROW_RIGHT = 'ArrowRight';


let timerID;
let frameRate = 1000;
let collided = false;
let gameOver = false;
let stopDraw = false;
let canMoveRight = true, canMoveLeft = true, canRotate = true;
let tetrominoQueue = [];
const TetrominoList = [OTetromino,STetromino,ZTetromino,TTetromino,LTetromino,JTetromino,BarTetromino]; // contains all Tetrominos types' constructor functions
//TODO: add drawing console to a new function that does all background drawing

let currentTetromino;

let playing = true;
//inner rect sizings
const innerBlockWidth = 10, innerBlockHeight = 10;
const innerBlockPadding = 2;
//outer rect sizings
const outerBlockPadding = 4; // for background and actual blocks
// padding on both ends (of both axis) needed to center the inner block
const outerBlockWidth = innerBlockWidth + innerBlockPadding * 2;
const outerBlockHeight = innerBlockHeight + innerBlockPadding * 2;
const outerBlockWidthWithPadding = outerBlockWidth + outerBlockPadding;

const outerBlockHeightWithPadding = outerBlockHeight + outerBlockPadding;
//background area sizings
const maxBackgroundRow = 21;

const maxBackgroundColumn = 17; // most possible blocks for background

//playable area sizings
const maxRow = 22, maxColumn = 10;
//create landedGrid
var gameBoard = new GameBoard(maxRow, maxColumn, canvas, drawingPanel);
let landedGrid = gameBoard.landedGrid; //createGrid(maxRow, maxColumn);

//FIXME: Remove when done. Inject some landed blocks for testing
// populateBottom();


// landedGrid[0][5].isOccupied = 1;
// landedGrid[1][5].isOccupied = 1;
// landedGrid[2][5].isOccupied = 1;
// landedGrid[3][5].isOccupied = 1;
// landedGrid[4][5].isOccupied = 1;
// landedGrid[5][5].isOccupied = 1;
// landedGrid[6][5].isOccupied = 1;
// landedGrid[7][5].isOccupied = 1;
// landedGrid[19][4].isOccupied = 0;

//
//offsets for background of the game
const offsetToCanvasTop = outerBlockHeightWithPadding * 3;

const offsetToCanvasLeft = canvas.width / 2 - (outerBlockWidthWithPadding * maxBackgroundColumn) / 2;
const offsetToBackgroundTop = offsetToCanvasTop - innerBlockHeight * 3 + innerBlockPadding * 2; //FIXME: change this when reworking the background stuff


const offsetToBackgroundLeft = offsetToCanvasLeft + 10;
//FIXME: Remove when done
//draw console with yellow-ish color
drawingPanel.fillStyle = '#efcc19';



drawingPanel.fillRect(0, 0, canvas.width, canvas.height);
gameBoard.drawBackground(outerBlockWidthWithPadding * maxBackgroundColumn, outerBlockWidthWithPadding * maxBackgroundRow);

gameBoard.drawBackgroundBlocks(offsetToBackgroundLeft, offsetToBackgroundTop);
// this function should return filled lines in an array for another function to clear

// let newTetromino = new OTetromino({ row: 0, column: 2 });
addTetromino();
currentTetromino = tetrominoQueue.pop();

drawFrame();

// function populateBottom() {
//     landedGrid[landedGrid.length - 1].forEach(column => {
//         column.isOccupied = 1;
//     })
// }

/**
 * This functions add a new random tetromino to the tetrominoQueue.
 */
function addTetromino() {
    let random  = Math.round(Math.random() * 6);

    let tetromino;
    tetromino = new TetrominoList[random]({row: 0, column: 4});
    tetrominoQueue.push(tetromino);
}

/**
 * This function remove the row with the specified indices.
 * @param rowArray The argument should contain an array of indices to remove
 * @return {number} The amount of rows that have been removed.
 */
function clearRow(rowArray) {
    rowArray.forEach(rowIndex => {
        landedGrid.splice(rowIndex,1);
    });
    console.log(rowArray);
    return rowArray.length;
}

function drawFrame() {
    //refresh the previous framebefore drawing the next tetromino
    gameBoard.drawBackground((outerBlockWidthWithPadding) * maxBackgroundColumn, (outerBlockWidthWithPadding) * maxBackgroundRow);
    gameBoard.drawBackgroundBlocks(offsetToBackgroundLeft, offsetToBackgroundTop);
    gameBoard.drawLandedBlocks(landedGrid);

    //TODO: Fetch current tetromino to be used in here if there's nothing
    checkLanded(currentTetromino, landedGrid);
    checkGameOver(timerID);

    //the next spawned tetromino will reset the status before continue
    if (!collided) {
        currentTetromino.dropSlow();
        drawTetromino(currentTetromino);
    } else {
        if(!stopDraw) {
            drawTetromino(currentTetromino); // draw the tetromino for the last time before moving on.
            saveShape(currentTetromino);
        }

        if(gameBoard.filledRow().length) { //if filledRow array has more than 1 element
            gameBoard.addRow(clearRow(gameBoard.filledRow()));
        }
        // newTetromino = new JTetromino({ row: 0, column: 2 });
        addTetromino();
        currentTetromino = tetrominoQueue.pop();

        //check once the tetromino landed to see if the game is over.
        //TODO: set canMoveFast to false once landed before the next tetromino

        // if(gameOver) {
        //     stopDraw = true; //FIXME: maybe switch this to detect game pausing and when to get next piece / use timerID to clear timeout
        // }
    }


    //check to see if the current tetromino has collided.
    //saving down the timerID to clear it out when needed to change drawing speed
    //FIXME: Maybe this is still useful for game pausing or just clear current timeout and set new one.

    if(!stopDraw) {
        timerID = setTimeout(drawFrame, frameRate);
    }

}

function drawFrameOnce() {
    //refresh the previous framebefore drawing the next tetromino
    gameBoard.drawBackground((outerBlockWidthWithPadding) * maxBackgroundColumn, (outerBlockWidthWithPadding) * maxBackgroundRow);
    gameBoard.drawBackgroundBlocks(offsetToBackgroundLeft, offsetToBackgroundTop);
    gameBoard.drawLandedBlocks(landedGrid);

    //the next spawned tetromino will reset the status before continue
    if (!collided) {
        //can't move left or right then skip
        drawTetromino(currentTetromino);
    } else {
        drawTetromino(currentTetromino);
        saveShape(currentTetromino);

    }
    //check to see if the current tetromino has collided.
    checkLanded(currentTetromino, landedGrid);
    checkGameOver(timerID);
}

function drawTetromino(tetromino) {
    //For every row of the tetromino shape
    for (let row = 0; row < tetromino.shape.length; row++) {
        //current row of tetromino on the landed grid
        let tetrominoRowPosition = row + tetromino.topLeft.row;

        //omit drawing on the 1st invisible(not drawn) row.
        if (tetrominoRowPosition === 1) continue;

        //for each column of the tetromino shape
        for (let column = 0; column < tetromino.shape[row].length; column++) {
            //current column of tetromino on the landed grid
            let tetrominoColumnPosition = column + tetromino.topLeft.column;

            //if tetromino's has a block in its shape
            if (tetromino.shape[row][column]) {
                // //TODO: if potential shape is not occupied then draw else skip
                try {
                    if(landedGrid[tetrominoRowPosition][tetrominoColumnPosition].x) { // accounts for the invisible rows on top, so don't draw if the tetromino is at the top edge
                        gameBoard.drawSingleBlock(drawingPanel, landedGrid[tetrominoRowPosition][tetrominoColumnPosition].x, landedGrid[tetrominoRowPosition][tetrominoColumnPosition].y, '#000');
                    }
                } catch (e) {
                    console.log(landedGrid);
                }
            }
        }
    }
}


/**
 * This function checks for collision of the passed in tetromino
 * It manipulates collided variable
 * 
 * @param {object} tetromino tetromino to check for collision
 * @param {array} landedGrid landed array to check for existing landed block
 *
 * 
 */
function checkLanded(tetromino, landedGrid) {
    //check if there's a block or bottom floor below the tetromino potential position
    //console.log(landedGrid);
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let column = 0; column < tetromino.shape[row].length; column++) {
            if (tetromino.shape[row][column]) {
                if (row + tetromino.potentialTopLeft.down.row < landedGrid.length) {
                    collided = landedGrid[row + tetromino.potentialTopLeft.down.row][column + tetromino.potentialTopLeft.down.column].isOccupied;
                    if (collided) return;
                } else {
                    collided = true;
                    return;
                }
            }
        }
    }
}

//TODO: The function is a little verbose, rework it if possible
function checkRight(tetromino, landedGrid) {
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let column = 0; column < tetromino.shape[row].length; column++) {
            // debugger;
            if (tetromino.shape[row][column]) {
                    if (landedGrid[row + tetromino.potentialTopLeft.right.row][column + tetromino.potentialTopLeft.right.column].isOccupied) {
                        canMoveRight = false; //  false if can't move
                        return;//immdediately return since this means the whole tetromino can't move
                        //not doing this will result in drawing overlaps since the other blocks
                        //of the current tetromino will reset the canMove... to be true
                    } else {
                        canMoveRight = true;
                    }
            }
        }
    }
}

//TODO: The function is a little verbose, rework it if possible
function checkLeft(tetromino, landedGrid) {
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let column = 0; column < tetromino.shape[row].length; column++) {
            if (tetromino.shape[row][column]) {
                if (landedGrid[row + tetromino.potentialTopLeft.left.row][column + tetromino.potentialTopLeft.left.column].isOccupied) {
                    canMoveLeft = false; //  false if can't move
                    return;//immdediately return since this means the whole tetromino can't move
                    //not doing this will result in drawing overlaps since the other blocks
                    //of the current tetromino will reset the canMove... to be true
                } else {
                    canMoveLeft = true;
                }
            }
        }
    }
}

function checkRotation(tetromino, landedGrid) {
    for (let row = 0; row < tetromino.potentialShape.length; row++) {
        for (let column = 0; column < tetromino.potentialShape[row].length; column++) {
            if (tetromino.potentialShape[row][column]) {
                if (landedGrid[row + tetromino.topLeft.row][column + tetromino.topLeft.column].isOccupied) {
                    canRotate = false; //  false if can't move
                    return;//immdediately return since this means the whole tetromino can't move
                    //not doing this will result in drawing overlaps since the other blocks
                    //of the current tetromino will reset the canMove... to be true
                } else {
                    canRotate = true;
                }
            }
        }
    }
}

/**
 * This funciton saves the passed in tetromino to the landed grid array.
 * @param {object} tetromino the tetromino to be saved
 */
function saveShape(tetromino) {
    //TODO: 
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let column = 0; column < tetromino.shape[row].length; column++) {
            if (tetromino.shape[row][column]) {
                landedGrid[row + tetromino.topLeft.row][column + tetromino.topLeft.column].isOccupied = tetromino.shape[row][column];
            }
        }
    }
}

function checkGameOver(timerID) { //TODO: make it dynamic and/or less hard coded stuff
    for (let row = 1; row < 2; row++) {
        for (let column = 0; column < landedGrid[row].length; column++) {
            if (landedGrid[row][column].isOccupied) stopDraw = true;
        }
    }
}

// ----------- EVENT LISTENERS AND HANDLERS--------------
window.addEventListener('keydown', keyDownHandler);

window.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    switch (e.key) {
        case SPACE_BAR: //FIXME: pressing space still looks like pressing arrowdown.
            //No need to redraw the shape at every row,use dropSlow() and checkLanded and not redraw until landed.
            clearTimeout(timerID);
            frameRate = 0;
            drawFrame();
            break;
        case ARROW_DOWN: //TODO: maybe add a variable to keep check of when space bar is hit
            clearTimeout(timerID);
            frameRate = 50;
            if(!stopDraw) {
                drawFrame();
            }
            break;
        case ARROW_UP: if (!collided) {
            checkRotation(currentTetromino, landedGrid);
            if (canRotate) {
                currentTetromino.rotate();
                drawFrameOnce();
            }
        }
            break;
        case ARROW_LEFT: checkLeft(currentTetromino, landedGrid); //TODO: maybe add a variable to keep check of when space bar is hit
            if (canMoveLeft) {
                if (!collided) {
                    currentTetromino.moveLeft();
                        drawFrameOnce();
                }
            }
            break;
        case ARROW_RIGHT:
            checkRight(currentTetromino, landedGrid);
            if (canMoveRight) {
                if (!collided) {
                    currentTetromino.moveRight();
                    drawFrameOnce();
                }
            }
            break;
    }
}

function keyUpHandler(e) {
    switch (e.key) {
        case SPACE_BAR:
            clearTimeout(timerID);
            frameRate = 1000;
            drawFrame();
            break;
        case ARROW_DOWN:
            clearTimeout(timerID);
            frameRate = 500;
            if (!stopDraw) {
                drawFrame();
            }
            break;
        case ARROW_UP:
            break;
        case ARROW_LEFT:
            break;
        case ARROW_RIGHT:
            break;
    }
}

