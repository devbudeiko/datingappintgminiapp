document.addEventListener('DOMContentLoaded', function () {
    anime({
        targets: '.container-flex',
        opacity: [0, 1],
        translateX: [100, 0], // начальное и конечное значение для translateX
        duration: 500, // длительность анимации
        easing: 'easeOutQuad', // функция плавности, похожая на Animate.css
        delay: anime.stagger(200) // задержка между анимациями блоков
    });
});