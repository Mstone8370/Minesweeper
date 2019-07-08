<?php

  session_start();

  $inputId =  $_REQUEST["id"];
  $inputPw =  $_REQUEST["pw"];

  $idMatched = false;
  $pwMatched = false;

  $dataFile = fopen("accountdata.txt", "r") or die("Unable to open file!");

  while(!feof($dataFile)) {    // 파일 끝까지 읽음
    $currentLine =  trim(fgets($dataFile));    // 아이디 비밀번호 정보 하나 가져옴
    $currentData = explode("|", $currentLine);

    $currentId = $currentData[0];    // 파일에서 가져온 아이디
    $currentPw = $currentData[1];    // 파일에서 가져온 비밀번호

    if(strcmp($inputId, $currentId) == 0) {    // 아이디가 일치하면 비밀번호도 일치하는지 확인, 일치한 아이디 찾으면 while문 break
      $idMatched = true;
      if(strcmp($inputPw, $currentPw) == 0) {
        $pwMatched = true;
        break;
      } else {    // 아이디는 맞지만 비밀번호가 틀린 경우
        $pwMatched = false;
        break;
      }
    }
  }

  if(!$idMatched) {    // 아이디가 없음
    echo 0;
  } else if(!$pwMatched) {    // 아이디는 있지만 비밀번호가 없음
    echo 1;
  } else {    // 아이디도 있고 비밀번호도 있음
    echo 2;
    $_SESSION["loginId"] = $inputId;
  }

  fclose($dataFile);

 ?>
