<?php
require "config.php";
$stmt = $pdo->query("SELECT * FROM contacts");
$contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<?php require "config.php"; ?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Контакты - Мой сайт</title>
    <link rel="stylesheet" href="main.css">
</head>
<body>
    <nav>
        <a href="index.php">Главная</a>
        <a href="news.php">Новости</a>
        <a href="contacts.php">Контакты</a>
    </nav>
    
    <div class="container">
        <h1>Наши контакты</h1>
<ul>
    <?php foreach ($contacts as $contact): ?>
        <li><strong><?= htmlspecialchars($contact["label"]) ?>:</strong> <?= htmlspecialchars($contact["value"]) ?></li>
    <?php endforeach; ?>
</ul>

        
        <p>Свяжитесь с нами любым удобным способом — мы всегда рады помочь!</p>
        
        
    </div>
</body>
</html>