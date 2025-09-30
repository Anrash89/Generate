// ===================================================
// ===       КОНФИГУРАЦИЯ FIREBASE                ===
// ===   !!! ЗАМЕНИТЕ ЭТИ ДАННЫЕ СВОИМИ !!!       ===
// ===================================================
const firebaseConfig = {
  apiKey: "AIzaSyAYEn5CN91w6B4YoTcWrW42qKdJfRm9k7s",
  authDomain: "generatesticker.firebaseapp.com",
  projectId: "generatesticker",
  storageBucket: "generatesticker.firebasestorage.app",
  messagingSenderId: "619341342031",
  appId: "1:619341342031:web:7d861b6ab2224d90e0113a",
  measurementId: "G-FNSKM2K33W"
};
// ===================================================

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const stickersCollection = db.collection("stickers");

// === СПИСОК ID ВСЕХ ПОЛЕЙ (без изменений) ===
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
        loginView.style.display = 'none';
        userView.style.display = 'block';
        userEmailSpan.textContent = user.email;
        authStatus.textContent = '';
        
        // === ИЗМЕНЕНИЕ: ПРОВЕРЯЕМ URL НА НАЛИЧИЕ АРТИКУЛА ===
        const urlParams = new URLSearchParams(window.location.search);
        const skuFromUrl = urlParams.get('sku');
        if (skuFromUrl) {
            document.getElementById('loadSku').value = skuFromUrl;
            loadLabel();
            // Очищаем URL, чтобы при обновлении страницы стикер не загружался снова
            window.history.replaceState({}, document.title, window.location.pathname);
        }

    } else {
        loginView.style.display = 'block';
        userView.style.display = 'none';
        userEmailSpan.textContent = '';
    }
});
// ... остальные функции (registerUser, loginUser, logoutUser, saveLabel, и т.д.) без изменений
function registerUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    authStatus.textContent = '';
    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => { authStatus.textContent = `Ошибка регистрации: ${error.message}`; });
}

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    authStatus.textContent = '';
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => { authStatus.textContent = `Ошибка входа: ${error.message}`; });
}

function logoutUser() {
    auth.signOut();
}

function showStatusMessage(elementId, message, isError = false) {
    const statusDiv = document.getElementById(elementId);
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${isError ? 'error' : 'success'}`;
    setTimeout(() => { statusDiv.textContent = ''; statusDiv.className = 'status-message'; }, 4000);
}


function saveLabel() {
    const sku = document.getElementById('sku').value.trim();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        showStatusMessage('save-status', 'Ошибка: Вы должны войти в систему для сохранения.', true);
        return;
    }
    if (!sku) {
        showStatusMessage('save-status', 'Ошибка: Артикул (SKU) не может быть пустым!', true);
        return;
    }

    const dataToSave = collectLabelData();
    dataToSave.lastUpdatedBy = currentUser.email;
    dataToSave.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

    const docRef = stickersCollection.doc(sku);

    docRef.get().then(doc => {
        if (!doc.exists) {
            dataToSave.createdBy = currentUser.email;
            dataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        // set с merge:true создаст документ, если его нет, или обновит, если он есть.
        // Это как раз то, что вам нужно для "перезаписи".
        docRef.set(dataToSave, { merge: true })
            .then(() => {
                showStatusMessage('save-status', `Стикер "${sku}" успешно сохранен в базу.`);
                loadLabel(false);
            })
            .catch(error => {
                showStatusMessage('save-status', `Ошибка сохранения: ${error.message}`, true);
            });
    });
}


function loadLabel(showAlerts = true) {
    const skuToLoad = showAlerts ? document.getElementById('loadSku').value.trim() : document.getElementById('sku').value.trim();
    
    if (!skuToLoad) {
        if (showAlerts) showStatusMessage('load-status', 'Введите артикул для загрузки!', true);
        return;
    }

    stickersCollection.doc(skuToLoad).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                populateForm(data);
                generateLabel();
                
                document.getElementById('meta-created').textContent = `${data.createdBy || 'N/A'}`;
                const updatedDate = data.updatedAt ? data.updatedAt.toDate().toLocaleString('ru-RU') : '';
                document.getElementById('meta-updated').textContent = `${data.lastUpdatedBy || 'N/A'} (${updatedDate})`;

                if (showAlerts) showStatusMessage('load-status', `Стикер "${skuToLoad}" загружен.`);
            } else {
                 if (showAlerts) showStatusMessage('load-status', `Стикер с артикулом "${skuToLoad}" не найден.`, true);
            }
        })
        .catch(error => {
            if (showAlerts) showStatusMessage('load-status', `Ошибка загрузки: ${error.message}`, true);
        });
}

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

function pixelsToMm(px) { return px * 25.4 / 96; }

function generateLabel() {
    // ... эта функция остается без изменений
    const labelWidth = document.getElementById('labelWidth').value;
    const labelHeightInput = document.getElementById('labelHeight');
    const fontSize = document.getElementById('fontSize').value;
    const iconSize = document.getElementById('iconSize').value;
    const autoHeightEnabled = document.getElementById('autoHeight').checked;
    const labelPreview = document.getElementById('label-preview');

    labelPreview.style.width = `${labelWidth}mm`;
    labelPreview.style.fontSize = `${fontSize}pt`;
    labelPreview.style.height = 'auto';

    const textFields = ['productName', 'composition', 'origin', 'productionDate', 'manufacturer', 'importer', 'storageConditions', 'shelfLife', 'compliance', 'warning'];
    textFields.forEach(id => {
        const element = document.getElementById(`preview-${id}`);
        if (element) {
            element.innerText = document.getElementById(id).value;
        }
    });
    document.getElementById('preview-sku').innerText = `Артикул: ${document.getElementById('sku').value}`;
    const staticPhrase = "Свяжитесь с нами, если что-то пошло не так с товаром или доставкой - мы быстро решим вопрос в рамках законодательства РФ. ";
    document.getElementById('feedback-content').innerText = staticPhrase + document.getElementById('feedbackContact').value;

    const ean13 = document.getElementById('ean13').value;
    if (ean13) {
        try { JsBarcode("#barcode", ean13, { format: "EAN13", lineColor: "#000", width: 1.5, height: 30, displayValue: true, fontSize: 12 }); } catch (e) { console.error("Barcode error:", e); }
    } else {
        document.getElementById('barcode').innerHTML = '';
    }
    
    const iconContainer = document.getElementById('preview-icons');
    iconContainer.innerHTML = '';
    const checkedIcons = document.querySelectorAll('input[name="icons"]:checked');
    checkedIcons.forEach(checkbox => {
        const img = document.createElement('img');
        img.src = 'icons/' + checkbox.value;
        img.alt = checkbox.value.split('.')[0];
        img.className = 'icon';
        img.style.height = `${iconSize}mm`;
        img.style.width = 'auto';
        iconContainer.appendChild(img);
    });

    if (autoHeightEnabled) {
        labelPreview.style.height = 'auto';
        const contentHeightPx = labelPreview.scrollHeight;
        labelPreview.style.height = `${contentHeightPx}px`;
        labelHeightInput.value = pixelsToMm(contentHeightPx).toFixed(1);
    } else {
        labelPreview.style.height = `${labelHeightInput.value}mm`;
    }
}

function toggleAutoHeight() {
    document.getElementById('labelHeight').disabled = document.getElementById('autoHeight').checked;
    generateLabel();
}

window.onload = () => {
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generateLabel);
        input.addEventListener('change', generateLabel);
    });
    generateLabel(); // Запускаем один раз, чтобы предпросмотр не был пустым
};