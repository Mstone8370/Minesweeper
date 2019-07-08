var userId = "";    // 유저 아이디
var userSkin = "";    // 유저가 선택한 스킨

function getUserData() {    // 유저 정보 받아오는 함수
  $.get("minesweeper.php", function(data) {
    if(data == "") {    // 로그인 하지 않아서 가져온 정보가 없는경우
      userSkin = "default";    // 기본 스킨으로 지정
    } else {
      var arr = data.split("|");
      userId = arr[0];    // 유저 아이디 저장
      userSkin = arr[arr.length - 1];    // 유저가 선택한 스킨 저장
    }
    createBoard(mode);    // 유저 정보 가져온 후에 board 생성
  })
}
getUserData();

window.oncontextmenu = function ()    // 마우스 우클릭해도 메뉴 표시되지 않게 함 https://stackoverflow.com/a/2405835
{
    return false;     // cancel default menu
}

const easy = [9, 9, 10];    // easy 모드 판 크기와 지뢰 개수
const medium = [16, 16, 40];    // medium 모드 판 크기와 지뢰 개수
const hard = [30, 16, 99];    // hard 모드 판 크기와 지뢰 개수

var mode = easy;    // 기본은 easy 모드

var wrapper = document.getElementById("wrapper");

var tableElement = document.getElementById("table");
var boardElement = document.getElementById("board");
var playAgainButton = document.getElementById("playAgainButton");
var remainMinesDisplay = document.getElementById("remainMines");
var timeDisplay = document.getElementById("timer");

var start = false;    // 게임이 시작됐는지 아닌지를 판별하기 위함
var startTime;
var endTime;
var timer;
var currentTime = 0;
var resultTime;    // 게임이 끝날 때까지 걸린 시간

var resultTextSpan = document.getElementById("resultText");
var resultTimeSpan = document.getElementById("resultTime");

// 주변 8개의 block을 검사하기 위해 사용되는 배열
var seq = [ [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1] ];

// Class -----------------------------------------------------------------------
// -----------------------------------------------------------------------------

class Board {
  constructor(mode) {
    this.mode = mode;
    this.width = mode[0];
    this.height = mode[1];
    this.number = mode[2];
    this.boxes = [];    // 모든 td를 box라고 정했음, Box 객체 저장
    this.blocks = [];    // 클릭되지 않아 덮혀있는 box는 block, Block 객체를 저장
    this.mines = [];    // 지뢰, Mine 객체를 저장

    // Board 클래스 생성하면 게임 판을 처음부터 다시 생성
    this.createBoxes();
    this.createBlocks();
    this.createMines(this.number);
    this.findSurroundingMines();
  }

  getBox(x, y) {    // 인덱스로 Box 객체를 찾아 return. 유효하지 않은 인덱스면 null 반환
    if(x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return null;
    } else {
      return this.boxes[x][y];
    }
  }

  getBlock(x, y) {    // 인덱스로 Block 객체를 찾아 return. 유효하지 않은 인덱스면 null 반환
    if(x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return null;
    } else {
      return this.blocks[x][y];
    }
  }

  createBoxes() {    // box들을 판 크기에 맞게 생성해서 2차원 배열에 저장
    for(let i = 0; i < this.width; i++) {
      var tempArr = [];
      for(let j = 0; j < this.height; j++) {
        var box = new Box(i, j);
        tempArr.push(box);
      }
      this.boxes.push(tempArr);
    }
  }

  createBlocks() {    // block들을 판 크기에 맞게 생성해서 2차원 배열에 저장
    for(let i = 0; i < this.width; i++) {
      var tempArr = [];
      for(let j = 0; j < this.height; j++) {
        var block = new Block(i, j, "none");
        tempArr.push(block);
      }
      this.blocks.push(tempArr);
    }
  }

