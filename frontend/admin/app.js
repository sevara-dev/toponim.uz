// API URL
const API_URL = 'https://toponim-uz.onrender.com';
let token = localStorage.getItem('token');

// Agar token yo'q bo'lsa, login sahifasiga yo'naltirish
if (!token) {
    window.location.href = 'login.html';
}

// API so'rovlari uchun funksiya
async function fetchAPI(endpoint, options = {}) {
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    } else {
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (response.status === 401) {
            // Token eskirgan yoki noto'g'ri
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }
        return await response.json();
    } catch (error) {
        console.error('API xatosi:', error);
        return null;
    }
}

// Sahifalar orasida o'tish
document.querySelectorAll('nav li').forEach(item => {
    item.addEventListener('click', () => {
        // Aktiv elementni o'zgartirish
        document.querySelector('nav li.active').classList.remove('active');
        item.classList.add('active');

        // Sahifani ko'rsatish
        const pageId = item.dataset.page;
        document.querySelectorAll('.content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');

        // Ma'lumotlarni yuklash
        loadPageData(pageId);
    });
});

// Sahifa ma'lumotlarini yuklash
async function loadPageData(pageId) {
    switch (pageId) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'toponims':
            await loadToponims();
            break;
        case 'messages':
            await loadMessages();
            break;
        case 'users':
            await loadUsers();
            break;
    }
}

// Dashboard ma'lumotlarini yuklash
async function loadDashboardData() {
    const [toponims, messages, users] = await Promise.all([
        fetchAPI('/toponims/'),
        fetchAPI('/messages/'),
        fetchAPI('/users/')
    ]);

    if (toponims) document.getElementById('toponimCount').textContent = toponims.length;
    if (messages) {
        document.getElementById('messageCount').textContent = messages.filter(m => !m.is_read).length;
        document.getElementById('unreadMessages').textContent = messages.filter(m => !m.is_read).length;
    }
    if (users) document.getElementById('userCount').textContent = users.length;
}

// Toponim turlariga mos ranglar
const typeColors = {
    'Shahar': '#3498db',
    'Shaharcha': '#2980b9',
    'Qishloq': '#27ae60',
    'Aholi punkti': '#2ecc71',
    'Mahalla': '#f1c40f',
    'Ko\'cha': '#e67e22',
    'Marmar koni': '#800000',
    'Oltin koni': '#ffd700',
    'Volfram koni': '#c0c0c0',
    'Urochishe': '#8e44ad',
    'Do\'nglik': '#795548',
    'Quruq o\'zan': '#d7ccc8',
    'Tog\'': '#6d4c41',
    'Tog\'lar': '#5d4037',
    'Daryo': '#00bcd4',
    'Buloq': '#80deea',
    'Dovon': '#ff80ab',
    'Ko\'l': '#4fc3f7',
    'Ko\'chki': '#f44336',
    'Qo\'rg\'on': '#b71c1c',
    'Tog\' tizmasi': '#4e342e',
    'Yuvilma o\'yiq': '#bdbdbd'
};

// Toponim turlariga mos belgilar
const typeIcons = {
    'Shahar': '🏢',
    'Shaharcha': '🏘️',
    'Qishloq': '🏡',
    'Aholi punkti': '🏠',
    'Mahalla': '🏘️',
    'Ko\'cha': '🛣️',
    'Marmar koni': '⛰️',
    'Oltin koni': '💰',
    'Volfram koni': '⚒️',
    'Urochishe': '🏞️',
    'Do\'nglik': '⛰️',
    'Quruq o\'zan': '🏜️',
    'Tog\'': '🗻',
    'Tog\'lar': '🏔️',
    'Daryo': '🌊',
    'Buloq': '💧',
    'Dovon': '🏔️',
    'Ko\'l': '💧',
    'Ko\'chki': '⚠️',
    'Qo\'rg\'on': '🏰',
    'Tog\' tizmasi': '🗻',
    'Yuvilma o\'yiq': '🏜️'
};

