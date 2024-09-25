const apiUrl = 'https://a572-91-210-250-82.ngrok-free.app'; // Зміни на свою адресу, якщо треба
let user_id, username; // Тепер user_id та username будуть отримуватися з Telegram

let configData = null; // Змінна, яка буде доступна у всьому файлі

// Функція для завантаження конфігурації
function loadConfig() {
    return fetch('config.json') // Вкажіть правильний шлях до файлу
      .then(response => response.json())
      .then(data => {
        configData = data; // Зберігаємо дані у глобальній змінній
        console.log('Config loaded:', configData);
      })
      .catch(error => {
        console.error('Error fetching the config file:', error);
      });
}

function loadUserData(){
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
        user_id = 6; // Зберігаємо user_id
        username = 'bot6';
        document.getElementById("userName").textContent = `Hello, ${username}!`;
        getInitialData();
//        console.error("User data is not available.");
    }
}

loadUserData();
loadConfig();

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
        }, 200); // Затримка 1 секунда (1000 мілісекунд)
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

    isAnyUpgradePending = data.palace_upgrade_pending || data.worker_house_upgrade_pending ||
                          data.food_farm_upgrade_pending || data.wood_mine_upgrade_pending;
    updateBuildingState('palace', data.palace_upgrade_pending, data.palace_upgrade_start_time,
                        configData['palaceUpgradeTimes'][data.palace_level-1], isAnyUpgradePending,
                        configData['palaceCostsWood'][data.palace_level-1],
                        configData['palaceCostsFood'][data.palace_level-1]);
    updateBuildingState('workerHouse', data.worker_house_upgrade_pending, data.worker_house_upgrade_start_time,
                        configData['workerHouseUpgradeTimes'][data.worker_house_level-1], isAnyUpgradePending,
                        configData['workerHouseCostsWood'][data.worker_house_level-1],
                        configData['workerHouseCostsFood'][data.worker_house_level-1]);
    updateBuildingState('foodMine', data.food_farm_upgrade_pending, data.food_farm_upgrade_start_time,
                        configData['foodFarmUpgradeTimes'][data.food_farm_level-1], isAnyUpgradePending,
                        configData['foodFarmCostsWood'][data.food_farm_level-1],
                        configData['foodFarmCostsFood'][data.food_farm_level-1]);
    updateBuildingState('woodMine', data.wood_mine_upgrade_pending, data.wood_mine_upgrade_start_time,
                        configData['woodMineUpgradeTimes'][data.wood_mine_level-1], isAnyUpgradePending,
                        configData['woodMineCostsWood'][data.wood_mine_level-1],
                        configData['woodMineCostsFood'][data.wood_mine_level-1]);
}

// Функція для оновлення стану будівлі
function updateBuildingState(building, isUpgradePending, startTime, duration, isAnyUpgradePending, woodCost, foodCost) {
    // Оновлення вартості та тривалості апгрейду
    document.getElementById(`${building}WoodCost`).textContent = woodCost;
    document.getElementById(`${building}FoodCost`).textContent = foodCost;
    document.getElementById(`${building}UpgradeDuration`).textContent = duration;

    const upgradeBtn = document.querySelector(`#${building}Info .upgradeBtn`);
    const finishBtn = document.querySelector(`#${building}Info .finishUpgradeBtn`);
    const timerElement = document.querySelector(`#${building}Info .upgradeTimer`);

    if (isAnyUpgradePending && !isUpgradePending) {
        // Якщо інша будівля в процесі апгрейду - вимикаємо кнопки
        upgradeBtn.disabled = true;
        upgradeBtn.classList.add('disabled');
        timerElement.style.display = 'none';
        return;
    } else {
        // Якщо апгрейд не йде для цієї будівлі
        upgradeBtn.disabled = false
        upgradeBtn.classList.remove('disabled');
    }

    if (!isUpgradePending) {
        // Якщо апгрейд не йде - показати кнопку "Upgrade"
        upgradeBtn.style.display = 'block';
        finishBtn.style.display = 'none';
        timerElement.style.display = 'none';
    } else {
        const cleanedStartTime = startTime.split('.')[0] + 'Z';  // Додаємо 'Z' для позначення UTC

        const now = Date.now();
        const upgradeEndTime = new Date(cleanedStartTime).getTime() + (duration * 1000);
        const timeRemaining = upgradeEndTime - now;
        if (timeRemaining > 0) {
            // Показуємо таймер
            upgradeBtn.style.display = 'none';
            finishBtn.style.display = 'none';
            timerElement.style.display = 'block';
            startUpgradeTimer(timerElement, timeRemaining);
        } else {
            // Якщо апгрейд завершився - показати кнопку "Finish Upgrade"
            upgradeBtn.style.display = 'none';
            finishBtn.style.display = 'block';
            timerElement.style.display = 'none';
        }
    }
}

// Функція для запуску таймера
function startUpgradeTimer(timerElement, timeRemaining) {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000) + 1;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const intervalId = setInterval(() => {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeRemaining <= 0) {
            clearInterval(intervalId);
            timerElement.style.display = 'none';
            // Показати кнопку "Finish Upgrade" після завершення таймера
            const finishBtn = timerElement.parentElement.querySelector('.finishUpgradeBtn');
            finishBtn.style.display = 'block';
        }

        timeRemaining -= 1000;
    }, 1000);
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
            //alert(`${building.charAt(0).toUpperCase() + building.slice(1)} upgrade started!`);
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
            //alert(`${building.charAt(0).toUpperCase() + building.slice(1)} upgrade finished!`);
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