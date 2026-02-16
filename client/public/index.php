<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
      require_once '../../server/config/connessione.php';

      if ($conn->connect_error) {
     	die("Errore di connessione al database: " . $conn->connect_error);
  	  }else{
      	echo "connesione riuscita al db tramite file connessione.php";
      }
      
    ?>
</body>
</html>
