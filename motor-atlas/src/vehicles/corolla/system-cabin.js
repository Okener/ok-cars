import { createKit } from './system-kit.js';

export function buildInterior(T) {
  const { root, finish, group, box, cylinder, ellipsoid, rod, curve, turned } = createKit(T, 'Cabin');
  const leather = finish(0x694c36, 0, 0.54);
  const inset = finish(0x795c43, 0, 0.6);
  const welt = finish(0x987657, 0, 0.58);
  const carpet = finish(0x3a3731, 0, 0.96);
  const rubber = finish(0x202322, 0, 0.69);
  const chrome = finish(0xc6c7bb, 0.78, 0.25);
  const metal = finish(0x47514e, 0.63, 0.39);
  const paint = finish(0x3d625a, 0.35, 0.34);
  const cream = finish(0xe2d9be, 0.15, 0.45);
  const coral = finish(0xc36545, 0.12, 0.4);

  const floor = group('Carpet, transmission tunnel and seat runners');
  box([-0.09, 0.323, 0], [1.99, 0.055, 1.17], carpet, 0.022, floor);
  box([-0.10, 0.349, 0], [1.78, 0.14, 0.183], carpet, 0.06, floor);
  for (const side of [-1, 1]) {
    box([0.46, 0.353, side * 0.307], [0.48, 0.014, 0.35], rubber, 0.006, floor);
    for (let rib = 0; rib < 10; rib++) {
      box([0.46, 0.362, side * 0.307 + (rib - 4.5) * 0.028], [0.4, 0.004, 0.006], metal, 0, floor);
    }
    box([-0.03, 0.355, side * 0.57], [1.78, 0.018, 0.027], chrome, 0.007, floor);
  }
  function seat(name, x, z, width, rear = false) {
    const chair = group(name);
    chair.position.set(x, 0, z);
    const cushionY = rear ? 0.53 : 0.508;
    if (!rear) for (const side of [-1, 1]) {
      box([0, 0.389, side * 0.125], [0.43, 0.073, 0.031], metal, 0.008, chair);
      box([0, 0.419, side * 0.125], [0.32, 0.027, 0.045], rubber, 0.006, chair);
    }
    box([0, cushionY - 0.018, 0], [0.46, 0.145, width], leather, 0.056, chair);
    box([0.006, cushionY + 0.052, 0], [0.393, 0.035, width * 0.78], inset, 0.016, chair);
    const back = group('Pleated backrest', chair);
    back.position.set(-0.208, cushionY + 0.043, 0);
    back.rotation.z = rear ? 0.23 : 0.17;
    const backHeight = rear ? 0.404 : 0.448;
    box([0, backHeight / 2, 0], [0.117, backHeight, width], leather, 0.05, back);
    box([0.054, backHeight * 0.52, 0], [0.025, backHeight * 0.81, width * 0.8], inset, 0.011, back);
    const count = rear ? 15 : 6;
    for (let i = 0; i < count; i++) {
      const pleatZ = (i / (count - 1) - 0.5) * width * 0.68;
      rod([-0.16, cushionY + 0.070, pleatZ], [0.166, cushionY + 0.070, pleatZ], 0.002, welt, chair, 6);
      rod([0.067, backHeight * 0.16, pleatZ], [0.067, backHeight * 0.88, pleatZ], 0.002, welt, back, 6);
    }
    for (const side of [-1, 1]) {
      const edge = side * (width / 2 - 0.025);
      curve([[0.197, cushionY + 0.016, edge], [0.169, cushionY + 0.048, edge], [-0.135, cushionY + 0.048, edge], [-0.179, cushionY + 0.032, edge]], 0.003, welt, chair);
      curve([[0.037, 0.04, edge], [0.048, backHeight * 0.72, edge], [0.026, backHeight - 0.037, edge], [0.002, backHeight - 0.018, edge * 0.94]], 0.003, welt, back);
      if (!rear) {
        box([-0.181, cushionY + 0.06, side * width * 0.498], [0.07, 0.082, 0.012], metal, 0.005, chair).rotation.z = -0.24;
        cylinder([-0.18, cushionY + 0.075, side * width * 0.514], 0.018, 0.009, 'z', chrome, 14, chair);
      }
    }
  }
  seat('Driver bucket seat', -0.026, 0.313, 0.455);
  seat('Passenger bucket seat', -0.026, -0.313, 0.455);
  seat('Rear bench', -0.685, 0, 1.065, true);

  for (const side of [-1, 1]) {
    const door = group('Interior door trim');
    box([0.02, 0.635, side * 0.597], [1.05, 0.419, 0.035], leather, 0.017, door);
    box([0.022, 0.722, side * 0.575], [0.98, 0.127, 0.011], inset, 0.005, door);
    box([0.022, 0.781, side * 0.567], [0.977, 0.008, 0.006], chrome, 0.002, door);
    box([-0.03, 0.66, side * 0.544], [0.24, 0.045, 0.068], leather, 0.019, door);
    rod([0.25, 0.732, side * 0.566], [0.315, 0.737, side * 0.552], 0.009, chrome, door);
    cylinder([0.213, 0.637, side * 0.572], 0.021, 0.01, 'z', chrome, 20, door);
    rod([0.213, 0.637, side * 0.563], [0.25, 0.591, side * 0.543], 0.006, chrome, door);
    cylinder([0.25, 0.591, side * 0.535], 0.011, 0.022, 'z', rubber, 14, door);
  }

  const dash = group('Instrument panel and controls');
  box([0.655, 0.79, 0], [0.146, 0.176, 1.192], paint, 0.035, dash);
  box([0.655, 0.887, 0], [0.232, 0.052, 1.204], rubber, 0.022, dash);
  box([0.579, 0.767, 0], [0.011, 0.012, 1.118], chrome, 0.004, dash);
  box([0.573, 0.826, 0.311], [0.021, 0.081, 0.389], chrome, 0.009, dash);
  box([0.561, 0.826, 0.311], [0.008, 0.062, 0.37], rubber, 0.003, dash);
  for (let i = 0; i < 17; i++) {
    box([0.555, 0.83, 0.147 + i * 0.0184], [0.005, i % 4 ? 0.008 : 0.017, 0.003], cream, 0, dash);
  }
  box([0.553, 0.816, 0.255], [0.006, 0.038, 0.004], coral, 0, dash).rotation.x = 0.28;
  box([0.573, 0.808, -0.018], [0.018, 0.056, 0.162], chrome, 0.005, dash);
  box([0.562, 0.817, -0.02], [0.005, 0.018, 0.096], rubber, 0, dash);
  for (const z of [-0.084, 0.045]) cylinder([0.554, 0.8, z], 0.012, 0.02, 'x', rubber, 16, dash);
  box([0.58, 0.797, -0.326], [0.009, 0.079, 0.33], metal, 0.004, dash);
  box([0.573, 0.798, -0.326], [0.008, 0.069, 0.32], paint, 0.003, dash);
  box([0.565, 0.819, -0.326], [0.011, 0.01, 0.048], chrome, 0.003, dash);

  const wheel = group('Steering wheel and column', dash);
  wheel.position.set(0.382, 0.836, 0.312);
  // Wheel lies in the YZ plane with its top tilted toward the windshield.
  wheel.rotation.z = -0.47;
  cylinder([0.092, 0, 0], 0.026, 0.19, 'x', rubber, 24, wheel);
  const rim = Array.from({length: 24}, (_, i) => [0, 0.164 * Math.cos(i * Math.PI / 12), 0.164 * Math.sin(i * Math.PI / 12)]);
  curve(rim, 0.012, rubber, wheel, true);
  for (const side of [-1, 1]) {
    rod([-0.004, -0.004, 0], [0, 0.01, side * 0.162], 0.01, metal, wheel);
    rod([-0.015, -0.011, side * 0.037], [-0.012, 0.007, side * 0.139], 0.004, chrome, wheel);
  }
  cylinder([-0.01, 0, 0], 0.046, 0.028, 'x', metal, 30, wheel);
  cylinder([-0.026, 0, 0], 0.036, 0.008, 'x', rubber, 30, wheel);
  cylinder([-0.031, 0, 0], 0.014, 0.003, 'x', chrome, 20, wheel);

  turned([0.21, 0.41, 0], [[0,0], [0,0.056], [0.012,0.055], [0.021,0.043], [0.028,0.044], [0.036,0.033], [0.044,0.035], [0.053,0.018], [0.059,0.014], [0.059,0]], 'y', rubber, floor);
  rod([0.21, 0.463, 0], [0.145, 0.675, 0], 0.008, chrome, floor);
  ellipsoid([0.142, 0.687, 0], [0.025, 0.026, 0.024], rubber, floor);
  for (const z of [0.205, 0.306, 0.408]) {
    rod([0.644, 0.675, z], [0.531, 0.439, z], 0.007, metal, floor);
    box([0.527, 0.436, z], [0.025, 0.063, 0.049], rubber, 0.009, floor).rotation.z = -0.36;
  }
  return root;
}
