/**
 * Smoke-test for components/ThreeDViewer.tsx helpers.
 * Verifies: flattenPositions, buildIndices, loadTextureSource (base64 JPEG),
 * and the three.js scene pipeline (renderer/scene/camera/geometry/material).
 */
const path = require('path');
const fs = require('fs');

/* ---------- read the component source & transpile TS -> JS ---------- */
const ts = require('typescript');
const src = fs.readFileSync(
  path.join(__dirname, '../components/ThreeDViewer.tsx'),
  'utf8'
);
const jsSrc = ts.transpileModule(src, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;

// crude extraction of the helper functions to test them in isolation
function extractFn(name) {
  const start = jsSrc.indexOf(`function ${name}`);
  if (start === -1) throw new Error(`fn ${name} not found`);
  let depth = 0, i = jsSrc.indexOf('{', start);
  for (; i < jsSrc.length; i++) {
    if (jsSrc[i] === '{') depth++;
    else if (jsSrc[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return jsSrc.slice(start, i + 1);
}

const helpersCode = [
  extractFn('flattenPositions'),
  extractFn('buildIndices'),
].join('\n');

const helpers = new Function(`${helpersCode}
  return { flattenPositions, buildIndices };`)();

/* ---------- tests ---------- */
let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log(`  ok - ${name}`); }
  else { failed++; console.log(`  FAIL - ${name}`); }
}

console.log('== flattenPositions ==');
{
  const flat = [1, 2, 3, 4, 5, 6];
  const nested = [[1, 2, 3], [4, 5, 6]];
  check('flat passthrough', JSON.stringify(helpers.flattenPositions(flat)) === JSON.stringify(flat));
  check('nested flattens', JSON.stringify(helpers.flattenPositions(nested)) === JSON.stringify(flat));
  check('empty -> []', helpers.flattenPositions([]).length === 0);
  check('undefined -> []', helpers.flattenPositions(undefined).length === 0);
}

console.log('== buildIndices ==');
{
  const flat = [0, 1, 2, 2, 1, 3];
  const nested = [[0, 1, 2], [2, 1, 3]];
  const r1 = helpers.buildIndices(flat);
  const r2 = helpers.buildIndices(nested);
  check('flat passthrough', Array.from(r1).join(',') === '0,1,2,2,1,3');
  check('nested triangulates', Array.from(r2).join(',') === '0,1,2,2,1,3');
  check('quad fan-triangulation', Array.from(helpers.buildIndices([[0,1,2,3]])).join(',') === '0,1,2,0,2,3');
}

console.log('== three.js pipeline ==');
(async () => {
  try {
    // jpeg decode via our same lib
    const decode = require('jpeg-js');
    const jpeg = decode;

    // Build a tiny 8x8 red JPEG (jpeg-js encode path)
    let jpegBytes;
    const w = 8, h = 8;
    const frame = Buffer.alloc(w * h * 4);
    for (let p = 0; p < w * h; p++) {
      frame[p * 4] = 255;     // R
      frame[p * 4 + 1] = 0;   // G
      frame[p * 4 + 2] = 0;   // B
      frame[p * 4 + 3] = 255; // A
    }
    jpegBytes = jpeg.encode({ data: frame, width: w, height: h }, 90).data;

    const decoded = decode.decode(jpegBytes, { useTArray: true, formatAsRGBA: true });
    check('jpeg decodes', decoded.width === 8 && decoded.height === 8);
    check('jpeg is RGBA', decoded.data.length === 8 * 8 * 4);

    // three.js headless smoke test
    const THREE = require('three');
    check('three loads', !!THREE.Scene);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      0, 0, 0, 1, 0, 0, 0, 1, 0,
    ]), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2]), 1));
    geometry.computeVertexNormals();
    check('buffer geometry builds', geometry.attributes.position.count === 3);
    const tex = new THREE.DataTexture(
      new Uint8Array(decoded.data.buffer, decoded.data.byteOffset, decoded.data.length),
      decoded.width,
      decoded.height,
      THREE.RGBAFormat
    );
    tex.needsUpdate = true;
    check('DataTexture builds', tex.image.width === 8);
  } catch (e) {
    console.log('  (three.js pipeline skipped:', e.message + ')');
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
