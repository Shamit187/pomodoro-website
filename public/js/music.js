// const musicLinks = [
//     "https://www.youtube.com/embed/jfKfPfyJRdk?si=Fihwx0JgtZIaLC3y&amp;controls=0",
//     "https://www.youtube.com/embed/4Q9jq-tdOoE?si=hZYGIdudm6rWEu3J&amp;controls=0",
//     "https://www.youtube.com/embed/-OekvEFm1lo?si=haNhtOX2WCsAnfdk&amp;controls=0",
//     "https://www.youtube.com/embed/tG0hf6mDD6A?si=walVogRU8wumCnFD&amp;controls=0",
//     "https://www.youtube.com/embed/vrB9wC6quaU?si=CosMB44iho2tDaYY&amp;controls=0",
//     "https://www.youtube.com/embed/techmgGVOhk?si=-H-gvonRnPgtefDC&amp;controls=0",
//     "https://www.youtube.com/embed/S_MOd40zlYU?si=SXO8wHkWqX7H8GAi&amp;controls=0",
//     "https://www.youtube.com/embed/XFdTycvQMQo?si=Tya_Uw9aLvqGlRHc&amp;controls=0",
//     "https://www.youtube.com/embed/A_hmrykwR7g?si=DNfzd1odylS0AIGP&amp;controls=0",
//     "https://www.youtube.com/embed/l6J0ylYTO4s?si=hFnZtqGj8nkaWSAY&amp;controls=0",
//     "https://www.youtube.com/embed/eV25g4VK_Eg?si=vTcUIDgZ_gK4H1C6&amp;controls=0",
//     "https://www.youtube.com/embed/DSGyEsJ17cI?si=wPYj_A6HcN5eyStL&amp;controls=0",
//     "https://www.youtube.com/embed/4khIPP--FDU?si=BQWCsBbS3yMnc6Lk&amp;controls=0",
// ];

// const gridContainer = document.querySelector('#music .grid');
// const iframe = document.getElementById('music-iframe');

// musicLinks.forEach((link, index) => {
//     const button = document.createElement('button');
//     // button.textContent = `${index + 1}`;
//     button.className = "p-2 neumorphic-button text-white rounded";
//     button.dataset.index = index;

//     button.addEventListener('click', () => {
//         // Update iframe src
//         iframe.src = musicLinks[index];

//         // Remove music-active class from all buttons
//         document.querySelectorAll('.grid button').forEach(btn => btn.classList.remove('music-active'));

//         // Add music-active class to the clicked button
//         button.classList.add('music-active');
//     });

//     gridContainer.appendChild(button);
// });

/* New Audio Based Logic */

let currentAudio = null; // To keep track of the current audio object
let currentPlaylistButton = null; // To track the active playlist button
let currentTrackIndex = 0; // To track the current playing track
let currentPlaylist = []; // To store the current playlist

document.addEventListener('DOMContentLoaded', () => {
    const playlistButtonsDiv = document.getElementById('playlist-buttons');
    const volumeSlider = document.getElementById('volume-slider');
    const playPauseButton = document.getElementById('play-pause');
    const trackInfo = document.getElementById('track-info');
    
    document.getElementById('next-music').addEventListener('click', () => {
        if (currentAudio && currentPlaylist.length > 0) {
            currentAudio.pause(); // Stop the current audio
            currentTrackIndex++; // Move to the next track in the playlist
            playTrack(currentPlaylistButton.textContent.trim()); // Play the next track
        }
    });

    // Adjust volume using slider
    volumeSlider.addEventListener('input', (e) => {
        if (currentAudio) {
            currentAudio.volume = e.target.value;
        }
    });

    // Toggle Play/Pause
    playPauseButton.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                playPauseButton.innerHTML = '<span class="material-symbols-outlined">pause</span>';
            } else {
                currentAudio.pause();
                playPauseButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
            }
        }
    });

    // Fetch playlists from the backend and create buttons
    fetch('/api/playlists')
    .then((response) => response.json())
    .then((data) => {
        const { playlists } = data;
        playlists.forEach((playlist) => {
            // Create button
            const button = document.createElement('button');
            button.className = 'neumorphic-music-button';
            button.addEventListener('click', () => playPlaylist(playlist, button));

            // Wrap text in span for animation
            const span = document.createElement('span');
            span.textContent = playlist.name;
            button.appendChild(span);

            // Append the button to the container
            playlistButtonsDiv.appendChild(button);

            // Check if the text is overflowing
            requestAnimationFrame(() => {
                if (span.offsetWidth > button.clientWidth) {
                    span.style.animation = 'scroll-text 6s linear infinite'; // Add animation
                } else {
                    span.style.animation = 'none'; // Remove animation
                }
            });
        });
    })
    .catch((error) => console.error('Error fetching playlists:', error));
});

