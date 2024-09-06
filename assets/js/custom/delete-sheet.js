document.addEventListener('DOMContentLoaded', () => {
    const deleteButton = document.querySelector('.js-confirm-delete-sheet');
    const preloader = document.querySelector('.image-preloader');
    const notification = document.getElementById('notification-compare');

    function showNotification(message) {
        notification.innerHTML = message;
        notification.classList.remove('hide');
        notification.classList.add('show');
        setTimeout(function () {
            notification.classList.remove('show');
            notification.classList.add('hide');
        }, 4000);
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            preloader.classList.remove('hide');
            try {
                const response = await fetch('/settings/delete-sheet/delete-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    showNotification('<i class="fas fa-check-circle" style="margin-right:10px;color: green;"></i> Анкета успешно удалена');
                    setTimeout(function () {
                        window.location.href = '/';
                    }, 4000);
                } else {
                    const errorData = await response.json();
                    showNotification(errorData.message);
                }
            } catch (error) {
                showNotification(error);
            } finally {
                preloader.classList.add('hide');
            }
        });
    }
});
