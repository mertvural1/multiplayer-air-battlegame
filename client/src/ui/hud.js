export class Hud {
  constructor(root) {
    root.innerHTML = `
      <div class="hud-topbar">
        <div class="panel online-panel"><span class="dot"></span><span id="online-count">Bağlanılıyor…</span></div>
        <section class="panel scoreboard"><h2>SKOR TABLOSU</h2><div class="score-head"><span>OYUNCU</span><span>K</span><span>Ö</span></div><div id="score-list"></div></section>
      </div>
      <div class="crosshair" aria-hidden="true"><i></i><b></b><em></em><strong></strong></div>
      <div class="hud-bottom">
        <div class="panel vitals"><div class="vital-label">GÖVDE</div><div id="hearts" class="hearts">♡ ♡</div><div class="vital-label nitro-label">NİTRO <span id="nitro-value">100%</span></div><div class="meter"><div id="nitro-fill"></div></div></div>
        <div class="controls">W/S HIZ &nbsp; A/D DÖN &nbsp; MOUSE ↑/↓ İRTİFA &nbsp; SOL TIK ATEŞ &nbsp; SPACE NİTRO</div>
      </div>
      <div id="respawn" class="respawn hidden"></div>
      <div class="mobile-controls" aria-label="Dokunmatik oyun kontrolleri">
        <!-- D-pad: up/left/right/down -->
        <div class="mobile-cluster dpad-cluster">
          <button data-input="climb" aria-label="Yüksel">▲</button>
          <div class="dpad-row">
            <button data-input="turnLeft" aria-label="Sola">▶</button>
            <button class="dpad-center" aria-hidden="true"></button>
            <button data-input="turnRight" aria-label="Sağa">◀</button>
          </div>
          <button data-input="descend" aria-label="Alçal">▼</button>
        </div>
        <!-- Actions: nitro + fire -->
        <div class="mobile-cluster action-cluster">
          <button data-input="nitro" aria-label="Nitro" class="nitro-button">N</button>
          <button data-action="fire" class="fire-button" aria-label="Ateş et">ATEŞ</button>
        </div>
      </div>`;
    this.online = root.querySelector('#online-count');
    this.hearts = root.querySelector('#hearts');
    this.nitro = root.querySelector('#nitro-value');
    this.nitroFill = root.querySelector('#nitro-fill');
    this.scoreList = root.querySelector('#score-list');
    this.respawn = root.querySelector('#respawn');
  }

  setConnection(message) { this.online.textContent = message; }

  update(state) {
    const players = [...state.players.values()];
    const self = state.self;
    this.online.textContent = `${players.length} OYUNCU ÇEVRİMİÇİ`;
    if (self) {
      this.hearts.textContent = `${self.hp >= 1 ? '♥' : '♡'} ${self.hp >= 2 ? '♥' : '♡'}`;
      this.nitro.textContent = `${self.nitro}%`;
      this.nitroFill.style.width = `${self.nitro}%`;
      if (!self.alive) {
        const seconds = Math.max(0, (self.respawnAt - Date.now()) / 1000);
        this.respawn.textContent = `UÇAĞIN İMHA EDİLDİ · ${seconds.toFixed(1)} SANİYE`;
        this.respawn.classList.remove('hidden');
      } else this.respawn.classList.add('hidden');
    }
    this.scoreList.innerHTML = players
      .sort((left, right) => right.kills - left.kills || left.deaths - right.deaths || left.nickname.localeCompare(right.nickname))
      .map((player) => `<div class="score-row ${player.id === state.selfId ? 'self' : ''}"><span><i style="background:${player.color}"></i>${escapeHtml(player.nickname)}</span><b>${player.kills}</b><b>${player.deaths}</b></div>`)
      .join('');
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
