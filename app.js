// Перевіряємо, чи API доступний
if (window.Telegram && window.Telegram.WebApp) {
    // Ініціалізуємо Telegram WebApp API
    window.Telegram.WebApp.ready();

    // Отримуємо дані користувача
    const user = window.Telegram.WebApp.initDataUnsafe.user;

    // Виводимо інформацію про користувача на сторінку
    document.getElementById("userId").textContent = `User ID: ${user.id}`;
    document.getElementById("firstName").textContent = `First Name: ${user.first_name}`;
    document.getElementById("lastName").textContent = `Last Name: ${user.last_name || 'Not provided'}`;
    document.getElementById("username").textContent = `Username: ${user.username || 'Not provided'}`;
} else {
    console.log("Telegram WebApp API is not available.");
}
