import { BufferAttribute, Group, Mesh } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// The layer builder transfers ownership of its static meshes to this batch.
// Transparent surfaces stay separate so the renderer can depth-sort the glass.
export function batchLayer(source) {
  const root = new Group();
  const opaque = new Map();
  const originals = new Set();
  source.updateMatrixWorld(true);
  source.traverse(part => {
    if (!part.isMesh) return;
    originals.add(part.geometry);
    const geometry = part.geometry.clone().applyMatrix4(part.matrixWorld);
    const material = part.material;
    if (material.transparent || Array.isArray(material)) {
      root.add(new Mesh(geometry, material));
      return;
    }
    if (!geometry.index) {
      const count = geometry.attributes.position.count;
      const indices = count > 65535 ? new Uint32Array(count) : new Uint16Array(count);
      for (let i = 0; i < count; i++) indices[i] = i;
      geometry.setIndex(new BufferAttribute(indices, 1));
    }
    if (!opaque.has(material)) opaque.set(material, []);
    opaque.get(material).push(geometry);
  });
  for (const [material, parts] of opaque) {
    const batch = mergeGeometries(parts);
    if (!batch) throw new Error('Incompatible geometry attributes in layer.');
    const mesh = new Mesh(batch, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    for (const geometry of parts) geometry.dispose();
  }
  for (const geometry of originals) geometry.dispose();
  return root;
}

export function releaseLayer(root) {
  const materials = new Set();
  const textures = new Set();
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const mat of [].concat(mesh.material)) materials.add(mat);
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
}
