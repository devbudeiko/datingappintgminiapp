const MAX_FILE_SIZE = 30 * 1024 * 1024;
const ACCEPTED_FILE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

document.addEventListener('DOMContentLoaded', () => {
    const updateImageInput = document.getElementById('updateImageInput');
    const updateImagePreview = document.getElementById('updateImagePreview');
    const updateUploader = document.getElementById('updateUploader');
    const confirmUpdatePhotoBtn = document.querySelector('.js-confirm-update-photo');
    const preloader = document.querySelector('.image-preloader');
    const notification = document.getElementById('notification-compare');
    const iconUploaderUpdate = document.querySelector('.js-icon-uploader-update');

    if (!updateImageInput) {
        return;
    }

    handleFileInputChange(updateImageInput, updateImagePreview, updateUploader, iconUploaderUpdate);

    function showNotification() {
        notification.classList.remove('hide');
        notification.classList.add('show');
        setTimeout(function () {
            notification.classList.remove('show');
            notification.classList.add('hide');
        }, 4000);
    }

    confirmUpdatePhotoBtn.addEventListener('click', async () => {
        preloader.classList.remove('hide');
        const file = updateImageInput.files[0];
        if (!file) {
            preloader.classList.add('hide');
            const notificationRed = document.getElementById('notification');
            function showNotificationRed() {
                notificationRed.classList.remove('hide');
                notificationRed.classList.add('show');
                setTimeout(function () {
                    notificationRed.classList.remove('show');
                    notificationRed.classList.add('hide');
                }, 4000);
            }
            showNotificationRed();
            notificationRed.innerHTML = 'Пожалуйста, выберите изображение для обновления.';
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await fetch('/settings/update-photo/update-photo', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right:10px;color: green;"></i> Фото успешно обновлено';
                setTimeout(function () {
                    window.location.href = '/settings';
                }, 4000);
            } else {
                const errorData = await response.json();
                notification.innerHTML = errorData.message;
            }
        } catch (error) {
            notification.innerHTML = error;
        } finally {
            preloader.classList.add('hide');
            showNotification();
        }
    });
});

function handleFileInputChange(input, previewImg, uploader, iconUploaderUpdate) {
    input.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE || !ACCEPTED_FILE_FORMATS.includes(file.type)) {
                const notificationRed = document.getElementById('notification');
                function showNotificationRed() {
                    notificationRed.classList.remove('hide');
                    notificationRed.classList.add('show');
                    setTimeout(function () {
                        notificationRed.classList.remove('show');
                        notificationRed.classList.add('hide');
                    }, 4000);
                }
                showNotificationRed();
                notificationRed.innerHTML = 'Размер файла должен быть меньше 30 МБ и в формате JPG, JPEG или PNG.';
                input.value = '';
                previewImg.style.display = 'none';
                previewImg.src = '';
                uploader.classList.remove('uploaded');
                iconUploaderUpdate.style.display = 'block';
            } else {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                    uploader.classList.add('uploaded');
                    iconUploaderUpdate.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        } else {
            previewImg.style.display = 'none';
            previewImg.src = '';
            uploader.classList.remove('uploaded');
            iconUploaderUpdate.style.display = 'block';
        }
    });
}