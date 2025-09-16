// Вспомогательная функция для конвертации пикселей в миллиметры
function pixelsToMm(px) {
    return px * 25.4 / 96;
}

function generateLabel() {
    // === Получаем все значения из полей ===
    const labelWidth = document.getElementById('labelWidth').value;
    const labelHeightInput = document.getElementById('labelHeight');
    const fontSize = document.getElementById('fontSize').value;
    const autoHeightEnabled = document.getElementById('autoHeight').checked;
    const labelPreview = document.getElementById('label-preview');

    // === Заполняем этикетку текстом и применяем базовые стили ===
    labelPreview.style.width = `${labelWidth}mm`;
    labelPreview.style.fontSize = `${fontSize}pt`;
    labelPreview.style.height = 'auto'; 
    
    // Заполняем стандартные поля
    const standardFields = ['productName', 'composition', 'origin', 'productionDate', 'manufacturer', 'importer'];
    standardFields.forEach(id => {
        document.getElementById(`preview-${id}`).innerText = document.getElementById(id).value;
    });
    // Отдельно обрабатываем SKU
    document.getElementById('preview-sku').innerText = `Артикул: ${document.getElementById('sku').value}`;

    // --- ГЛАВНОЕ ИЗМЕНЕНИЕ: Формируем блок "Обратная связь" ---
    const feedbackElement = document.getElementById('preview-feedback');
    const feedbackContact = document.getElementById('feedback').value; // Берем WhatsApp из поля ввода
    const staticPhrase = "Свяжитесь с нами, если что-то пошло не так с товаром или доставкой - мы быстро решим вопрос в рамках законодательства РФ. ";
    
    // Собираем итоговый HTML-код
    const finalHtml = `<strong>Обратная связь:</strong> ${staticPhrase}${feedbackContact}`;
    
    // Вставляем HTML в наш параграф. innerHTML ОБЯЗАТЕЛЕН, чтобы тег <strong> сработал
    feedbackElement.innerHTML = finalHtml;
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    // Генерируем штрихкод
    const ean13 = document.getElementById('ean13').value;
    if (ean13) {
        JsBarcode("#barcode", ean13, {
            format: "EAN13", lineColor: "#000", width: 1.5, height: 30,
            displayValue: true, fontSize: 12
        });
    }

    // === ЛОГИКА АВТОПОДБОРА ВЫСОТЫ ===
    if (autoHeightEnabled) {
        const contentHeightPx = labelPreview.scrollHeight;
        labelPreview.style.height = `${contentHeightPx}px`;
        const contentHeightMm = pixelsToMm(contentHeightPx);
        labelHeightInput.value = contentHeightMm.toFixed(1);

    } else {
        labelPreview.style.height = `${labelHeightInput.value}mm`;
    }
}

function toggleAutoHeight() {
    const labelHeightInput = document.getElementById('labelHeight');
    const autoHeightCheckbox = document.getElementById('autoHeight');
    labelHeightInput.disabled = autoHeightCheckbox.checked;
    generateLabel();
}

// Первоначальная загрузка
window.onload = () => {
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generateLabel);
    });
    toggleAutoHeight();
};