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
    
    // --- ОСНОВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ---
    const fields = ['productName', 'sku', 'ean13', 'composition', 'origin', 'productionDate', 'manufacturer', 'importer', 'feedback'];
    fields.forEach(id => {
        const element = document.getElementById(`preview-${id}`);
        if (element) {
            let value = document.getElementById(id).value;

            // Добавляем специальную логику для разных полей
            if (id === 'sku') {
                element.innerText = `Артикул: ${value}`;
            } else if (id === 'feedback') {
                // Добавляем стандартную фразу перед значением из поля "Обратная связь"
                const prefix = "Свяжитесь с нами, если что-то пошло не так с товаром или доставкой - мы быстро решим вопрос в рамках законодательства РФ. ";
                element.innerText = prefix + value;
            } else {
                element.innerText = value;
            }
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
