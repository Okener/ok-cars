import './style.css';
import { makes } from './catalog.js';
import { icon } from './icons.js';

const $ = id => document.getElementById(id);
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
const initial = new URL(location.href).searchParams;
let make, model, layer, studio, studioPromise, selection = 0, mode = 'orbit';

function options(select, items, title, initialValue) {
  select.replaceChildren(...items.map(item => new Option(title(item), item.id)));
  select.value = items.some(item => item.id === initialValue) ? initialValue : items[0].id;
}
function chooseMake(modelId, layerId) {
  make = makes.find(item => item.id === $('make').value);
  options($('model'), make.models, m => m.model + ' ' + m.generation, modelId);
  chooseModel(layerId);
}
function chooseModel(layerId) {
  model = make.models.find(item => item.id === $('model').value);
  const name = [make.name, model.model, model.generation].join(' ');
  $('vehicle-title').textContent = name;
  document.title = 'Motor Atlas · ' + name;
  $('vehicle-meta').replaceChildren();
  for (const item of [model.years, model.generationName, model.body]) {
    if ($('vehicle-meta').hasChildNodes()) $('vehicle-meta').append(document.createElement('b'));
    const span = document.createElement('span');
    span.textContent = item;
    $('vehicle-meta').append(span);
  }
  options($('layer'), model.layers, l => l.name, layerId);
  $('layer-cards').replaceChildren(...model.layers.map(l => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'layer-card';
    card.dataset.layer = l.id;
    card.setAttribute('aria-label','Show ' + l.name.toLowerCase() + ' layer');
    card.innerHTML = '<span class="card-art"><img alt="" width="440" height="165"></span><span class="card-radio">' + icon('check', 10) +
      '</span><span class="card-text"><strong></strong><small></small></span>';
    card.querySelector('strong').textContent = l.name;
    card.querySelector('small').textContent = l.subtitle;
    card.querySelector('img').src = l.thumbnail;
    card.addEventListener('click', () => {
      if ($('layer').value === l.id && $('viewport').dataset.ready === 'true') return;
      $('layer').value = l.id;
      chooseLayer();
    });
    return card;
  }));
  $('layer-counter').textContent = model.layers.length + ' layers';
  chooseLayer();
}

