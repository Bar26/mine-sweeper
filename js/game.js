'use strict'

const MINE = `<img src="img/bomb.webp" />`
const FLAG = `<span class="flag"><img src="img/flag.png" /></span>`
const audio= new Audio('../sound/bomb-sound.wav')
const winAudio = new Audio('../sound/win.wav')
const loseAudio= new Audio('../sound/lose.wav')
var gElSmiley = document.querySelector('.smiley')
var gElLifes = document.querySelector('.heart span')
var elSafeCount = document.querySelector('span.safeCount')
var elHintBts = document.querySelectorAll('.hint button')
var gElTimer = document.querySelector('.timer')
var gNumMines
var gSize
var gTimeInterval
var gBoard
var gCountExploded
var gCellsShown
var gCountMarked
var gIsWin
var gIs7Boom
var gNumClicks
var gIsHintOn
var gSafeClicks
var gIsGameOn
var gMin
var gSec


function init(size = 4, numMines = 2) {
    gIsGameOn = true
    if (gTimeInterval) clearInterval(gTimeInterval)
    if (size === 4) gElLifes.innerHTML = '💝'
    else gElLifes.innerHTML = '💝💝💝'
    elSafeCount.innerHTML = '3'
    gSafeClicks = 3
    for (var i = 0; i < elHintBts.length; i++) {
        elHintBts[i].classList.remove('hit')
    }
    gMines = []
    gSize = size
    gNumMines = numMines
    gBoard = createBoard(gSize)
    printMat(gBoard, ".container")
    changeRightClickDefaul(gBoard)
    resetTimer()
    gElSmiley.innerHTML = NORMAL
    gIs7Boom = false
    gCountExploded = 0
    gCellsShown = 0
    gCountMarked = 0
    gNumClicks = 0
    gSec = 0
    gMin = 0
}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (!gIsGameOn) return
    if (cell.isShown) return
    if (cell.isMarked) return
    gNumClicks++
    if (gNumClicks === 1) {
        createMines(gBoard, gNumMines, i, j)
        setMinesNegsCount(gBoard)
        printMat(gBoard, ".container")
        gTimeInterval = setInterval(timerCycle, 1000)
        changeRightClickDefaul(gBoard)
    }
    if (gNumClicks === 1) elCell = document.querySelector(`.cell-${i}-${j}`)
    var elContent = elCell.querySelector("span.content")
    cell.isShown = true
    if (gIsHintOn) {
        revealHint(elContent, i, j)
        return
    }
    elCell.classList.add('shown')
    elContent.style.display = 'block'
    if (cell.isMine) {
        audio.play()
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
        console.log(gCellsShown)
        if (gCellsShown + gCountExploded + gCountMarked === gSize ** 2) {
            gIsWin = true
            gameOver()
        }
        if (!cell.minesAroundCount) {
            showNegs(gBoard, i, j)
        }

    }
}

function rightclick(elcell, cell) {
    if (cell.isShown) return
    var elFlag = elcell.querySelector('span.flag')
    gNumClicks++
    if (gNumClicks === 1) gTimeInterval = setInterval(timerCycle, 1000)
    if (cell.isMarked) {
        cell.isMarked = false
        elFlag.style.display = 'none'
        if (cell.isMine) {
            gCountMarked--
            console.log(gCountMarked)
        }

    } else {
        cell.isMarked = true
        elFlag.style.display = 'block'
        if (cell.isMine) {
            gCountMarked++
            console.log(gCountMarked)
            if (gCellsShown + gCountExploded + gCountMarked === gSize ** 2) {
                gIsWin = true
                gameOver()
            }
        }
    }

}

function activate7Boom() {
    gIs7Boom = true
}


function gameOver() {
    gIsGameOn = false

    if (!gIsWin) {
        loseAudio.play()
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
        winAudio.play()
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

