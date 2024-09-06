document.addEventListener('DOMContentLoaded', function () {
    const nameInput = document.querySelector('.js-edit-sheet-name');
    const textInput = document.querySelector('.js-edit-sheet-text');
    const inputElements = document.querySelectorAll('.js-edit-sheet-name, .js-edit-sheet-text');
    const preloader = document.querySelector('.image-preloader');
    const notification = document.getElementById('notification-compare');

    if (!nameInput || !textInput) {
        return;
    }

    // Массив городов
    const cities = [
        "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
        "Красноярск", "Нижний Новгород", "Челябинск", "Уфа", "Самара",
        "Ростов-на-Дону", "Краснодар", "Омск", "Воронеж", "Пермь", "Волгоград",
        "Саратов", "Тюмень", "Тольятти", "Махачкала", "Барнаул", "Ижевск",
        "Хабаровск", "Ульяновск", "Иркутск", "Владивосток", "Ярославль",
        "Севастополь", "Ставрополь", "Томск", "Кемерово", "Набережные Челны",
        "Оренбург", "Новокузнецк", "Балашиха", "Рязань", "Чебоксары",
        "Калининград", "Пенза", "Липецк", "Киров", "Астрахань", "Тула", "Сочи",
        "Курск", "Улан-Удэ", "Сургут", "Тверь", "Магнитогорск", "Брянск",
        "Якутск", "Иваново", "Владимир", "Симферополь", "Грозный", "Чита",
        "Нижний Тагил", "Калуга", "Белгород", "Волжский", "Подольск", "Вологда",
        "Саранск", "Смоленск", "Курган", "Череповец", "Архангельск",
        "Владикавказ", "Орёл", "Нижневартовск", "Йошкар-Ола", "Стерлитамак",
        "Мытищи", "Мурманск", "Кострома", "Новороссийск", "Химки", "Тамбов",
        "Нальчик", "Таганрог", "Нижнекамск", "Благовещенск", "Люберцы",
        "Петрозаводск", "Комсомольск-на-Амуре", "Королёв", "Энгельс",
        "Великий Новгород", "Шахты", "Братск", "Сыктывкар", "Ангарск",
        "Старый Оскол", "Дзержинск", "Красногорск", "Орск", "Одинцово",
        "Псков", "Абакан", "Армавир", "Балаково", "Бийск", "Южно-Сахалинск",
        "Уссурийск", "Норильск", "Прокопьевск", "Рыбинск", "Волгодонск",
        "Альметьевск", "Петропавловск-Камчатский", "Сызрань", "Каменск-Уральский",
        "Новочеркасск", "Хасавюрт", "Златоуст", "Домодедово", "Северодвинск",
        "Керчь", "Миасс", "Салават", "Копейск", "Пятигорск", "Электросталь",
        "Майкоп", "Щёлково", "Находка", "Березники", "Нефтекамск", "Серпухов",
        "Обнинск", "Коломна", "Кызыл", "Каспийск", "Ковров", "Дербент",
        "Нефтеюганск", "Кисловодск", "Назрань", "Батайск", "Рубцовск",
        "Ессентуки", "Новочебоксарск", "Долгопрудный", "Новомосковск", "Октябрьский",
        "Невинномысск", "Раменское", "Черкесск", "Мурино", "Михайловск", "Реутов",
        "Ханты-Мансийск", "Первоуральск", "Пушкино", "Жуковский", "Димитровград",
        "Артём", "Новый Уренгой", "Евпатория", "Видное", "Северск", "Камышин",
        "Муром", "Орехово-Зуево", "Арзамас", "Элиста", "Ноябрьск", "Бердск",
        "Ногинск", "Новошахтинск"
    ];

    // Получаем элемент select по id
    var citySelect = document.getElementById("citySelect");

    if (citySelect) {
        // Сортируем города по алфавиту
        cities.sort();

        // Формируем список городов
        cities.forEach(function (city) {
            // Создаем новый элемент option
            var option = document.createElement("option");
            // Задаем значение для option
            option.value = city;
            // Задаем отображаемый текст для option
            option.textContent = city;
            // Добавляем option в select
            citySelect.appendChild(option);
        });
    }

    nameInput.addEventListener('input', function () {
        var regex = /^[А-Яа-яA-Za-z]*$/;
        var inputText = this.value;
        if (!regex.test(inputText)) {
            this.value = inputText.slice(0, -1);
        }
    });
    
    textInput.addEventListener('input', function () {
        var regex = /^[А-Яа-яA-Za-z0-9_,.\s]*$/;
        var inputText = this.value;

        if (inputText.length > 120) {
            this.value = inputText.slice(0, 120);
            return;
        }

        if (!regex.test(inputText)) {
            this.value = inputText.replace(/[^А-Яа-яA-Za-z0-9_,.\s]/g, '');
        }
    });

    document.addEventListener('click', function (event) {
        let isClickInside = false;

        inputElements.forEach(function (input) {
            if (input.contains(event.target)) {
                isClickInside = true;
            }
        });

        if (!isClickInside) {
            inputElements.forEach(function (input) {
                input.blur();
            });
        }
    });

    function showNotification() {
        notification.classList.remove('hide');
        notification.classList.add('show');
        setTimeout(function () {
            notification.classList.remove('show');
            notification.classList.add('hide');
        }, 4000);
    }

    const confirmButton = document.querySelector('.js-confirm-edit-sheet');

    confirmButton.addEventListener('click', async (event) => {
        event.preventDefault();
        preloader.classList.remove('hide');

        const text = document.querySelector('.js-edit-sheet-text').value;
        const name = document.querySelector('.js-edit-sheet-name').value;
        const age = document.querySelector('.js-edit-sheet-age').value;
        const city = document.querySelector('.js-edit-sheet-city').value;

        // Формируем объект с данными
        const data = {text, name, age, city};

        try {
            const response = await fetch('/settings/edit-sheet/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Если запрос успешен, перенаправляем пользователя или показываем сообщение об успехе
                notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right:10px;color: green;"></i> Анкета успешно обновлена';
                setTimeout(function () {
                    window.location.href = '/settings';
                }, 4000);
            } else {
                const errorData = await response.json();
                // Показываем сообщение об ошибке пользователю
                notification.innerHTML = errorData.message.join(', ');
            }
        } catch (error) {
            notification.innerHTML = error.message;
        } finally {
            preloader.classList.add('hide');
            showNotification();
        }
    });
});