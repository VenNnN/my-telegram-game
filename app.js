const apiUrl = 'https://0f41-91-210-250-82.ngrok-free.app'; // Зміни на свою адресу, якщо треба
let user_id; // Тепер user_id буде отримуватися з Telegram

// Перевіряємо, чи API доступний
if (window.Telegram && window.Telegram.WebApp) {
    // Ініціалізуємо Telegram WebApp API
    let tg = window.Telegram.WebApp;
    tg.ready();  // Сигналізуємо, що додаток готовий до роботи

    // Отримуємо дані користувача
    const user = tg.initDataUnsafe.user;

    if (user) {
        user_id = user.id; // Зберігаємо user_id
        console.log("User ID from Telegram: ", user_id);

        // Отримати початкові дані при завантаженні сторінки
        getInitialData();
    } else {
        console.error("User data is not available.");
    }
} else {
    console.log("Telegram WebApp API is not available.");
}

// Функція для отримання початкових даних
async function getInitialData() {
    try {
        const response = await fetch(`${apiUrl}/users/${user_id}`, {
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

// Функція для запуску апгрейду з таймером
async function startUpgrade(building) {
    let endpoint = '';
    let upgradeDurationKey = '';
    let buildingElement = '';

    // Вибір endpoint для будівлі
    switch (building) {
        case 'palace':
            endpoint = `/users/${user_id}/start_upgrade_palace/`;
            buildingElement = document.getElementById('palaceUpgradeTimer');
            break;
        case 'farm':
            endpoint = `/users/${user_id}/start_upgrade_food_farm/`;
            buildingElement = document.getElementById('farmUpgradeTimer');
            break;
        case 'woodMine':
            endpoint = `/users/${user_id}/start_upgrade_wood_mine/`;
            buildingElement = document.getElementById('woodMineUpgradeTimer');
            break;
        case 'workerHouse':
            endpoint = `/users/${user_id}/start_upgrade_worker_house/`;
            buildingElement = document.getElementById('workerHouseUpgradeTimer');
            break;
    }

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const data = await response.json();

            // Отримуємо час початку апгрейду та тривалість
            const startTime = new Date(data.palace_upgrade_start_time);  // Час початку
            const upgradeDuration = data.upgrade_duration * 1000;  // Тривалість у мілісекундах

            alert(`${building.charAt(0).toUpperCase() + building.slice(1)} upgrade started!`);

            // Оновлюємо таймер
            startCountdownTimer(startTime, upgradeDuration, buildingElement);

            getInitialData(); // Оновлюємо дані після апгрейду
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Функція для запуску таймера зворотного відліку
function startCountdownTimer(startTime, upgradeDuration, element) {
    const endTime = new Date(startTime.getTime() + upgradeDuration);

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            element.textContent = "Upgrade complete!";
        } else {
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            element.textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
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
