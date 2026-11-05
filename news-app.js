const form = document.querySelector('#news-form');
const list = document.querySelector('#news-list');
const message = document.querySelector('#message');
const reload = document.querySelector('#reload');
// ВАЖНО: берем элементы, которые мы добавили в HTML
const searchInput = document.querySelector('#search-input');
const statsBlock = document.querySelector('#stats');

// ГЛАВНОЕ ИЗМЕНЕНИЕ: храним два массива
let allNews = [];       // Исходный массив (от сервера)
let filteredNews = [];  // Отфильтрованный массив (для показа)
let busy = false;

function setBusy(value) {
    busy = value;
    document.querySelectorAll('button').forEach(button => button.disabled = value);
    form.querySelectorAll('input, textarea').forEach(field => field.disabled = value);
    list.setAttribute('aria-busy', String(value));
}

async function request(payload) {
    const options = payload === undefined ? {} : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };
    let response;
    try {
        response = await fetch('api-news.php', options);
    } catch {
        throw new Error('Нет связи с сервером. Перед повтором обновите список.');
    }
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('Сервер вернул не JSON. Проверьте ответ во вкладке Network.');
    }
    if (!response.ok) {
        throw new Error(data.error || `Ошибка HTTP ${response.status}`);
    }
    return data;
}

async function run(task) {
    if (busy) return;
    setBusy(true);
    message.textContent = 'Выполняется запрос…';
    try {
        await task();
    } catch (error) {
        message.textContent = error.message;
    } finally {
        setBusy(false);
    }
}

function render() {
    list.replaceChildren();

    // --- ЛОГИКА СЧЁТЧИКА ---
    if (statsBlock) {
        statsBlock.textContent = `Отображено: ${filteredNews.length} из ${allNews.length} новостей`;
    }

    if (filteredNews.length === 0) {
        const empty = document.createElement('li');
        // Умное сообщение: если фильтр пуст — "нет новостей", если искали — "не найдено"
        const isSearching = searchInput && searchInput.value.trim() !== '';
        empty.textContent = isSearching ? 'Ничего не найдено по этому запросу.' : 'Новостей пока нет.';
        list.append(empty);
        return;
    }

    // --- ОТРИСОВКА СПИСКА ---
    for (const item of filteredNews) { // Рисуем только то, что прошло фильтр
        const li = document.createElement('li');
        const title = document.createElement('strong');
        const content = document.createElement('p');
        const button = document.createElement('button');

        title.textContent = item.title;
        content.textContent = item.content; // textContent защищает от XSS (HTML не выполнится)
        
        button.type = 'button';
        button.textContent = 'Удалить';
        button.disabled = busy;

        button.addEventListener('click', () => {
            if (busy || !confirm('Удалить эту новость?')) return;
            run(async () => {
                const data = await request({ action: 'delete', id: item.id });
                
                // УДАЛЕНИЕ: чистим ОБА массива, чтобы при очистке поиска новость не вернулась
                allNews = allNews.filter(row => String(row.id) !== String(data.deleted));
                filteredNews = filteredNews.filter(row => String(row.id) !== String(data.deleted));
                
                render();
                message.textContent = 'Новость удалена.';
            });
        });

        li.append(title, content, button);
        list.append(li);
    }
}

function loadNews() {
    return run(async () => {
        const data = await request();
        allNews = data.news;       // 1. Сохраняем полный список
        filteredNews = [...allNews]; // 2. Копируем его для отображения
        render();
        message.textContent = 'Список загружен.';
    });
}

// --- ГЛАВНАЯ ЧАСТЬ: ФИЛЬТРАЦИЯ БЕЗ ЗАПРОСА К СЕРВЕРУ ---
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            // Если поле пустое — возвращаем весь список
            filteredNews = [...allNews];
        } else {
            // Фильтруем исходный массив
            filteredNews = allNews.filter(item => 
                item.title.toLowerCase().includes(query)
            );
        }
        render(); // Перерисовываем только список и счётчик
    });
}
// ---------------------------------------------------------

form.addEventListener('submit', event => {
    event.preventDefault();
    if (busy) return;

    const fields = new FormData(form);
    const payload = {
        action: 'create',
        title: fields.get('title'),
        content: fields.get('content')
    };

    run(async () => {
        const data = await request(payload);
        
        // ДОБАВЛЕНИЕ: добавляем в оба массива
        allNews.unshift(data.item);
        filteredNews.unshift(data.item); 
        
        render();
        form.reset();
        message.textContent = 'Новость добавлена.';
    });
});

reload.addEventListener('click', loadNews);
loadNews();
