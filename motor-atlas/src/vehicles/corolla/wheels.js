import { createKit } from './system-kit.js';

export const axleOffset = 1.1425;
export const tireRadius = 0.284;

export function buildWheels(T, { hubcaps = true } = {}) {
  const { root, group, finish, turned, cylinder, ellipsoid } = createKit(T, 'Road wheels');
  const rubber = finish(0x202423, 0.02, 0.87);
  const tread = finish(0x343735, 0.02, 0.80);
  const ivory = finish(0xd8d0b7, 0.03, 0.68);
  const steel = finish(0x303838, 0.58, 0.31);
  const chrome = finish(0xdce1df, 0.91, 0.17);
  const satin = finish(0xb3bebd, 0.68, 0.29);
  const black = finish(0x151d1d, 0.08, 0.67);
  // Both faces of the thin pressed rims and sidewall stripes are visible.
  for (const material of [rubber, tread, ivory, steel, chrome, satin]) material.side = T.DoubleSide;

  for (const x of [-axleOffset, axleOffset]) for (const side of [-1, 1]) {
    const wheel = group('Steel wheel and cross-ply tire');
    wheel.position.set(x, tireRadius, side * 0.637);
    if (side < 0) wheel.rotation.y = Math.PI;
    const lathe = (profile, material, segments = 56) =>
      turned([0, 0, 0], profile, 'z', material, wheel, segments);

    lathe([[-.063,.153],[-.076,.214],[-.070,.255],[-.056,.275],[-.039,.283],[.034,.284],
      [.052,.280],[.063,.271],[.070,.252],[.074,.221],[.070,.172],[.063,.153],[-.063,.153]], rubber);
    for (const [r,z,dr,material] of [[.261,.067,.002,tread],[.246,.072,.0025,tread],
      [.212,.075,.006,ivory],[.182,.072,.002,tread]]) {
      lathe([[z-.001,r-dr],[z,r-dr*.75],[z,r+dr*.75],[z-.001,r+dr]], material);
    }
    for (const z of [-.036,-.013,.012,.036]) {
      lathe([[z-.0017,.284],[z,.2845],[z+.0017,.284]], tread, 64);
    }
    lathe([[-.065,.163],[-.059,.154],[.021,.143],[.055,.140],[.065,.152],[.075,.159],[.073,.167],[.067,.172]], steel);
    lathe([[.067,.153],[.073,.157],[.075,.164],[.072,.167],[.069,.169]], hubcaps ? chrome : satin);
    lathe([[.046,.029],[.046,.062],[.050,.073],[.027,.101],[.030,.119],[.055,.140]], steel);
    if (hubcaps) {
      lathe([[.106,.001],[.107,.052],[.103,.074],[.096,.092],[.085,.104],
        [.083,.116],[.087,.123],[.086,.132],[.077,.141],[.072,.154]], chrome);
      lathe([[.085,.104],[.084,.109],[.084,.113],[.085,.114]], steel);
      lathe([[.111,.001],[.111,.019],[.108,.022],[.106,.022]], satin, 32);
      for (let i = 0; i < 14; i++) {
        const angle = 2 * Math.PI * i / 14;
        ellipsoid([.145*Math.cos(angle),.145*Math.sin(angle),.077], [.0045,.010,.003], steel, wheel).rotation.z = angle;
      }
    } else {
      cylinder([0,0,.053], .033, .027, 'z', satin, 24, wheel);
      for (let i = 0; i < 4; i++) {
        const angle = (i + .5) * Math.PI / 2;
        cylinder([.045*Math.cos(angle),.045*Math.sin(angle),.054], .011, .016, 'z', satin, 6, wheel);
      }
    }
    ellipsoid([side*.126,.088,.077], [.004,.005,.010], black, wheel);
  }
  return root;
}