  findSurroundingMines() {    // 모든 box들을 주변에 지뢰가 있는지 검사하게 함
    for(let i = 0; i < this.width; i++) {
      for(let j = 0; j < this.height; j++) {
        this.getBox(i, j).findSurroundingMines(this, this.width, this.height);    // Box 클래스에도 같은 이름의 메소드 있음
      }
    }
  }

  createMines(number) {    // 지뢰들을 정해진 개수만큼 생성해서 2차원 배열에 저장
    for(let i = 0; i < number; i++) {
      while(true) {    // 지뢰 하나를 저장할 때까지 반복되어서 조건에 맞을 때까지 지뢰를 계속 생성
        var mine = new Mine(this.width, this.height);
        if(this.mines.length == 0) {    // 첫번째 지뢰를 생성한 경우엔 바로 저장
          this.mines.push(mine);
          (this.getBox(mine.x, mine.y)).setType("mine");
          break;
        }
        if(this.checkMine(mine)) {    // 첫번째로 저장하는게 아닌 경우 지뢰 위치가 중복됐는지 검사한다음 저장
          this.mines.push(mine);
          (this.getBox(mine.x, mine.y)).setType("mine");
          break;
        }
      }
    }
  }

  checkMine(mine) {    // 지뢰위치가 중복되었는지 검사
    for(let i = 0; i < this.mines.length; i++) {
      if(this.mines[i].x == mine.x && this.mines[i].y == mine.y) {
        return false;
      }
    }
    return true;
  }

  coverAll() {    // 저장된 block들을 이용해서 게임 판을 생성
    var boardElement = document.createElement("tbody");
    var boardId = document.createAttribute("id");
    boardId.value = "board";
    boardElement.setAttributeNode(boardId);

    for(let j = 0; j < this.height; j++) {
      var tableRow = document.createElement("tr");
      for(let i = 0; i < this.width; i++) {
        tableRow.appendChild(this.blocks[i][j].toImage());
      }
      boardElement.appendChild(tableRow);
    }

    return boardElement;
  }

  revealAllMine() {    // 게임에서 패배한 경우 실행됨. 모든 지뢰의 위치를 공개함
    for(let i = 0; i < this.mines.length; i++) {
      var mineX = this.mines[i].x;
      var mineY = this.mines[i].y;

      var row = boardElement.childNodes[mineY];
      row.replaceChild(this.getBox(mineX, mineY).toImage(), row.childNodes[mineX]);
    }
  }

  flagAllMines() {    // 특정 조건에 맞아 승리한 경우 실행됨.
    // 남은 block 개수와 전체 지뢰 개수가 같다면 남은 block에는 모두 지뢰가 있는 것이기 때문에 자동으로 승리되고, 깃발을 꽂아줌
    for(let i = 0; i < this.mines.length; i++) {
      var mineX = this.mines[i].x;
      var mineY = this.mines[i].y;

      var row = boardElement.childNodes[mineY];
      row.replaceChild(this.getBlock(mineX, mineY).toFlagImage(), row.childNodes[mineX]);
    }
  }

  toImage() {    // coverALl 메소드와 중복됨. 나중에 삭제될 수 있음
    var boardElement = document.createElement("tbody");
    var boardId = document.createAttribute("id");
    boardId.value = "board";
    boardElement.setAttributeNode(boardId);

    for(let j = 0; j < this.height; j++) {
      var tableRow = document.createElement("tr");
      for(let i = 0; i < this.width; i++) {
        tableRow.appendChild(this.boxes[i][j].toImage());
      }
      boardElement.appendChild(tableRow);
    }

    return boardElement;
  }
}

class Box {
  constructor(x, y, type = "") {    // 위치정보와 타입을 지정. 타입 종류: 일반, 지뢰, 숫자
    this.x = x;
    this.y = y;
    this.type = type;
    this.count = 0;
  }

  setType(type) {    // 타입 지정
    this.type = type;
  }