// Toponimlar ro'yxatini yuklash
async function loadToponims() {
    const toponims = await fetchAPI('/toponims/');
    if (!toponims) return;

    const tbody = document.querySelector('#toponimTable tbody');
    tbody.innerHTML = '';

    toponims.forEach(toponim => {
        const tr = document.createElement('tr');
        const color = typeColors[toponim.type] || '#777';
        const icon = typeIcons[toponim.type] || '📍';
        
        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px;">${icon}</span>
                    <span>${toponim.name}</span>
                </div>
            </td>
            <td>
                <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: ${color}; color: white;">
                    ${toponim.type}
                </span>
            </td>
            <td>Nurota tumani</td>
            <td>${toponim.latitude}, ${toponim.longitude}</td>
            <td>${new Date(toponim.created_at).toLocaleDateString()}</td>
            <td>
                <button onclick="editToponim(${toponim.id})" class="edit-btn" title="Tahrirlash">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteToponim(${toponim.id})" class="delete-btn" title="O'chirish">
                    <span class="material-icons">delete</span>
                </button>
                <button onclick="showOnMap(${toponim.id})" class="map-btn" title="Xaritada ko'rish">
                    <span class="material-icons">map</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Toponimni tahrirlash
async function editToponim(id) {
    const toponim = await fetchAPI(`/toponims/${id}`);
    if (!toponim) return;

    const form = document.getElementById('toponimForm');
    form.name.value = toponim.name;
    form.type.value = toponim.type;
    
    // Viloyat va tumanni tanlash
    const regionSelect = document.getElementById('regionSelect');
    regionSelect.value = 'navoiy'; // Hozircha faqat Navoiy viloyati uchun
    
    // Tumanlar ro'yxatini yuklash
    const districtSelect = document.getElementById('districtSelect');
    districtSelect.disabled = false;
    districtSelect.innerHTML = `
        <option value="">Tumanni tanlang</option>
        <option value="${toponim.district_id}" selected>Nurota tumani</option>
    `;
    
    form.latitude.value = toponim.latitude;
    form.longitude.value = toponim.longitude;
    form.established.value = toponim.established || '';
    form.previous_name.value = toponim.previous_name || '';
    form.meaning.value = toponim.meaning || '';

    form.dataset.editId = id;
    showModal('toponimModal');
}

// Toponimni o'chirish
async function deleteToponim(id) {
    if (!confirm('Bu toponimni o\'chirishni xohlaysizmi?')) return;

    try {
        const response = await fetchAPI(`/toponims/${id}`, {
            method: 'DELETE'
        });

        if (response) {
            await loadToponims();
            await loadDashboardData();
        }
    } catch (error) {
        console.error('Toponimni o\'chirishda xatolik:', error);
        alert('Toponimni o\'chirishda xatolik yuz berdi');
    }
}

// Yangi toponim qo'shish
document.getElementById('addToponimBtn').addEventListener('click', () => {
    const form = document.getElementById('toponimForm');
    form.reset();
    delete form.dataset.editId;
    showModal('toponimModal');
});

// Toponim formani yuborish
document.getElementById('toponimForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Nurota tumani ID si (biz bilganmiz bu 1 bo'ladi)
    const nurotaDistrictId = 1;
    
    const data = {
        name: formData.get('name'),
        type: formData.get('type'),
        district_id: nurotaDistrictId,
        latitude: parseFloat(formData.get('latitude')),
        longitude: parseFloat(formData.get('longitude')),
        established: formData.get('established') || null,
        previous_name: formData.get('previous_name') || null,
        meaning: formData.get('meaning') || null
    };

    const editId = form.dataset.editId;
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/toponims/${editId}` : '/toponims/';

    try {
        const response = await fetchAPI(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response) {
            hideModal('toponimModal');
            await loadToponims();
            form.reset();
            alert('Toponim muvaffaqiyatli saqlandi!');
        }
    } catch (error) {
        console.error('Toponim saqlashda xatolik:', error);
        alert('Toponim saqlashda xatolik yuz berdi');
    }
});

// Xabarlar ro'yxatini yuklash
async function loadMessages() {
    const messages = await fetchAPI('/messages/');
    if (!messages) return;

    const tbody = document.querySelector('#messageTable tbody');
    tbody.innerHTML = '';

    messages.forEach(message => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${message.name}</td>
            <td>${message.subject}</td>
            <td>${new Date(message.created_at).toLocaleDateString()}</td>
            <td>${message.is_read ? 'O\'qilgan' : 'Yangi'}</td>
            <td>
                <button onclick="viewMessage(${message.id})">
                    <span class="material-icons">visibility</span>
                </button>
                <button onclick="deleteMessage(${message.id})">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Foydalanuvchilar ro'yxatini yuklash
async function loadUsers() {
    const users = await fetchAPI('/users/');
    if (!users) return;

    const tbody = document.querySelector('#userTable tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.is_active ? 'Faol' : 'Nofaol'}</td>
            <td>
                <button onclick="editUser(${user.id})">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteUser(${user.id})">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal oynalarni boshqarish
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Modal oynalarni yopish tugmalari
document.querySelectorAll('.modal .cancel').forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        hideModal(modal.id);
    });
});

// Xabarni ko'rish
async function viewMessage(id) {
    const message = await fetchAPI(`/messages/${id}`);
    if (!message) return;

    const messageDetails = document.getElementById('messageDetails');
    messageDetails.innerHTML = `
        <div class="message-info">
            <p><strong>Kimdan:</strong> ${message.name}</p>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Mavzu:</strong> ${message.subject}</p>
            <p><strong>Xabar:</strong> ${message.message}</p>
            <p><strong>Sana:</strong> ${new Date(message.created_at).toLocaleString()}</p>
        </div>
    `;

    showModal('messageModal');

    // Xabarni o'qilgan deb belgilash
    if (!message.is_read) {
        await fetchAPI(`/messages/${id}/read`, { method: 'PUT' });
        loadMessages();
        loadDashboardData();
    }
}

// Xabarni o'chirish
async function deleteMessage(id) {
    if (!confirm('Bu xabarni o\'chirishni xohlaysizmi?')) return;

    try {
        const response = await fetchAPI(`/messages/${id}`, {
            method: 'DELETE'
        });

        if (response) {
            loadMessages();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Xabarni o\'chirishda xatolik:', error);
        alert('Xabarni o\'chirishda xatolik yuz berdi');
    }
}

// Viloyatlar ro'yxatini yuklash
async function loadRegions() {
    try {
        const response = await fetchAPI('/regions/');
        const regions = await response.json();
        
        const regionSelect = document.getElementById('regionSelect');
        if (regionSelect) {
            regionSelect.innerHTML = '<option value="">Viloyatni tanlang</option>';
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                regionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Viloyatlarni yuklashda xatolik:', error);
    }
}

// Tumanlar ro'yxatini yuklash
async function loadDistricts(regionId) {
    try {
        const response = await fetchAPI(`/regions/${regionId}/districts/`);
        const districts = await response.json();
        
        const districtSelect = document.getElementById('districtSelect');
        if (districtSelect) {
            districtSelect.innerHTML = '<option value="">Tumanni tanlang</option>';
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Tumanlarni yuklashda xatolik:', error);
    }
}

// Viloyat tanlanganda tumanlarni yuklash
document.getElementById('regionSelect').addEventListener('change', function() {
    const region = this.value;
    const districtSelect = document.getElementById('districtSelect');
    
    if (region === 'navoiy') {
        districtSelect.disabled = false;
        districtSelect.innerHTML = `
            <option value="">Tumanni tanlang</option>
            <option value="nurota">Nurota tumani</option>
        `;
    } else {
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">Tumanni tanlang</option>';
    }
});

// Toponimni xaritada ko'rsatish
async function showOnMap(id) {
    const toponim = await fetchAPI(`/toponims/${id}`);
    if (!toponim) return;

    // Nurota tumani koordinatalari
    const nurotaCenter = {
        lat: 40.5614,
        lng: 65.6886
    };

    // Xaritani ko'rsatish uchun modal oyna
    const mapModal = document.createElement('div');
    mapModal.className = 'modal';
    mapModal.id = 'mapModal';
    mapModal.innerHTML = `
        <div class="modal-content" style="width: 80%; height: 80%;">
            <h3>${toponim.name}</h3>
            <div id="map" style="width: 100%; height: 500px;"></div>
            <div class="form-actions">
                <button type="button" class="cancel">Yopish</button>
            </div>
        </div>
    `;
    document.body.appendChild(mapModal);

    // OpenStreetMap xaritasini yuklash
    const map = L.map('map').setView([toponim.latitude, toponim.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Toponim markerini qo'shish
    L.marker([toponim.latitude, toponim.longitude])
        .bindPopup(`
            <b>${toponim.name}</b><br>
            Turi: ${toponim.type}<br>
            ${toponim.meaning ? 'Ma\'nosi: ' + toponim.meaning : ''}
        `)
        .addTo(map);

    // Nurota tumani chegarasini chizish
    // Bu yerda Nurota tumani chegarasi koordinatalarini qo'shish kerak
    // Misol uchun:
    const nurotaBorder = [
        [40.6, 65.6],
        [40.7, 65.7],
        [40.6, 65.8],
        [40.5, 65.7],
        [40.6, 65.6]
    ];
    L.polygon(nurotaBorder, {color: 'red'}).addTo(map);

    showModal('mapModal');

    // Modal yopilganda xaritani tozalash
    document.querySelector('#mapModal .cancel').addEventListener('click', () => {
        hideModal('mapModal');
        document.body.removeChild(mapModal);
    });
}

// Chiqish
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// Dastlabki ma'lumotlarni yuklash
loadDashboardData();

// Sahifa yuklanganda viloyatlarni yuklash
document.addEventListener('DOMContentLoaded', () => {
    loadRegions();
    loadDashboardData();
}); 