function playPlaylist(playlist, button) {
    // Stop the current playlist if any
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Remove highlight from the previous playlist button
    if (currentPlaylistButton) {
        currentPlaylistButton.classList.remove('music-active');
        // currentPlaylistButton.classList.add('music-active');
    }

    // Highlight the current playlist button
    // button.classList.remove('music-active');
    button.classList.add('music-active');
    currentPlaylistButton = button;

    // Shuffle and set the current playlist
    currentPlaylist = shuffleArray(playlist.tracks);
    currentTrackIndex = 0;

    // Start playing the first track
    playTrack(playlist.name);
}

function playTrack(playlistName) {
    if (currentTrackIndex >= currentPlaylist.length) {
        // shuffle and play the playlist again
        currentPlaylist = shuffleArray(currentPlaylist);
        currentTrackIndex = 0;
    }

    const trackName = currentPlaylist[currentTrackIndex];
    updateTrackInfo(trackName); // Update the track info display

    currentAudio = new Audio(`/music/${playlistName}/${trackName}`);
    currentAudio.volume = Math.pow(document.getElementById('volume-slider').value, 2); // Set volume to slider value
    currentAudio.play();

    currentAudio.onended = () => {
        currentTrackIndex++;
        playTrack(playlistName); // Play the next track
    };
}

function updateTrackInfo(trackName) {
    const trackInfo = document.getElementById('track-info');
    const trackNameWithoutExtension = trackName.split('.')[0];

    // Clear existing content
    trackInfo.innerHTML = '';

    // Create a span to hold the track name
    const span = document.createElement('span');
    span.textContent = `${trackNameWithoutExtension}`;
    trackInfo.appendChild(span);

    // Dynamically apply animation if text overflows
    requestAnimationFrame(() => {
        if (span.offsetWidth > trackInfo.clientWidth) {
            span.style.animation = 'scroll-track-text 6s linear infinite';
        } else {
            span.style.animation = 'none'; // No animation if text fits
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create an audio map to store audio objects and their states
const audioMap = {
    'brown-noise': {
        file: 'resource/brown_noise.mp3',
        audio: null,
        volumeLevels: [0.75, 0.5, 0.25, 0.05, 0],
        currentLevelIndex: 0
    },
    'rain': {
        file: 'resource/rain.mp3',
        audio: null,
        volumeLevels: [0.75, 0.5, 0.25, 0.05, 0],
        currentLevelIndex: 0
    }
};

// Function to handle button clicks
function handleSoundButtonClick(buttonId) {
    const sound = audioMap[buttonId];

    if (!sound.audio) {
        // Initialize the audio object if not already done
        sound.audio = new Audio(sound.file);
        sound.audio.loop = true; // Loop the sound continuously
    }

    // Update the volume to the next level
    sound.currentLevelIndex = (sound.currentLevelIndex + 1) % sound.volumeLevels.length;
    const newVolume = sound.volumeLevels[sound.currentLevelIndex];

    if (newVolume === 0) {
        // Stop the sound if volume is 0
        sound.audio.pause();
        sound.audio.currentTime = 0; // Reset the playback position
    } else {
        // Play the sound with the updated volume
        sound.audio.volume = newVolume;
        if (sound.audio.paused) {
            sound.audio.play();
        }
    }
}

// Attach event listeners to the buttons
document.getElementById('brown-noise').addEventListener('click', () => handleSoundButtonClick('brown-noise'));
document.getElementById('rain').addEventListener('click', () => handleSoundButtonClick('rain'));
