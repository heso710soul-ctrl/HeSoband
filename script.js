let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showNextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// 4秒ごとに自動で切り替え
setInterval(showNextSlide, 3000);

// イベント情報をここで管理(今後増えたらここに追加するだけ!)
const events = [
    { id: "event1", label: "2026.4.11 VORZ BAR", folder: "image/2026.4.11 VORZ BAR", count: 28, photographer: "Taro Nozawa" },
    // 今後増えたらここにも photographer を追加
];

// ギャラリーを自動生成する
function buildGallery() {
    const tabsContainer = document.getElementById('gallery-tabs');
    const gridContainer = document.getElementById('gallery-grid');

    // 「全部」ボタンを追加(最初はactiveクラスをつけない!)
    tabsContainer.innerHTML = `<button class="tab-btn" onclick="filterGallery('all', this)">全部</button>`;

    events.forEach(event => {
        // タブボタンを追加
        tabsContainer.innerHTML += `<button class="tab-btn" onclick="filterGallery('${event.id}', this)">${event.label}</button>`;

        // その回数分の画像を自動生成(最初は非表示にする!)
        for (let i = 1; i <= event.count; i++) {
            const num = String(i).padStart(3, '0');
            const img = document.createElement('img');
            img.src = encodeURI(`${event.folder}/image_${num}.jpg`);
            img.dataset.event = event.id;
            img.style.display = 'none';  // ← 最初は非表示にしておく
            img.onclick = function() { openLightbox(this); };
            gridContainer.appendChild(img);
        }
    });
}

// 絞り込み機能
function filterGallery(eventId, btn) {
    const images = document.querySelectorAll('.gallery-grid img');
    images.forEach(img => {
        img.style.display = (eventId === 'all' || img.dataset.event === eventId) ? 'block' : 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 案内文を消す
    const hint = document.getElementById('gallery-hint');
    if (hint) hint.style.display = 'none';

    // クレジット表示の切り替え
    const credit = document.getElementById('gallery-credit');
    if (eventId === 'all') {
        credit.textContent = '';  // 「全部」表示の時はクレジット非表示(複数カメラマンが混在するため)
    } else {
        const event = events.find(e => e.id === eventId);
        credit.textContent = event.photographer ? `Photo by ${event.photographer}` : '';
    }
}


// ライトボックス(拡大表示)
function openLightbox(imgElement) {
    document.getElementById('lightbox-img').src = imgElement.src;
    document.getElementById('lightbox').classList.add('active');
}
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

// ページ読み込み時にギャラリー生成
buildGallery();