// Ініціалізуємо Telegram WebApp API
window.Telegram.WebApp.ready();

// Отримуємо інформацію про користувача з Telegram WebApp
const user = window.Telegram.WebApp.initDataUnsafe.user;

// Виводимо інформацію на сторінці
document.addEventListener("DOMContentLoaded", function() {
    if (user) {
        document.getElementById("userId").textContent = `User ID: ${user.id}`;
        document.getElementById("firstName").textContent = `First Name: ${user.first_name}`;
        document.getElementById("lastName").textContent = `Last Name: ${user.last_name || 'Not provided'}`;
        document.getElementById("username").textContent = `Username: ${user.username || 'Not provided'}`;
    } else {
        document.getElementById("userId").textContent = "User data not available.";
    }
});
