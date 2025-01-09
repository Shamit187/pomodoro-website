const musicLinks = [
    "https://www.youtube.com/embed/jfKfPfyJRdk?si=Fihwx0JgtZIaLC3y&amp;controls=0",
    "https://www.youtube.com/embed/4Q9jq-tdOoE?si=hZYGIdudm6rWEu3J&amp;controls=0",
    "https://www.youtube.com/embed/-OekvEFm1lo?si=haNhtOX2WCsAnfdk&amp;controls=0",
    "https://www.youtube.com/embed/tG0hf6mDD6A?si=walVogRU8wumCnFD&amp;controls=0",
    "https://www.youtube.com/embed/vrB9wC6quaU?si=CosMB44iho2tDaYY&amp;controls=0",
    "https://www.youtube.com/embed/techmgGVOhk?si=-H-gvonRnPgtefDC&amp;controls=0",
    "https://www.youtube.com/embed/S_MOd40zlYU?si=SXO8wHkWqX7H8GAi&amp;controls=0",
    "https://www.youtube.com/embed/XFdTycvQMQo?si=Tya_Uw9aLvqGlRHc&amp;controls=0",
    "https://www.youtube.com/embed/A_hmrykwR7g?si=DNfzd1odylS0AIGP&amp;controls=0",
    "https://www.youtube.com/embed/l6J0ylYTO4s?si=hFnZtqGj8nkaWSAY&amp;controls=0",
    "https://www.youtube.com/embed/eV25g4VK_Eg?si=vTcUIDgZ_gK4H1C6&amp;controls=0",
    "https://www.youtube.com/embed/DSGyEsJ17cI?si=wPYj_A6HcN5eyStL&amp;controls=0",
    "https://www.youtube.com/embed/4khIPP--FDU?si=BQWCsBbS3yMnc6Lk&amp;controls=0",
];

const gridContainer = document.querySelector('#music .grid');
const iframe = document.getElementById('music-iframe');

musicLinks.forEach((link, index) => {
    const button = document.createElement('button');
    // button.textContent = `${index + 1}`;
    button.className = "p-2 neumorphic-button text-white rounded";
    button.dataset.index = index;

    button.addEventListener('click', () => {
        // Update iframe src
        iframe.src = musicLinks[index];

        // Remove music-active class from all buttons
        document.querySelectorAll('.grid button').forEach(btn => btn.classList.remove('music-active'));

        // Add music-active class to the clicked button
        button.classList.add('music-active');
    });

    gridContainer.appendChild(button);
});