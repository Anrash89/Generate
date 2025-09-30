// === КОНФИГУРАЦИЯ FIREBASE ===
// ВАЖНО: ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА ВАШИ ИЗ КОНСОЛИ FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAYEn5CN91w6B4YoTcWrW42qKdJfRm9k7s",
  authDomain: "generatesticker.firebaseapp.com",
  projectId: "generatesticker",
  storageBucket: "generatesticker.firebasestorage.app",
  messagingSenderId: "619341342031",
  appId: "1:619341342031:web:7d861b6ab2224d90e0113a",
  measurementId: "G-FNSKM2K33W"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const stickersCollection = db.collection("stickers");

// === СПИСОК ID ВСЕХ ПОЛЕЙ ДЛЯ УДОБСТВА ===
const allInputIds = [
    'labelWidth', 'labelHeight', 'fontSize', 'iconSize', 'autoHeight',
    'productName', 'sku', 'ean13', 'composition', 'origin', 'productionDate',
    'manufacturer', 'importer', 'storageConditions', 'shelfLife', 'compliance',
    'warning', 'feedbackContact'
];
const iconIds = ['icon-eac', 'icon-pap20', 'icon-pp05', 'icon-abs9', 'icon-ps06', 'icon-pap21'];

// === ЛОГИКА АУТЕНТИФИКАЦИИ ===
const loginView = document.getElementById('login-view');
const userView = document.getElementById('user-view');
const userEmailSpan = document.getElementById('user-email');
const authStatus = document.getElementById('auth-status');

auth.onAuthStateChanged(user => {
    if (user) {
        // Пользователь вошел в систему
        loginView.style.display = 'none';
        userView.style.display = 'block';
        userEmailSpan.textContent = user.email;
    } else {
        // Пользователь вышел
        loginView.style.display = 'block';
        userView.style.display = 'none';
        userEmailSpan.textContent = '';
    }
});

function registerUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => { authStatus.textContent = `Ошибка регистрации: ${error.message}`; });
}

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => { authStatus.textContent = `Ошибка входа: ${error.message}`; });
}

function logoutUser() {
    auth.signOut();
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ (FIRESTORE) ===

function saveLabel() {
    const sku = document.getElementById('sku').value.trim();
    const statusDiv = document.getElementById('save-status');
    const currentUser = auth.currentUser;

    if (!currentUser) {
        statusDiv.textContent = 'Ошибка: Вы должны войти в систему для сохранения.';
        return;
    }
    if (!sku) {
        statusDiv.textContent = 'Ошибка: Артикул (SKU) не может быть пустым!';
        return;
    }

    const dataToSave = collectLabelData();
    // Добавляем метаданные
    dataToSave.lastUpdatedBy = currentUser.email;
    dataToSave.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

    // Используем .set с { merge: true }, чтобы обновить или создать
    stickersCollection.doc(sku).set(dataToSave, { merge: true })
        .then(() => {
            // Устанавливаем автора только при первом сохранении
            stickersCollection.doc(sku).set({ 
                createdBy: currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
             }, { merge: true });
            
            statusDiv.textContent = `Стикер "${sku}" успешно сохранен в базу.`;
            setTimeout(() => statusDiv.textContent = '', 3000);
        })
        .catch(error => {
            statusDiv.textContent = `Ошибка сохранения: ${error.message}`;
        });
}

function loadLabel() {
    const skuToLoad = document.getElementById('loadSku').value.trim();
    const statusDiv = document.getElementById('load-status');

    if (!skuToLoad) {
        statusDiv.textContent = 'Введите артикул для загрузки!';
        return;
    }

    stickersCollection.doc(skuToLoad).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                populateForm(data);
                generateLabel();
                
                // Отображаем мета-информацию
                document.getElementById('meta-created').textContent = `${data.createdBy || 'N/A'}`;
                document.getElementById('meta-updated').textContent = `${data.lastUpdatedBy || 'N/A'} (${data.updatedAt ? data.updatedAt.toDate().toLocaleString() : ''})`;

                statusDiv.textContent = `Стикер "${skuToLoad}" загружен.`;
            } else {
                statusDiv.textContent = `Стикер с артикулом "${skuToLoad}" не найден.`;
            }
             setTimeout(() => statusDiv.textContent = '', 3000);
        })
        .catch(error => {
            statusDiv.textContent = `Ошибка загрузки: ${error.message}`;
        });
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (сбор и заполнение данных) ===

function collectLabelData() {
    const data = {};
    allInputIds.forEach(id => {
        const input = document.getElementById(id);
        data[id] = (input.type === 'checkbox') ? input.checked : input.value;
    });
    data.icons = {};
    iconIds.forEach(id => {
        data.icons[id] = document.getElementById(id).checked;
    });
    return data;
}

function populateForm(data) {
    allInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (typeof data[id] !== 'undefined') {
            if (input.type === 'checkbox') input.checked = data[id];
            else input.value = data[id];
        }
    });
    if (data.icons) {
        iconIds.forEach(id => {
            document.getElementById(id).checked = data.icons[id] || false;
        });
    }
}

// === ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ (без изменений) ===
function generateLabel() { /* ... код этой функции остается прежним ... */ }
function toggleAutoHeight() { /* ... код этой функции остается прежним ... */ }

window.onload = () => {
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generateLabel);
        input.addEventListener('change', generateLabel);
    });
    toggleAutoHeight();
};