  findSurroundingMines(board, width, height) {    // 주변의 지뢰를 찾음
    if(this.type == "mine") {    // 지금 box가 지뢰라면 종료
      return;
    }
    for(let i = 0; i < seq.length; i++) {    // seq 배열을 이용해서 순서대로 검사
      var sBoxX = this.x + seq[i][0];
      var sBoxY = this.y + seq[i][1];
      var surroundingBox = board.getBox(sBoxX, sBoxY);    // 인덱스로 box 가져옴
      if(surroundingBox == null) {    // 유효하지 않은 인덱스여서 다음 box 검사
        continue;
      }
      if(surroundingBox.type == "mine") {    // 가져온 Box 객체가 지뢰인경우 타입을 숫자로 바꾸고 카운트 증가
        this.type = "number";
        this.count++;
      }
    }
  }

  toImage() {    // img 엘리먼트를 생성해서 반환
    var boxElement = document.createElement("td");
    var boxImage = document.createElement("img");
    var boxImageSrc = document.createAttribute("src");
    var img = new Image(this, userSkin);
    boxImageSrc.value = img.getImageSrc();
    boxImage.setAttributeNode(boxImageSrc);
    boxImage.addEventListener("mouseover", hoverEvent);
    boxImage.addEventListener("mouseout", hoverOutEvent);
    boxElement.appendChild(boxImage);

    return boxElement;
  }
}

class Block {
  constructor(x, y, status) {    // 위치정보와 상태를 지정. 상태 종류: 일반, 깃발 꽂혀짐
    this.x = x;
    this.y = y;
    this.status = status;
  }

  toImage() {    // img 엘리먼트를 생성해서 반환
    var blockElement = document.createElement("td");
    var blockImage = document.createElement("img");
    var blockImgaeSrc = document.createAttribute("src");
    if(this.status == "flaged") {
      blockImgaeSrc.value = "img/" + userSkin + "/flag.png";
    } else {
      blockImgaeSrc.value = "img/" + userSkin + "/block.png";
    }
    blockImage.setAttributeNode(blockImgaeSrc);
    blockImage.addEventListener("click", clickEvent);
    blockImage.addEventListener("mousedown", flagEvent);
    blockElement.appendChild(blockImage);

    return blockElement;
  }

  toFlagImage() {    // 깃발 img 엘리먼트를 생성해서 반환
    var blockElement = document.createElement("td");
    var blockImage = document.createElement("img");
    var blockImgaeSrc = document.createAttribute("src");
    blockImgaeSrc.value = "img/" + userSkin + "/flag.png";
    blockImage.setAttributeNode(blockImgaeSrc);
    blockImage.addEventListener("click", clickEvent);
    blockImage.addEventListener("mousedown", flagEvent);
    blockElement.appendChild(blockImage);

    return blockElement;
  }
}

class Mine {
  constructor(maxWidth, maxHeight) {    // 랜덤으로 위치 생성
    this.x = parseInt((Math.random() * 100) % maxWidth);
    this.y = parseInt((Math.random() * 100) % maxHeight);
  }
}

class Image {
  constructor(box, skin) {    // box 타입에 따라 이미지가 달라짐
    this.box = box;
    this.type = box.type;
    this.skin = skin;
    this.skinRootDir = this.getSkinRootDir();
  }

  getSkinRootDir() {
    return this.skin + "/";
  }

  getImageSrc() {    // 스킨 종류에 따라 이미지 경로가 바뀜
    if(this.type == "mine") {
      return "img/" + this.skinRootDir + "mine.png";
    } else if(this.type == "number") {
      switch(this.box.count) {
        case 1:
          return "img/" + this.skinRootDir + "1.png";
        case 2:
          return "img/" + this.skinRootDir + "2.png";
        case 3:
          return "img/" + this.skinRootDir + "3.png";
        case 4:
          return "img/" + this.skinRootDir + "4.png";
        case 5:
          return "img/" + this.skinRootDir + "5.png";
        case 6:
          return "img/" + this.skinRootDir + "6.png";
        case 7:
          return "img/" + this.skinRootDir + "7.png";
        case 8:
          return "img/" + this.skinRootDir + "8.png";
        default:
          return "img/" + this.skinRootDir + "plain.png";
      }
    } else {
      return "img/" + this.skinRootDir + "plain.png";
    }
  }
}
var boardClass;    // Board 객체 저장할 변수

