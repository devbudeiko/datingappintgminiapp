// Получаем элемент select по его id
var select = document.getElementById("age");

if (select) {

// Формируем массив чисел от 16 до 60
    for (var i = 16; i <= 60; i++) {
        // Создаем новый элемент option
        var option = document.createElement("option");
        // Задаем значение для option
        option.value = i;
        // Задаем отображаемый текст для option
        option.textContent = i;
        // Добавляем option в select
        select.appendChild(option);
    }
}