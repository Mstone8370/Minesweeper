<?php

session_start();

$time = $_POST["time"];
$mode = $_POST["mode"];
$id = $_SESSION["loginId"];
if(strcmp($id, "") == 0) {
  $id = "GUEST";
}

$lines = array();

$readFile = fopen($mode . "Rank.txt", "r") or die("File read error");   // 모드에 맞는 파일 열음

$i = 0;
while(!feof($readFile)) {   // 파일의 정보를 배열에 저장
  $line = trim(fgets($readFile));
  if(strcmp($line, "") == 0) {
    continue;
  } else {
    $lines[$i++] = $line;
  }
}

fclose($readFile);

array_push($lines, $id . "|" . $time);    // 배열에 새로운 기록 저장

function cmp($a, $b) {    // 정렬에 사용될 함수
  $aArr = explode("|", $a);
  $bArr = explode("|", $b);

  $aNum = (float) $aArr[1];
  $bNum = (float) $bArr[1];

  if($aNum == $bNum) {
    return 0;
  }
  return ($aNum < $bNum) ? -1 : 1;
}

usort($lines, "cmp");   // 정렬

$writeFile = fopen($mode . "Rank.txt", "w") or die("File write error");   // 파일을 다시 씀

for($i = 0; $i < count($lines); $i++) {
  fwrite($writeFile, $lines[$i] . "\n");
}
fclose($writeFile);

echo "success";

 ?>
