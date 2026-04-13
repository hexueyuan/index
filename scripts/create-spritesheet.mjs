import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const charDir = path.join(root, '.devpipe/16x16RetroTileset/CharacterAnimation');
const outPath = path.join(root, 'public/assets/sprites/character.png');

const TILE = 16;
const COLS = 4;
const ROWS = 5;

// Row order: idle(0), walk_down(1), walk_up(2), walk_left(3), walk_right(4)
const rows = [
  { dir: 'Idle',      prefix: 'Untitled-0' },
  { dir: 'WalkDown',  prefix: 'Untitled-2' },
  { dir: 'WalkUp',    prefix: 'Untitled-2' },
  { dir: 'WalkLeft',  prefix: 'Untitled-3' },
  { dir: 'WalkRight', prefix: 'Untitled-3' },
];

async function main() {
  const composites = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const fileName = `${rows[r].prefix}_${c}.png`;
      const filePath = path.join(charDir, rows[r].dir, fileName);
      composites.push({
        input: filePath,
        left: c * TILE,
        top: r * TILE,
      });
    }
  }

  await sharp({
    create: {
      width: COLS * TILE,
      height: ROWS * TILE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .toFile(outPath);

  console.log(`Spritesheet created: ${outPath} (${COLS * TILE}x${ROWS * TILE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
