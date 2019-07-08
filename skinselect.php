<?php

  session_start();

  $id = $_SESSION["loginId"];
  $userData = $_SESSION["userData"];

  echo $userData;

 ?>
