function generateLabel() {
    // 1. Получаем данные из всех полей формы
    const productName = document.getElementById('productName').value;
    const sku = document.getElementById('sku').value;
    const ean13 = document.getElementById('ean13').value;
    const composition = document.getElementById('composition').value;
    const origin = document.getElementById('origin').value;
    const productionDate = document.getElementById('productionDate').value;
    const manufacturer = document.getElementById('manufacturer').value;
    const importer = document.getElementById('importer').value;
    const feedback = document.getElementById('feedback').value;

    // 2. Вставляем данные в элементы предпросмотра этикетки
    document.getElementById('preview-productName').innerText = productName;
    document.getElementById('preview-sku').innerText = `Артикул: ${sku}`;
    document.getElementById('preview-composition').innerText = composition;
    document.getElementById('preview-origin').innerText = origin;
    document.getElementById('preview-productionDate').innerText = productionDate;
    document.getElementById('preview-manufacturer').innerText = manufacturer;
    document.getElementById('preview-importer').innerText = importer;
    document.getElementById('preview-feedback').innerText = feedback;

    // 3. Генерируем штрихкод
    if (ean13) {
        JsBarcode("#barcode", ean13, {
            format: "EAN13",
            lineColor: "#000",
            width: 2,
            height: 50,
            displayValue: true, // Показывает цифры под штрихкодом
            fontSize: 14
        });
    }
}

// Вызываем функцию один раз при загрузке страницы, чтобы заполнить этикетку данными по умолчанию
window.onload = generateLabel;