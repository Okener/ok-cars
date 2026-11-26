import { createKit } from './system-kit.js';
import { axleOffset, buildWheels, tireRadius } from './wheels.js';
import { addBrakeDrum, buildDrivetrain, crankHeight } from './system-drivetrain.js';
import { buildEngine } from './system-engine.js';

export function buildChassis(T) {
  const kit = createKit(T, 'Corolla E10 rolling chassis');
  const { root, group, mesh, finish, box, rod, cylinder, curve, turned } = kit;
  const green = finish(0x40665d, .46, .39);
  const sheet = finish(0x57736a, .42, .46);
  sheet.side = T.DoubleSide;
  const steel = finish(0x394541, .59, .45);
  const cast = finish(0x65716a, .55, .43);
  const zinc = finish(0xa2aaa1, .68, .35);
  const rubber = finish(0x242927, .04, .75);
  const exhaust = finish(0x8e7765, .54, .52);
  const springs = finish(0x535b50, .58, .41);

  const engine = buildEngine(T);
  // Seat the rear of the block against the bellhousing, with the crank on the input axis.
  engine.position.set(-.026, crankHeight - (.238 + .181), 0);
  root.add(buildDrivetrain(T), engine, buildWheels(T, { hubcaps: false }));

  // Sweep a folded box section along mounting stations. Separate faces keep the
  // creases of the stamping sharp through changes in height and track width.
  function member(stations, width, height, material, parent) {
    const profile = [[-.52,.50],[.52,.50],[.52,.40],[.43,.37],[.39,-.39],
      [.30,-.50],[-.30,-.50],[-.39,-.39],[-.43,.37],[-.52,.40]];
    const rings = stations.map(([x,y,z], i) => {
      const before = stations[Math.max(0, i-1)];
      const after = stations[Math.min(stations.length-1, i+1)];
      const dx = after[0]-before[0], dz = after[2]-before[2];
      const length = Math.hypot(dx, dz);
      return profile.map(([w,h]) => [x-dz/length*w*width, y+h*height, z+dx/length*w*width]);
    });
    const positions = [];
    for (let i = 0; i < profile.length; i++) {
      const j = (i+1) % profile.length;
      for (let r = 1; r < rings.length; r++) {
        const a = rings[r-1], b = rings[r];
        positions.push(...a[i], ...a[j], ...b[j], ...a[i], ...b[j], ...b[i]);
      }
      positions.push(...stations[0], ...rings[0][j], ...rings[0][i]);
      positions.push(...stations.at(-1), ...rings.at(-1)[i], ...rings.at(-1)[j]);
    }
    const shape = new T.BufferGeometry();
    shape.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    shape.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(positions.length/3*2), 2));
    shape.computeVertexNormals();
    return mesh(shape, material, [0,0,0], parent);
  }

  const structure = group('Exposed unibody rails, sills and crossmembers');
  function stamping(columns, rows, point) {
    const shape = new T.PlaneGeometry(1, 1, columns, rows);
    const { position, uv } = shape.attributes;
    for (let i = 0; i < position.count; i++) {
      position.setXYZ(i, ...point(uv.getX(i), uv.getY(i)));
    }
    shape.computeVertexNormals();
    return mesh(shape, sheet, [0,0,0], structure);
  }
  const front = group('Front struts, transverse leaf spring and brakes');
  const rear = group('Rear shock absorbers and spring hangers');
  const steering = group('Steering box, centre link and tie rods');
  for (const side of [-1,1]) {
    const point = (x,y,z) => [x,y,side*z];
    const rail = (stations, w, h, material = green, parent = structure) =>
      member(stations.map(p => point(...p)), w, h, material, parent);
    rail([[-1.79,.42,.41],[-1.55,.43,.446],[-1.25,.49,.446],[-1.06,.49,.446],
      [-.80,.39,.446],[-.58,.265,.53],[.43,.265,.53],[.72,.33,.397],
      [.89,.40,.35],[1.39,.40,.35],[1.73,.38,.36]], .095, .10);
    rail([[-.82,.31,.48],[-.68,.285,.626],[.49,.285,.626],[.65,.31,.54],[.74,.34,.40]], .09, .112);
    // Show the outer floor pressings in section and leave the transmission tunnel open.
    stamping(32, 36, (u,v) => {
      const x = -.72 + 1.38*u;
      const ends = Math.abs(2*u-1) ** 6;
      const inner = .205 + .039*u + .028*ends;
      const outer = .615 - .103*ends;
      const bead = Math.max(0, Math.cos(v*8*Math.PI)) ** 3;
      const y = .313 + .062*ends + .014*bead*Math.sin(u*Math.PI) + .035*(1-v)**8;
      return point(x, y, inner + (outer-inner)*v);
    });
    // Drop the gearbox support below the output shaft and bolt it to the floor rails.
    rail([[.412,.265,.545],[.412,.257,.32],[.412,.261,.18],[.412,.261,0]], .091, .035, steel);
    rail([[-.49,.268,.636],[-.49,.268,.32],[-.49,.393,.12],[-.49,.399,0]], .052, .044);
    box([.412,.287,side*.071],[.087,.033,.06],rubber,.005,structure);
    rail([[1.055,.38,.35],[1.055,.273,.266],[1.055,.181,.15],[1.055,.149,0]], .125, .068, steel);
    rail([[1.035,.286,.28],[1.035,.302,.205]], .093, .045, cast);

    for (const x of [-1.5375,-.7475]) {
      const top = x < -1 ? .415 : .354;
      for (const dz of [-.034,.034]) {
        box(point(x,(top+.292)/2,.446+dz),[.049,top-.292+.018,.009],steel,.004,rear);
      }
      cylinder(point(x,.292,.446),.009,.09,'z',zinc,12,rear);
    }
    rod(point(-1.14,.217,.422),point(-.977,.391,.36),.021,cast,rear);
    rod(point(-.977,.391,.36),point(-.90,.458,.34),.010,zinc,rear);
    rod(point(-.90,.458,.337),point(-.90,.432,.446),.023,steel,rear);

    // The strut top sits in a stamped tower tied to the inner front rail.
    rail([[.89,.415,.35],[1.007,.57,.399],[1.102,.67,.45]], .125, .041);
    rail([[1.36,.415,.35],[1.24,.57,.405],[1.102,.67,.45]], .125, .041);
    stamping(24, 8, (u,v) => {
      const arch = Math.sin(u*Math.PI);
      return point(1.12 + (2*u-1)*(.232-.152*v), .424+.234*v,
        .352+.092*v-.029*arch*Math.sin(v*Math.PI));
    });
    turned(point(1.102,.64,.45), [[0,.069],[.019,.087],[.038,.082],[.042,.068],[.042,0]], 'y',green,front);
    cylinder(point(1.102,.686,.45),.04,.011,'y',rubber,28,front);
    cylinder(point(1.102,.697,.45),.012,.014,'y',zinc,6,front);
    for (let i = 0; i < 3; i++) {
      const a = 2*Math.PI*i/3;
      cylinder(point(1.102+.058*Math.cos(a),.685,.45+.058*Math.sin(a)),.006,.009,'y',zinc,6,front);
    }
    const knuckle = point(axleOffset,tireRadius,.574);
    const lowerJoint = point(axleOffset,.208,.564);
    rod(lowerJoint,point(1.121,.454,.518),.03,steel,front);
    rod(point(1.121,.447,.521),point(1.102,.654,.45),.015,zinc,front);
    rod(knuckle,point(axleOffset,tireRadius,.613),.039,cast,front);
    rail([[1.06,.224,.267],[1.10,.196,.396],[axleOffset,.208,.564]], .066, .032,cast,front);
    rod(point(1.52,.35,.35), lowerJoint, .012, steel, front);
    addBrakeDrum(kit, front, axleOffset, tireRadius, side);

    rod(knuckle,point(.998,.257,.555),.014,cast,steering);
    rod(point(.998,.257,.555),point(.952,.264,.278),.010,zinc,steering);
    rod(point(.952,.264,.278),point(.83,.334,.315),.015,steel,steering);
    cylinder(point(.952,.264,.278),.016,.026,'y',cast,16,steering);
  }
  member([[-1.76,.42,-.41],[-1.76,.42,.41]], .065, .075, green, structure);
  member([[1.7,.38,-.36],[1.7,.38,.36]], .065, .075, green, structure);
  // The KE10 uses a transverse front leaf in addition to its struts.
  for (let i = 0; i < 3; i++) {
    const span = .535 - i*.094;
    const points = Array.from({length:11}, (_, j) => {
      const z = span*(j/5-1);
      return [1.113, .166 + i*.0065 + .14*z*z, z];
    });
    member(points, .054, .006, springs, front);
  }
  for (const side of [-1,1]) {
    box([1.11,.194,side*.19],[.08,.046,.048],steel,.004,front);
  }
  rod([.952,.264,-.278],[.952,.264,.278],.012,cast,steering);
  box([.83,.354,.316],[.091,.079,.069],cast,.016,steering);
  rod([.83,.373,.316],[.585,.544,.33],.012,steel,steering);

  const fuel = group('Rear fuel tank and retaining straps');
  box([-1.50,.397,0],[.405,.144,.65],zinc,.043,fuel);
  box([-1.50,.398,0],[.410,.009,.657],cast,.004,fuel);
  for (const z of [-.235,-.117,0,.117,.235]) {
    box([-1.5,.467,z],[.289,.012,.023],zinc,.006,fuel);
  }
  for (const side of [-1,1]) {
    member([[-1.76,.403,.203*side],[-1.704,.378,.203*side],[-1.676,.325,.203*side],
      [-1.327,.325,.203*side],[-1.294,.393,.203*side],[-1.257,.47,.203*side]], .018, .008, steel, fuel);
  }
  member([[-1.257,.47,-.45],[-1.257,.47,.45]], .048, .04,green,structure);

  const pipe = group('Exhaust pipe and rear silencer');
  curve([[.797,.362,-.177],[.65,.239,-.185],[.42,.166,-.248],[-.43,.164,-.256],
    [-.79,.213,-.267],[-1.06,.387,-.279],[-1.23,.388,-.284],[-1.385,.273,-.286]], .019,exhaust,pipe);
  box([-1.526,.268,-.285],[.322,.097,.151],cast,.039,pipe);
  for (const x of [-1.664,-1.389]) box([x,.268,-.285],[.011,.1,.154],zinc,.005,pipe);
  curve([[-1.675,.266,-.285],[-1.758,.258,-.30],[-1.867,.243,-.32]], .020,exhaust,pipe);
  return root;
}