const axisColors = ['#ab5e4a', '#688263', '#637d95'];
$('axis').innerHTML = ['X','Y','Z'].map((label,i) => '<g stroke="' + axisColors[i] + '" fill="' + axisColors[i] + '"><line x1="30" y1="32" stroke-width="1.6"/><circle r="2"/><text text-anchor="middle" dominant-baseline="central" stroke="none">' + label + '</text></g>').join('') + '<circle cx="30" cy="32" r="2.5" fill="#596358"/>';
function updateAxis(quaternion) {
  // Columns of the inverse camera rotation give the projected world basis.
  const { x, y, z, w } = quaternion;
  const axes = [[1-2*(y*y+z*z),2*(x*y-z*w)], [2*(x*y+z*w),1-2*(x*x+z*z)], [2*(x*z-y*w),2*(y*z+x*w)]];
  [...$('axis').querySelectorAll('g')].forEach((g,i) => {
    const [dx,dy] = axes[i];
    const px = 30+dx*19, py = 32-dy*19;
    const [line,dot,label] = g.children;
    line.setAttribute('x2',px); line.setAttribute('y2',py);
    dot.setAttribute('cx',px); dot.setAttribute('cy',py);
    label.setAttribute('x',30+dx*28); label.setAttribute('y',32-dy*28);
  });
}
function message(content) {
  $('stage-message').hidden = !content;
  $('stage-message').textContent = content;
}
function available(enabled) {
  for (const id of ['zoom-in','zoom-out','reset','camera-view','orbit','pan']) $(id).disabled = !enabled;
  $('viewport').dataset.ready = String(enabled);
}
async function chooseLayer() {
  const request = ++selection;
  layer = model.layers.find(l => l.id === $('layer').value);
  $('layer-description').textContent = layer.description;
  document.querySelectorAll('.layer-card').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.layer === layer.id)));
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({make: make.id, model: model.id, layer: layer.id})) url.searchParams.set(key,value);
  history.replaceState(null,'',url);
  $('model-host').setAttribute('aria-label', layer.name + ' 3D model. Arrow keys rotate. Plus and minus zoom. R resets the view.');
  $('model-host').setAttribute('aria-busy','true');
  message('Loading ' + layer.name.toLowerCase() + '…');
  available(false);
  try {
    studioPromise ??= import('./viewer/studio.js').then(({Studio}) => new Studio($('model-host'), {
      onCamera: updateAxis,
      onFreeOrbit: () => { $('camera-view').value = 'custom'; },
      onContext: restored => { available(restored); message(restored ? '' : 'Restoring the 3D view…'); },
    }));
    studio = await studioPromise;
    if (request !== selection) return;
    studio.setMode(mode);
    await studio.loadVehicleLayer(model, layer);
    if (request !== selection) return;
    $('camera-view').value = studio.preset;
    $('model-host').style.backgroundImage = '';
    studio.renderer.domElement.hidden = false;
    available(true);
    message('');
  } catch (error) {
    if (request !== selection) return;
    console.error('3D layer loading failed', error);
    if (!studio) studioPromise = undefined;
    if (studio) studio.renderer.domElement.hidden = true;
    const host = $('model-host');
    host.style.background = 'center / 75% auto no-repeat url("' + layer.thumbnail + '")';
    message('3D view unavailable. Showing the layer preview.');
  } finally {
    if (request === selection) $('model-host').setAttribute('aria-busy','false');
  }
}
function setMode(next) {
  mode = next;
  studio?.setMode(mode);
  $('orbit').setAttribute('aria-pressed', String(mode === 'orbit'));
  $('pan').setAttribute('aria-pressed', String(mode === 'pan'));
  $('drag-hint').textContent = mode === 'orbit' ? 'Drag to rotate' : 'Drag to pan';
  $('viewport').dataset.mode = mode;
}
function reset() {
  studio?.setView('perspective');
  $('camera-view').value = 'perspective';
}
$('make').addEventListener('change', () => chooseMake());
$('model').addEventListener('change', () => chooseModel());
$('layer').addEventListener('change', chooseLayer);
$('camera-view').addEventListener('change', e => studio?.setView(e.target.value));
$('zoom-in').addEventListener('click', () => studio?.zoom(.83));
$('zoom-out').addEventListener('click', () => studio?.zoom(1/.83));
$('reset').addEventListener('click', reset);
$('orbit').addEventListener('click', () => setMode('orbit'));
$('pan').addEventListener('click', () => setMode('pan'));
$('model-host').addEventListener('keydown', e => {
  if (!studio || e.altKey || e.ctrlKey || e.metaKey) return;
  const keys = { ArrowLeft: [-.14,0], ArrowRight: [.14,0], ArrowUp: [0,-.12], ArrowDown: [0,.12] };
  if (Object.hasOwn(keys,e.key)) {
    studio.rotate(...keys[e.key]); $('camera-view').value = 'custom';
  } else if (['+','='].includes(e.key)) studio.zoom(.85);
  else if (e.key === '-') studio.zoom(1/.85);
  else if (e.key.toLowerCase() === 'r') reset();
  else return;
  e.preventDefault();
});
const dialog = $('dialog');
function showDialog(title, rows, paragraph, source) {
  $('dialog-title').textContent = title;
  const dl = document.createElement('dl');
  for (const [label, value] of rows) {
    const row = document.createElement('div');
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label; dd.textContent = value;
    row.append(dt,dd); dl.append(row);
  }
  const intro = document.createElement('p');
  intro.textContent = paragraph;
  $('dialog-content').replaceChildren(intro,dl);
  if (source) {
    const anchor = document.createElement('a');
    anchor.href = source; anchor.textContent = 'Toyota vehicle archive'; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    $('dialog-content').append(anchor);
  }
  dialog.showModal();
}
$('specifications').addEventListener('click', () => showDialog('Vehicle specifications', model.specifications,
  'The demo uses an original reconstruction of the launch-year sedan. Component shapes and wiring routes are approximate.', model.source));
$('guide').addEventListener('click', () => showDialog('Viewer guide', [
  ['Rotate', 'Drag in Orbit mode'], ['Pan', 'Drag in Pan mode'], ['Zoom', 'Scroll, pinch, or use + / −'],
  ['Change view', 'Use the camera menu'], ['Keyboard rotation', 'Focus the model and use arrow keys'],
  ['Reset camera', 'Use the fit button, or press R in the model'],
], 'Choose a layer in Configuration or select its thumbnail to inspect that assembly on its own.'));
$('dialog-close').addEventListener('click',() => dialog.close());
dialog.addEventListener('click',e => {
  const rect = dialog.getBoundingClientRect();
  if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close();
});
options($('make'), makes, m => m.name, initial.get('make'));
chooseMake(initial.get('model'), initial.get('layer'));
