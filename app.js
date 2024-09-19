const apiUrl = 'https://c80c-91-210-250-82.ngrok-free.app'; // Зміни на свою адресу, якщо треба

// Ініціалізуємо Telegram WebApp API
window.Telegram.WebApp.ready();

// Отримуємо інформацію про користувача з Telegram WebApp
const user = window.Telegram.WebApp.initDataUnsafe.user;

// Перевіряємо, чи є інформація про користувача
if (user) {
    document.addEventListener("DOMContentLoaded", function() {
        document.getElementById("userId").textContent = `User ID: ${user.id}`;
        document.getElementById("firstName").textContent = `First Name: ${user.first_name}`;
        document.getElementById("lastName").textContent = `Last Name: ${user.last_name ? user.last_name : 'Not provided'}`;
        document.getElementById("username").textContent = `Username: ${user.username ? user.username : 'Not provided'}`;
    });

    let user_id = user.id; // Використовуємо ID користувача

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

    // Отримати початкові дані при завантаженні сторінки
    window.onload = getInitialData;

} else {
    console.error("User information not available from Telegram WebApp");
}
