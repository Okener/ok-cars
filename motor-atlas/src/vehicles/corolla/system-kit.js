import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// All dimensions and part positions use the car's metre-scale coordinate system.
export function createKit(T, name) {
  const root = new T.Group();
  root.name = name;
  const geometries = new Map();
  const materials = new Map();
  const up = new T.Vector3(0, 1, 0);

  function geometry(key, create) {
    if (!geometries.has(key)) geometries.set(key, create());
    return geometries.get(key);
  }
  function finish(color, metalness = 0, roughness = 0.5) {
    const key = [color, metalness, roughness].join('/');
    if (!materials.has(key)) {
      materials.set(key, new T.MeshStandardMaterial({ color, metalness, roughness }));
    }
    return materials.get(key);
  }
  function group(name, parent = root) {
    const part = new T.Group();
    part.name = name;
    parent.add(part);
    return part;
  }
  function mesh(shape, material, pos, parent = root) {
    const part = new T.Mesh(shape, material);
    part.position.set(...pos);
    parent.add(part);
    return part;
  }
  function box(pos, size, material, radius = 0, parent = root) {
    const shape = geometry(['box', ...size, radius].join('/'), () =>
      radius ? new RoundedBoxGeometry(...size, 1, radius) : new T.BoxGeometry(...size));
    return mesh(shape, material, pos, parent);
  }
  function cylinder(pos, radius, height, axis, mat, segments = 24, parent = root) {
    const shape = geometry(['disc', segments].join('/'), () =>
      new T.CylinderGeometry(1, 1, 1, segments));
    const part = mesh(shape, mat, pos, parent);
    part.scale.set(radius, height, radius);
    if (axis === 'x') part.rotation.z = -Math.PI / 2;
    if (axis === 'z') part.rotation.x = Math.PI / 2;
    return part;
  }
  function ellipsoid(pos, radii, material, parent = root) {
    const shape = geometry('ellipsoid', () => new T.SphereGeometry(1, 24, 14));
    const part = mesh(shape, material, pos, parent);
    part.scale.set(...radii);
    return part;
  }
  function rod(a, b, radius, mat, parent = root, segments = 12) {
    const start = new T.Vector3(...a);
    const end = new T.Vector3(...b);
    const dir = end.clone().sub(start);
    const midpoint = start.addScaledVector(dir, 0.5);
    const part = cylinder(midpoint.toArray(), radius, dir.length(), 'y', mat, segments, parent);
    part.quaternion.setFromUnitVectors(up, dir.normalize());
    return part;
  }
  function curve(points, radius, mat, parent = root, closed = false) {
    const path = new T.CatmullRomCurve3(points.map(point => new T.Vector3(...point)), closed);
    const shape = new T.TubeGeometry(path, Math.max(12, points.length * 4), radius, 7, closed);
    return mesh(shape, mat, [0, 0, 0], parent);
  }
  // The profile coordinates are [position on the axis, radius].
  function turned(pos, profile, axis, mat, parent = root, segments = 36) {
    const points = profile.map(([height, radius]) => new T.Vector2(radius, height));
    const part = mesh(new T.LatheGeometry(points, segments), mat, pos, parent);
    if (axis === 'x') part.rotation.z = -Math.PI / 2;
    if (axis === 'z') part.rotation.x = Math.PI / 2;
    return part;
  }
  return { root, finish, group, mesh, box, cylinder, ellipsoid, rod, curve, turned };
}