// Function --------------------------------------------------------------------
// -----------------------------------------------------------------------------

function createBoard(mode) {       // init
  boardClass = new Board(mode);    // 새로운 board 생성
  tableElement.replaceChild(boardClass.coverAll(), boardElement);
  boardElement = document.getElementById("board");

  // 재시작 하는 경우를 위해 초기화
  start = false;    // 시작되지 않음
  timeDisplay.innerHTML = 0;    // 시간 초기화
  remainMines = mode[2];    // 남은 지뢰개수 초기화
  remainMinesDisplay.innerHTML = remainMines;    // 남은 지뢰개수 표시부분 초기화

  var wrapperStyle = document.createAttribute("style");
  wrapperStyle.value = "width: " + ((boardClass.width * 30) + 250) + "px; height: " + ((boardClass.height * 30) + 220) + "px;";
  wrapper.setAttributeNode(wrapperStyle);
}

function getCurrentTime() {    // 1초마다 실행될 함수, 시간 표시부분도 업데이트함
  currentTime++;
  timeDisplay.innerHTML = currentTime;
}

function stopTimer() {    // 타이머 종료
  clearInterval(timer);
  currentTime = 0;
}

function findLocation(element) {    // 인자로 받은 엘리먼트의 위치를 반환
  for(let j = 0; j < boardElement.childNodes.length; j++) {
    var row = boardElement.childNodes[j];
    for(let i = 0; i < row.childNodes.length; i++) {
      if(row.childNodes[i] === element) {
        var loc = [i, j];
        return loc;
      }
    }
  }
  return -1;
}

function clickEvent(e) {    // block이 클릭되면 실행
  if(!start) {  // 시작되지 않은경우엔 타이머 시작
    startTime = new Date().getTime();
    start = true;
    timer = setInterval(getCurrentTime, 1000);
  }

  var clickedBox = e.target.parentNode;
  var loc = findLocation(clickedBox);
  var blockClass = boardClass.getBlock(loc[0], loc[1]);
  if(blockClass.status == "flaged") {    // 깃발이 꽂힌 경우엔 block이 공개되지 않음
    return;
  }
  revealBox(clickedBox);    // 클릭된 box 공개
}

function revealBox(clickedBox) {    // 인자로 받은 box 공개
  var clickedBoxLoc = findLocation(clickedBox);
  var x = clickedBoxLoc[0];
  var y = clickedBoxLoc[1];

  var boxClass = boardClass.getBox(x, y);
  clickedBox.parentNode.replaceChild(boxClass.toImage(), clickedBox);

  if(boxClass.type == "mine") {    // 공개된 box가 지뢰라면 패배
    defeat();
    return;
  }
  if(boxClass.type != "number") {    // 공개된 box가 숫자가 아닌 경우엔 주면 8개 box도 공개됨
    propagate(boxClass);
  }

  checkNumberOfBlock();    // block 공개가 끝나면 남은 block 개수 카운트
}

function propagate(boxClass) {    // 주변 8개 box도 공개하는 함수
  for(let i = 0; i < seq.length; i++) {
    var sBoxX = boxClass.x + seq[i][0];
    var sBoxY = boxClass.y + seq[i][1];
    var surroundingBoxClass = boardClass.getBox(sBoxX, sBoxY);
    if(surroundingBoxClass == null)
      continue;

    var surroundingBoxElement = boardElement.childNodes[sBoxY].childNodes[sBoxX];

    if(surroundingBoxClass.type == "mine") {
      continue;
    }
    if(surroundingBoxElement.childNodes[0].getAttribute("src") != "img/" + userSkin + "/block.png") {
      // 이미 공개된 box인 경우 다시 공개할 필요 없음
      continue;
    }

    revealBox(surroundingBoxElement);    // box 공개가 반복되면서 퍼져나감
  }
}

