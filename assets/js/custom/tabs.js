document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tablinks');
    const contents = document.querySelectorAll('.tabcontent');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
                c.style.opacity = 0;
            });

            tab.classList.add('active');
            const content = document.getElementById(tab.getAttribute('data-tab'));
            content.classList.add('active');
            content.style.display = 'block';
            content.style.opacity = 1;
        });
    });

    // Set the default active tab
    const defaultTab = document.querySelector('.tablinks[data-tab="Likes"]');
    if(!defaultTab) {
        return;
    }
    defaultTab.classList.add('active');
    const defaultContent = document.getElementById('Likes');
    defaultContent.classList.add('active');
    defaultContent.style.display = 'block';
    defaultContent.style.opacity = 1;
});