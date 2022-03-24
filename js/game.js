'use strict'

const MINE = `<img src="img/bomb.jpg" />`
const FLAG = `<span class="flag"><img src="img/flag.jpg" /></span>`

//FOR NOW
var gNumMines
var gSize
var gElTimer = document.querySelector('.timer')
var gTimeInterval
var gBoard
var gSec
var gMin
var gCountExploded
var gCellsCount = gSize ** 2 - gNumMines
var gCellsShown
var gCountMarked
var gIsWin
var gNumClicks
var gIsHintOn
var gElSmiley = document.querySelector('.smiley')
var gElLifes = document.querySelector('.heart span')
var elSafeCount = document.querySelector('span.safeCount')
var gSafeClicks
//


function init(size = 4, numMines = 2) {

    if (gTimeInterval) clearInterval(gTimeInterval)
    console.log(size)

    if (size === 4) gElLifes.innerHTML = '💝'
    else gElLifes.innerHTML = '💝💝💝'

    elSafeCount.innerHTML = '3'
    gSafeClicks = 3
    gMines = []
    gSize = size
    gNumMines = numMines
    gBoard = createBoard(gSize)
    createMines(gBoard, gNumMines)
    setMinesNegsCount(gBoard)
    printMat(gBoard, ".container")
    resetTimer()
    gElSmiley.innerHTML = NORMAL

    gCountExploded = 0
    gCellsShown = 0
    gCountMarked = 0
    gNumClicks = 0
    gSec = 0
    gMin = 0
}




function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) return
    gNumClicks++
    var elContent = elCell.querySelector("span.content")
    if (gNumClicks === 1) {
        if (cell.isMine) changeMineLocation(cell, elContent)
        gTimeInterval = setInterval(timerCycle, 1000)
    }
    if (gIsHintOn) {
        revealHint(elContent, i, j)
        return
    }
    cell.isShown = true
    elCell.classList.add('shown')
    elContent.style.display = 'block'

    if (cell.isMine) {
        elCell.classList.add('explode')
        gCountExploded++
        console.log(gCountExploded)
        switch (gCountExploded) {
            case 1: gElLifes.innerHTML = gSize === 4 ? '' : '💝💝'
                break
            case 2: gElLifes.innerHTML = gSize === 4 ? '' : '💝'
                break
            case 3: gElLifes.innerHTML = ''
        }
        if (gSize === 4 && gCountExploded === 2 || gSize > 4 && gCountExploded === 4) {
            gIsWin = false
            gameOver()
        }
    } else {
        gCellsShown++
        if (gCellsShown === gCellsCount && gCountMarked === gNumMines) {
            gIsWin = true
            gameOver()
        }
        if (!cell.minesAroundCount) {
            showNegs(gBoard, i, j)
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


function gameOver() {

    if (!gIsWin) {
        for (var i = 0; i < gMines.length; i++) {
            var currMine = gMines[i]
            var elMine = document.querySelector(`.cell-${currMine.i}-${currMine.j}`)
            if (!gBoard[currMine.i][currMine.j].isMarked) {
                var elContent = elMine.querySelector('span.content')
                elContent.style.display = 'block'
            }
        }
        gElSmiley.innerHTML = LOOSE
    } else {
        gElSmiley.innerHTML = WIN
    }

    clearInterval(gTimeInterval)
}



function hintClicked(elBtn) {
    elBtn.classList.add('hit')
    gIsHintOn = true
}



function revealHint(elContent, cellI, cellJ) {

    var negs = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue
            var elNeg = document.querySelector(`.cell-${i}-${j}`)
            var elContent = elNeg.querySelector('span.content')
            negs.push(elContent)
            elContent.style.display = 'block'
        }
    }
    setTimeout(function () {
        for (var i = 0; i < negs.length; i++) {
            negs[i].style.display = 'none'
        }
        gIsHintOn = false
    }, 1000);
}

function revealSafeClick() {
    if (gSafeClicks === 0) return
    gSafeClicks--
    console.log(gSafeClicks)

    console.log(elSafeCount)
    switch (gSafeClicks) {
        case 2: elSafeCount.innerHTML = '2'
            break
        case 1: elSafeCount.innerHTML = '1'
            break
        case 0: elSafeCount.innerHTML = '0'

    }
    var safeCellIdx = getRandomEmptyCellIdx(gBoard)
    while (gBoard[safeCellIdx.i][safeCellIdx.j].isShown) {
        safeCellIdx = getRandomEmptyCellIdx(gBoard)
    }
    var elSafeCell = document.querySelector(`.cell-${safeCellIdx.i}-${safeCellIdx.j}`)
    elSafeCell.classList.add(`revealed`)
    setTimeout(function () {
        elSafeCell.classList.remove(`revealed`)
    }, 1000)

}