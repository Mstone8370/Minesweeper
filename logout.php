<?php

  session_start();

  $_SESSION["loginId"] = "";

  session_unset();    // 세션 삭제
  session_destroy();

  echo true;

 ?>
