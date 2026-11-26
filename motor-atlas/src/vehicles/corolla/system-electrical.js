import { createKit } from './system-kit.js';

export function buildElectrical(T) {
  const { root, finish, group, box, cylinder, curve, turned, rod } = createKit(T, 'Electrical system');
  const black=finish(0x28302f,0.07,0.53);
  const rubber=finish(0x333a36,0,0.66);
  const steel=finish(0x77837f,0.65,0.4);
  const bright=finish(0xbcc6c1,0.76,0.28);
  const copper=finish(0xb58a58,0.64,0.36);
  const porcelain=finish(0xddd8ca,0,0.42);
  const red=finish(0xa64e41,0.05,0.47);
  const ochre=finish(0xbaa05d,0.05,0.51);
  const blue=finish(0x467b86,0.05,0.44);
  const green=finish(0x638573,0.05,0.48);
  const amber=finish(0xb2743e,0.17,0.31);
  const tailRed=finish(0x943d31,0.21,0.31);

  const battery=group('Battery and cable clamps');
  battery.position.set(1.15,0.49,0.439);
  box([0,0,0],[0.277,0.018,0.179],steel,0.005,battery);
  box([0,0.092,0],[0.26,0.178,0.164],black,0.011,battery);
  for (const side of [-1,1]) for (let i=0;i<10;i++) {
    box([(i-4.5)*0.024,0.09,side*0.082],[0.008,0.142,0.006],rubber,0.002,battery);
  }
  box([0,0.185,0],[0.27,0.024,0.173],rubber,0.009,battery);
  for (let i=0;i<6;i++) {
    cylinder([(i-2.5)*0.038,0.205,0],0.014,0.015,'y',porcelain,12,battery);
    box([(i-2.5)*0.038,0.214,0],[0.017,0.004,0.004],copper,0,battery);
  }
  for (const side of [-1,1]) {
    const x=side*0.104, z=-0.052;
    cylinder([x,0.207,z],0.014,0.033,'y',bright,18,battery);
    cylinder([x,0.213,z],0.022,0.014,'y',side>0?red:rubber,18,battery);
    box([x-side*0.021,0.214,z],[0.025,0.012,0.019],copper,0.003,battery);
    box([x,0.198,0.049],[0.025,0.003,0.005],porcelain,0,battery);
    if(side>0) box([x,0.198,0.049],[0.005,0.003,0.025],porcelain,0,battery);
  }
  for(const x of [-0.084,0.084]) {
    box([x,0.198,0],[0.009,0.006,0.173],steel,0.002,battery);
    for(const z of [-0.086,0.086]) rod([x,0.197,z],[x,0.006,z],0.003,steel,battery,8);
  }

  const junction=group('Fuse block and regulator');
  box([0.686,0.675,0.454],[0.091,0.082,0.17],black,0.009,junction);
  box([0.681,0.724,0.458],[0.086,0.021,0.162],copper,0.006,junction);
  for(let i=0;i<4;i++) {
    const z=0.403+i*0.035;
    cylinder([0.68,0.737,z],0.007,0.048,'x',porcelain,14,junction);
    for(const x of [0.657,0.703]) cylinder([x,0.737,z],0.008,0.009,'x',bright,12,junction);
  }
  box([0.695,0.725,0.24],[0.082,0.08,0.112],steel,0.01,junction);
  box([0.695,0.687,0.24],[0.095,0.015,0.13],black,0.004,junction);

  const loom=group('Wiring harness and branch connectors');
  curve([[1.254,0.706,0.387],[1.286,0.727,0.344],[1.286,0.663,0.297],[1.07,0.615,0.293],[0.842,0.643,0.327],[0.7,0.699,0.407]],0.012,red,loom);
  curve([[1.046,0.706,0.387],[1.016,0.735,0.35],[0.977,0.628,0.318],[0.978,0.526,0.166]],0.011,black,loom);
  curve([[0.686,0.692,0.448],[0.746,0.668,0.575],[1.311,0.59,0.594],[1.656,0.603,0.56],[1.745,0.659,0.477]],0.014,rubber,loom);
  curve([[0.671,0.688,0.45],[0.607,0.666,0.522],[0.489,0.464,0.551],[0.171,0.359,0.561],[-0.479,0.355,0.562],[-0.797,0.397,0.557],[-1.048,0.524,0.529],[-1.427,0.565,0.526],[-1.707,0.588,0.492]],0.015,rubber,loom);
  for(const [i,wire] of [red,ochre,green].entries()) {
    const d=i*0.012;
    curve([[0.665,0.71,0.417+d],[0.619,0.716,0.451+d],[0.57,0.646,0.51+d],[0.48,0.468,0.554+d],[0.175,0.368,0.569+d],[-0.477,0.364,0.568+d],[-0.788,0.408,0.568+d],[-1.048,0.535,0.535+d],[-1.412,0.573,0.537+d],[-1.72,0.598,0.505+d]],0.0045,wire,loom);
  }
  for(const [x,y,z] of [[0.282,0.38,0.568],[-0.02,0.364,0.568],[-0.339,0.364,0.568],[-1.16,0.55,0.541],[-1.466,0.579,0.537]]) {
    cylinder([x,y,z],0.031,0.013,'x',black,14,loom);
  }
  for(const side of [-1,1]) {
    const z=side*0.524;
    // Headlamp bowls, the sealed beams, and their integral terminals.
    const lamp=group('Headlamp and marker lamp');
    lamp.position.set(1.744,0.666,z);
    turned([0,0,0],[[-0.072,0],[-0.072,0.025],[-0.058,0.039],[-0.034,0.068],[-0.014,0.082],[0,0.086],[0.009,0.086],[0.009,0]],'x',steel,lamp,36);
    turned([0.01,0,0],[[0,0],[0,0.082],[0.007,0.079],[0.014,0.058],[0.02,0.032],[0.022,0]],'x',porcelain,lamp,36);
    for(let n=-4;n<=4;n++) {
      const yy=n*0.014;
      const half=Math.sqrt(0.078**2-yy**2);
      curve([[0.017,yy,-half],[0.031-Math.abs(n)*0.0015,yy,0],[0.017,yy,half]],0.0013,bright,lamp);
    }
    box([-0.079,0,0],[0.028,0.034,0.047],black,0.004,lamp);
    box([-0.002,-0.108,0.007*side],[0.04,0.037,0.086],amber,0.011,lamp);
    box([-1.741,0.615,z],[0.06,0.091,0.189],steel,0.014,root);
    box([-1.777,0.615,z+side*0.022],[0.023,0.074,0.117],tailRed,0.01,root);
    box([-1.777,0.615,z-side*0.052],[0.023,0.074,0.04],amber,0.008,root);
    for(const [i,color] of [ochre,blue].entries()) {
      const d=i*0.014;
      curve([[1.641,0.606,0.561],[1.648+d,0.629,0.462],[1.653+d,0.632,side*0.419],[1.661,0.65+d,z],[1.681,0.66+d,z]],0.006,color,loom);
      curve([[-1.646,0.591,0.535],[-1.668-d,0.588,0.396],[-1.679-d,0.595,side*0.379],[-1.698,0.614+d,z],[-1.719,0.622+d,z]],0.0055,color,loom);
    }
  }
  const ignition=group('Ignition coil and distributor');
  cylinder([0.788,0.661,-0.227],0.037,0.108,'y',steel,24,ignition);
  cylinder([0.788,0.72,-0.227],0.037,0.018,'y',black,24,ignition);
  cylinder([0.788,0.741,-0.227],0.012,0.029,'y',copper,20,ignition);
  cylinder([0.95,0.529,0.185],0.028,0.086,'y',steel,20,ignition);
  turned([0.95,0.57,0.185],[[0,0],[0,0.046],[0.015,0.049],[0.05,0.04],[0.053,0]],'y',black,ignition);
  curve([[0.788,0.757,-0.227],[0.816,0.778,-0.187],[0.891,0.725,0.02],[0.949,0.658,0.185],[0.95,0.625,0.185]],0.0068,black,ignition);
  for(const [i,x] of [0.906,1.019,1.132,1.245].entries()) {
    curve([[0.936+i*0.01,0.618,0.198],[0.94+i*0.013,0.648,0.222],[x-0.018,0.678+i*0.004,0.197],[x,0.638,0.143]],0.0064,blue,ignition);
    rod([x,0.638,0.143],[x,0.615,0.118],0.008,porcelain,ignition);
    rod([x,0.618,0.121],[x,0.61,0.111],0.011,bright,ignition,6);
  }
  curve([[0.69,0.707,0.402],[0.697,0.744,0.197],[0.728,0.742,-0.11],[0.773,0.723,-0.216]],0.005,red,loom);
  return root;
}
