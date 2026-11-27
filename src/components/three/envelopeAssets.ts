import * as THREE from "three";

/** Canvas-drawn textures and shared geometry for envelopes, in the paper/airmail style. */

const PAPER = "#fffdf8";
const INK = "#14213d";
const STAMP = "#c8553d";
const AIRMAIL = "#1f4e8c";

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Red/blue diagonal airmail border around the edge of a w×h canvas. */
function airmailBorder(ctx: CanvasRenderingContext2D, w: number, h: number, band: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.rect(band, band, w - band * 2, h - band * 2);
  ctx.clip("evenodd");
  for (let x = -h; x < w + h; x += 44) {
    ctx.fillStyle = STAMP;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 15, 0);
    ctx.lineTo(x + 15 - h, h);
    ctx.lineTo(x - h, h);
    ctx.fill();
    ctx.fillStyle = AIRMAIL;
    ctx.beginPath();
    ctx.moveTo(x + 22, 0);
    ctx.lineTo(x + 37, 0);
    ctx.lineTo(x + 37 - h, h);
    ctx.lineTo(x + 22 - h, h);
    ctx.fill();
  }
  ctx.restore();
}

/** Front of a closed envelope: paper, airmail edge, inked flap line, stamp seal. */
export function makeEnvelopeFrontTexture() {
  const w = 512;
  const h = 328;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  airmailBorder(ctx, w, h, 16);

  ctx.strokeStyle = "rgba(20,33,61,0.5)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(18, 18);
  ctx.lineTo(w / 2, h * 0.58);
  ctx.lineTo(w - 18, 18);
  ctx.stroke();

  ctx.fillStyle = STAMP;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.58, 22, 0, Math.PI * 2);
  ctx.fill();

  return toTexture(c);
}

/** Back of an envelope: address lines, stamp and a postmark. */
export function makeEnvelopeBackTexture() {
  const w = 512;
  const h = 328;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  airmailBorder(ctx, w, h, 16);

  // stamp with perforated edge
  ctx.fillStyle = STAMP;
  ctx.fillRect(w - 120, 40, 74, 88);
  ctx.fillStyle = PAPER;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.arc(w - 120 + i * 9.25, 40, 3, 0, Math.PI * 2);
    ctx.arc(w - 120 + i * 9.25, 128, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PAPER;
  ctx.font = "500 44px Roboto, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("R", w - 83, 86);

  // postmark rings over the stamp
  ctx.strokeStyle = "rgba(20,33,61,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w - 150, 96, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(w - 112, 70 + i * 14);
    ctx.bezierCurveTo(w - 90, 62 + i * 14, w - 70, 78 + i * 14, w - 40, 70 + i * 14);
  }
  ctx.stroke();

  // address lines
  ctx.fillStyle = INK;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(150, 182, 210, 6);
  ctx.globalAlpha = 0.45;
  ctx.fillRect(150, 208, 170, 6);
  ctx.fillRect(150, 234, 130, 6);
  ctx.globalAlpha = 1;

  return toTexture(c);
}

export type EnvelopeAssets = {
  geometry: THREE.BoxGeometry;
  materials: THREE.Material[];
  dispose: () => void;
};

/** Thin box with textured front/back; material order follows BoxGeometry groups (+x,-x,+y,-y,+z,-z). */
export function createEnvelopeAssets(): EnvelopeAssets {
  const geometry = new THREE.BoxGeometry(1, 0.64, 0.02);
  const front = makeEnvelopeFrontTexture();
  const back = makeEnvelopeBackTexture();
  const side = new THREE.MeshStandardMaterial({ color: "#e9e2d6", roughness: 0.9 });
  const frontMat = new THREE.MeshStandardMaterial({ map: front, roughness: 0.9 });
  const backMat = new THREE.MeshStandardMaterial({ map: back, roughness: 0.9 });
  const materials = [side, side, side, side, frontMat, backMat];

  return {
    geometry,
    materials,
    dispose: () => {
      geometry.dispose();
      front.dispose();
      back.dispose();
      side.dispose();
      frontMat.dispose();
      backMat.dispose();
    },
  };
}
