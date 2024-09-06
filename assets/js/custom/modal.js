document.addEventListener('DOMContentLoaded', function() {
    const openModalLinks = document.querySelectorAll('.js-view-info-user');

    openModalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const modal = document.getElementById(`openModal-${userId}`);
            if (modal) {
                modal.style.opacity = '1';           // Делаем модальное окно видимым
                modal.style.pointerEvents = 'auto';  // Включаем возможность взаимодействия
            } else {
                console.error(`Modal with ID openModal-${userId} not found.`);
            }
        });
    });

    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.opacity = '0';           // Прячем модальное окно
                modal.style.pointerEvents = 'none';  // Отключаем возможность взаимодействия
            } else {
                console.error('Modal element not found.');
            }
        });
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.opacity = '0';           // Прячем модальное окно
                modal.style.pointerEvents = 'none';  // Отключаем возможность взаимодействия
            }
        });
    });
});
