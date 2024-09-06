window.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.querySelector('.js-check-button');
    const image1Input = document.getElementById('image1Input');
    const image2Input = document.getElementById('image2Input');
    const preloader = document.querySelector('.image-preloader');
    const notification = document.getElementById('notification-compare');
    const finishBtn = document.querySelector('.js-finish-button');
    const prevBtn = document.querySelector('.js-prev-button');

    const imagePreviewOne = document.getElementById('image1Preview');
    const uploaderOne = document.getElementById('uploader1');

    if (!image1Input || !image2Input) {
        return;
    }

    image1Input.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreviewOne.src = e.target.result;
                imagePreviewOne.style.display = 'block';
                uploaderOne.querySelector('label').style.display = 'none';
                uploaderOne.classList.add('uploaded');
            }
            reader.readAsDataURL(file);
        } else {
            imagePreviewOne.style.display = 'none';
            imagePreviewOne.src = '';
            uploaderOne.querySelector('label').style.display = 'flex';
            uploaderOne.classList.remove('uploaded');
        }
    });

    const imagePreviewTwo = document.getElementById('image2Preview');
    const uploaderTwo = document.getElementById('uploader2');

    image2Input.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreviewTwo.src = e.target.result;
                imagePreviewTwo.style.display = 'block';
                uploaderTwo.querySelector('label').style.display = 'none';
                uploaderTwo.classList.add('uploaded');
            }
            reader.readAsDataURL(file);
        } else {
            imagePreviewTwo.style.display = 'none';
            imagePreviewTwo.src = '';
            uploaderTwo.querySelector('label').style.display = 'flex';
            uploaderTwo.classList.remove('uploaded');
        }
    });

    checkButton.addEventListener('click', async () => {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
        const image1File = image1Input.files[0];
        const image2File = image2Input.files[0];

        if (!image1File || !image2File) {
            notification.innerText = 'Пожалуйста, выберите оба изображения для загрузки!';
            showNotification();
            return;
        }

        checkButton.disabled = true;
        preloader.classList.remove('hide');

        try {
            const formData = new FormData();
            formData.append('image1', image1File);
            formData.append('image2', image2File);

            const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
            formData.append('userId', userId);

            const response = await fetch('/compare', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();

                if (data.confidence !== undefined) {
                    if (data.confidence >= 70) {
                        notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right:10px;color: green;"></i> Проверка прошла успешно';
                        image1Input.disabled = true;
                        image2Input.disabled = true;
                        checkButton.disabled = true;

                        finishBtn.disabled = false;
                        finishBtn.style.backgroundColor = '';
                        finishBtn.classList.remove('inactive');

                        checkButton.classList.add('inactive');
                        checkButton.style.backgroundColor = '#ccc';
                        checkButton.style.color = '#666';

                        prevBtn.disabled = true;
                        prevBtn.style.color = '#666';
                        prevBtn.style.backgroundColor = '#ccc';
                    } else {
                        notification.innerHTML = '<span style="display:block;"><span style="color: red;">Ошибка!</span><br> На фото два разных человека, вы непохожи друг на друга. Пробуй заново с другими фото.</span>';
                        checkButton.disabled = false;
                    }
                } else {
                    notification.innerHTML = '<span style="display:block;"><span style="color: red;">Ошибка!</span><br> На одном из фото нераспознанно лицо, загрузи изображения, на которых отчетливо видно твое лицо.</span>';
                    checkButton.disabled = false;
                }
            } else {
                notification.innerHTML = '<span style="display:block;"><span style="color: red;">Ошибка!</span><br> Произошла ошибка при запросе к API. </span>';
                checkButton.disabled = true;
            }
        } catch (error) {
            notification.innerText = 'Ошибка: ' + error;
            checkButton.disabled = true;
        } finally {
            showNotification();
            preloader.classList.add('hide');
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