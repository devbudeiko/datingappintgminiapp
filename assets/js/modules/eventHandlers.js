// Функции для обработки событий
export function addGlobalEventHandlers() {
    document.addEventListener('copy', function (e) {
        if (!e.target.closest('.dating-page__buttons')) {
            e.preventDefault();
        }
    });

    document.addEventListener('selectstart', function (e) {
        if (!e.target.closest('.dating-page__buttons')) {
            e.preventDefault();
        }
    });

    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
    });

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, {
        passive: false
    });

    document.addEventListener('touchmove', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, {
        passive: false
    });

    document.addEventListener('touchend', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, {
        passive: false
    });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
        let now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, {
        passive: false
    });

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        img.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });
        img.addEventListener('touchstart', function (e) {
            e.preventDefault();
        }, {
            passive: false
        });
    });
}
