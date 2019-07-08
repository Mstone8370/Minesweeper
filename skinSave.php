<?php

  session_start();

  $id = $_SESSION["loginId"];
  $userData = $_SESSION["userData"];
  $skin = $_POST["skin"];
  $userCredit;

  $lines = array();
  $userSkins = array();   // 유저가 가지고있는 스킨 정보를 따로 저장
  $userDataIndex;

  $dataFile = fopen("userdata.txt", "r") or die("File read error");   // 유저 정보 가져옴

  while(!feof($dataFile)) {
    $line = trim(fgets($dataFile));
    array_push($lines, $line);    // 배열에 저장
  }

  fclose($dataFile);

  for($i = 0; $i < count($lines); $i++) {
    $temp = explode("|", $lines[$i]);
    if(strcmp($temp[0], $id) == 0) {    // 현재 로그인중인 유저의 정보 찾기
      $userDataIndex = $i;
      $userCredit = $temp[1];
      for($j = 2; $j < count($temp); $j++) {
        array_push($userSkins, $temp[$j]);    // 유저가 가지고있는 스킨을 저장하는 배열에 추가
      }
      break;
    }
  }

  $index = array_search($skin, $userSkins);   // 유저가 적용하려는 스킨을 가지고 있는지 검사

  if($index === false){
    echo "error";   // 유저가 스킨을 적용하고싶지만 그 스킨을 가지고있지 않은 경우 에러
  } else {
    array_splice($userSkins, $index, 1);    // 유저가 적용하려는 스킨을 배열에서 지움 ( 유저 정보 맨 마지막에 있는 스킨이 적용된 스킨임 )

    $newLine = $id . "|" . $userCredit . "|";

    for($i = 0; $i < count($userSkins); $i++) {
      $newLine .= $userSkins[$i] . "|";
    }
    $newLine .= $skin;    // 맨 뒤에 적용할 스킨 이름을 넣음

    $lines[$userDataIndex] = $newLine;

    $dataFile = fopen("userdata.txt", "w") or die("File write error");

    for($i = 0; $i < count($lines); $i++) {   // 파일에 쓰기
      fwrite($dataFile, $lines[$i] . "\n");
    }

    fclose($dataFile);

    echo "저장되었습니다.";
  }

 ?>
