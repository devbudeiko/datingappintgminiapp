document.addEventListener('DOMContentLoaded', function () {
    const confirmButton = document.querySelector('.js-confirm-edit-filter');
    const preloader = document.querySelector('.image-preloader');
    const notification = document.getElementById('notification-compare');

    if (!confirmButton) {
        return;
    }

    confirmButton.addEventListener('click', async (event) => {
        event.preventDefault();
        preloader.classList.remove('hide');

        const genderCategory = document.querySelector('input[name="gender-category"]:checked');
        const citySearch = document.querySelector('input[name="city-search"]:checked');

        // Проверяем, что хотя бы одно из полей выбрано
        if (!genderCategory && !citySearch) {
            // Показать сообщение об ошибке, если не выбраны оба критерия
            notification.innerHTML = '<i class="fas fa-times-circle" style="margin-right:10px;color: red;"></i> Пожалуйста, выберите категорию пола и/или регион поиска';
            notification.classList.remove('hide');
            notification.classList.add('show');
            preloader.classList.add('hide');
            setTimeout(function () {
                notification.classList.remove('show');
                notification.classList.add('hide');
            }, 4000);
            return;
        }

        const data = {};
        if (genderCategory) {
            data.gender_category = genderCategory.value;
        }
        if (citySearch) {
            data.city = citySearch.value;
        }

        try {
            const response = await fetch('/settings/edit-filter/update-filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Если запрос успешен, показываем сообщение об успехе
                notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right:10px;color: green;"></i> Критерии успешно обновлены';
                setTimeout(function () {
                    window.location.href = '/settings'; // Перенаправляем пользователя на страницу настроек
                }, 4000);
            } else {
                const errorData = await response.json();
                // Показываем сообщение об ошибке пользователю
                notification.innerHTML = '<i class="fas fa-times-circle" style="margin-right:10px;color: red;"></i> Ошибка при обновлении настроек: ' + errorData.message;
            }
        } catch (error) {
            // Показываем сообщение об ошибке при сетевой ошибке
            notification.innerHTML = '<i class="fas fa-times-circle" style="margin-right:10px;color: red;"></i> Ошибка при отправке запроса: ' + error.message;
        } finally {
            preloader.classList.add('hide');
            showNotification();
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
});