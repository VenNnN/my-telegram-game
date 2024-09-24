const apiUrl = 'https://a572-91-210-250-82.ngrok-free.app'; // Зміни на свою адресу, якщо треба
let user_id, username; // Тепер user_id та username будуть отримуватися з Telegram

// Перевіряємо, чи API доступний
if (window.Telegram && window.Telegram.WebApp) {
    // Ініціалізуємо Telegram WebApp API
    let tg = window.Telegram.WebApp;
    tg.ready();  // Сигналізуємо, що додаток готовий до роботи

    // Отримуємо дані користувача
    const user = tg.initDataUnsafe.user;

    if (user) {
        user_id = user.id; // Зберігаємо user_id
        username = user.first_name;
        document.getElementById("userName").textContent = `Hello, ${username}!`;
        console.log("User ID from Telegram: ", user_id);

        // Отримати початкові дані при завантаженні сторінки
        getInitialData();
    } else {
        user_id = 2; // Зберігаємо user_id
        username = 'bot2';
        document.getElementById("userName").textContent = `Hello, ${username}!`;
        getInitialData();
//        console.error("User data is not available.");
    }
} else {
    console.log("Telegram WebApp API is not available.");
}

// Показуємо екран завантаження
function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';
}

// Ховаємо екран завантаження
function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
}

// Викликаємо екран завантаження при старті
window.onload = function() {
    showLoadingScreen();
    showBase(); // Відразу показуємо базу при завантаженні

    // Затримуємо завантаження на 1 секунду перед тим, як ховати екран завантаження
    getInitialData().then(() => {
        setTimeout(() => {
            hideLoadingScreen();
        }, 1000); // Затримка 1 секунда (1000 мілісекунд)
    });
};

// Функція для отримання початкових даних
async function getInitialData() {
    try {
        const response = await fetch(`${apiUrl}/users/${user_id}/${username}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'  // Додаємо цей заголовок
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data); // Перевіримо отримані дані
            updateUI(data); // Оновлюємо інтерфейс користувача
        } else {
            console.error("Failed to fetch user data");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Функція для оновлення даних на UI
function updateUI(data) {
    document.getElementById('wood').textContent = data.wood_amount;
    document.getElementById('food').textContent = data.food_amount;
    document.getElementById('totalWorkers').textContent = data.total_workers;

    document.getElementById('palaceLevel').textContent = data.palace_level;
    document.getElementById('farmLevel').textContent = data.food_farm_level;
    document.getElementById('woodMineLevel').textContent = data.wood_mine_level;
    document.getElementById('workerHouseLevel').textContent = data.worker_house_level;
}

// Функція для запуску апгрейду
async function startUpgrade(building) {
    let endpoint = '';
    switch (building) {
        case 'palace':
            endpoint = `/users/${user_id}/start_upgrade_palace/`;
            break;
        case 'farm':
            endpoint = `/users/${user_id}/start_upgrade_food_farm/`;
            break;
        case 'woodMine':
            endpoint = `/users/${user_id}/start_upgrade_wood_mine/`;
            break;
        case 'workerHouse':
            endpoint = `/users/${user_id}/start_upgrade_worker_house/`;
            break;
    }

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const data = await response.json();
            alert(`${building.charAt(0).toUpperCase() + building.slice(1)} upgrade started!`);
            getInitialData(); // Оновлюємо дані після апгрейду
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Функція для завершення апгрейду
async function finishUpgrade(building) {
    let endpoint = '';
    switch (building) {
        case 'palace':
            endpoint = `/users/${user_id}/finish_upgrade_palace/`;
            break;
        case 'farm':
            endpoint = `/users/${user_id}/finish_upgrade_food_farm/`;
            break;
        case 'woodMine':
            endpoint = `/users/${user_id}/finish_upgrade_wood_mine/`;
            break;
        case 'workerHouse':
            endpoint = `/users/${user_id}/finish_upgrade_worker_house/`;
            break;
    }

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const data = await response.json();
            alert(`${building.charAt(0).toUpperCase() + building.slice(1)} upgrade finished!`);
            getInitialData(); // Оновлюємо дані після завершення апгрейду
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Отримуємо посилання на елементи бази та рейтингу
const mainView = document.getElementById('mainView');
const rankingView = document.getElementById('ranking');

// Показ базової сторінки (Base)
function showBase() {
    resetActiveButtons();
    document.getElementById('btnBase').classList.add('active');
    mainView.style.display = 'grid';   // Показуємо основний контент
    rankingView.style.display = 'none'; // Ховаємо рейтинг
}

// Функції для відкриття та закриття модальних вікон
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Показ сторінки рейтингу (Ranking)
async function showRanking() {
    resetActiveButtons();
    document.getElementById('btnRanking').classList.add('active');
//    mainView.style.display = 'none';    // Ховаємо основний контент
    rankingView.style.display = 'block'; // Показуємо рейтинг

    // Запит на отримання рейтингу
    try {
        const response = await fetch(`${apiUrl}/users/ranking`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'  // Додаємо цей заголовок
            }
        });

        if (response.ok) {
            const rankingData = await response.json();
            const rankingList = document.getElementById('rankingList');
            rankingList.innerHTML = ''; // Очищаємо попередні дані

            rankingData.forEach((user, index) => {
                const item = document.createElement('p');
                item.textContent = `${index + 1}. ${user.username} - Palace Level: ${user.palace_level}`;
                rankingList.appendChild(item);
            });
        } else {
            console.error("Failed to fetch ranking data");
        }
    } catch (error) {
        console.error("Error fetching ranking:", error);
    }
}

// Отримуємо всі кнопки навбару
const navbarButtons = document.querySelectorAll('#navbar button');

// Функція для зняття виділення з усіх кнопок
function resetActiveButtons() {
    navbarButtons.forEach(button => button.classList.remove('active'));
}

// Аналогічні функції для інших кнопок
function showWorkerHouse() {
    resetActiveButtons();
    document.getElementById('btnWorkerHouse').classList.add('active');
    // Додаємо логіку для Worker House
}

function showFoodMine() {
    resetActiveButtons();
    document.getElementById('btnFoodMine').classList.add('active');
    // Додаємо логіку для Food Mine
}

function showWoodMine() {
    resetActiveButtons();
    document.getElementById('btnWoodMine').classList.add('active');
    // Додаємо логіку для Wood Mine
}