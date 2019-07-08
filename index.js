var loginDiv = document.getElementById("loginDiv");
var userDiv = document.getElementById("userDiv");

var idInput = document.getElementById("id");
var pwInput = document.getElementById("pw");

var loginButton = document.getElementById("login");
var signupButton = document.getElementById("signup");
var logoutButton = document.getElementById("logout");

loginButton.addEventListener("click", login);
signupButton.addEventListener("click", signup);
logoutButton.addEventListener("click", logout);

var userIdDisplay = document.getElementById("userId");
var userCreditDisplay = document.getElementById("userCredit");

var userId = "";
var userCredit = 0;
var userSkin = [];

function init() {   // init
  $.get("index.php", getUserData);
}

function getUserData(data) {    // 유저정보 가져오는 함수, 로그인 여부 판별
  if(data == "") {    // 로그인 되어있지 않음
    console.log("not logined");

    loginDiv.style.display = "block";
    userDiv.style.display = "none";
  } else {    // 로그인 됨
    console.log("logined : " + data);

    loginDiv.style.display = "none";
    userDiv.style.display = "block";

    var arr = data.split("|");    // 유저 정보 화면에 표시
    userId = arr[0];
    userCredit = arr[1];
    for(let i = 2; i < arr.length; i++) {
      userSkin.push(arr[i].trim());
    }

    userIdDisplay.innerHTML = userId;
    userCreditDisplay.innerHTML = userCredit;
  }
}
init();

function login() {    // 로그인
  var id = idInput.value;
  var pw = pwInput.value;
  if(id == "" || pw == "") {    // 아이디 또는 패스워드가 비어있는 경우
    alert("아이디 또는 비밀번호를 입력해주세요.");
    return;
  }

  $.post("login.php", {id: id, pw: pw}, checkLogin);    // login.php로부터 결과 받아오고 chechLogin 함수 실행
}

function checkLogin(data) {    // 로그인 검사하는 함수
  if(data == 0) {
    alert("존재하지 않는 아이디 입니다.");
  } else if(data == 1) {
    alert("비밀번호가 틀립니다.");
  } else if(data == 2) {    // 로그인 성공
    window.location.reload();
  }
}

function signup() {    // 회원가입
  var id = idInput.value;
  var pw = pwInput.value;
  if(id == "" || pw == "") {    // 아이디 또는 패스워드가 비어있는 경우
    alert("아이디 또는 비밀번호를 입력해주세요.");
    return;
  }

  $.post("signup.php", {id: id, pw: pw}, checkSignup);    // signup.php로부터 결과 받아오고 checkSignup 함수 실행
}

function checkSignup(data) {    // 회원가입 검사하는 함수
  if(data == 0) {
    alert("이미 존재하는 아이디가 있습니다.");
  } else if(data == 1) {
    alert("회원가입 되었습니다.");
  }
}

function logout() {    // 로그아웃하는 함수
  $.get("logout.php", function(data, status) {
    userId = "";
    userCredit = 0;
    userSkin = [];
    window.location.reload(true);
  });
}

var gameStartButton = document.getElementById("gameStart");
gameStartButton.addEventListener("click", startGame);
var rankingButton = document.getElementById("ranking");
rankingButton.addEventListener("click", seeRank);
var skinSelectButton = document.getElementById("skinSelect");
skinSelectButton.addEventListener("click", selectSkin);

function startGame() {    // 게임시작 버튼
  gameBoardModal.style.display = "block";
}

function seeRank() {    // 랭크 보는 함수
  $('#easyRankBoard').html("");
  $('#mediumRankBoard').html("");
  $('#hardRankBoard').html("");

  var tempArr = ["easy", "medium", "hard"];

  for(let i = 0; i < 3; i++) {    // 각 난이도별로 정보 가져옴
    $.get(tempArr[i] + "Rank.txt", function(data) {
      var rank = data.split("\n");
      var length = rank.length - 1;
      if(rank.length > 10) {    // 랭크는 10위까지만 표시됨
        length = 10;
      } else {
        length = rank.length;
      }

      for(let j = 0; j < length; j++) {
        if(rank[j] == "") {
          continue;
        }
        var rankArr = rank[j].split("|");
        $("#" + tempArr[i] + "RankBoard").append('<tr><td>' + (j + 1) + '</td><td>' + rankArr[0] + '</td><td>' + rankArr[1] + ' 초</td></tr>');
      }
    });
  }

  rankModal.style.display = "block";
}

function selectSkin() {
  skinModal.style.display = "block";
}

// Modal
var gameBoardModal = document.getElementById("gameBoardModal");
var closeButton = document.getElementsByClassName("closeButton")[0];
var gameBoard = document.getElementById("gameBoard");
closeButton.onclick = function() {
  gameBoard.contentDocument.location.reload(true);
  gameBoardModal.style.display = "none";
  init();
}

var rankModal = document.getElementById("rankModal");
var closeButton = document.getElementsByClassName("closeButton")[1];
closeButton.onclick = function() {
  rankModal.style.display = "none";
}

var skinModal = document.getElementById("skinModal");
var closeButton = document.getElementsByClassName("closeButton")[2];
closeButton.onclick = function() {
  skinModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == gameBoardModal) {
    gameBoardModal.style.display = "none";
    init();
  }
  if (event.target == rankModal) {
    rankModal.style.display = "none";
  }
  if (event.target == skinModal) {
    skinModal.style.display = "none";
    init();
  }
}
// Modal end
