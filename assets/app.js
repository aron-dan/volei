const SUPABASE_URL = 'https://qkuavmzpfaljksqyqibb.supabase.co';
const SUPABASE_KEY = 'sb_publishable__c4rzRaPbfFky4G1QNtaVw_ISD3Y_e-';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const POS = { Atacante: 'ATA', Levantador: 'LEV', 'Versátil': 'VER', 'Recepção': 'REC' };
const SIL = '<svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="32" r="17"/><path d="M12 100c0-26 17-42 38-42s38 16 38 42z"/></svg>';

// Quem sou eu: o id na URL manda; depois a aba (sessionStorage); por último o último escolhido no navegador.
// 1.0.1-alpha: esse id só vale se passou pelo PIN. A prova é "jogador_ok" (gravada em escolherId, depois do PIN).
// Sem a prova, meuId() devolve null e a página manda a pessoa de volta para a tela de entrada.
function meuId() {
  let v = new URLSearchParams(location.search).get('id');
  try {
    v = v || sessionStorage.getItem('jogador_id') || localStorage.getItem('jogador_id');
    const liberado = [sessionStorage.getItem('jogador_ok'), localStorage.getItem('jogador_ok')];
    if (!v || !liberado.includes(v)) return null;
    sessionStorage.setItem('jogador_id', v); sessionStorage.setItem('jogador_ok', v);
  } catch (_) { return null; }
  return v;
}
function escolherId(v) {
  try {
    sessionStorage.setItem('jogador_id', v); localStorage.setItem('jogador_id', v);
    sessionStorage.setItem('jogador_ok', v); localStorage.setItem('jogador_ok', v);
  } catch (_) {}
}
function limparId() {
  try {
    ['jogador_id', 'jogador_ok'].forEach(k => { sessionStorage.removeItem(k); localStorage.removeItem(k); });
  } catch (_) {}
}

// ---- PIN (1.0.1-alpha) ----
// 4 dígitos, tabela "pins". Não é segurança real: só evita entrar na conta errada sem querer.
const pinValido = p => /^\d{4}$/.test(p);

// Pergunta ao banco: "existe linha deste jogador com este PIN?". Não baixa o PIN.
// Retorna null (PIN errado) ou { definido: true/false }.
async function checarPin(id, pin) {
  const { data } = await sb.from('pins').select('definido').eq('player_id', id).eq('pin', pin).maybeSingle();
  return data;
}

// Grava o PIN novo e marca como definido pelo jogador. Retorna true/false.
async function trocarPin(id, novo) {
  const { error } = await sb.from('pins').update({ pin: novo, definido: true }).eq('player_id', id);
  return !error;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nomeExibido = p => p.vulgo || p.nome || '???';
// nota média (1 a 5) -> escala 0 a 99 estilo FIFA
const sc = v => (v == null ? null : Math.round(Number(v) * 19.8));

function cardHTML(p) {
  const v = { ATQ: sc(p.ataque), REC: sc(p.recepcao), LEV: sc(p.levantamento), SAQ: sc(p.saque), MOB: sc(p.mobilidade) };
  const vals = Object.values(v).filter(x => x != null);
  const ovr = vals.length ? Math.round(vals.reduce((a, b) => a + b) / vals.length) : '--';
  const pos = POS[p.caracteristica] || '--';
  const foto = p.foto_url ? `style="background-image:url('${esc(p.foto_url)}')"` : '';
  const sub = p.vulgo && p.nome ? esc(p.nome) : '';
  return `<div class="slot"><div class="card special"><div class="inner">
    <div class="top"><div class="ovr">${ovr}</div><div class="pos">${pos}</div><div class="ball">🏐</div></div>
    <div class="photo" ${foto}>${p.foto_url ? '' : SIL}</div>
    <div class="name">${esc(nomeExibido(p))}</div>
    <div class="real">${sub}</div>
    <div class="stats">${Object.entries(v).map(([k, x]) => `<div class="st"><b>${x ?? '--'}</b><span>${k}</span></div>`).join('')}</div>
  </div></div></div>`;
}

// carta reduzida (para listas): s = escala (1 = tamanho real, 270x400)
function cardMini(p, s = .55) {
  return `<div class="cm" style="--s:${s}"><div class="cmi">${cardHTML(p)}</div></div>`;
}
