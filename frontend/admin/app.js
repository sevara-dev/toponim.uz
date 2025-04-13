// API URL
const API_URL = 'https://toponim-uz.onrender.com';
let token = localStorage.getItem('token');

// Agar token yo'q bo'lsa, login sahifasiga yo'naltirish
if (!token) {
    window.location.href = 'login.html';
}

// API so'rovlari uchun funksiya
async function fetchAPI(endpoint, options = {}) {
    // Ensure token is always up-to-date
    token = localStorage.getItem('token');
    if (token) {
        options.headers = {
            ...options.headers,
           