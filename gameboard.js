class GameBoard {
    constructor(maxRow, maxColumn, canvas, drawingPanel) {
        this._landedGrid = this.createGrid(maxRow, maxColumn);
        this.canvas = canvas;
        this.drawingPanel = drawingPanel;

        this.innerBlockWidth = 10;
        this.innerBlockHeight = 10;
        this.innerBlockPadding = 2;

        this.outerBlockPadding = 4; // for background and actual blocks

        this.outerBlockWidth = this.innerBlockWidth + this.innerBlockPadding * 2;
        this.outerBlockHeight = this.innerBlockHeight + this.innerBlockPadding * 2;
        this.outerBlockWidthWithPadding = this.outerBlockWidth + this.outerBlockPadding;

        this.outerBlockHeightWithPadding = this.outerBlockHeight + this.outerBlockPadding;

        this.offsetToCanvasTop = this.outerBlockHeightWithPadding * 3;
        this.offsetToCanvasLeft = this.canvas.width / 2 - (this.outerBlockWidthWithPadding * this.maxBackgroundColumn) / 2;
        this.offsetToBackgroundTop = this.offsetToCanvasTop - this.innerBlockHeight * 3 + this.innerBlockPadding * 2; //FIXME: change this when reworking the background stuff
        this.offsetToBackgroundLeft = this.offsetToCanvasLeft + 10;
    }

    get landedGrid() {
        return this._landedGrid;
    }

    createGrid(row, column) {
        const newArray = new Array(row).fill(0);
        for (let row = 0; row < newArray.length; row++) {
            newArray[row] = new Array(column);
    
        }
        for (let row = 0; row < newArray.length; row++) {
            for (let column = 0; column < newArray[row].length; column++) {
                newArray[row][column] = { x: 0, y: 0, isOccupied: 0 };
            }
        }
        return newArray;
    }

    addRow(count) {
        for(let row = 0; row < count; row++) {
            this._landedGrid.unshift(new Array(maxColumn));
        }
    
        for(let row = 0; row < count; row++) {
            for(let column = 0; column < this._landedGrid[row].length; column++) {
                this._landedGrid[row][column] = {x:0, y:0, isOccupied:0};
            }
        }
        this.drawBackgroundBlocks(offsetToBackgroundLeft,offsetToBackgroundTop);
        drawLandedBlocks(this._landedGrid);
    }

    filledRow() {
        let filledRow = [];
    
        //using label
        loop1: for (let row = this._landedGrid.length - 1; row > 1; row--) {
            if (!this._landedGrid[row][0]) continue;// if the first element of the row doesn't exist then skip to next row
    
            for (let column = 0; column < this._landedGrid[row].length; column++) {
                if (!this._landedGrid[row][column].isOccupied) continue loop1; // break out of the loop for this current row since it's not all filled
            }
            // at this point all block in the current row is filled. So add the current filled line in the array.
            filledRow.push(row);
            // }
            //
            // for(let row = this._landedGrid.length -1; row > 1; row--) {
            //     for(let column = 0 ; column < this._landedGrid[row].length; column++) {
            //         if(this._landedGrid[row][column] === 0) break;
            //
            //     }
            // }
            // console.log(filledRow);
        }
        return filledRow;
    }

    drawInnerRect(x, y, color) {
        this.drawingPanel.fillStyle = color;
        this.drawingPanel.fillRect(x, y, this.innerBlockWidth, this.innerBlockHeight);
    }

    drawOuterRect(x, y, color) {
        this.drawingPanel.strokeStyle = color;
        this.drawingPanel.strokeRect(x, y, this.innerBlockWidth, this.innerBlockHeight);
    }

    drawSingleBlock(x, y, color) {
        this.drawInnerRect(x + innerBlockPadding, y + innerBlockPadding, color);
        this.drawOuterRect(x, y, color);
    }

    drawLandedBlocks(landedGrid) {
        // for every row in the landedGrid array
        for (let row = 0; row < landedGrid.length; row++) {
            //for every column in the landedGrid array
            for (let column = 0; column < landedGrid[row].length; column++) {
                //if the element is occupied
                if (landedGrid[row][column].isOccupied) {
                    //then draw the block at that location
                    this.drawSingleBlock(landedGrid[row][column].x, landedGrid[row][column].y, '#000');
                }
            }
        }
    }

    drawBackgroundBlocks(offSetX, offSetY) {
        for (let row = 2; row < landedGrid.length; row++) { // setting row to 1 to omit the 1st row.
            for (let column = 0; column < landedGrid[row].length; column++) {
                this.drawSingleBlock(column * (outerBlockWidthWithPadding) + offSetX, row * (outerBlockHeightWithPadding) + offSetY, 'rgb(135,147,114)');
                landedGrid[row][column].x = column * (outerBlockWidthWithPadding) + offSetX;
                landedGrid[row][column].y = row * (outerBlockHeightWithPadding) + offSetY;
            }
        }
    }

    drawBackground(width, height) {
        this.drawInnerRect(this.offsetToCanvasLeft, this.offsetToCanvasTop, width, height, '#9ead86');
        this.drawOuterRect(this.offsetToCanvasLeft, this.offsetToCanvasTop, width, height, '#494536');
    }
}