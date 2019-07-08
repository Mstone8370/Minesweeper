<?php

  $inputId =  $_POST["id"];
  $inputPw =  $_POST["pw"];

  $idMatched = false;

  $readFile = fopen("accountdata.txt", "r") or die("Unable to read file!");

  while(!feof($readFile)) {    // 파일 끝까지 읽음
    $currentLine =  trim(fgets($readFile));    // 아이디 비밀번호 정보 하나 가져옴
    $currentData = explode("|", $currentLine);

    $currentId = $currentData[0];    // 파일에서 가져온 아이디
    $currentPw = $currentData[1];    // 파일에서 가져온 비밀번호

    if(strcmp($inputId, $currentId) == 0) {    // 회원가입된 아이디가 이미 있는 경우
      $idMatched = true;
      break;
    }
  }
  fclose($readFile);

  if($idMatched) {    // 아이디가 이미 있는 경우
    echo 0;
  } else {
    $writeFile = fopen("accountdata.txt", "a") or die("Unable to write file!");
    fwrite($writeFile, $inputId . "|" . $inputPw . "\n");    // 회원 정보 새로 저장
    echo 1;
    fclose($writeFile);
  }

 ?>
