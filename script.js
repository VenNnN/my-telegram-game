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
    let food = loadState('food', 0);
    let wood = loadState('wood', 0);
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
            });
            palaceLevel++;
            saveState('palaceLevel', palaceLevel);
            updateDisplay();
        } else {
            alert('Not enough resources, maximum level reached, or an upgrade is already in progress.');
        }
    });

    document.getElementById('upgradeWorkerHouse').addEventListener('click', () => {
        if (!isUpgradingWorkerHouse && workerHouseLevel < maxLevel && food >= workerHouseCosts[workerHouseLevel - 1] && wood >= workerHouseCosts[workerHouseLevel - 1]) {
            food -= workerHouseCosts[workerHouseLevel - 1];
            wood -= workerHouseCosts[workerHouseLevel - 1];
            isUpgradingWorkerHouse = true;
            startUpgrade('workerHouse', workerHouseLevel, workerHouseProgressTimer, () => {
                isUpgradingWorkerHouse = false;
            });
            workerHouseLevel++;
            availableWorkers = workerHouseLevel; // Update available workers
            saveState('workerHouseLevel', workerHouseLevel);
            saveState('availableWorkers', availableWorkers);
            updateDisplay();
        } else {
            alert('Not enough resources, maximum level reached, or an upgrade is already in progress.');
        }
    });

    document.getElementById('mineFood').addEventListener('click', () => {
        const workers = parseInt(document.getElementById('workersFood').value); // Кількість робітників для їжі
        if (availableWorkers >= workers) {
            availableWorkers -= workers;
            saveState('availableWorkers', availableWorkers); // Save state after reducing workers
            startMining('food', foodMineProgressContainer, workers); // Передаємо кількість робітників
            updateDisplay();
        } else {
            alert('Not enough workers.');
        }
    });

    document.getElementById('mineWood').addEventListener('click', () => {
        const workers = parseInt(document.getElementById('workersWood').value); // Кількість робітників для дерева
        if (availableWorkers >= workers) {
            availableWorkers -= workers;
            saveState('availableWorkers', availableWorkers); // Save state after reducing workers
            startMining('wood', woodMineProgressContainer, workers); // Передаємо кількість робітників
            updateDisplay();
        } else {
            alert('Not enough workers.');
        }
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm("Are you sure you want to reset all progress?")) {
            localStorage.clear();
            initializeGame();
            updateDisplay();
        }
    });

    function initializeGame() {
        palaceLevel = 1;
        workerHouseLevel = 1;
        availableWorkers = 1;
        food = 0;
        wood = 0;

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
        const endTime = Date.now() + time;
        saveUpgradeData(building, endTime);
        updateUpgradeTimer(timerElement, endTime, onComplete);
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
            const timerElement = building === 'palace' ? palaceProgressTimer : workerHouseProgressTimer;
            updateUpgradeTimer(timerElement, data.endTime, () => {});
        }
    }

    function updateUpgradeTimer(timerElement, endTime, onComplete) {
        const interval = setInterval(() => {
            const remainingTime = endTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(interval);
                timerElement.textContent = ''; // Clear the timer text
                updateDisplay();
                delete upgradeData[timerElement.id];
                localStorage.setItem('upgradeData', JSON.stringify(upgradeData));
                if (onComplete) onComplete();
            } else {
                timerElement.textContent = `${formatTime(remainingTime)}`; // Update timer text
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
                } else if (resourceType === 'wood') {
                    wood += resourceGain * workers;
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
