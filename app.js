// Отримуємо параметри з URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
const firstName = urlParams.get('first_name');
const lastName = urlParams.get('last_name');
const username = urlParams.get('username');

// Виводимо інформацію на сторінці
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("userId").textContent = `User ID: ${userId}`;
    document.getElementById("firstName").textContent = `First Name: ${firstName}`;
    document.getElementById("lastName").textContent = `Last Name: ${lastName || 'Not provided'}`;
    document.getElementById("username").textContent = `Username: ${username || 'Not provided'}`;
});
