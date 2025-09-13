const stage = document.getElementById('stage');
const clock = document.getElementById('clock');

const CARD_UPDATE_INTERVAL_min = 1;
const FADE_DURATION_sec = 3.2;

function tickClock() {
    const d = new Date();
    // clock.textContent = d.toLocaleString();
    let $ = q => document.getElementById(q);
    Number.prototype.pad = function (n) { return String(this).padStart(n, '0'); };
    $('clock_date').innerText = `${(d.getMonth() + 1).pad(2)}/${d.getDate().pad(2)}`;
    $('clock_daytext').innerText = `(${d.toLocaleDateString('en', { weekday: 'short' })})`;
    $('clock_time').innerText = `${d.getHours().pad(2)}:${d.getMinutes().pad(2)}`;
    $('clock_seconds').innerText = d.getSeconds().pad(2);
}
setInterval(tickClock, 1000); tickClock();

var data = null;
var current_card_index = -1;
var current_data_fetchAt = '';



async function nextCard() {
    if (!data) return;

    if (current_data_fetchAt != data.fetchedAt) {
        current_card_index = -1;
        current_data_fetchAt = data?.fetchedAt;
    }


    current_card_index = (current_card_index + 1) % data.items.length;
    await render(data.items[current_card_index]);


    if (current_card_index == data.items.length - 2) {
        await refetch();
    }
}



function createAnimationCSS() {
    const style = document.createElement('style');
    style.innerHTML = `
.card .bg {
    transition: all ${FADE_DURATION_sec}s ease;
}
.fade-out .card .bg {
    filter: blur(12vmin) brightness(1) contrast(1) saturate(5) brightness(0);
    transform: scale(0.72);
}
.card .box {
    transition: all ${FADE_DURATION_sec * 0.8}s ease;
}
.fade-out .card .box {
    filter: blur(12vmin);
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
}
`;
    document.head.append(style);
}
createAnimationCSS();


async function render(item) {
    document.body.classList.add('fade-out');
    await new Promise(resolve => setTimeout(resolve, FADE_DURATION_sec * 1000));

    stage.innerHTML = '';
    const card = document.createElement('article');
    card.className = 'card';
    if (item.img) {
        const bg = document.createElement('div');
        bg.className = 'bg';
        bg.style.backgroundImage = `url("${item.img}")`;
        card.append(bg);
    }
    const box = document.createElement('div');
    box.className = 'box card-appearance';
    box.innerHTML = `
<div class="thumbnail-container"><img src="${item.img}" class="thumbnail"></div>
<div class="content"><h1 class="title">${item.title ?? ''}</h1>
<p class="desc">${item.discription ?? ''}</p>
<div class="meta">
${item.source_img ? `<img class="fav" src="${item.source_img}" />` : ''}
<span>${item.source ?? ''}</span>
</div>
</div>`;
    card.append(box);

    // クリックで外部ブラウザ（main側 setWindowOpenHandler で shell.openExternal）
    // card.addEventListener('click', () => {
    //     if (it.link) window.open(it.link, '_blank');
    // });

    stage.append(card);

    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.classList.remove('fade-out');
}




async function refetch() {
    let config = await window.configAPI.get()
    await window.discoverAPI.fetch(config);
    data = window.discoverAPI.load();
    console.log("最新Discover:", data);
}

refetch().then(nextCard);
function mainLoop() {
    setTimeout(_ => requestAnimationFrame(mainLoop), (CARD_UPDATE_INTERVAL_min * 60 * 1000) - (Date.now() % (CARD_UPDATE_INTERVAL_min * 60 * 1000)));
    nextCard();
}

mainLoop();