// ==========================================
// イベント情報(ライブ写真が増えたらここに1行追加するだけ!)
//   folder の中に image_001.jpg, image_002.jpg ... と連番で入れる
// ==========================================
const events = [
    { id: "event1", label: "2024.9.7 定禅寺ストリートジャズフェスティバル", folder: "image/2024.9.7 定禅寺ストリートジャズフェスティバル", count: 27, photographer: "Taro Nozawa" },
    { id: "event2", label: "2024.12.22 ROCKATERIA", folder: "image/2024.12.22 ROCKATERIA", count: 12, photographer: "Taro Nozawa" },
    { id: "event3", label: "2026.4.11 VORZ BAR", folder: "image/2026.4.11 VORZ BAR", count: 26, photographer: "Taro Nozawa" },
    { id: "event4", label: "2026.9.12 定禅寺ストリートジャズフェスティバル", folder: "image/2026.9.12 定禅寺ストリートジャズフェスティバル", count: 17, photographer: "Taro Nozawa" },
    // 今後増えたらここに追加
];

// ヒーローのスライド枚数(好きな数字に変更OK)
const SLIDE_COUNT = 10;
// スライドが切り替わる間隔(ミリ秒)
const SLIDE_INTERVAL = 5000;

// 写真のパスを作る
function photoPath(event, i) {
    return encodeURI(`${event.folder}/image_${String(i).padStart(3, '0')}.jpg`);
}

// ==========================================
// ヒーロー:全イベントの写真からランダムにスライドショー
// ==========================================
function buildSlideshow() {
    const container = document.getElementById('slideshow');

    let all = [];
    events.forEach(ev => {
        for (let i = 1; i <= ev.count; i++) all.push(photoPath(ev, i));
    });

    // シャッフル(Fisher-Yates法)
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }

    const picked = all.slice(0, SLIDE_COUNT);
    picked.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.className = index === 0 ? 'slide active' : 'slide';
        if (index > 0) img.loading = 'lazy';
        container.appendChild(img);
    });

    let current = 0;
    setInterval(() => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length < 2) return;
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, SLIDE_INTERVAL);
}

// ==========================================
// 流れる帯(次のライブなど、好きな言葉に変更OK)
// ==========================================
const TICKER_WORDS = [
    'HeSo BAND',
    'Acoustic Reggae & Trad',
    'From Sendai',
    'Mandolin / Pianica / Guitar / Bass / Drums',
    'Thank you for listening',
];

function buildTicker() {
    const track = document.getElementById('ticker-track');
    const line = TICKER_WORDS.map(w => `${w}<i>✺</i>`).join(' ');
    // 2回並べて途切れずにループさせる
    track.innerHTML = `<span>${line}</span><span>${line}</span>`;
}

// ==========================================
// ギャラリー
// ==========================================
let visiblePhotos = [];   // ライトボックスで前後に送るための一覧
let lightboxIndex = 0;

function buildGallery() {
    const tabs = document.getElementById('gallery-tabs');

    // 新しいイベントを先に並べる
    const ordered = [...events].reverse();

    ordered.forEach(ev => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.textContent = ev.label;
        btn.onclick = () => showGallery(ev.id, btn);
        tabs.appendChild(btn);
    });

    const allBtn = document.createElement('button');
    allBtn.className = 'tab-btn';
    allBtn.textContent = 'すべて';
    allBtn.onclick = () => showGallery('all', allBtn);
    tabs.appendChild(allBtn);

    // 最初は一番新しいイベントを表示
    showGallery(ordered[0].id, tabs.querySelector('.tab-btn'));
}

function showGallery(eventId, btn) {
    const grid = document.getElementById('gallery-grid');
    const credit = document.getElementById('gallery-credit');

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targets = eventId === 'all' ? [...events].reverse() : events.filter(e => e.id === eventId);

    visiblePhotos = [];
    targets.forEach(ev => {
        for (let i = 1; i <= ev.count; i++) {
            visiblePhotos.push({ src: photoPath(ev, i), alt: `${ev.label} の写真` });
        }
    });

    grid.innerHTML = '';
    visiblePhotos.forEach((p, index) => {
        const img = document.createElement('img');
        img.src = p.src;
        img.alt = p.alt;
        img.loading = 'lazy';
        img.onclick = () => openLightbox(index);
        grid.appendChild(img);
    });

    // クレジット(「すべて」の時は複数カメラマンが混ざる可能性があるので非表示)
    if (eventId === 'all') {
        credit.textContent = '';
    } else {
        const ev = targets[0];
        credit.textContent = ev.photographer ? `Photo by ${ev.photographer}` : '';
    }
}

// ==========================================
// ライトボックス(拡大表示・前後送り)
// ==========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
}
function closeLightbox() {
    lightbox.classList.remove('active');
}
function moveLightbox(step) {
    lightboxIndex = (lightboxIndex + step + visiblePhotos.length) % visiblePhotos.length;
    updateLightbox();
}
function updateLightbox() {
    const p = visiblePhotos[lightboxIndex];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.alt;
}

lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lb-close')) closeLightbox();
});
lightbox.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); moveLightbox(-1); });
lightbox.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); moveLightbox(1); });
document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') moveLightbox(-1);
    if (e.key === 'ArrowRight') moveLightbox(1);
});

// スマホのスワイプで前後送り
let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) moveLightbox(dx < 0 ? 1 : -1);
    touchX = null;
});

// ==========================================
// メニュー(スマホ・タブレット)とヘッダーの色切り替え
// ==========================================
const menuBtn = document.getElementById('menu-btn');
const nav = document.getElementById('nav');
const header = document.getElementById('site-header');

