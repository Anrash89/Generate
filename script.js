function pixelsToMm(px) { return px * 25.4 / 96; }

function generateLabel() {
    // === Получаем все значения из полей ===
    const labelWidth = document.getElementById('labelWidth').value;
    const labelHeightInput = document.getElementById('labelHeight');
    const fontSize = document.getElementById('fontSize').value;
    const iconSize = document.getElementById('iconSize').value; 
    const autoHeightEnabled = document.getElementById('autoHeight').checked;
    const labelPreview = document.getElementById('label-preview');

    // === Заполняем этикетку текстом и применяем базовые стили ===
    labelPreview.style.width = `${labelWidth}mm`;
    labelPreview.style.fontSize = `${fontSize}pt`;
    labelPreview.style.height = 'auto'; 
    
    // Заполняем текстовые поля
    const allFields = [
        'productName', 'composition', 'origin', 'productionDate', 
        'manufacturer', 'importer', 'storageConditions', 'shelfLife', 
        'compliance', 'warning'
    ];
    allFields.forEach(id => {
        const element = document.getElementById(`preview-${id}`);
        if (element) {
            element.innerText = document.getElementById(id).value;
        }
    });
    
    document.getElementById('preview-sku').innerText = `Артикул: ${document.getElementById('sku').value}`;
    const staticPhrase = "Свяжитесь с нами, если что-то пошло не так с товаром или доставкой - мы быстро решим вопрос в рамках законодательства РФ. ";
    document.getElementById('feedback-content').innerText = staticPhrase + document.getElementById('feedbackContact').value;
    
    // Генерируем штрихкод
    const ean13 = document.getElementById('ean13').value;
    if (ean13) { JsBarcode("#barcode", ean13, { format: "EAN13", lineColor: "#000", width: 1.5, height: 30, displayValue: true, fontSize: 12 }); }

    // --- Динамическое добавление значков ---
    const iconContainer = document.getElementById('preview-icons');
    iconContainer.innerHTML = ''; 

    const checkedIcons = document.querySelectorAll('input[name="icons"]:checked');
    
    checkedIcons.forEach(checkbox => {
        const img = document.createElement('img');
        img.src = 'icons/' + checkbox.value; 
        img.alt = checkbox.value.split('.')[0]; 
        img.className = 'icon'; 
        
        // Задаем только высоту, а ширина подстроится сама, сохраняя пропорции
        img.style.height = `${iconSize}mm`;
        img.style.width = 'auto';
        
        iconContainer.appendChild(img);
    });

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
    document.getElementById('labelHeight').disabled = document.getElementById('autoHeight').checked;
    generateLabel();
}

window.onload = () => {
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', generateLabel); 
        input.addEventListener('change', generateLabel); 
    });
    toggleAutoHeight();
};