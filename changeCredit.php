<?php

  session_start();

  $id = $_SESSION["loginId"];
  $num = $_POST["num"];

  $arr = array();

  $readFile = fopen("userdata.txt", "r") or die("File read error");

  while(!feof($readFile)) {    // 유저정보 저장
    $line = trim(fgets($readFile));
    $temp = explode("|", $line);

    array_push($arr, $temp);
  }

  fclose($readFile);

  $writeFile = fopen("userdata.txt", "w") or die("File write error");

  for($i = 0; $i < count($arr); $i++) {
    if(count($arr[$i]) < 3) {
      continue;
    }
    if(strcmp($arr[$i][0], $id) == 0) {   // 현재 로그인 한 유저 정보를 찾음
      $tempCredit = (int)$arr[$i][1] + (int)$num;
      if($tempCredit < 0) {   // 크레딧이 0보다 작은경우 에러
        echo "error";
        break;
      } else {
        echo "success";
      }
      $arr[$i][1] = $tempCredit;    // 증가된 크레딧 적용
    }
    for($j = 0; $j < count($arr[$i]) - 1; $j++) {
      fwrite($writeFile, $arr[$i][$j] . "|");
    }
    fwrite($writeFile, $arr[$i][count($arr[$i]) - 1] . "\n");   // 파일에 쓰기
  }

  fclose($writeFile);

 ?>
