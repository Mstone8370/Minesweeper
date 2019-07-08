var userData = "";
var selectedSkin;
var clickedSkin;
var clickedRed;
var userSkinList = [];

var skinList = ["default", "handWrite", "flower", "radioactive"];

var reds = document.getElementsByClassName("red");    // 구매하지 않아서 빨갛게 표시되는 부분
for(let i = 0; i < reds.length; i++) {
  reds[i].addEventListener("click", displayBuyModal);
}
var radios = document.getElementsByTagName("input");    // radio 버튼에 이벤트 추가
for(let i = 0; i < radios.length; i++) {
  radios[i].addEventListener("change", function(e) {
    for(let i = 0; i < radios.length; i++) {
      if(e.target == radios[i]) {
        clickedSkin = skinList[i];
      }
    }
  })
}
var activatedRadio;

var skinSaveButton = document.getElementById("skinSave");
skinSaveButton.addEventListener("click", saveSkin);

$.get("skinselect.php", init);

function init(data) {    // init
  if(data == "") {    // 로그인하지 않은 경우
    selectedSkin = "default";
    userSkinList = ["default"];
  } else {    // 로그인 한 경우
    userData = data.split("|");
    selectedSkin = userData[userData.length - 1].trim();
    for(let i = 2; i  < userData.length; i++) {
      userSkinList.push(userData[i].trim());    // 유저가 가지고있는 스킨 저장
    }
  }

  activatedRadio = document.getElementById(selectedSkin + "Radio");
  activatedRadio.checked = true;    // 유저가 이전에 선택했던 스킨의 radio버튼을 체크된 상태로 함

  for(let i =  0; i < userSkinList.length; i++) {
    reds[skinList.indexOf(userSkinList[i])].style.display = "none";   // 유저가 가지고있는 스킨들은 빨간 영역 지움
  }
}

function saveSkin() {   // 적용할 스킨을 저장하는 함수
  if(userData == "") {
    document.getElementById("saveResult").innerHTML = "로그인 해야 가능합니다.";    // 로그인 하지 않은경우 스킨 관련 기능 사용 불가
    saveModal.style.display = "block";
  } else {
    $.post("skinSave.php", {skin: clickedSkin}, function(data) {
      document.getElementById("saveResult").innerHTML = data;
      saveModal.style.display = "block";
    });
  }
}

function displayBuyModal(e) {   // 구매하는 modal을 표시하는 부분
  if(userData == "") {
    document.getElementById("saveResult").innerHTML = "로그인 해야 가능합니다.";    // 로그인 하지 않은경우 스킨 관련 기능 사용 불가
    saveModal.style.display = "block";
  } else {
    clickedRed = e.target.parentNode.id;    // 클릭된 빨간 영역으로 어떤 스킨을 구매하려고 하는건지 파악함
    buyModal.style.display = "block";
  }
}

function buySkin() {    // 스킨 구매하는 함수
  $.post("skinBuy.php", {num: -50, skin: clickedRed}, function(data) {
    document.getElementById("saveResult").innerHTML = data;
    saveModal.style.display = "block";
    buyModal.style.display = "none";
  });
}

// Modal
var saveModal = document.getElementById("saveModal");
var closeButton = document.getElementById("closeButton");
closeButton.onclick = function() {
  saveModal.style.display = "none";
  window.top.location.reload();   // 메인 화면 새로고침
}

var buyModal = document.getElementById("buyModal");
var buyButton = document.getElementById("buy");
buyButton.addEventListener("click", buySkin);
var cancelButton = document.getElementById("cancel");
cancelButton.addEventListener("click", function() {
  buyModal.style.display = "none";
});

window.onclick = function(event) {
  if (event.target == buyModal) {
    buyModal.style.display = "none";
  }
}
// Modal end