function checkNumberOfBlock() {    // 남은 block 카운트
  var count = 0;

  for(let i = 0; i < boardElement.childNodes.length; i++) {
    var row = boardElement.childNodes[i];
    for(let j = 0; j < row.childNodes.length; j++) {
      var img = row.childNodes[j].childNodes[0];
      if(img.getAttribute("src") == "img/" + userSkin + "/block.png" || img.getAttribute("src") == "img/" + userSkin + "/flag.png") {
        count++;
      }
    }
  }
  if(count == mode[2]) {    // 남은 block 개수와 전체 지뢰 개수가 같은경우 승리
    win();
  }
}

function hoverEvent(e) {    // 숫자 box에 마우스를 올렸을 경우 주변 8개의 블럭이 강조됨
  var loc = findLocation(e.target.parentNode);
  var boxClass = boardClass.getBox(loc[0], loc[1]);
  if(boxClass.type != "number") {
    return;
  }

  for(let i = 0; i < seq.length; i++) {
    var sBoxX = loc[0] + seq[i][0];
    var sBoxY = loc[1] + seq[i][1];

    var surroundingBoxClass = boardClass.getBox(sBoxX, sBoxY);
    if(surroundingBoxClass == null)
      continue;

    var surroundingBoxElement = boardElement.childNodes[sBoxY].childNodes[sBoxX];

    var style = document.createAttribute("style");
    style.value =  "border: 2px solid rgb(225, 51, 51); z-index: 100";
    surroundingBoxElement.setAttributeNode(style);

    surroundingBoxElement.childNodes[0].style.width = "28px";
    surroundingBoxElement.childNodes[0].style.height = "28px";
  }
}

function hoverOutEvent(e) {    // 숫자 box에서 마우스가 나간 경우 원래 상태로 되돌림
  var loc = findLocation(e.target.parentNode);
  var boxClass = boardClass.getBox(loc[0], loc[1]);
  if(boxClass.type != "number") {
    return;
  }

  for(let i = 0; i < seq.length; i++) {
    var sBoxX = loc[0] + seq[i][0];
    var sBoxY = loc[1] + seq[i][1];

    var surroundingBoxClass = boardClass.getBox(sBoxX, sBoxY);
    if(surroundingBoxClass == null)
      continue;

    var surroundingBoxElement = boardElement.childNodes[sBoxY].childNodes[sBoxX];

    var style = document.createAttribute("style");
    style.value =  "border: 1px solid black; z-index: 0";
    surroundingBoxElement.setAttributeNode(style);

    surroundingBoxElement.childNodes[0].style.width = "30px";
    surroundingBoxElement.childNodes[0].style.height = "30px";
  }
}

function removeAllEvent() {    // 모든 엘리먼트의 이벤트를 제거하는 함수
  for(let i = 0; i < boardElement.childNodes.length; i++) {
    var row = boardElement.childNodes[i];
    for(let j = 0; j < row.childNodes.length; j++) {
      var td = row.childNodes[j].childNodes[0];
      td.removeEventListener("click", clickEvent);
      td.removeEventListener("mousedown", flagEvent);
      td.removeEventListener("mouseover", hoverEvent);
      td.removeEventListener("mouseout", hoverOutEvent);
    }
  }
}

function flagEvent(e) {    // block을 마우스 우클릭 한 경우 깃발을 꽂음
  if(e.button == 2) {
    var clickedBlock = e.target.parentNode;
    var loc = findLocation(clickedBlock);
    var blockClass = boardClass.getBlock(loc[0], loc[1]);
    if(blockClass.status != "flaged") {
      blockClass.status = "flaged";
      remainMines--;
    } else {
      blockClass.status = "none";
      remainMines++;
    }
    remainMinesDisplay.innerHTML = remainMines;
    clickedBlock.parentNode.replaceChild(blockClass.toImage(), clickedBlock);
  }
}

