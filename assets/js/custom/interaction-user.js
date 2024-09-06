document.addEventListener('DOMContentLoaded', () => {
// Находим все элементы с классом 'start-chat-user'
    const startChatUsers = document.querySelectorAll('.js-start-chat-user');

// Проходимся по каждому элементу и добавляем обработчик события
    startChatUsers.forEach(function(startChatUser) {
        startChatUser.addEventListener('click', function () {
            const userId = this.getAttribute('data-user-username');
            const profileLink = `https://t.me/${userId}`;
            Telegram.WebApp.openTelegramLink(profileLink);
        });
    });
// Обработчик для кнопок "Лайк"
    document.querySelectorAll('.js-like-user').forEach(button => {
        button.addEventListener('click', async (event) => {
            window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
            const userId = event.target.closest('li').dataset.userId;
            try {
                const response = await fetch('../dating/like', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                const result = await response.json();
                if (response.ok) {
                    // Удаление пользователя из списка без плавной анимации
                    const userElement = event.target.closest('li');
                    userElement.remove(); // Удаляем элемент сразу
                } else {
                    alert(result.error);
                }
            } catch (error) {
                console.error('Ошибка при отправке лайка:', error);
                alert('Ошибка сервера');
            }
        });
    });

// Обработчик для кнопок "Дизлайк"
    document.querySelectorAll('.js-dislike-user').forEach(button => {
        button.addEventListener('click', async (event) => {
            window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
            const userId = event.target.closest('li').dataset.userId;
            try {
                const response = await fetch('../dating/dislike', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                const result = await response.json();
                if (response.ok) {
                    // Удаление пользователя из списка без плавной анимации
                    const userElement = event.target.closest('li');
                    userElement.remove(); // Удаляем элемент сразу
                } else {
                    alert(result.error);
                }
            } catch (error) {
                console.error('Ошибка при отправке дизлайка:', error);
                alert('Ошибка сервера');
            }
        });
    });
});