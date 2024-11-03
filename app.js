const apiUrl = 'https://00c4-2a05-d014-5d8-2100-24f0-347d-efd9-9ec3.ngrok-free.app'; // Зміни на свою адресу, якщо треба
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
            updateUI(data, 'all', ''); // Оновлюємо інтерфейс користувача
        } else {
            console.error("Failed to fetch user data");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Функція для оновлення кількості працівників на слайдері
function updateWorkersCount(building) {
    const slider = document.getElementById(`${building}WorkersSlider`);
    const countDisplay = document.getElementById(`${building}WorkersCount`);
    countDisplay.textContent = slider.value;
}

// Функція для оновлення даних на UI
function updateUI(data, trigger, building) {
    document.getElementById('wood').textContent = data.wood_amount;
    document.getElementById('food').textContent = data.food_amount;
    document.getElementById('totalWorkers').textContent = data.total_workers;

    document.getElementById('palaceLevel').textContent = data.palace_level;
    document.getElementById('farmLevel').textContent = data.food_farm_level;
    document.getElementById('woodMineLevel').textContent = data.wood_mine_level;
    document.getElementById('workerHouseLevel').textContent = data.worker_house_level;

    updateStartButtonState(data);

    if (trigger == 'all'){
        updateBuildingState('palace', data.palace_upgrade_pending, data.palace_upgrade_start_time,
                            configData['palaceUpgradeTimes'][data.palace_level-1],
                            configData['palaceCostsWood'][data.palace_level-1],
                            configData['palaceCostsFood'][data.palace_level-1]);
        updateBuildingState('workerHouse', data.worker_house_upgrade_pending, data.worker_house_upgrade_start_time,
                            configData['workerHouseUpgradeTimes'][data.worker_house_level-1],
                            configData['workerHouseCostsWood'][data.worker_house_level-1],
                            configData['workerHouseCostsFood'][data.worker_house_level-1]);
        updateBuildingState('foodMine', data.food_farm_upgrade_pending, data.food_farm_upgrade_start_time,
                            configData['foodFarmUpgradeTimes'][data.food_farm_level-1],
                            configData['foodFarmCostsWood'][data.food_farm_level-1],
                            configData['foodFarmCostsFood'][data.food_farm_level-1]);
        updateBuildingState('woodMine', data.wood_mine_upgrade_pending, data.wood_mine_upgrade_start_time,
                            configData['woodMineUpgradeTimes'][data.wood_mine_level-1],
                            configData['woodMineCostsWood'][data.wood_mine_level-1],
                            configData['woodMineCostsFood'][data.wood_mine_level-1]);

        updateFoodMinesState(data);
        updateWoodMinesState(data);
    }
    else{
        if (trigger == 'upgrade'){
            if (building == 'palace'){
                updateBuildingState('palace', data.palace_upgrade_pending, data.palace_upgrade_start_time,
                            configData['palaceUpgradeTimes'][data.palace_level-1],
                            configData['palaceCostsWood'][data.palace_level-1],
                            configData['palaceCostsFood'][data.palace_level-1]);
            }
            if (building == 'workerHouse'){
                updateBuildingState('workerHouse', data.worker_house_upgrade_pending, data.worker_house_upgrade_start_time,
                            configData['workerHouseUpgradeTimes'][data.worker_house_level-1],
                            configData['workerHouseCostsWood'][data.worker_house_level-1],
                            configData['workerHouseCostsFood'][data.worker_house_level-1]);
            }
            if (building == 'farm'){
                updateBuildingState('foodMine', data.food_farm_upgrade_pending, data.food_farm_upgrade_start_time,
                            configData['foodFarmUpgradeTimes'][data.food_farm_level-1],
                            configData['foodFarmCostsWood'][data.food_farm_level-1],
                            configData['foodFarmCostsFood'][data.food_farm_level-1]);
            }
            if (building == 'woodMine'){
                updateBuildingState('woodMine', data.wood_mine_upgrade_pending, data.wood_mine_upgrade_start_time,
                            configData['woodMineUpgradeTimes'][data.wood_mine_level-1],
                            configData['woodMineCostsWood'][data.wood_mine_level-1],
                            configData['woodMineCostsFood'][data.wood_mine_level-1]);
            }
        }
        else {
            if (trigger == 'mine'){
                if (building == 'food'){
                    updateFoodMinesState(data);
                }
                if (building == 'wood'){
                    updateWoodMinesState(data);
                }
            }
        }
    }
}

// Функція для оновлення стану всіх кнопок старт_щось
function updateStartButtonState(data){
    // Чи йде якийсь апгрейд
    isAnyUpgradePending = data.palace_upgrade_pending || data.worker_house_upgrade_pending ||
                          data.food_farm_upgrade_pending || data.wood_mine_upgrade_pending;

    // Кнопка старт апгрейд в палаці
    if(isAnyUpgradePending || (data.wood_amount < configData['palaceCostsWood'][data.palace_level-1] ||
        data.food_amount < configData['palaceCostsFood'][data.palace_level-1])){

        if(isAnyUpgradePending){
            document.querySelector(`#palaceInfo .upgradeBtn`).textContent = 'Another upgrade in progress..';
        }
        else{
            document.querySelector(`#palaceInfo .upgradeBtn`).textContent = 'Insufficient resources..';
        }
        document.querySelector(`#palaceInfo .upgradeBtn`).disabled = true;
        document.querySelector(`#palaceInfo .upgradeBtn`).classList.add('disabled');
    }
    else{
        document.querySelector(`#palaceInfo .upgradeBtn`).textContent = 'Upgrade';

        document.querySelector(`#palaceInfo .upgradeBtn`).disabled = false;
        document.querySelector(`#palaceInfo .upgradeBtn`).classList.remove('disabled');
    }

    // Кнопка старт апгрейд в будинку робітників
    if(isAnyUpgradePending || (data.worker_house_level >= data.palace_level) ||
        (data.wood_amount < configData['workerHouseCostsWood'][data.worker_house_level-1] ||
        data.food_amount < configData['workerHouseCostsFood'][data.worker_house_level-1])){

        if(isAnyUpgradePending){
            document.querySelector(`#workerHouseInfo .upgradeBtn`).textContent = 'Another upgrade in progress..';
        }
        else{
            if(data.worker_house_level >= data.palace_level){
                document.querySelector(`#workerHouseInfo .upgradeBtn`).textContent = 'Upgrade the palace first..';
            }
            else{
                document.querySelector(`#workerHouseInfo .upgradeBtn`).textContent = 'Insufficient resources..';
            }
        }

        document.querySelector(`#workerHouseInfo .upgradeBtn`).disabled = true;
        document.querySelector(`#workerHouseInfo .upgradeBtn`).classList.add('disabled');
    }
    else{
        document.querySelector(`#workerHouseInfo .upgradeBtn`).textContent = 'Upgrade';

        document.querySelector(`#workerHouseInfo .upgradeBtn`).disabled = false;
        document.querySelector(`#workerHouseInfo .upgradeBtn`).classList.remove('disabled');
    }

    // Кнопка старт апгрейд в фермі
    if(isAnyUpgradePending || (data.food_farm_level >= data.palace_level) ||
        data.food_extraction_in_progress ||
        (data.wood_amount < configData['foodFarmCostsWood'][data.food_farm_level-1] ||
        data.food_amount < configData['foodFarmCostsFood'][data.food_farm_level-1])){

        if(isAnyUpgradePending){
            document.querySelector(`#foodMineInfo .upgradeBtn`).textContent = 'Another upgrade in progress..';
        }
        else{
            if(data.food_farm_level >= data.palace_level){
                document.querySelector(`#foodMineInfo .upgradeBtn`).textContent = 'Upgrade the palace first..';
            }
            else{
                if(data.wood_amount < configData['foodFarmCostsWood'][data.food_farm_level-1] ||
                   data.food_amount < configData['foodFarmCostsFood'][data.food_farm_level-1])
                {
                    document.querySelector(`#foodMineInfo .upgradeBtn`).textContent = 'Insufficient resources..';
                }
                else{
                    document.querySelector(`#foodMineInfo .upgradeBtn`).textContent = 'Food extraction..';
                }
            }
        }

        document.querySelector(`#foodMineInfo .upgradeBtn`).disabled = true;
        document.querySelector(`#foodMineInfo .upgradeBtn`).classList.add('disabled');
    }
    else{
        document.querySelector(`#foodMineInfo .upgradeBtn`).textContent = 'Upgrade';

        document.querySelector(`#foodMineInfo .upgradeBtn`).disabled = false;
        document.querySelector(`#foodMineInfo .upgradeBtn`).classList.remove('disabled');
    }

    // Кнопка старт апгрейд в лісопилці
    if(isAnyUpgradePending || data.wood_mine_level >= data.palace_level ||
        data.wood_extraction_in_progress ||
        (data.wood_amount < configData['woodMineCostsWood'][data.wood_mine_level-1] ||
        data.food_amount < configData['woodMineCostsFood'][data.wood_mine_level-1])){

        if(isAnyUpgradePending){
            document.querySelector(`#woodMineInfo .upgradeBtn`).textContent = 'Another upgrade in progress..';
        }
        else{
            if(data.wood_mine_level >= data.palace_level){
                document.querySelector(`#woodMineInfo .upgradeBtn`).textContent = 'Upgrade the palace first..';
            }
            else{
                if(data.wood_amount < configData['woodMineCostsWood'][data.wood_mine_level-1] ||
                   data.food_amount < configData['woodMineCostsFood'][data.wood_mine_level-1])
                {
                    document.querySelector(`#woodMineInfo .upgradeBtn`).textContent = 'Insufficient resources..';
                }
                else{
                    document.querySelector(`#woodMineInfo .upgradeBtn`).textContent = 'Wood extraction..';
                }
            }
        }

        document.querySelector(`#woodMineInfo .upgradeBtn`).disabled = true;
        document.querySelector(`#woodMineInfo .upgradeBtn`).classList.add('disabled');
    }
    else{
        document.querySelector(`#woodMineInfo .upgradeBtn`).textContent = 'Upgrade';

        document.querySelector(`#woodMineInfo .upgradeBtn`).disabled = false;
        document.querySelector(`#woodMineInfo .upgradeBtn`).classList.remove('disabled');
    }

    // Кнопка старт майн в фермі
    if(data.food_farm_upgrade_pending || (data.total_workers - data.workers_on_wood - data.workers_on_food == 0)){
        if(data.food_farm_upgrade_pending){
            document.querySelector(`#foodMineInfo .foodStartBtn`).textContent = 'Farm upgrade..';
        }
        else{
            document.querySelector(`#foodMineInfo .foodStartBtn`).textContent = 'No free workers..';
        }

        document.querySelector(`#foodMineInfo .foodStartBtn`).disabled = true;
        document.querySelector(`#foodMineInfo .foodStartBtn`).classList.add('disabled');
    }
    else{
        document.querySelector(`#foodMineInfo .foodStartBtn`).textContent = 'Start Extraction';

        document.querySelector(`#foodMineInfo .foodStartBtn`).disabled = false;
        document.querySelector(`#foodMineInfo .foodStartBtn`).classList.remove('disabled');
    }

    // Кнопка старт майн в лісопилці
    if(data.wood_mine_upgrade_pending || (data.total_workers - data.workers_on_wood - data.workers_on_food == 0)){
        if(data.wood_mine_upgrade_pending){
            document.querySelector(`#woodMineInfo .woodStartBtn`).textContent = 'Wood mine upgrade..';
        }
        else{
            document.querySelector(`#woodMineInfo .woodStartBtn`).textContent = 'No free workers..';
        }

        document.querySelector(`#woodMineInfo .woodStartBtn`).disabled = true;
        document.querySelector(`#woodMineInfo .woodStartBtn`).classList.add('disabled');
    }
    else{
        document.querySelector(`#woodMineInfo .woodStartBtn`).textContent = 'Start Extraction';

        document.querySelector(`#woodMineInfo .woodStartBtn`).disabled = false;
        document.querySelector(`#woodMineInfo .woodStartBtn`).classList.remove('disabled');
    }
}

// Функція для оновлення стану будівлі
function updateBuildingState(building, isUpgradePending, startTime, duration, woodCost, foodCost) {
    // Оновлення вартості та тривалості апгрейду
    document.getElementById(`${building}WoodCost`).textContent = woodCost;
    document.getElementById(`${building}FoodCost`).textContent = foodCost;
    document.getElementById(`${building}UpgradeDuration`).textContent = duration;

    const upgradeBtn = document.querySelector(`#${building}Info .upgradeBtn`);
    const finishBtn = document.querySelector(`#${building}Info .finishUpgradeBtn`);
    const timerElement = document.querySelector(`#${building}Info .upgradeTimer`);

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

// Оновлення стану шахти їжі
function updateFoodMinesState(data) {
    // Оновлюємо слайдери для ферми та лісопилки
    const availableWorkers = data.total_workers - data.workers_on_wood - data.workers_on_food;

    // Оновлюємо дані для ферми
    document.getElementById('foodMineTimePerWorker').textContent = configData.miningTime;
    document.getElementById('foodMineResourcePerWorker').textContent = configData.resourceGain + data.food_farm_level;
    document.getElementById('foodMineWorkersSlider').max = availableWorkers;
    document.getElementById('woodMineWorkersSlider').max = availableWorkers;

    if (data.food_extraction_in_progress) {
        // Якщо йде добич їжі
        startFoodExtractionTimer(data.food_extraction_start_time, configData.miningTime, data.workers_on_food);
        document.querySelector(`#foodMineInfo .foodStartBtn`).style.display = 'none';
    }
    else{
        document.querySelector(`#foodMineInfo .foodFinishBtn`).style.display = 'none';
        document.querySelector(`#foodMineInfo .foodStartBtn`).style.display = 'block';
    }
}

// Оновлення стану шахти дерева
function updateWoodMinesState(data) {
    // Оновлюємо слайдери для ферми та лісопилки
    const availableWorkers = data.total_workers - data.workers_on_wood - data.workers_on_food;

    // Оновлюємо дані для лісопилки
    document.getElementById('woodMineTimePerWorker').textContent = configData.miningTime;
    document.getElementById('woodMineResourcePerWorker').textContent = configData.resourceGain + data.wood_mine_level;
    document.getElementById('woodMineWorkersSlider').max = availableWorkers;
    document.getElementById('foodMineWorkersSlider').max = availableWorkers;

    if (data.wood_extraction_in_progress) {
        // Якщо йде добич дерева
        startWoodExtractionTimer(data.wood_extraction_start_time, configData.miningTime, data.workers_on_wood);
        document.querySelector(`#woodMineInfo .woodStartBtn`).style.display = 'none';
    }
    else{
        document.querySelector(`#woodMineInfo .woodFinishBtn`).style.display = 'none';
        document.querySelector(`#woodMineInfo .woodStartBtn`).style.display = 'block';
    }
}

// Запуск таймера видобутку їжі
function startFoodExtractionTimer(startTime, duration, workers) {
    const cleanedStartTime = startTime.split('.')[0] + 'Z';  // Додаємо 'Z' для позначення UTC

    const now = Date.now();
    const extractionEndTime = new Date(cleanedStartTime).getTime() + (duration * workers * 1000);
    let timeRemaining = extractionEndTime - now;

    const timerElement = document.querySelector(`#foodMineInfo .foodExtractionTimer`);
    const extractionButton = document.querySelector(`#foodMineInfo .foodStartBtn`);
    const extractionFinishButton = document.querySelector(`#foodMineInfo .foodFinishBtn`);

    if (timeRemaining > 0) {
        timerElement.style.display = 'block';
        extractionButton.style.display = 'none';
        extractionFinishButton.style.display = 'none';

        const minutes = Math.floor((timeRemaining+1000) / 60000);
        const seconds = Math.floor(((timeRemaining+1000) % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        const intervalId = setInterval(() => {
            const minutes = Math.floor(timeRemaining / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeRemaining <= 0) {
                clearInterval(intervalId);
                timerElement.style.display = 'none';
                extractionFinishButton.style.display = 'block';
            }

            timeRemaining -= 1000;
        }, 1000);
    }
    else {
        extractionFinishButton.style.display = 'block';
    }
}

// Запуск таймера видобутку дерева
function startWoodExtractionTimer(startTime, duration, workers) {
    const cleanedStartTime = startTime.split('.')[0] + 'Z';  // Додаємо 'Z' для позначення UTC

    const now = Date.now();
    const extractionEndTime = new Date(cleanedStartTime).getTime() + (duration * workers * 1000);
    let timeRemaining = extractionEndTime - now;

    const timerElement = document.querySelector(`#woodMineInfo .woodExtractionTimer`);
    const extractionButton = document.querySelector(`#woodMineInfo .woodStartBtn`);
    const extractionFinishButton = document.querySelector(`#woodMineInfo .woodFinishBtn`);

    if (timeRemaining > 0) {
        timerElement.style.display = 'block';
        extractionButton.style.display = 'none';
        extractionFinishButton.style.display = 'none';

        const minutes = Math.floor((timeRemaining+1000) / 60000);
        const seconds = Math.floor(((timeRemaining+1000) % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        const intervalId = setInterval(() => {
            const minutes = Math.floor(timeRemaining / 60000);
            const seconds = Math.floor((timeRemaining % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeRemaining <= 0) {
                clearInterval(intervalId);
                timerElement.style.display = 'none';
                extractionFinishButton.style.display = 'block';
            }

            timeRemaining -= 1000;
        }, 1000);
    }
    else {
        extractionFinishButton.style.display = 'block';
    }
}

// Функція для запуску таймера
function startUpgradeTimer(timerElement, timeRemaining) {
    const minutes = Math.floor((timeRemaining+1000) / 60000);
    const seconds = Math.floor(((timeRemaining+1000) % 60000) / 1000);
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
            updateUI(data, 'upgrade', building);
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
            updateUI(data, 'upgrade', building);
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Функція для запуску видобутку ресурсу
async function startExtraction(resource, workers) {
    let endpoint = '';
    switch (resource) {
        case 'food':
            endpoint = `/users/${user_id}/start_food_extraction/?workers_on_food=${workers}`;
            break;
        case 'wood':
            endpoint = `/users/${user_id}/start_wood_extraction/?workers_on_wood=${workers}`;
            break;
    }

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const data = await response.json();
         //   alert(`${workers} workers started ${resource} extraction!`);
            updateUI(data, 'mine', resource);
        } else {
            const error = await response.json();
          //  alert(`Error: ${error.detail}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Функція для завершення видобутку ресурсу
async function finishExtraction(resource) {
    let endpoint = '';
    switch (resource) {
        case 'food':
            endpoint = `/users/${user_id}/finish_food_extraction/`;
            break;
        case 'wood':
            endpoint = `/users/${user_id}/finish_wood_extraction/`;
            break;
    }

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const data = await response.json();
          //  alert(`${resource.charAt(0).toUpperCase() + resource.slice(1)} extraction finished! Gained: ${data.total_food_gained || data.total_wood_gained}`);
            updateUI(data, 'mine', resource);
        } else {
            const error = await response.json();
          //  alert(`Error: ${error.detail}`);
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
                item.innerHTML = `
                    ${index + 1}. ${user.username}<br>
                    Palace Level: ${user.palace_level}<br>
                    Worker House Level: ${user.worker_house_level}<br>
                    Farm Level: ${user.farm_level}<br>
                    Wood Mine Level: ${user.woof_mine_level}<br>
                    Food: ${user.food}<br>
                    Wood: ${user.wood}
                `;
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