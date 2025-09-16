// Вспомогательная функция для конвертации пикселей в миллиметры
// Стандартное соотношение для веба - 96 пикселей на дюйм (25.4 мм)
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
    // Устанавливаем фиксированную ширину и шрифт
    labelPreview.style.width = `${labelWidth}mm`;
    labelPreview.style.fontSize = `${fontSize}pt`;
    // Временно сбрасываем высоту, чтобы измерить реальную высоту контента
    labelPreview.style.height = 'auto'; 
    
    const fields = ['productName', 'sku', 'ean13', 'composition', 'origin', 'productionDate', 'manufacturer', 'importer', 'feedback'];
    fields.forEach(id => {
        const element = document.getElementById(`preview-${id}`);
        if (element) {
            const value = document.getElementById(id).value;
            element.innerText = (id === 'sku') ? `Артикул: ${value}` : value;
        }
    });

    const ean13 = document.getElementById('ean13').value;
    if (ean13) {
        JsBarcode("#barcode", ean13, {
            format: "EAN13", lineColor: "#000", width: 1.5, height: 30,
            displayValue: true, fontSize: 12
        });
    }

    // === ЛОГИКА АВТОПОДБОРА ВЫСОТЫ ===
    if (autoHeightEnabled) {
        // Получаем полную высоту контента в пикселях
        const contentHeightPx = labelPreview.scrollHeight;
        
        // Устанавливаем эту высоту для предпросмотра
        labelPreview.style.height = `${contentHeightPx}px`;

        // Конвертируем пиксели в мм и обновляем значение в поле ввода
        const contentHeightMm = pixelsToMm(contentHeightPx);
        labelHeightInput.value = contentHeightMm.toFixed(1); // Округляем до одного знака

    } else {
        // Если автоподбор выключен, используем значение из поля ввода
        labelPreview.style.height = `${labelHeightInput.value}mm`;
    }
}

function toggleAutoHeight() {
    // Блокируем/разблокируем поле ввода высоты
    const labelHeightInput = document.getElementById('labelHeight');
    const autoHeightCheckbox = document.getElementById('autoHeight');
    labelHeightInput.disabled = autoHeightCheckbox.checked;
    generateLabel(); // Пересчитываем этикетку
}

// Первоначальная загрузка
window.onload = () => {
    // Добавляем слушатели событий на все поля ввода, чтобы этикетка обновлялась мгновенно
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generateLabel);
    });
    toggleAutoHeight(); // Вызываем один раз для настройки состояния
};