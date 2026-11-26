import { createKit } from './system-kit.js';
import { axleOffset, tireRadius } from './wheels.js';

export const crankHeight = 0.38;

export function addBrakeDrum(kit, parent, x, y, side) {
  const { group, finish, cylinder, turned } = kit;
  const iron = finish(0x505d59, 0.63, 0.44);
  const dark = finish(0x343e3d, 0.56, 0.43);
  const machined = finish(0xc0c4ba, 0.74, 0.28);
  const bronze = finish(0x998367, 0.61, 0.42);
  cylinder([x,y,0.6*side],0.122,0.022,'z',dark,40,parent);
  const drum = group('Brake drum and hub', parent);
  drum.position.set(x,y,0.61*side);
  drum.rotation.y=side<0 ? Math.PI : 0;
  turned([0,0,0], [[0,0],[0,0.119],[0.014,0.126],[0.054,0.122],[0.063,0.104],[0.065,0.067],[0.076,0.057],[0.076,0]],'z',iron,drum,44);
  for (const z of [0.017,0.029,0.041]) cylinder([0,0,z],0.127,0.004,'z',dark,44,drum);
  cylinder([0,0,0.081],0.031,0.028,'z',machined,24,drum);
  for (let i=0;i<4;i++) {
    const angle=(i+0.5)*Math.PI/2;
    cylinder([0.045*Math.cos(angle),0.045*Math.sin(angle),0.084],0.007,0.03,'z',bronze,12,drum);
  }
}

