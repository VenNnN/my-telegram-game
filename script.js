// Function to load the configuration from an external file
async function loadConfig() {
    const response = await fetch('config.json');
    return await response.json();
}

function toggleInfo(buildingId) {
    const infoElement = document.getElementById(buildingId + 'Info');
    infoElement.style.display = 'block';
    const closeButton = document.getElementById('close' + capitalizeFirstLetter(buildingId) + 'Info');
    closeButton.onclick = function () {
        infoElement.style.display = 'none';
    };
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Load configuration and initialize the game
loadConfig().then(config => {
    let palaceLevel = loadState('palaceLevel', 1);
    let workerHouseLevel = loadState('workerHouseLevel', 1);
    let availableWorkers = loadState('availableWorkers', 1);
    let food = loadState('food', 100);
    let wood = loadState('wood', 100);
    let miningData = JSON.parse(localStorage.getItem('miningData')) || {};
    let upgradeData = JSON.parse(localStorage.getItem('upgradeData')) || {};

    const maxLevel = config.maxLevel;
    const palaceCosts = config.palaceCosts;
    const workerHouseCosts = config.workerHouseCosts;
    const upgradeTimes = config.upgradeTimes;
    const miningTime = config.miningTime;
    const resourceGain = config.resourceGain;

    let isUpgradingPalace = false;
    let isUpgradingWorkerHouse = false;

    const palaceProgressTimer = document.getElementById('palaceProgress'); // Corrected ID
    const workerHouseProgressTimer = document.getElementById('workerHouseProgress'); // Corrected ID
    const foodMineProgressContainer = document.getElementById('foodMineProgressContainer');
    const woodMineProgressContainer = document.getElementById('woodMineProgressContainer');

    document.getElementById('upgradePalace').addEventListener('click', () => {
        if (!isUpgradingPalace && palaceLevel < maxLevel && food >= palaceCosts[palaceLevel - 1] && wood >= palaceCosts[palaceLevel - 1]) {
            food -= palaceCosts[palaceLevel - 1];
            wood -= palaceCosts[palaceLevel - 1];
            isUpgradingPalace = true;
            startUpgrade('palace', palaceLevel, palaceProgressTimer, () => {
                isUpgradingPalace = false;
                palaceLevel++; // Збільшення рівня після завершення прокачки
                saveState('palaceLevel', palaceLevel);
                updateDisplay();
            });
            updateDisplay(); // Оновлення відображення після запуску апгрейда
        } else {
        }
    });

    document.getElementById('upgradeWorkerHouse').addEventListener('click', () => {
        if (!isUpgradingWorkerHouse && workerHouseLevel < maxLevel && food >= workerHouseCosts[workerHouseLevel - 1] && wood >= workerHouseCosts[workerHouseLevel - 1]) {
            food -= workerHouseCosts[workerHouseLevel - 1];
            wood -= workerHouseCosts[workerHouseLevel - 1];
            isUpgradingWorkerHouse = true;
            startUpgrade('workerHouse', workerHouseLevel, workerHouseProgressTimer, () => {
                isUpgradingWorkerHouse = false;
                workerHouseLevel++; // Збільшення рівня після завершення прокачки
                availableWorkers = workerHouseLevel; // Оновлення доступних робітників після завершення апгрейда
                saveState('workerHouseLevel', workerHouseLevel);
                saveState('availableWorkers', availableWorkers);
                updateDisplay();
            });
            updateDisplay(); // Оновлення відображення після запуску апгрейда
        } else {
        }
    });

    let isMiningFood = false;
    let isMiningWood = false;

    document.getElementById('mineFood').addEventListener('click', () => {
        const workers = parseInt(document.getElementById('workersFood').value);
        if (workers > 0 && workers <= availableWorkers && !isMiningFood) { // Перевірка статусу видобутку
            availableWorkers -= workers;
            saveState('availableWorkers', availableWorkers);
            isMiningFood = true; // Позначити, що видобуток їжі розпочався
            startMining('food', foodMineProgressContainer, workers);
            updateDisplay();
        }
        // Нічого не робимо, якщо кількість робітників некоректна або вже йде видобуток
    });

    document.getElementById('mineWood').addEventListener('click', () => {
        const workers = parseInt(document.getElementById('workersWood').value);
        if (workers > 0 && workers <= availableWorkers && !isMiningWood) { // Перевірка статусу видобутку
            availableWorkers -= workers;
            saveState('availableWorkers', availableWorkers);
            isMiningWood = true; // Позначити, що видобуток деревини розпочався
            startMining('wood', woodMineProgressContainer, workers);
            updateDisplay();
        }
        // Нічого не робимо, якщо кількість робітників некоректна або вже йде видобуток
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        localStorage.clear();
        initializeGame();
        updateDisplay();
    });

        // Функція для оновлення значення слайдера та доступних робітників
    function updateSliderMax() {
        const availableWorkers = loadState('availableWorkers', 1); // Загальна кількість доступних робітників
        document.getElementById('workersFood').max = availableWorkers;
        document.getElementById('workersWood').max = availableWorkers;
        document.getElementById('workersFood').value = Math.min(availableWorkers, document.getElementById('workersFood').value || 0);
        document.getElementById('workersWood').value = Math.min(availableWorkers, document.getElementById('workersWood').value || 0);
        document.getElementById('workersFoodValue').textContent = document.getElementById('workersFood').value;
        document.getElementById('workersWoodValue').textContent = document.getElementById('workersWood').value;
    }

    // Встановлення слухачів подій для слайдерів
    document.getElementById('workersFood').addEventListener('input', function () {
        document.getElementById('workersFoodValue').textContent = this.value;
    });

    document.getElementById('workersWood').addEventListener('input', function () {
        document.getElementById('workersWoodValue').textContent = this.value;
    });

    function initializeGame() {
        palaceLevel = 1;
        workerHouseLevel = 1;
        availableWorkers = 1;
        food = 100;
        wood = 100;

        saveState('palaceLevel', palaceLevel);
        saveState('workerHouseLevel', workerHouseLevel);
        saveState('availableWorkers', availableWorkers);
        saveState('food', food);
        saveState('wood', wood);
        localStorage.removeItem('miningData');
        localStorage.removeItem('upgradeData');
    }

    function startUpgrade(building, level, timerElement, onComplete) {
        const time = upgradeTimes[level - 1];

        // Перевірка, чи time є числом і більше нуля
        if (isNaN(time) || time <= 0) {
            alert('Неправильний час оновлення для цього рівня.');
            return;
        }

        const endTime = Date.now() + time;
        saveUpgradeData(building, endTime);

        // Елемент для таймера в додатковій інформації
        const infoTimerElement = document.getElementById(building + 'InfoProgress');
        updateUpgradeTimer(timerElement, infoTimerElement, endTime, onComplete);
    }

    function saveUpgradeData(building, endTime) {
        const data = {
            endTime: endTime,
            building: building
        };
        upgradeData[building] = data;
        localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
    }

    function restoreUpgradeData() {
        for (const building in upgradeData) {
            const data = upgradeData[building];
            if (data && data.endTime) { // Перевірка, чи існує data і endTime
                const timerElement = building === 'palace' ? palaceProgressTimer : workerHouseProgressTimer;
                const infoTimerElement = document.getElementById(building + 'InfoProgress');
                updateUpgradeTimer(timerElement, infoTimerElement, data.endTime, () => {});
            }
        }
    }

    function updateUpgradeTimer(timerElement, infoTimerElement, endTime, onComplete) {
        // Перевірка, чи endTime є числом
        if (isNaN(endTime) || endTime <= Date.now()) {
            timerElement.textContent = ''; // Очищення тексту таймера
            if (infoTimerElement) infoTimerElement.textContent = ''; // Очищення тексту таймера у додатковій інформації
            if (onComplete) onComplete();
            return; // Вихід, якщо немає коректного endTime
        }

        const interval = setInterval(() => {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(interval);
                timerElement.textContent = ''; // Очищення таймера на карті
                if (infoTimerElement) infoTimerElement.textContent = ''; // Очищення таймера в додатковій інформації
                updateDisplay();
                delete upgradeData[timerElement.id];
                localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
                if (onComplete) onComplete();
            } else {
                const formattedTime = formatTime(remainingTime);
                timerElement.textContent = formattedTime; // Оновлення таймера на карті
                if (infoTimerElement) infoTimerElement.textContent = formattedTime; // Оновлення таймера в додатковій інформації
            }
        }, 100);
    }

    function startMining(resource, container, workers) {
        const timer = document.createElement('span');
        timer.className = 'progressTimer';
        const timerId = Date.now(); // Unique identifier for each timer
        timer.id = `timer-${timerId}`;
        container.appendChild(timer);

        const time = miningTime * workers; // Загальний час добування пропорційний кількості робітників
        const endTime = Date.now() + time;
        saveMiningData(resource, endTime, timer.id, workers); // Зберігаємо дані про видобуток разом з кількістю робітників

        // Save available workers in localStorage after assigning a worker
        saveState('availableWorkers', availableWorkers);
        updateMiningTimer(timer, endTime, resource, workers);
    }

    function saveMiningData(resource, endTime, timerId, workers) {
        const data = {
            endTime: endTime,
            resource: resource,
            workers: workers
        };
        miningData[timerId] = data;
        localStorage.setItem('miningData', JSON.stringify(miningData));
    }

    function restoreMiningData() {
        for (const id in miningData) {
            const data = miningData[id];
            const container = data.resource === 'food' ? foodMineProgressContainer : woodMineProgressContainer;
            const timer = document.createElement('span');
            timer.className = 'progressTimer';
            timer.id = id;
            container.appendChild(timer);

            const buildingTimerElement = document.getElementById(data.resource + 'MineProgress');
            updateMiningTimer(timer, data.endTime, data.resource, data.workers);
        }
    }

    function updateMiningTimer(timer, endTime, resource, workers) {
        const buildingTimerElement = document.getElementById(resource + 'MineProgress'); // Таймер на будівлі
        const interval = setInterval(() => {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(interval);
                const resourceType = miningData[timer.id].resource;
                if (resourceType === 'food') {
                    food += resourceGain * workers;
                    isMiningFood = false; // Скидаємо статус видобутку їжі після завершення
                } else if (resourceType === 'wood') {
                    wood += resourceGain * workers;
                    isMiningWood = false; // Скидаємо статус видобутку деревини після завершення
                }
                availableWorkers += workers; // Повертаємо робітників після завершення видобутку

                // Зберігаємо ресурси та доступних робітників у localStorage
                saveState('food', food);
                saveState('wood', wood);
                saveState('availableWorkers', availableWorkers);
                updateDisplay();
                delete miningData[timer.id];
                localStorage.setItem('miningData', JSON.stringify(miningData));
                timer.remove();
                buildingTimerElement.textContent = ''; // Очищення таймера на будівлі
            } else {
                const formattedTime = formatTime(remainingTime);
                timer.textContent = formattedTime;
                buildingTimerElement.textContent = formattedTime; // Оновлення таймера на будівлі
            }
        }, 100);
    }

    function formatTime(ms) {
        const totalSeconds = Math.ceil(ms / 1000); // Перетворюємо мілісекунди на секунди
        const days = Math.floor(totalSeconds / 86400); // Обчислюємо дні
        const hours = Math.floor((totalSeconds % 86400) / 3600); // Обчислюємо години
        const minutes = Math.floor((totalSeconds % 3600) / 60); // Обчислюємо хвилини
        const seconds = totalSeconds % 60; // Обчислюємо секунди

        let formattedTime = '';
        if (days > 0) {
            formattedTime += `${days}d `;
        }
        if (hours > 0 || days > 0) { // Додаємо години, якщо є дні або години більше нуля
            formattedTime += `${hours}h `;
        }
        if (minutes > 0 || hours > 0 || days > 0) { // Додаємо хвилини, якщо є дні, години або хвилини більше нуля
            formattedTime += `${minutes}m `;
        }
        formattedTime += `${seconds}s`; // Додаємо секунди в будь-якому випадку

        return formattedTime;
    }

    function updateWorkerCount() {
        // Рахуємо кількість робітників, які зараз зайняті на видобутку
        const workersInMines = Object.values(miningData).reduce((total, data) => total + data.workers, 0);
        const totalWorkers = workerHouseLevel; // Загальна кількість робітників відповідає рівню будинку для робітників
        availableWorkers = totalWorkers - workersInMines; // Обчислюємо кількість доступних робітників

        // Зберігаємо оновлену кількість робітників у localStorage
        saveState('availableWorkers', availableWorkers);

        // Оновлюємо відображення
        updateDisplay();
    }

    // Call the updateWorkerCount function every second
    setInterval(updateWorkerCount, 1000);

    function updateDisplay() {
        document.getElementById('palaceLevel').textContent = palaceLevel;
        document.getElementById('workerHouseLevel').textContent = workerHouseLevel;
        document.getElementById('foodBalance').textContent = food;
        document.getElementById('woodBalance').textContent = wood;
        document.getElementById('availableWorkers').textContent = availableWorkers;
        document.getElementById('palaceCost').textContent = `${palaceCosts[palaceLevel - 1]} food, ${palaceCosts[palaceLevel - 1]} wood`;
        document.getElementById('workerHouseCost').textContent = `${workerHouseCosts[workerHouseLevel - 1]} food, ${workerHouseCosts[workerHouseLevel - 1]} wood`;

        saveState('palaceLevel', palaceLevel);
        saveState('workerHouseLevel', workerHouseLevel);
        saveState('availableWorkers', availableWorkers);
        saveState('food', food);
        saveState('wood', wood);

        // Оновлення максимального значення слайдера
        updateSliderMax();

        // Блокування або розблокування кнопок видобутку
        document.getElementById('mineFood').disabled = isMiningFood;
        document.getElementById('mineWood').disabled = isMiningWood;
    }

    function loadState(key, defaultValue) {
        const value = localStorage.getItem(key);
        return value !== null && !isNaN(value) ? parseInt(value) : defaultValue;
    }

    function saveState(key, value) {
        localStorage.setItem(key, value);
    }

    restoreMiningData();
    restoreUpgradeData();
    updateDisplay();
});
