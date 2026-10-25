// Recorte automático da foto (detecção de rosto) + envio para o Supabase Storage
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const FOTO_RATIO = 170 / 190;          // mesma proporção do espaço da foto na carta
const FOTO_W = 340, FOTO_H = 380;

let _detector = null;
async function getDetector() {
  if (_detector) return _detector;
  const { FaceDetector, FilesetResolver } = await import(`${MP}/vision_bundle.mjs`);
  const fileset = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
  _detector = await FaceDetector.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MP_MODEL },
    runningMode: 'IMAGE',
    minDetectionConfidence: 0.5,
  });
  return _detector;
}

async function carregarImagem(file) {
  const bmp = await createImageBitmap(file); // respeita a rotação do celular
  const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c;
}

async function acharRosto(canvas) {
  try {
    const det = await getDetector();
    const res = det.detect(canvas);
    const list = (res.detections || []).map(d => d.boundingBox).filter(Boolean);
    if (!list.length) return null;
    list.sort((a, b) => b.width * b.height - a.width * a.height);
    return list[0]; // maior rosto
  } catch (e) {
    console.error('detector', e);
    return null;
  }
}

function calcularRecorte(W, H, rosto) {
  let cw, ch, left, top;
  if (rosto) {
    cw = rosto.width * 2.4;               // cabeça + ombros
    ch = cw / FOTO_RATIO;
    left = rosto.originX + rosto.width / 2 - cw / 2;
    top = rosto.originY + rosto.height / 2 - ch * 0.36; // rosto no terço de cima
  } else {
    cw = Math.min(W, H * FOTO_RATIO);
    ch = cw / FOTO_RATIO;
    left = (W - cw) / 2;
    top = (H - ch) * 0.1;                 // rostos costumam ficar na parte de cima
  }
  if (cw > W) { cw = W; ch = cw / FOTO_RATIO; }
  if (ch > H) { ch = H; cw = ch * FOTO_RATIO; }
  left = Math.max(0, Math.min(left, W - cw));
  top = Math.max(0, Math.min(top, H - ch));
  return { left, top, cw, ch };
}

async function recortarFoto(file) {
  const src = await carregarImagem(file);
  const rosto = await acharRosto(src);
  const r = calcularRecorte(src.width, src.height, rosto);
  const out = document.createElement('canvas');
  out.width = FOTO_W; out.height = FOTO_H;
  out.getContext('2d').drawImage(src, r.left, r.top, r.cw, r.ch, 0, 0, FOTO_W, FOTO_H);
  const blob = await new Promise(res => out.toBlob(res, 'image/jpeg', 0.88));
  return { blob, achou: !!rosto };
}

async function enviarFoto(sb, id, blob) {
  const path = `${id}.jpg`;
  const up = await sb.storage.from('fotos').upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
  if (up.error) throw up.error;
  const url = sb.storage.from('fotos').getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
  const { error } = await sb.from('players').update({ foto_url: url }).eq('id', id);
  if (error) throw error;
}
