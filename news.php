<?php
require "config.php";
$stmt = $pdo->query("SELECT * FROM news ORDER BY created_at DESC");
$news = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Новости - Мой сайт</title>
    <link rel="stylesheet" href="main.css">
</head>
<body>
    <nav>
        <a href="index.php">Главная</a>
        <a href="news.php">Новости</a>
        <a href="contacts.php">Контакты</a>
    </nav>
    
    <div class="container">
        <h1>Новости</h1>
        <?php foreach ($news as $item): ?>
    <div class="news-item">
        <h3><?= htmlspecialchars($item["title"]) ?></h3>
        <p><?= htmlspecialchars($item["content"]) ?></p>
    </div>
<?php endforeach; ?>

        
    </div>
</body>
</html>