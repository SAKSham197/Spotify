let currentsong = new Audio();
let songs = [];
let currfolder;

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes + ":" + ("0" + remainingSeconds).slice(-2);
}

// Fetch songs from a folder
async function getsongs(folder) {
    currfolder = folder;
    let songsdata = await fetch(`songs/${folder}/`);
    songsdata = await songsdata.text();
    const div = document.createElement("div");
    div.innerHTML = songsdata;
    const as = div.getElementsByTagName("a");

    songs = [];
    for (const element of as) {
        if (element.href.endsWith(".mp3")) {
            const filename = element.href.split(`/songs/${folder}/`)[1];
            songs.push(filename);
        }
    }

    // Populate playlist
    const songlists = document.querySelector(".songlists ul");
    songlists.innerHTML = "";
    for (const song of songs) {
        const displayName = song.replaceAll("%20", " ");
        songlists.innerHTML += `
        <li>
            <img class="filter" src="img/music.svg" alt="">
            <div class="info">
                <div class="songname">${displayName}</div>
            </div>
            <span>Play now</span>
            <img class="filter" src="img/pause.svg" alt="">
        </li>`;
    }

    // Event listener for playing songs
    Array.from(songlists.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            const track = li.querySelector(".songname").innerHTML.trim();
            playMusic(track);
            updatePlaylistIcons(track);
        });
    });
}

// Play a track
function playMusic(track) {
    currentsong.src = `songs/${currfolder}/${track}`;
    currentsong.play();
    document.querySelector(".songinfo").innerHTML = track;
}

// Update play/pause icons in playlist
function updatePlaylistIcons(currentTrack) {
    Array.from(document.querySelectorAll(".songlists li")).forEach(li => {
        const img = li.querySelector("img:last-child");
        const trackName = li.querySelector(".songname").innerHTML.trim();
        img.src = (trackName === currentTrack) ? "img/play.svg" : "img/pause.svg";
    });
}

// Display albums/cards
async function displayalbum() {
    const cards = document.querySelector(".cards");
    let albums = await fetch("songs/");
    albums = await albums.text();
    const div = document.createElement("div");
    div.innerHTML = albums;
    const as = div.getElementsByTagName("a");

    for (const e of as) {
        if (e.href.includes("/songs/")) {
            const folder = e.href.split("/songs/")[1].replace("/", "");
            const infodataRes = await fetch(`songs/${folder}/info.json`);
            const infodata = await infodataRes.json();
            cards.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img src="songs/${folder}/cover.jpg" alt="">
                <h3>${infodata.title}</h3>
                <p>${infodata.description}</p>
                <div class="play-container">
                    <svg class="play-button" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="30,20 30,80 80,50" />
                    </svg>
                </div>
            </div>`;
        }
    }

    // Click event to load songs for album
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await getsongs(card.dataset.folder);
            const firstTrack = document.querySelector(".songlists li .songname").innerHTML.trim();
            playMusic(firstTrack);
            updatePlaylistIcons(firstTrack);
        });
    });
}

// Main function
async function main() {
    await getsongs("Sigma-mood"); // Use correct folder name without spaces
    if (songs.length > 0) {
        playMusic(songs[0]);
        updatePlaylistIcons(songs[0]);
    }
    displayalbum();

    const pauseBtn = document.querySelector(".pause");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    // Pause/play toggle
    pauseBtn.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
        } else {
            currentsong.pause();
        }
        updatePlaylistIcons(currentsong.src.split(`/songs/${currfolder}/`)[1]);
    });

    // Time update
    currentsong.addEventListener("timeupdate", () => {
        const duration = currentsong.duration || 0;
        document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(duration)}`;
        document.querySelector(".circle").style.left = `${(currentsong.currentTime / duration) * 100}%`;
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentsong.currentTime = percent * currentsong.duration;
        document.querySelector(".circle").style.left = `${percent * 100}%`;
    });

    // Next button
    nextBtn.addEventListener("click", () => {
        const index = songs.indexOf(currentsong.src.split(`/songs/${currfolder}/`)[1]);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
        updatePlaylistIcons(currentsong.src.split(`/songs/${currfolder}/`)[1]);
    });

    // Previous button
    prevBtn.addEventListener("click", () => {
        const index = songs.indexOf(currentsong.src.split(`/songs/${currfolder}/`)[1]);
        if (index > 0) playMusic(songs[index - 1]);
        updatePlaylistIcons(currentsong.src.split(`/songs/${currfolder}/`)[1]);
    });

    // Volume control
    const volumeInput = document.querySelector(".volume input");
    const volImg = document.querySelector(".volduration img");
    volumeInput.addEventListener("change", e => {
        currentsong.volume = e.target.value / 100;
        volImg.src = currentsong.volume === 0 ? "img/mute.svg" : "img/vol.svg";
    });

    // Volume button toggle
    volImg.addEventListener("click", () => {
        if (currentsong.volume > 0) {
            currentsong.volume = 0;
            volumeInput.value = 0;
            volImg.src = "img/mute.svg";
        } else {
            currentsong.volume = 0.1;
            volumeInput.value = 10;
            volImg.src = "img/vol.svg";
        }
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    });
}

main();