function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
}
menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.6);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// ==========================================
// スクロールでふわっと表示
// ==========================================
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade').forEach(el => observer.observe(el));

// ==========================================
// お問い合わせフォーム
//   送信先は index.html のフォームの data-endpoint(Google Apps Script のURL)です。
//   届いた内容は Gmail に通知され、スプレッドシートにも記録されます。
// ==========================================
(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const endpoint = (form.dataset.endpoint || '').trim();
    const fallback = (form.dataset.fallback || '').trim();
    const status = form.querySelector('.contact-form__status');
    const submit = form.querySelector('.contact-form__submit');
    const eventFields = form.querySelector('.event-only');

    // 演奏のご依頼のときだけ「開催予定日・会場」の欄を出す
    const EVENT_TOPICS = ['ライブ出演のご依頼', 'イベント・パーティーでの演奏'];
    function updateEventFields() {
        const checked = form.querySelector('input[name="topic"]:checked');
        eventFields.hidden = !(checked && EVENT_TOPICS.includes(checked.value));
    }
    form.querySelectorAll('input[name="topic"]').forEach(r => r.addEventListener('change', updateEventFields));
    updateEventFields();

    // 入力し直したら、その欄のエラー表示を消す
    form.addEventListener('input', e => clearFieldError(e.target));
    form.addEventListener('change', e => clearFieldError(e.target));
    function clearFieldError(el) {
        const wrap = el.closest && el.closest('.field');
        if (!wrap || !wrap.classList.contains('has-error')) return;
        wrap.classList.remove('has-error');
        wrap.querySelectorAll('.field-error').forEach(x => x.remove());
        wrap.querySelectorAll('[aria-invalid]').forEach(x => { x.removeAttribute('aria-invalid'); x.removeAttribute('aria-describedby'); });
    }

    const messages = {
        name: 'お名前を入力してください。',
        email: 'メールアドレスを入力してください。',
        emailFormat: 'メールアドレスの形式をご確認ください(例:name@example.com)。',
        topic: 'ご用件を選んでください。',
        message: '内容を入力してください。'
    };

    function clearErrors() {
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
        form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    }

    function showError(field, text) {
        const wrap = field.closest('.field');
        wrap.classList.add('has-error');
        const p = document.createElement('p');
        p.className = 'field-error';
        p.id = (field.id || field.name) + '-error';
        p.textContent = text;
        wrap.appendChild(p);
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', p.id);
    }

    function validate() {
        clearErrors();
        const errors = [];
        const name = form.elements.name;
        const email = form.elements.email;
        const message = form.elements.message;
        const topicChecked = form.querySelector('input[name="topic"]:checked');

        if (!name.value.trim()) errors.push([name, messages.name]);
        if (!email.value.trim()) errors.push([email, messages.email]);
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errors.push([email, messages.emailFormat]);
        if (!topicChecked) errors.push([form.querySelector('input[name="topic"]'), messages.topic]);
        if (!message.value.trim()) errors.push([message, messages.message]);

        errors.forEach(([field, text]) => showError(field, text));
        if (errors.length) errors[0][0].focus();
        return errors.length === 0;
    }

    function setStatus(html, isError) {
        status.innerHTML = html;
        status.classList.toggle('is-error', !!isError);
    }

    function fallbackLink(text) {
        return fallback ? '<a href="' + fallback + '" target="_blank" rel="noopener">' + text + '</a>' : '別の方法';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // 送信先がまだ設定されていないあいだは、旧フォームを案内する
        if (!endpoint) {
            setStatus('ただいまフォームの準備中です。お手数ですが、' + fallbackLink('こちらのフォーム') + 'からお送りください。', true);
            return;
        }

        // 演奏以外のご用件では、隠れている日付・会場欄は送らない
        if (eventFields.hidden) {
            form.elements.date.value = '';
            form.elements.venue.value = '';
        }

        const data = new URLSearchParams(new FormData(form));
        data.append('page', location.href);

        submit.disabled = true;
        const label = submit.textContent;
        submit.textContent = '送信しています…';
        setStatus('', false);

        try {
            const res = await fetch(endpoint, { method: 'POST', body: data });
            let result = null;
            try { result = await res.json(); } catch (_) { /* 応答が読めない場合は下で判定 */ }
            if (!res.ok || (result && result.ok === false)) throw new Error((result && result.error) || 'send failed');

            const name = form.elements.name.value.trim();
            const done = document.createElement('div');
            done.className = 'contact-done';
            done.setAttribute('tabindex', '-1');
            done.innerHTML =
                '<span class="done-mark" aria-hidden="true">✓</span>' +
                '<h3>送信しました!</h3>' +
                '<p></p>' +
                '<p>内容を確認して、メールでお返事します。数日たっても返信がない場合は、お手数ですがもう一度お送りいただくか、迷惑メールフォルダをご確認ください。</p>';
            done.querySelector('p').textContent = name + ' 様、お問い合わせありがとうございます。';
            form.replaceChildren(done);
            done.focus();
        } catch (err) {
            submit.disabled = false;
            submit.textContent = label;
            const tooSoon = String(err && err.message) === 'too_soon';
            setStatus(
                (tooSoon
                    ? '少し時間をおいてから、もう一度お試しください。'
                    : '送信できませんでした。通信状況をご確認のうえ、もう一度お試しください。') +
                (fallback ? 'うまくいかない場合は' + fallbackLink('こちらのフォーム') + 'からもお送りいただけます。' : ''),
                true
            );
        }
    });
})();

// ==========================================
// ページ読み込み時に実行
// ==========================================
buildSlideshow();
buildTicker();
buildGallery();
