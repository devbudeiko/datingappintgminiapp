document.addEventListener('DOMContentLoaded', function () {
    const swiperContainer = document.getElementById('swiper-container');
    const swiperWrapper = document.getElementById('swiper-wrapper');
    let swiper;

    if (!swiperContainer || !swiperWrapper) {
        return;
    }

    function initializeSwiper() {
        swiper = new Swiper(swiperContainer, {
            direction: 'horizontal',
            loop: false,
            allowTouchMove: false,
            slidesPerView: 1,
            centeredSlides: true,
            spaceBetween: 40,
            on: {
                reachEnd: function () {
                    loadMoreCards();
                }
            }
        });
    }

    let page = 1;
    const limit = 5;

    async function updateCards() {
        try {
            const response = await fetch(`/dating?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Ошибка сети');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCards = doc.querySelectorAll('#swiper-wrapper .profile-page__card');

            if (newCards.length === 0) {
                if (swiperWrapper.children.length === 0) {
                    const noCardsMessage = `
                <div style="margin-bottom:20px;" class="likes-page">
                    <div class="likes-page__nothing-text">
                        <p>В твоем городе пока что нет анкет.<br><br>
                            Есть 3 варианта:<br>
                        <div style="text-align:left;font-size: 18px;">
                            1) Сделать поиск по всей России в <a href="../settings/edit-filter">Настройках</a>
                            <br><br>
                            2) Поменять свой город в <a href="../settings/edit-sheet">Анкете</a>
                            <br><br>
                            3) Подождать новые анкеты
                        </div>
                        </p>
                    </div>
                </div>`;
                    swiperWrapper.innerHTML = noCardsMessage;
                }
            } else {
                newCards.forEach(card => {
                    const userId = card.dataset.userId;
                    const existingSlide = [...swiperWrapper.children].some(slide =>
                        slide.querySelector(`[data-user-id="${userId}"]`)
                    );
                    if (!existingSlide) {
                        const slide = card.closest('.swiper-slide');
                        swiperWrapper.appendChild(slide);
                    }
                });

                swiper.update();
            }
        } catch (error) {
            console.error('Ошибка при обновлении карточек:', error);
        }
    }

    async function loadMoreCards() {
        page++;
        await updateCards();
    }

    initializeSwiper();
    updateCards();

    swiperContainer.addEventListener('click', async (event) => {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
        const target = event.target.closest('button');
        if (!target) return;

        const userId = target.getAttribute('data-user-id');
        if (!userId) return;

        if (target.classList.contains('js-like')) {
            await sendLike(userId);
            swiper.removeSlide(swiper.activeIndex);
        } else if (target.classList.contains('js-dislike')) {
            await sendDislike(userId);
            swiper.removeSlide(swiper.activeIndex);
        } else if (target.classList.contains('js-view-info-user-dating')) {
            const modal = document.getElementById(`openModal-${userId}`);
            if (modal) {
                showModal(modal); // Показ модального окна
            } else {
                console.error(`Modal not found for userId: ${userId}`);
            }
        }

        if (swiper.slides.length === 0) {
            const noCardsMessage = `
            <div style="margin-bottom:20px;" class="likes-page">
                <div class="likes-page__nothing-text">
                    <p>В твоем городе пока что нет анкет.<br><br>
                        Есть 3 варианта:<br>
                    <div style="text-align:left;font-size: 18px;">
                        1) Сделать поиск по всей России в <a href="../settings/edit-filter">Настройках</a>
                        <br><br>
                        2) Поменять свой город в <a href="../settings/edit-sheet">Анкете</a>
                        <br><br>
                        3) Подождать новые анкеты
                    </div>
                    </p>
                </div>
            </div>`;
            swiperWrapper.innerHTML = noCardsMessage;
        } else {
            swiper.update();
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('close')) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
            const modal = event.target.closest('.modal');
            if (modal) {
                hideModal(modal); // Скрытие модального окна
            } else {
                console.error('Modal not found when trying to close.');
            }
        }
    });

    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                hideModal(modal); // Скрытие модального окна при клике вне его
            }
        });
    });
});

async function sendLike(userId) {
    try {
        const response = await fetch('/dating/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId})
        });
        const result = await response.json();
        if (result.match) {
            showNotification('<i class="fa-solid fa-face-smile" style="margin-right:10px;color: green;"></i> Произошел мэтч');
        }
    } catch (error) {
        console.error('Ошибка при отправке лайка:', error);
    }
}

async function sendDislike(userId) {
    try {
        await fetch('/dating/dislike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId})
        });
    } catch (error) {
        console.error('Ошибка при отправке дизлайка:', error);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification-compare');
    if (notification) {
        notification.innerHTML = message;
        notification.style.display = 'block'; // Показ уведомления
        setTimeout(() => {
            notification.style.display = 'none'; // Скрытие уведомления
        }, 4000);
    }
}

function showModal(modal) {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
}

function hideModal(modal) {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
}
