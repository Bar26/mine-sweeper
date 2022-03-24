'use strict'

var gMines = []
const NORMAL = '😊'
const LOOSE = '🤯'
const WIN = '😎'


function createBoard(size) {                    //DONE
    var board = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            row.push(cell)
        }
        board.push(row)
    }
    return board
}



function getRandomEmptyCellIdx(board) {        //DONE
    var emptyCellsIndx = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) emptyCellsIndx.push({ i, j })
        }
    }
    var randomIdx = Math.floor(Math.random() * emptyCellsIndx.length)
    var cellIdx = emptyCellsIndx[randomIdx]
    return cellIdx
}



function createMines(board, numMines) {
    var randomRowIdx = Math.floor(Math.random() * board.length)
    var randomColIdx = Math.floor(Math.random() * board.length)
    board[randomRowIdx][randomColIdx].isMine = true

    for (var i = 0; i < numMines - 1; i++) {
        var cellIdx = getRandomEmptyCellIdx(board)
        board[cellIdx.i][cellIdx.j].isMine = true

    }
}


function changeMineLocation(cell, elContent){
    cell.isMine = false
    elContent.innerHTML = `${cell.minesAroundCount}`
    var newMinePos = getRandomEmptyCellIdx(gBoard)
    var elNewMine = document.querySelector(`.cell-${newMinePos.i}-${newMinePos.j}`)
    gBoard[newMinePos.i][newMinePos.j].isMine = true
    var elNewContent = elNewMine.querySelector(`span.content`)
    elNewContent.innerHTML = MINE
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            for (var x = i - 1; x <= i + 1; x++) {
                if (x < 0 || x > board.length - 1) continue
                for (var y = j - 1; y <= j + 1; y++) {
                    if (y < 0 || y > board.length - 1) continue
                    if (x === i && y === j) continue
                    var currNeg = board[x][y]
                    if (currNeg.isMine) currCell.minesAroundCount++
                }

            }
        }
    }
}
function printMat(mat, selector) {

    var strHTML = '<table><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat.length; j++) {
            var currCell = mat[i][j]
            var cellContent
            if (mat[i][j].isMine) {
                cellContent = MINE
                gMines.push({ i, j })

            }
            else if (currCell.minesAroundCount) cellContent = currCell.minesAroundCount
            else cellContent = ''
            var className = 'cell cell-' + i + '-' + j;
            strHTML += `<td onclick="cellClicked(this,${i},${j})" class=" ${className}"> ${FLAG} <span class="content"> ${cellContent}</span </td>`
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;

    for (let i = 0; i < mat.length; i++) {
        for (let j = 0; j < mat.length; j++) {
            let cell = mat[i][j]
            let elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                rightclick(elCell, cell, i, j)
            }, false);
        }
    }


}


function rightclick(elcell, cell) {     //TODO
    if (cell.isShown) return
    var elFlag = elcell.querySelector('span.flag')
    gNumClicks++
    if (gNumClicks === 1) gTimeInterval = setInterval(timerCycle, 1000)
    if (cell.isMarked) {
        cell.isMarked = false
        elFlag.style.display = 'none'
        if (cell.isMine) {
            gCountMarked--
        }

    } else {
        cell.isMarked = true
        elFlag.style.display = 'block'
        if (cell.isMine) {
            gCountMarked++
            if (gCellsShown === gCellsCount && gCountMarked === gNumMines) {
                gIsWin = true
                gameOver()
            }
        }
    }

}



function showNegs(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > board.length - 1) continue
            if (i === cellI && j === cellJ) continue
            var neg = board[i][j]
            if (!neg.isShown) {
                neg.isShown = true
                gCellsShown++
                console.log(gCellsShown)
            }
            if (gCellsShown === gCellsCount && gCountMarked === gNumMines) {
                gIsWin = true
                gameOver()
            }
            var elNeg = document.querySelector(`.cell-${i}-${j}`)
            elNeg.classList.add('shown')
            var elContent = elNeg.querySelector("span.content")
            elContent.style.display = 'block'

        }
    }
}


function resetTimer() {
    gElTimer.innerHTML = '00:00';
}

function timerCycle() {
    gSec = parseInt(gSec);
    gMin = parseInt(gMin);

    gSec = gSec + 1;

    if (gSec === 60) {
        gMin = gMin + 1;
        gSec = 0;
    }

    if (gSec < 10 || gSec === 0) {
        gSec = '0' + gSec;
    }
    if (gMin < 10 || gMin === 0) {
        gMin = '0' + gMin;
    }

    gElTimer.innerHTML = gMin + ':' + gSec;
}


function resetLevel(){
    init(gSize,gNumMines)
}


// window.addEventListener('contextmenu', function (e) { 
//     console.log('hi')

//     e.preventDefault(); 
//   }, false);



function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}



function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

// function getRandomColor() {
//     var letters = '0123456789ABCDEF';
//     var color = '#';
//     for (var i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }



// function getRandomIntInclusive(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }


  // var elCells = document.querySelectorAll(`.noContextMenu`)           מבטל קליק ימני לכולם בבת אחת
    // for (var i = 0; i < elCells.length; i++) {
    //     elCells[i].addEventListener('contextmenu', function (e) {
    //         rightclick(elCells[i])
    //         e.preventDefault();
    //     }, false);
    // }

