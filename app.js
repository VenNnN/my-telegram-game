// Ініціалізуємо Telegram WebApp API
window.Telegram.WebApp.ready();

// Отримуємо інформацію про користувача з Telegram WebApp
const webApp = window.Telegram.WebApp;
const user = webApp.initDataUnsafe.user;

// Виводимо інформацію на сторінці або діагностуємо проблему
document.addEventListener("DOMContentLoaded", function() {
    if (user) {
        document.getElementById("userId").textContent = `User ID: ${user.id}`;
        document.getElementById("firstName").textContent = `First Name: ${user.first_name}`;
        document.getElementById("lastName").textContent = `Last Name: ${user.last_name || 'Not provided'}`;
        document.getElementById("username").textContent = `Username: ${user.username || 'Not provided'}`;

        // Додатковий відлагоджувальний вивід у консоль
        console.log("User data:", user);
    } else {
        document.getElementById("userId").textContent = "User ID: Not available";
        document.getElementById("firstName").textContent = "First Name: Not available";
        document.getElementById("lastName").textContent = "Last Name: Not available";
        document.getElementById("username").textContent = "Username: Not available";

        // Виводимо ініціалізовані дані для діагностики
        console.log("No user data found.");
        console.log("initData:", webApp.initData);
        console.log("initDataUnsafe:", webApp.initDataUnsafe);
    }
});
