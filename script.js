function generateLabel() {
    // === Применяем размеры этикетки ===
    const labelWidth = document.getElementById('labelWidth').value;
    const labelHeight = document.getElementById('labelHeight').value;
    const labelPreview = document.getElementById('label-preview');
    labelPreview.style.width = `${labelWidth}mm`;
    labelPreview.style.height = `${labelHeight}mm`;

    // === Заполняем этикетку текстом ===
    const fields = ['productName', 'sku', 'ean13', 'composition', 'origin', 'productionDate', 'manufacturer', 'importer', 'feedback'];
    fields.forEach(id => {
        const element = document.getElementById(`preview-${id}`);
        if (element) { // Проверяем, существует ли элемент для вставки
            const value = document.getElementById(id).value;
            if (id === 'sku') {
                element.innerText = `Артикул: ${value}`;
            } else {
                element.innerText = value;
            }
        }
    });

    // === Генерируем штрихкод ===
    const ean13 = document.getElementById('ean13').value;
    if (ean13) {
        JsBarcode("#barcode", ean13, {
            format: "EAN13", lineColor: "#000", width: 1.5, height: 30,
            displayValue: true, fontSize: 12
        });
    }
    
    // === ЛОГИКА АВТОПОДБОРА ШРИФТА ===
    const autoFitEnabled = document.getElementById('autoFit').checked;
    const fontSizeInput = document.getElementById('fontSize');

    if (autoFitEnabled) {
        // Режим автоподбора
        const maxFontSize = 12; // Начинаем с большого шрифта
        const minFontSize = 4;  // Минимально читаемый шрифт
        let bestSize = minFontSize;

        // Перебираем размеры шрифта от большего к меньшему
        for (let currentSize = maxFontSize; currentSize >= minFontSize; currentSize -= 0.2) {
            labelPreview.style.fontSize = `${currentSize}pt`;
            // Проверяем, нет ли вертикальной прокрутки (т.е. все ли помещается)
            if (labelPreview.scrollHeight <= labelPreview.clientHeight) {
                bestSize = currentSize; // Нашли подходящий размер
                break; // Выходим из цикла
            }
        }
        // Применяем лучший найденный размер
        labelPreview.style.fontSize = `${bestSize}pt`;
        // Обновляем значение в поле ввода, чтобы пользователь видел результат
        fontSizeInput.value = bestSize.toFixed(1);

    } else {
        // Ручной режим
        labelPreview.style.fontSize = `${fontSizeInput.value}pt`;
    }
}

function toggleAutoFit() {
    // Включаем/выключаем поле ввода шрифта в зависимости от чекбокса
    const fontSizeInput = document.getElementById('fontSize');
    const autoFitCheckbox = document.getElementById('autoFit');
    fontSizeInput.disabled = autoFitCheckbox.checked;
    // Перегенерируем этикетку, чтобы применить изменения
    generateLabel();
}

// Первоначальная загрузка
window.onload = () => {
    toggleAutoFit(); // Настраиваем состояние поля ввода
    generateLabel(); // Генерируем этикетку при загрузке
};