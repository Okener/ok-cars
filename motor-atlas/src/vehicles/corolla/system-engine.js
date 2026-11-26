import { createKit } from './system-kit.js';

export function buildEngine(T) {
  const { root, finish, group, box, cylinder, ellipsoid, rod, curve, turned, mesh } = createKit(T, 'Toyota K inline-four');
  const engine = group('Engine assembly');
  engine.position.set(1.075, 0.238, 0);
  const block = finish(0x3f6664, 0.52, 0.42);
  const machined = finish(0xb8bab0, 0.68, 0.3);
  const cast = finish(0x8b918d, 0.58, 0.46);
  const steel = finish(0x515955, 0.71, 0.35);
  const black = finish(0x262c2b, 0.28, 0.47);
  const rubber = finish(0x1a2021, 0, 0.68);
  const exhaust = finish(0x8e6c56, 0.48, 0.58);
  const copper = finish(0xb69b69, 0.62, 0.37);
  const enamel = finish(0x223c40, 0.58, 0.29);
  const porcelain = finish(0xe6ded0, 0.08, 0.31);
  const wire = finish(0x706343, 0.08, 0.48);

  const crankcase = group('Cylinder block and oil pan', engine);
  box([0.005, 0.069, 0], [0.435, 0.127, 0.233], black, 0.039, crankcase);
  box([0.072, 0.034, 0], [0.258, 0.068, 0.207], black, 0.024, crankcase);
  box([0, 0.128, 0], [0.479, 0.016, 0.269], steel, 0.006, crankcase);
  box([0, 0.236, 0], [0.446, 0.219, 0.236], block, 0.03, crankcase);
  for (const side of [-1,1]) {
    for (const x of [-0.172,-0.058,0.058,0.172]) {
      cylinder([x, 0.246, side * 0.105], 0.049, 0.166, 'y', block, 20, crankcase);
      cylinder([x, 0.126, side * 0.125], 0.007, 0.008, 'y', machined, 6, crankcase);
    }
    box([-0.001, 0.192, side * 0.133], [0.352, 0.013, 0.012], block, 0.004, crankcase);
    box([-0.001, 0.291, side * 0.133], [0.352, 0.013, 0.012], block, 0.004, crankcase);
    box([-0.02, 0.161, side * 0.18], [0.119, 0.04, 0.117], steel, 0.009, crankcase).rotation.x = side * 0.18;
    box([-0.018, 0.132, side * 0.205], [0.09, 0.032, 0.062], rubber, 0.008, crankcase);
  }
  const head = group('Cylinder head and rocker cover', engine);
  box([0, 0.342, 0], [0.463, 0.015, 0.254], black, 0.006, head);
  box([0, 0.385, 0], [0.47, 0.073, 0.261], cast, 0.018, head);
  box([0, 0.426, 0], [0.455, 0.012, 0.2], black, 0.004, head);
  box([0, 0.453, -0.002], [0.449, 0.062, 0.193], machined, 0.026, head);
  for (const z of [-0.061, -0.043, 0.047, 0.065]) {
    box([0.014, 0.483, z], [0.364, 0.009, 0.007], machined, 0.003, head);
  }
  for (const x of [-0.164, 0.153]) {
    cylinder([x, 0.487, -0.005], 0.012, 0.01, 'y', machined, 6, head);
  }
  for (const x of [-0.196,-0.10,0,0.10,0.196]) {
    for (const z of [-0.113,0.113]) cylinder([x, 0.421, z], 0.008, 0.011, 'y', steel, 6, head);
  }
  cylinder([-0.142, 0.49, 0.04], 0.025, 0.019, 'y', black, 16, head);
  box([0.039, 0.486, -0.005], [0.124, 0.007, 0.033], steel, 0.003, head);
  // Raised TOYOTA lettering on the valve-cover badge.
  const glyph = {
    T: [[[0,0],[0.012,0]], [[0.006,0],[0.006,0.02]]],
    O: [[[0.002,0],[0.01,0],[0.012,0.003],[0.012,0.017],[0.01,0.02],[0.002,0.02],[0,0.017],[0,0.003],[0.002,0]]],
    Y: [[[0,0],[0.006,0.009],[0.012,0]], [[0.006,0.009],[0.006,0.02]]],
    A: [[[0,0.02],[0.006,0],[0.012,0.02]], [[0.003,0.012],[0.009,0.012]]],
  };
  Array.from('TOYOTA').forEach((letter, i) => {
    for (const path of glyph[letter]) {
      for (let n = 1; n < path.length; n++) {
        const point = ([x,z]) => [-0.013 + i * 0.018 + x, 0.491, -0.015 + z];
        rod(point(path[n-1]), point(path[n]), 0.0013, machined, head, 6);
      }
    }
  });

  const manifold = group('Intake, carburetor and air cleaner', engine);
  for (const x of [-0.165,-0.055,0.055,0.165]) {
    curve([[x,0.382,-0.108], [x,0.395,-0.155], [x*0.68,0.396,-0.192], [x*0.33,0.406,-0.195]], 0.021, cast, manifold);
    curve([[x,0.369,-0.122], [x,0.344,-0.163], [x-0.025,0.283,-0.174], [-0.142+x*0.13,0.235,-0.167]], 0.022, exhaust, manifold);
  }
  curve([[-0.145,0.236,-0.165], [-0.195,0.201,-0.171], [-0.251,0.163,-0.177]], 0.035, exhaust, manifold);
  cylinder([-0.252,0.163,-0.177],0.044,0.014,'x',steel,10,manifold);
  box([-0.005,0.425,-0.181],[0.098,0.058,0.083],copper,0.008,manifold);
  cylinder([-0.005,0.467,-0.181],0.044,0.043,'y',machined,24,manifold);
  const filter = [-0.007,0.487,-0.178];
  turned(filter, [[0,0],[0,0.111],[0.008,0.139],[0.015,0.143],[0.057,0.143],[0.064,0.148],[0.071,0.146],[0.077,0.132],[0.085,0.09],[0.091,0.046],[0.091,0]], 'y', enamel, manifold, 56);
  turned(filter, [[0.058,0.144],[0.059,0.148],[0.063,0.148],[0.064,0.144]], 'y', machined, manifold, 56);
  cylinder([-0.007,0.583,-0.178],0.009,0.01,'y',machined,6,manifold);
  const snorkel = box([0.155,0.522,-0.205],[0.151,0.047,0.064],enamel,0.014,manifold);
  snorkel.rotation.y = 0.19;
  box([0.224,0.522,-0.218],[0.012,0.035,0.048],rubber,0.004,manifold).rotation.y = 0.19;
  for (const x of [-0.083,0.069]) rod([x,0.493,-0.29],[x,0.551,-0.303],0.003,machined,manifold);

  const ignition = group('Distributor and plug leads', engine);
  cylinder([-0.125,0.285,0.185],0.033,0.061,'y',cast,24,ignition);
  turned([-0.125,0.312,0.185], [[0,0],[0,0.041],[0.014,0.044],[0.034,0.039],[0.044,0.026],[0.044,0]], 'y', black, ignition);
  for (const [i,x] of [-0.169,-0.056,0.057,0.17].entries()) {
    const angle = (i+0.5)*Math.PI/2;
    const start = [-0.125+0.027*Math.cos(angle),0.36,0.185+0.027*Math.sin(angle)];
    cylinder(start,0.009,0.024,'y',rubber,12,ignition);
    rod([x,0.385,0.121], [x,0.401,0.15],0.009,porcelain,ignition);
    rod([x,0.399,0.146], [x,0.409,0.162],0.011,rubber,ignition);
    curve([start, [start[0],0.39,0.211+0.005*i], [x-0.025,0.419+0.006*i,0.19+0.004*i], [x,0.409,0.16]],0.0053,wire,ignition);
  }
  cylinder([-0.165,0.245,0.171],0.034,0.099,'x',enamel,28,ignition);
  cylinder([-0.211,0.245,0.171],0.036,0.014,'x',machined,28,ignition);
  curve([[-0.195,0.241,0.171],[-0.226,0.223,0.139],[-0.198,0.192,0.118]],0.005,copper,ignition);

  const drive = group('Water pump, fan and accessory belt', engine);
  box([0.231,0.235,0],[0.049,0.204,0.181],cast,0.023,drive);
  cylinder([0.253,0.181,0],0.074,0.036,'x',steel,36,drive);
  cylinder([0.277,0.181,0],0.068,0.019,'x',black,36,drive);
  cylinder([0.267,0.344,0],0.054,0.051,'x',steel,32,drive);
  cylinder([0.291,0.344,0],0.045,0.013,'x',black,32,drive);
  cylinder([0.187,0.308,0.157],0.051,0.117,'x',cast,28,drive);
  for (const x of [0.14,0.149,0.158,0.224,0.233]) cylinder([x,0.308,0.157],0.054,0.004,'x',machined,28,drive);
  cylinder([0.256,0.308,0.157],0.026,0.036,'x',black,24,drive);
  // Belt follows tangent points around all three pulleys.
  curve([[0.271,0.168,-0.066],[0.271,0.125,-0.036],[0.271,0.119,0.025],[0.271,0.142,0.056],[0.271,0.29,0.176],[0.271,0.315,0.181],[0.271,0.332,0.158],[0.271,0.386,0.012],[0.271,0.392,-0.006],[0.271,0.369,-0.043],[0.271,0.34,-0.05]],0.008,rubber,drive,true);
  const fan = group('Pressed-steel cooling fan', drive);
  fan.position.set(0.311,0.344,0);
  cylinder([0,0,0],0.032,0.026,'x',machined,24,fan);
  const blade = new T.Shape();
  blade.moveTo(0.014,-0.008);
  blade.quadraticCurveTo(0.059,-0.018,0.122,-0.014);
  blade.lineTo(0.139,0.022);
  blade.quadraticCurveTo(0.09,0.036,0.028,0.013);
  blade.closePath();
  const bladeGeometry = new T.ExtrudeGeometry(blade, {depth:0.003,bevelEnabled:false,curveSegments:5});
  bladeGeometry.rotateY(-Math.PI/2);
  for (let i=0;i<4;i++) {
    const pivot=group('Fan blade',fan);
    pivot.rotation.x=i*Math.PI/2+0.36;
    mesh(bladeGeometry,machined,[0,0,0],pivot).rotation.z=0.16;
  }
  cylinder([0.018,0,0],0.012,0.011,'x',steel,6,fan);
  return root;
}