export function buildDrivetrain(T) {
  const kit = createKit(T, 'Longitudinal drivetrain');
  const { root, finish, group, box, cylinder, ellipsoid, rod, curve, turned } = kit;
  const iron = finish(0x505d59, 0.63, 0.44);
  const alloy = finish(0x9caaa6, 0.62, 0.40);
  const machined = finish(0xc0c4ba, 0.74, 0.28);
  const dark = finish(0x343e3d, 0.56, 0.43);
  const seal = finish(0x262d2a, 0.07, 0.66);
  const bronze = finish(0x998367, 0.61, 0.42);
  const springSteel = finish(0x535b50, 0.58, 0.41);
  const axisY = 0.32;
  const axleX = -axleOffset;
  root.position.y = tireRadius - axisY;

  const gears = group('Four-speed manual gearbox and clutch');
  gears.position.y = crankHeight - tireRadius;
  turned([0,axisY,0], [
    [0.12,0],[0.12,0.044],[0.143,0.052],[0.161,0.052],[0.18,0.042],
    [0.27,0.052],[0.334,0.081],[0.353,0.084],[0.365,0.099],
    [0.405,0.106],[0.559,0.112],[0.583,0.12],[0.606,0.12],
    [0.622,0.106],[0.657,0.126],[0.783,0.183],[0.799,0.19],
    [0.824,0.19],[0.827,0.168],[0.801,0.165],[0.777,0.144],[0.777,0],
  ], 'x', alloy, gears, 48);
  for (const x of [0.353,0.598,0.817]) {
    const radius = x < 0.4 ? 0.099 : x < 0.7 ? 0.122 : 0.19;
    cylinder([x,axisY,0], radius, 0.009, 'x', iron, 40, gears);
    for (let i=0;i<8;i++) {
      const angle=i*Math.PI/4+Math.PI/8;
      const y=axisY+(radius-0.012)*Math.sin(angle);
      const z=(radius-0.012)*Math.cos(angle);
      cylinder([x+0.007,y,z],0.0078,0.013,'x',machined,6,gears);
    }
  }
  cylinder([0.831,axisY,0],0.154,0.014,'x',dark,40,gears);
  cylinder([0.84,axisY,0],0.12,0.009,'x',iron,32,gears);
  cylinder([0.851,axisY,0],0.034,0.036,'x',machined,28,gears);
  cylinder([0.883,axisY,0],0.015,0.047,'x',bronze,16,gears);
  for (let i=0;i<9;i++) {
    const angle=i*Math.PI*2/9;
    function point(x,r) { return [x,axisY+r*Math.sin(angle),r*Math.cos(angle)]; }
    rod(point(0.643,0.119),point(0.793,0.182),0.0055,alloy,gears);
    rod(point(0.385,0.103),point(0.58,0.113),0.005,alloy,gears);
  }
  box([0.474,0.42,0],[0.194,0.04,0.124],alloy,0.014,gears);
  for (const x of [0.396,0.548]) for (const z of [-0.048,0.048]) {
    cylinder([x,0.442,z],0.008,0.009,'y',machined,6,gears);
  }
  box([0.302,0.387,0],[0.093,0.063,0.082],iron,0.016,gears);
  cylinder([0.297,0.421,0],0.029,0.017,'y',seal,24,gears);
  rod([0.297,0.428,0],[0.222,0.573,0],0.008,machined,gears);
  box([0.412,0.244,0],[0.145,0.017,0.235],dark,0.007,gears);

  const rearJointX = -0.87;
  const shaftPivot = group('Propeller shaft and universal joints');
  shaftPivot.position.set(rearJointX, axisY, 0);
  shaftPivot.rotation.z = Math.atan2(gears.position.y, 0.12 - rearJointX);
  const prop = group('Shaft and yokes', shaftPivot);
  prop.position.set(-rearJointX, -axisY, 0);
  cylinder([-0.399,axisY,0],0.033,0.842,'x',dark,36,prop);
  for (const x of [-0.816,0.019]) cylinder([x,axisY,0],0.035,0.011,'x',bronze,32,prop);
  function universal(x) {
    cylinder([x,axisY,0],0.019,0.099,'z',machined,20,prop);
    cylinder([x,axisY,0],0.019,0.095,'y',machined,20,prop);
    for (const sign of [-1,1]) {
      box([x-0.021,axisY,sign*0.035],[0.062,0.034,0.024],iron,0.011,prop);
      box([x+0.022,axisY+sign*0.032,0],[0.063,0.022,0.038],iron,0.01,prop);
    }
  }
  universal(0.075);
  universal(rearJointX);
  cylinder([0.119,axisY,0],0.029,0.045,'x',machined,24,prop);
  cylinder([-0.916,axisY,0],0.045,0.02,'x',machined,28,prop);

  const axle = group('Live rear axle and differential');
  cylinder([axleX,axisY,0],0.044,1.229,'z',dark,32,axle);
  for (const side of [-1,1]) {
    cylinder([axleX,axisY,0.329*side],0.048,0.21,'z',iron,32,axle);
    cylinder([axleX,axisY,0.572*side],0.052,0.046,'z',iron,32,axle);
    addBrakeDrum(kit, axle, axleX, axisY, side);
  }
  ellipsoid([axleX,axisY,0],[0.133,0.129,0.128],dark,axle);
  turned([axleX,axisY,0], [[0,0],[0,0.127],[0.028,0.135],[0.048,0.13],[0.081,0.108],[0.11,0.08],[0.147,0.063],[0.168,0.049],[0.194,0.043],[0.194,0]], 'x',iron,axle,40);
  cylinder([axleX+0.201,axisY,0],0.056,0.022,'x',machined,32,axle);
  for (let i=0;i<10;i++) {
    const angle=(i+0.5)*Math.PI/5;
    cylinder([axleX+0.045,axisY+0.12*Math.sin(angle),0.12*Math.cos(angle)],0.007,0.016,'x',machined,6,axle);
  }

  const leaves = group('Rear leaf-spring supports');
  for (const side of [-1,1]) {
    const z=side*0.446;
    for (let layer=0;layer<4;layer++) {
      const length=0.79-layer*0.117;
      // A shallow arched stack of steel strips below the axle.
      for (let segment=0;segment<8;segment++) {
        const left=length*(segment/8-0.5);
        const right=length*((segment+1)/8-0.5);
        const y1=0.24-layer*0.008+0.56*left*left;
        const y2=0.24-layer*0.008+0.56*right*right;
        const strip=box([axleX+(left+right)/2,(y1+y2)/2,z],[Math.hypot(right-left,y2-y1)+0.002,0.007,0.046],springSteel,0,leaves);
        strip.rotation.z=Math.atan2(y2-y1,right-left);
      }
    }
    for (const x of [axleX-0.395,axleX+0.395]) {
      cylinder([x,0.328,z],0.021,0.06,'z',iron,24,leaves);
      cylinder([x,0.328,z],0.012,0.066,'z',seal,20,leaves);
      cylinder([x,0.328,z],0.006,0.073,'z',machined,12,leaves);
    }
    box([axleX,0.208,z],[0.104,0.013,0.082],iron,0.004,leaves);
    for (const offset of [-0.028,0.028]) {
      curve([[axleX-0.052,0.209,z+offset],[axleX-0.052,0.33,z+offset],[axleX,0.369,z+offset],[axleX+0.052,0.33,z+offset],[axleX+0.052,0.209,z+offset]],0.0045,machined,leaves);
    }
  }
  return root;
}
