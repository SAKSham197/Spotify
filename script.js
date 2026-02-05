let currentsong = new Audio();
let songs = [];
let currfolder = "";

/* -------------------- UTILS -------------------- */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "00:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

/* -------------------- PLAYLISTS -------------------- */
const albumsList = [
    "Sigma mood",
    "Happy mood",
    "Fresh vibes",
    "Eminem",
    "Phonk",
    "Sad tone",
    "Old songs",
    "Spiritual",
    "Honey Singh",
    "Imagine dragons"
];

/* -------------------- LOAD SONGS -------------------- */
async function getsongs(folder) {
    currfolder = folder;

    const res = await fetch(`songs/${folder}/info.json`);
    const data = await res.json();

    if (!data.songs || data.songs.length === 0) {
        console.error("No songs found in", folder);
        return;
    }

    songs = data.songs.map(song => `songs/${folder}/${song}`);

    const songlists = document.querySelector(".songlists ul");
    songlists.innerHTML = "";

    data.songs.forEach(song => {
        songlists.innerHTML += `
            <li>
                <img class="filter" src="img/music.svg">
                <div class="info">
                    <div class="songname">${song}</div>
                </div>
                <span>Play now</span>
                <img class="filter" src="img/pause.svg">
            </li>
        `;
    });

    document.querySelectorAll(".songlists li").forEach(li => {
        li.addEventListener("click", () => {
            const track = li.querySelector(".songname").innerText;
            playMusic(track);
            updateListIcons(li);
        });
    });
}

/* -------------------- PLAY MUSIC -------------------- */
function playMusic(track) {
    if (!track) return;

    currentsong.src = `songs/${currfolder}/${track}`;
    currentsong.play().catch(() => {}); // ignore autoplay restriction
    pause.src = "img/play.svg";
    document.querySelector(".songinfo").innerText = track;
}

/* -------------------- UPDATE ICONS -------------------- */
function updateListIcons(activeLi) {
    document.querySelectorAll(".songlists li").forEach(li => {
        li.querySelector("img:last-child").src = "img/pause.svg";
    });
    activeLi.querySelector("img:last-child").src = "img/play.svg";
}

/* -------------------- DISPLAY ALBUMS -------------------- */
async function displayalbum() {
    const cards = document.querySelector(".cards");
    cards.innerHTML = "";

    for (const folder of albumsList) {
        const res = await fetch(`songs/${folder}/info.json`);
        const data = await res.json();

        cards.innerHTML += `
            <div class="card" data-folder="${folder}">
                <img src="songs/${folder}/cover.jpg">
                <h3>${data.title}</h3>
                <p>${data.description}</p>
            </div>
        `;
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getsongs(card.dataset.folder);

            const firstSong =
                document.querySelector(".songlists li .songname");

            if (firstSong) {
                playMusic(firstSong.innerText);
                updateListIcons(firstSong.closest("li"));
            }
        });
    });
}

/* -------------------- MAIN -------------------- */
async function main() {
    await getsongs("Sigma mood");
    document.querySelector(".songinfo").innerText = "Select a song";
    displayalbum();

    pause.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play().catch(() => {});
            pause.src = "img/play.svg";
        } else {
            currentsong.pause();
            pause.src = "img/pause.svg";
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1].split(`/songs/${currfolder}/`)[1]);
        }
    });

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src);
        if (index > 0) {
            playMusic(songs[index - 1].split(`/songs/${currfolder}/`)[1]);
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerText =
            `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;

        document.querySelector(".circle").style.left =
            `${(currentsong.currentTime / currentsong.duration) * 100 || 0}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = e.offsetX / e.target.clientWidth;
        currentsong.currentTime = percent * currentsong.duration;
    });

    document.querySelector(".volume input").addEventListener("input", e => {
        currentsong.volume = e.target.value / 100;
    });
}

main();
