let palaceLevel = 1;
let workerHouseLevel = 1;
let availableWorkers = 1;
let food = 0;
let wood = 0;
const maxLevel = 5; // Max level for both palace and worker house

const palaceCosts = [100, 200, 400, 800, 1600];
const workerHouseCosts = [50, 100, 200, 400, 800];
const upgradeTimes = [5000, 7000, 9000, 11000, 13000]; // Upgrade times in milliseconds
const miningTime = 5000; // Fixed mining time for simplicity

const buildingsViewBtn = document.getElementById('buildingsViewBtn');
const minesViewBtn = document.getElementById('minesViewBtn');
const buildingsView = document.getElementById('buildingsView');
const minesView = document.getElementById('minesView');

const palaceProgressBar = document.getElementById('palaceProgressBar');
const workerHouseProgressBar = document.getElementById('workerHouseProgressBar');
const palaceProgressTimer = document.getElementById('palaceProgressTimer');
const workerHouseProgressTimer = document.getElementById('workerHouseProgressTimer');
const foodMineProgressContainer = document.getElementById('foodMineProgressContainer');
const woodMineProgressContainer = document.getElementById('woodMineProgressContainer');

buildingsViewBtn.addEventListener('click', () => {
    minesView.style.display = 'none';
    buildingsView.style.display = 'block';
});

minesViewBtn.addEventListener('click', () => {
    buildingsView.style.display = 'none';
    minesView.style.display = 'block';
});

document.getElementById('upgradePalace').addEventListener('click', () => {
    if (palaceLevel < maxLevel && food >= palaceCosts[palaceLevel - 1] && wood >= palaceCosts[palaceLevel - 1]) {
        food -= palaceCosts[palaceLevel - 1];
        wood -= palaceCosts[palaceLevel - 1];
        upgradeBuilding('palace', palaceLevel, palaceProgressBar, palaceProgressTimer);
        palaceLevel++;
        updateDisplay();
    } else {
        alert('Not enough resources or maximum level reached.');
    }
});

document.getElementById('upgradeWorkerHouse').addEventListener('click', () => {
    if (workerHouseLevel < maxLevel && food >= workerHouseCosts[workerHouseLevel - 1] && wood >= workerHouseCosts[workerHouseLevel - 1]) {
        food -= workerHouseCosts[workerHouseLevel - 1];
        wood -= workerHouseCosts[workerHouseLevel - 1];
        upgradeBuilding('workerHouse', workerHouseLevel, workerHouseProgressBar, workerHouseProgressTimer);
        workerHouseLevel++;
        availableWorkers = workerHouseLevel; // Update available workers
        updateDisplay();
    } else {
        alert('Not enough resources or maximum level reached.');
    }
});

document.getElementById('mineFood').addEventListener('click', () => {
    if (availableWorkers > 0) {
        availableWorkers--;
        createWorkerProgressBar('food', foodMineProgressContainer);
        updateDisplay();
    } else {
        alert('No available workers.');
    }
});

document.getElementById('mineWood').addEventListener('click', () => {
    if (availableWorkers > 0) {
        availableWorkers--;
        createWorkerProgressBar('wood', woodMineProgressContainer);
        updateDisplay();
    } else {
        alert('No available workers.');
    }
});

function upgradeBuilding(building, level, progressBar, timerElement) {
    const time = upgradeTimes[level - 1];
    progressBar.style.width = '0%';
    timerElement.textContent = formatTime(time);
    let progress = 0;
    const startTime = Date.now();
    const interval = setInterval(() => {
        progress += 100 / (time / 100);
        progressBar.style.width = progress + '%';
        const elapsedTime = Date.now() - startTime;
        timerElement.textContent = formatTime(Math.max(time - elapsedTime, 0));
        if (progress >= 100) {
            clearInterval(interval);
            updateDisplay();
        }
    }, 100);
}

function createWorkerProgressBar(resource, container) {
    const progressBar = document.createElement('div');
    progressBar.className = 'progressBar';
    const timer = document.createElement('div');
    timer.className = 'progressTimer';
    container.appendChild(progressBar);
    container.appendChild(timer);

    const time = miningTime;
    progressBar.style.width = '0%';
    timer.textContent = formatTime(time);
    let progress = 0;
    const startTime = Date.now();
    const interval = setInterval(() => {
        progress += 100 / (time / 100);
        progressBar.style.width = progress + '%';
        const elapsedTime = Date.now() - startTime;
        timer.textContent = formatTime(Math.max(time - elapsedTime, 0));
        if (progress >= 100) {
            clearInterval(interval);
            if (resource === 'food') {
                food += 100;
            } else if (resource === 'wood') {
                wood += 100;
            }
            availableWorkers++;
            updateDisplay();
            container.removeChild(progressBar); // Remove the progress bar when done
            container.removeChild(timer); // Remove the timer when done
        }
    }, 100);
}

function formatTime(ms) {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
}

function updateDisplay() {
    document.getElementById('palaceLevel').textContent = palaceLevel;
    document.getElementById('workerHouseLevel').textContent = workerHouseLevel;
    document.getElementById('foodBalance').textContent = food;
    document.getElementById('woodBalance').textContent = wood;
    document.getElementById('availableWorkers').textContent = availableWorkers;
    document.getElementById('foodMineWorkers').textContent = availableWorkers;
    document.getElementById('woodMineWorkers').textContent = availableWorkers;
    document.getElementById('palaceCost').textContent = `${palaceCosts[palaceLevel - 1]} food, ${palaceCosts[palaceLevel - 1]} wood`;
    document.getElementById('workerHouseCost').textContent = `${workerHouseCosts[workerHouseLevel - 1]} food, ${workerHouseCosts[workerHouseLevel - 1]} wood`;
}

updateDisplay();
