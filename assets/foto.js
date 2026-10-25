// Recorte manual da foto (arrastar e dar zoom) + envio para o Supabase Storage
const FOTO_W = 340, FOTO_H = 380;      // tamanho final (mesma proporção do espaço da foto na carta)
const FR_W = 255, FR_H = 285;          // moldura na tela
const ZOOM_MAX = 4;

async function carregarImagem(file) {
  const bmp = await createImageBitmap(file); // respeita a rotação do celular
  const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c;
}

const CROP_CSS = `
#crop{position:fixed;inset:0;z-index:50;background:rgba(5,7,13,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;font-family:'Oswald',sans-serif;color:#fff}
#crop h2{font-family:'Bebas Neue';font-size:30px;letter-spacing:.06em;font-weight:400}
#crop p{font-size:13px;letter-spacing:.1em;color:#9fb3c8;text-align:center}
#crop .fr{position:relative;width:${FR_W}px;height:${FR_H}px;border:3px solid #00e5ff;box-shadow:0 0 22px rgba(0,229,255,.5);touch-action:none;background:#000}
#crop canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
#crop .guia{position:absolute;left:50%;top:10%;width:46%;height:46%;transform:translateX(-50%);border:2px dashed rgba(182,255,0,.8);border-radius:50%;pointer-events:none}
#crop input[type=range]{width:${FR_W}px;accent-color:#b6ff00}
#crop .bt{display:flex;gap:12px;width:${FR_W}px}
#crop button{flex:1;font-family:'Bebas Neue';font-size:24px;letter-spacing:.06em;padding:9px;border:0;cursor:pointer}
#crop .ok{background:#b6ff00;color:#001018}
#crop .no{background:#0a1f3d;color:#eaffff;border:2px solid rgba(0,229,255,.5)}
`;

// Abre a tela de recorte. Devolve um Blob (jpeg) ou null se o jogador cancelar.
async function abrirRecorte(file) {
  const src = await carregarImagem(file);
  const base = Math.max(FR_W / src.width, FR_H / src.height); // escala mínima para cobrir a moldura
  let z = 1, cx = FR_W / 2, cy = 0;

  const ov = document.createElement('div');
  ov.id = 'crop';
  ov.innerHTML = `<style>${CROP_CSS}</style>
    <h2>Ajuste sua foto</h2>
    <p>Arraste para mover e use o zoom.<br>Coloque o rosto dentro do círculo.</p>
    <div class="fr"><canvas id="cc" width="${FR_W * 2}" height="${FR_H * 2}"></canvas><div class="guia"></div></div>
    <input type="range" id="cz" min="1" max="${ZOOM_MAX}" step="0.01" value="1">
    <div class="bt"><button class="no" id="cn">Cancelar</button><button class="ok" id="cok">Usar foto</button></div>`;
  document.body.appendChild(ov);

  const cv = ov.querySelector('#cc');
  const ctx = cv.getContext('2d');
  const zr = ov.querySelector('#cz');

  const clamp = () => {
    const w = src.width * base * z, h = src.height * base * z;
    cx = Math.min(w / 2, Math.max(FR_W - w / 2, cx));
    cy = Math.min(h / 2, Math.max(FR_H - h / 2, cy));
  };
  const desenhar = (c, k) => {
    const w = src.width * base * z, h = src.height * base * z;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    c.scale(k, k * (c.canvas.height / c.canvas.width) / (FR_H / FR_W));
    c.drawImage(src, cx - w / 2, cy - h / 2, w, h);
  };
  const redesenhar = () => { clamp(); desenhar(ctx, cv.width / FR_W); };

  cy = src.height * base * z / 2; // começa alinhada ao topo (rostos ficam em cima)
  redesenhar();

  // arrastar (1 dedo) e pinça (2 dedos)
  const pts = new Map();
  let ultDist = 0;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  cv.onpointerdown = e => {
    cv.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) ultDist = dist();
  };
  cv.onpointermove = e => {
    const p = pts.get(e.pointerId); if (!p) return;
    const k = FR_W / cv.getBoundingClientRect().width;
    if (pts.size === 1) {
      cx += (e.clientX - p.x) * k; cy += (e.clientY - p.y) * k;
      p.x = e.clientX; p.y = e.clientY;
    } else {
      p.x = e.clientX; p.y = e.clientY;
      const d = dist();
      if (ultDist) { z = Math.min(ZOOM_MAX, Math.max(1, z * d / ultDist)); zr.value = z; }
      ultDist = d;
    }
    redesenhar();
  };
  const soltar = e => { pts.delete(e.pointerId); ultDist = 0; };
  cv.onpointerup = soltar; cv.onpointercancel = soltar;
  cv.onwheel = e => { e.preventDefault(); z = Math.min(ZOOM_MAX, Math.max(1, z * (e.deltaY < 0 ? 1.08 : 0.93))); zr.value = z; redesenhar(); };
  zr.oninput = () => { z = parseFloat(zr.value); redesenhar(); };

  return new Promise(resolve => {
    const fechar = v => { ov.remove(); resolve(v); };
    ov.querySelector('#cn').onclick = () => fechar(null);
    ov.querySelector('#cok').onclick = () => {
      const out = document.createElement('canvas');
      out.width = FOTO_W; out.height = FOTO_H;
      desenhar(out.getContext('2d'), FOTO_W / FR_W);
      out.toBlob(b => fechar(b), 'image/jpeg', 0.88);
    };
  });
}

async function enviarFoto(sb, id, blob) {
  const path = `${id}.jpg`;
  const up = await sb.storage.from('fotos').upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
  if (up.error) throw up.error;
  const url = sb.storage.from('fotos').getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
  const { error } = await sb.from('players').update({ foto_url: url }).eq('id', id);
  if (error) throw error;
}
