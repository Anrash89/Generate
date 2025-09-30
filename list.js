// ===================================================
// ===       КОНФИГУРАЦИЯ FIREBASE                ===
// ===   !!! ВСТАВЬТЕ СЮДА ВАШИ ДАННЫЕ !!!         ===
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

const tableBody = document.getElementById('stickers-list-body');
const authMessage = document.getElementById('auth-message');
const tableWrapper = document.querySelector('.table-wrapper');

/**
 * Функция для отображения стикеров в таблице
 */
function displayStickers() {
    // Сортируем по дате обновления, от новых к старым
    stickersCollection.orderBy("updatedAt", "desc").get().then(querySnapshot => {
        tableBody.innerHTML = ''; // Очищаем таблицу перед заполнением
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4">Пока нет сохраненных стикеров.</td></tr>';
            return;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const sku = doc.id; // Артикул - это ID документа

            // Создаем новую строку в таблице
            const row = tableBody.insertRow();
            
            // Форматируем дату для красивого вывода
            const updatedDate = data.updatedAt ? data.updatedAt.toDate().toLocaleString('ru-RU') : 'N/A';

            // Заполняем ячейки
            row.innerHTML = `
                <td><a href="index.html?sku=${encodeURIComponent(sku)}">${sku}</a></td>
                <td>${data.ean13 || 'N/A'}</td>
                <td>${data.productName || 'N/A'}</td>
                <td>${updatedDate}</td>
            `;
        });
    }).catch(error => {
        tableBody.innerHTML = `<tr><td colspan="4">Ошибка загрузки данных: ${error.message}</td></tr>`;
    });
}

// Проверяем статус аутентификации при загрузке страницы
window.onload = () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Если пользователь вошел, показываем таблицу и загружаем данные
            authMessage.style.display = 'none';
            tableWrapper.style.display = 'block';
            displayStickers();
        } else {
            // Если пользователь не вошел, показываем сообщение и скрываем таблицу
            authMessage.style.display = 'block';
            tableWrapper.style.display = 'none';
        }
    });
};