function win() {    // 승리한 경우
  endTime = new Date().getTime();
  resultTime = (endTime - startTime) / 1000;
  console.log(resultTime);
  stopTimer();
  removeAllEvent();
  boardClass.flagAllMines();
  remainMinesDisplay.innerHTML = 0;
  console.log("WIN");
  displayResult("win");
  if(userId != "") {
    increaseCredit(10);
  }
}

function defeat() {    // 패배한 경우
  endTime = new Date().getTime();
  resultTime = (endTime - startTime) / 1000;
  console.log(resultTime);
  stopTimer();
  removeAllEvent();
  boardClass.revealAllMine();
  console.log("DEFEAT");
  displayResult("defeat");
}

function displayResult(result) {    // 결과 표시
  if(result == "win") {
    resultTextSpan.innerHTML = "승리!!";
    resultTimeSpan.innerHTML = resultTime + " 초";
    resultModal.style.display = "block";
    submitButton.style.display = "inline";
    success.style.display = "none";
  } else if(result == "defeat") {
    resultTextSpan.innerHTML = "패배";
    resultTimeSpan.innerHTML = "";
    resultModal.style.display = "block";
    submitButton.style.display = "none";
    success.style.display = "none";
  }
}

function increaseCredit(num) {    // 승리한 경우 크레딧을 증가시키는 함수
  $.post("changeCredit.php", {num: num}, function(data) {});
}

function replay() {    // 다시 시작하는 함수
  stopTimer();
  createBoard(mode);
}

function submitRecord() {    // 승리 기록을 서버에 전송하는 함수
  var currentMode;
  if(mode == easy) {
    currentMode = "easy";
  } else if(mode == medium) {
    currentMode = "medium";
  } else {
    currentMode = "hard";
  }
  $.post("uploadRank.php", {time: resultTime, mode: currentMode}, function(data) {
    console.log(data);
    submitButton.style.display = "none";
    success.style.display = "inline";
  })
}

// Main ------------------------------------------------------------------------
// -----------------------------------------------------------------------------

playAgainButton.addEventListener("click", replay);

// Option modal
var optionModal = document.getElementById("optionModal");
var optionButton = document.getElementById("optionButton");
var applyButton = document.getElementById("applyButton");
var closeButton = document.getElementsByClassName("closeButton")[0];
optionButton.onclick = function() {
  optionModal.style.display = "block";
}
closeButton.onclick = function() {
  optionModal.style.display = "none";
}

var checked = "easy";

var easyRadio = document.getElementById("easy");
var mediumRadio = document.getElementById("medium");
var hardRadio = document.getElementById("hard");
easyRadio.addEventListener("change", radioEvent);
mediumRadio.addEventListener("change", radioEvent);
hardRadio.addEventListener("change", radioEvent);

applyButton.addEventListener("click", function() {
  optionModal.style.display = "none";

  if(checked == "easy") {
    mode = easy;
  } else if(checked == "medium") {
    mode = medium;
  } else if(checked == "hard") {
    mode = hard;
  } else {
    console.log("error");
  }

  replay();
});

function radioEvent() {
  checked = this.value;
}
// Modal end

// Result modal
var resultModal = document.getElementById("resultModal");
var submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", submitRecord);
var success = document.getElementById("success");
success.style.display = "none";
var closeButton2 = document.getElementsByClassName("closeButton")[1];
closeButton2.onclick = function() {
  resultModal.style.display = "none";
}
// Modal end

window.onclick = function(e) {
  if (e.target == optionModal) {
    optionModal.style.display = "none";
  }
  if (e.target == resultModal) {
    resultModal.style.display = "none";
  }
}
