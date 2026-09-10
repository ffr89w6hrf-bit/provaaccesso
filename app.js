const searchInput = document.getElementById('searchInput');
const chips = [...document.querySelectorAll('.chip')];
const cards = [...document.querySelectorAll('.activity-card')];
const emptyState = document.getElementById('emptyState');
const mapPanel = document.getElementById('mapPanel');
const toggleMap = document.getElementById('toggleMap');
const dialog = document.getElementById('createDialog');
const form = document.getElementById('createForm');
const toast = document.getElementById('toast');

let activeSport = 'Tutti';

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  let visible = 0;

  cards.forEach(card => {
    const sportMatch = activeSport === 'Tutti' || card.dataset.sport === activeSport;
    const textMatch = !term || card.dataset.search.includes(term) || card.innerText.toLowerCase().includes(term);
    const show = sportMatch && textMatch;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  emptyState.classList.toggle('hidden', visible !== 0);
}

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    activeSport = chip.dataset.sport;
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    applyFilters();
  });
});

searchInput.addEventListener('input', applyFilters);

toggleMap.addEventListener('click', () => {
  const hidden = mapPanel.classList.toggle('hidden');
  toggleMap.textContent = hidden ? 'Mappa' : 'Nascondi';
});

function openCreate() {
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

document.getElementById('openCreate').addEventListener('click', openCreate);
document.getElementById('fabCreate').addEventListener('click', openCreate);

document.querySelectorAll('.join-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('joined');
    btn.textContent = btn.classList.contains('joined') ? '✓ Partecipo' : 'Partecipa';
    showToast(btn.classList.contains('joined') ? 'Sei dentro! Attività aggiunta.' : 'Partecipazione annullata.');
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const sport = document.getElementById('newSport').value;
  const title = document.getElementById('newTitle').value.trim();
  const date = document.getElementById('newDate').value;
  const time = document.getElementById('newTime').value;
  const place = document.getElementById('newPlace').value.trim();
  const max = document.getElementById('newMax').value || '12';

  if (!title || !date || !time || !place) return;

  const d = new Date(date + 'T12:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'];
  const month = months[d.getMonth()];
  const emoji = {Pallavolo:'🏐', Calcio:'⚽', Tennis:'🎾', Corsa:'🏃', Bici:'🚴'}[sport] || '🏅';

  const article = document.createElement('article');
  article.className = 'activity-card';
  article.dataset.sport = sport;
  article.dataset.search = `${sport} ${title} ${place}`.toLowerCase();
  article.innerHTML = `
    <div class="card-top">
      <span class="sport-badge">${emoji} ${sport}</span>
      <span class="distance">Nuova</span>
    </div>
    <div class="card-body">
      <div class="date-box"><strong>${day}</strong><span>${month}</span></div>
      <div class="card-main">
        <h3>${escapeHtml(title)}</h3>
        <p>📍 ${escapeHtml(place)} · ${time}</p>
        <div class="people"><span class="faces">🙂</span><span><strong>1/${max}</strong> partecipanti</span></div>
      </div>
    </div>
    <button class="join-btn joined">✓ Partecipo</button>
  `;

  document.getElementById('activityGrid').prepend(article);
  article.querySelector('.join-btn').addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('joined');
    e.currentTarget.textContent = e.currentTarget.classList.contains('joined') ? '✓ Partecipo' : 'Partecipa';
  });

  cards.unshift(article);
  dialog.close();
  form.reset();
  document.getElementById('newMax').value = '12';
  applyFilters();
  showToast('Attività pubblicata!');
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
