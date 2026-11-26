import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { batchLayer, releaseLayer } from './batch.js';

const views = {
  perspective: [4.6, 2.15, -6.8],
  side: [0, .001, -1],
  front: [1, .001, 0],
  top: [0, 1, -.0001],
};
const gridVertex = `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }`;
const gridFragment = `
  varying vec3 vWorld;
  uniform float extent;
  void main() {
    vec2 p = vWorld.xz / (extent * .105);
    vec2 width = max(fwidth(p), vec2(.0001));
    vec2 dist = abs(fract(p - .5) - .5) / width;
    float line = 1. - min(min(dist.x, dist.y), 1.);
    float fade = exp(-1.9 * dot(vWorld.xz, vWorld.xz) / (extent * extent));
    gl_FragColor = vec4(.38, .43, .38, .18 * line * fade);
  }`;

function contactTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(17,24,18,.52)');
  gradient.addColorStop(.48, 'rgba(17,24,18,.32)');
  gradient.addColorStop(1, 'rgba(17,24,18,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new T.CanvasTexture(canvas);
}

// One canvas and one active GPU model. Frames are scheduled only for changes.
export class Studio {
  constructor(host, { onCamera = () => {}, onFreeOrbit = () => {}, onContext = () => {}, thumbnail = false } = {}) {
    this.host = host;
    this.onCamera = onCamera;
    this.thumbnail = thumbnail;
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(29, 1, .01, 100);
    this.renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = .98;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    host.append(this.renderer.domElement);

    const room = new RoomEnvironment();
    const pmrem = new T.PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(room, .03);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = .87;
    room.dispose();
    pmrem.dispose();
    this.scene.add(new T.HemisphereLight(0xf9fbff, 0xa5a18e, 1.05));
    this.key = new T.DirectionalLight(0xfff6e6, 2.15);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.bias = -.0003;
    this.key.shadow.normalBias = .012;
    this.scene.add(this.key, this.key.target);
    const rim = new T.DirectionalLight(0xeaf9ff, 1.35);
    rim.position.set(-3, 4, 2);
    this.scene.add(rim);

    const ground = new T.PlaneGeometry(1, 1);
    this.grid = new T.Mesh(ground, new T.ShaderMaterial({
      uniforms: { extent: { value: 4 } }, vertexShader: gridVertex, fragmentShader: gridFragment,
      transparent: true, depthWrite: false,
    }));
    this.shadow = new T.Mesh(ground, new T.ShadowMaterial({ opacity: .15, depthWrite: false }));
    this.shadow.receiveShadow = true;
    this.contact = new T.Mesh(ground, new T.MeshBasicMaterial({
      map: contactTexture(), transparent: true, depthWrite: false, opacity: .88,
    }));
    for (const [index, plane] of [this.grid, this.contact, this.shadow].entries()) {
      plane.rotation.x = -Math.PI / 2;
      plane.renderOrder = index - 4;
      this.scene.add(plane);
    }
    this.grid.visible = !thumbnail;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.minPolarAngle = .001;
    this.controls.maxPolarAngle = Math.PI - .01;
    this.controls.rotateSpeed = .7;
    this.controls.zoomSpeed = .85;
    this.controls.addEventListener('change', () => this.invalidate());
    this.controls.addEventListener('start', event => {
      this.startDirection = this.camera.position.clone().sub(this.controls.target).normalize();
    });
    this.controls.addEventListener('end', () => {
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      if (this.startDirection && dir.dot(this.startDirection) < .999999) onFreeOrbit();
    });
    this.renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); onContext(false); });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.renderer.shadowMap.needsUpdate = true;
      this.invalidate();
      onContext(true);
    });
    this.preset = 'perspective';
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
  }

  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    const previous = this.camera.aspect;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    if (this.bounds && Math.abs(previous - w/h) > .01) this.setView(this.preset);
    this.invalidate();
  }

  async loadVehicleLayer(model, layer) {
    const request = this.request = Symbol();
    const { buildLayer } = await model.load();
    if (request !== this.request) return false;
    const source = await buildLayer(layer.id, T);
    if (request !== this.request) { releaseLayer(source); return false; }
    const next = batchLayer(source);
    if (this.model) { this.scene.remove(this.model); releaseLayer(this.model); }
    const bounds = new T.Box3().setFromObject(next, true);
    const center = bounds.getCenter(new T.Vector3());
    next.position.set(-center.x, -bounds.min.y, -center.z);
    this.model = next;
    this.scene.add(next);
    this.bounds = bounds.translate(next.position);
    this.size = this.bounds.getSize(new T.Vector3());
    this.extent = Math.max(this.size.x, this.size.y, this.size.z);
    this.grid.scale.setScalar(this.extent * 8);
    this.grid.material.uniforms.extent.value = this.extent;
    this.shadow.scale.setScalar(this.extent * 4);
    this.contact.scale.set(this.size.x * 1.2, this.size.z * 1.48, 1);
    this.contact.material.opacity = layer.contactOpacity ?? .45;
    this.grid.position.y = -.004 * this.extent;
    this.shadow.position.y = -.003 * this.extent;
    this.contact.position.y = -.002 * this.extent;
    this.key.position.set(.7, 1.65, -.48).multiplyScalar(this.extent);
    const shadowCam = this.key.shadow.camera;
    Object.assign(shadowCam, { left: -this.extent*.8, right: this.extent*.8, top: this.extent*.8,
      bottom: -this.extent*.8, near: this.extent*.01, far: this.extent*4 });
    shadowCam.updateProjectionMatrix();
    this.renderer.shadowMap.needsUpdate = true;
    this.defaultDirection = layer.direction ?? views.perspective;
    this.setView(this.preset);
    return true;
  }

  setView(id = 'perspective') {
    this.preset = Object.hasOwn(views,id) ? id : 'perspective';
    if (!this.bounds) return;
    const target = this.bounds.getCenter(new T.Vector3());
    const viewpoint = this.preset === 'perspective' ? this.defaultDirection : views[this.preset];
    const direction = new T.Vector3(...viewpoint).normalize();
    const right = new T.Vector3().crossVectors(this.camera.up, direction).normalize();
    const up = new T.Vector3().crossVectors(direction, right);
    const tangent = Math.tan(T.MathUtils.degToRad(this.camera.fov / 2));
    const limitX = tangent * this.camera.aspect * (this.thumbnail ? .90 : .84);
    const limitY = tangent * (this.thumbnail ? .86 : .72);
    let xMax = -Infinity, xMin = Infinity, yMax = -Infinity, yMin = Infinity;
    // Frame the actual vertices: the empty corners of an engine or a sloping
    // windscreen's bounding box would introduce a large amount of empty space.
    const vertex = new T.Vector3();
    this.model.updateMatrixWorld(true);
    this.model.traverse(mesh => {
      if (!mesh.isMesh) return;
      const points = mesh.geometry.attributes.position;
      for (let i = 0; i < points.count; i++) {
        vertex.fromBufferAttribute(points, i).applyMatrix4(mesh.matrixWorld).sub(target);
        const depth = vertex.dot(direction);
        const x = vertex.dot(right), y = vertex.dot(up);
        xMax = Math.max(xMax, x + depth*limitX);
        xMin = Math.min(xMin, x - depth*limitX);
        yMax = Math.max(yMax, y + depth*limitY);
        yMin = Math.min(yMin, y - depth*limitY);
      }
    });
    const distance = Math.max((xMax - xMin) / (2*limitX), (yMax - yMin) / (2*limitY));
    target.addScaledVector(right, (xMax + xMin)/2).addScaledVector(up, (yMax + yMin)/2);
    this.controls.target.copy(target);
    this.camera.position.copy(target).addScaledVector(direction, distance);
    this.controls.minDistance = this.extent * .12;
    this.controls.maxDistance = Math.max(distance * 4, this.extent * 5);
    this.camera.near = this.extent * .004;
    this.camera.far = this.extent * 50;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.invalidate();
  }

  setMode(mode) {
    this.controls.mouseButtons.LEFT = mode === 'pan' ? T.MOUSE.PAN : T.MOUSE.ROTATE;
    this.controls.touches.ONE = mode === 'pan' ? T.TOUCH.PAN : T.TOUCH.ROTATE;
  }

  zoom(factor) {
    if (!this.model) return;
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.setLength(T.MathUtils.clamp(offset.length() * factor, this.controls.minDistance, this.controls.maxDistance));
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  rotate(horizontal, vertical) {
    if (!this.model) return;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const polar = new T.Spherical().setFromVector3(offset);
    polar.theta += horizontal;
    polar.phi = T.MathUtils.clamp(polar.phi + vertical, .01, Math.PI-.01);
    this.camera.position.copy(this.controls.target).add(offset.setFromSpherical(polar));
    this.controls.update();
  }

  invalidate() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => { this.frame = 0; this.draw(); });
  }

  draw() {
    // Hide the studio floor when looking at the underside.
    const above = this.camera.position.y > 0;
    this.shadow.visible = this.contact.visible = above;
    this.grid.visible = above && !this.thumbnail;
    this.renderer.render(this.scene, this.camera);
    this.onCamera(this.camera.quaternion);
  }

  dispose() {
    this.request = null;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.controls.dispose();
    if (this.model) releaseLayer(this.model);
    this.contact.material.map.dispose();
    this.grid.geometry.dispose();
    for (const plane of [this.grid, this.shadow, this.contact]) plane.material.dispose();
    this.environment.dispose();
    this.key.shadow.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
