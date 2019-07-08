<?php

  session_start();

  $id = $_SESSION["loginId"];
  $_SESSION["userData"] = "";

  if(strcmp($id, "") == 0) {
    echo "";
  } else {
    $dataFile = fopen("userdata.txt", "r") or die("file error");
    $userData = "";

    while(!feof($dataFile)) {   // 파일에서 유저정보 찾음
      $currentLine = fgets($dataFile);
      $arr = explode("|", $currentLine);
      $currentId = $arr[0];

      if(strcmp($id, $currentId) == 0) {
        $userData =  $currentLine;
        break;
      }
    }

    fclose($dataFile);

    if(strcmp($userData, "") == 0) {    // 유저정보가 없는 경우 새로 생성
      $dataFile = fopen("userdata.txt", "a");
      fwrite($dataFile, $id . "|100|default" . "\n");
      fclose($dataFile);
      $_SESSION["userData"] = $id . "|100|default";
      echo $_SESSION["userData"];
    } else {    // 유저정보 있으면 반환
      $_SESSION["userData"] = $userData;
      echo $_SESSION["userData"];
    }
  }

 ?>
