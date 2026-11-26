// A dimensional interpretation of the 1966 KE10 two-door. All stations are in metres.
// The bonnet, greenhouse and fenders share their boundary curves so the silhouette
// stays continuous when viewed from the back, above and below.
export function buildExterior(THREE) {
  const root = new THREE.Group();
  root.name = 'KE10 two-door exterior';
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const lerp = THREE.MathUtils.lerp;
  const clamp = THREE.MathUtils.clamp;
  const { PI } = Math;
  const metal = (name, color, metalness, roughness, options = {}) =>
    new THREE.MeshStandardMaterial({ name, color, metalness, roughness, side: THREE.DoubleSide, ...options });

  const paint = new THREE.MeshPhysicalMaterial({
    name: 'Deep sea green enamel', color: 0x38736a, metalness: 0.38, roughness: 0.26,
    clearcoat: 0.92, clearcoatRoughness: 0.16, side: THREE.DoubleSide,
  });
  const chrome = metal('Polished brightwork', 0xdce1df, 0.91, 0.17);
  const satin = metal('Brushed aluminium', 0xb3bebd, 0.68, 0.29);
  const steel = metal('Graphite steel', 0x303838, 0.58, 0.31);
  const rubber = metal('Tire rubber', 0x202423, 0.02, 0.87);
  const tread = metal('Raised tire lettering and beads', 0x343735, 0.02, 0.80);
  const black = metal('Gaskets and panel joints', 0x151d1d, 0.08, 0.67);
  const ivory = metal('Ivory sidewall stripe', 0xd8d0b7, 0.03, 0.68);
  const glass = metal('Blue-green safety glass', 0x829c9a, 0.25, 0.12,
    { transparent: true, opacity: 0.49, depthWrite: false });
  const lens = metal('Fluted headlamp glass', 0xd5ded7, 0.43, 0.18);
  const optical = metal('Headlamp fluting', 0x9caeac, 0.54, 0.25);
  const amber = metal('Indicator lens', 0xda852a, 0.3, 0.22);
  const crimson = metal('Tail lamp lens', 0x8d2924, 0.24, 0.21);
  const enamel = metal('Badge enamel', 0x782d2b, 0.43, 0.27);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitSphere = new THREE.SphereGeometry(1, 18, 10);
  const smallSphere = new THREE.SphereGeometry(1, 10, 6);
  const rodGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);

  function mesh(geometry, material, name) {
    const object = new THREE.Mesh(geometry, material);
    object.name = name || material.name;
    object.castShadow = !material.transparent;
    object.receiveShadow = !material.transparent;
    root.add(object);
    return object;
  }
  function box(x, y, z, dx, dy, dz, material) {
    const part = mesh(unitBox, material);
    part.position.set(x, y, z);
    part.scale.set(dx, dy, dz);
    return part;
  }
  function oval(x, y, z, dx, dy, dz, material) {
    const part = mesh(Math.max(dx, dy, dz) < .035 ? smallSphere : unitSphere, material);
    part.position.set(x, y, z);
    part.scale.set(dx, dy, dz);
    return part;
  }
  function rod(a, b, radius, material) {
    const d = b.clone().sub(a);
    const part = mesh(rodGeometry, material);
    part.position.copy(a).lerp(b, 0.5);
    part.scale.set(radius, d.length(), radius);
    part.quaternion.setFromUnitVectors(v(0, 1, 0), d.normalize());
  }
  function bead(points, radius, material, loop = false, segments = points.length * 2) {
    const curve = new THREE.CatmullRomCurve3(points, loop, 'centripetal');
    return mesh(new THREE.TubeGeometry(curve, segments, radius, 6, loop), material);
  }
  // Indexed surfaces retain continuous normals across adjacent sections.
  function surface(columns, rows, point, material, flip = false) {
    const positions = [], uvs = [], indices = [];
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= columns; i++) {
        const u = i / columns, t = j / rows;
        const p = point(u, t);
        positions.push(p.x, p.y, p.z);
        uvs.push(u, t);
        if (i < columns && j < rows) {
          const a = j * (columns + 1) + i;
          const b = a + 1, c = a + columns + 1, d = c + 1;
          if (flip) indices.push(a, c, b, b, c, d);
          else indices.push(a, b, c, b, d, c);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return mesh(g, material);
  }
  function track(stations, x) {
    if (x <= stations[0][0]) return stations[0][1];
    for (let i = 1; i < stations.length; i++) {
      if (x <= stations[i][0]) {
        const [x0, y0] = stations[i - 1], [x1, y1] = stations[i];
        return lerp(y0, y1, (x - x0) / (x1 - x0));
      }
    }
    return stations[stations.length - 1][1];
  }
  function sample(fn, segments) {
    return Array.from({ length: segments + 1 }, (_, i) => fn(i / segments));
  }
  function revolution(profile, segments, material, pos, axis) {
    const geo = new THREE.LatheGeometry(profile.map(([r, offset]) => new THREE.Vector2(r, offset)), segments);
    const obj = mesh(geo, material);
    obj.position.copy(pos);
    obj.quaternion.setFromUnitVectors(v(0, 1, 0), axis);
    return obj;
  }

  const nose = 1.854, tail = -1.846, axle = 1.1425, tireRadius = 0.284, archRadius = 0.317;
  const widthSections = [[tail,.634],[-1.79,.68],[-1.58,.716],[-1.18,.734],[-.62,.736],
    [.18,.733],[.85,.738],[1.21,.742],[1.62,.727],[1.80,.694],[nose,.653]];
  const beltSections = [[tail,.795],[-1.75,.835],[-1.42,.858],[-.92,.882],[-.35,.899],
    [.28,.902],[.68,.895],[1.07,.873],[1.43,.844],[1.75,.819],[nose,.803]];
  const width = x => track(widthSections, x);
  const belt = x => track(beltSections, x);
  const sill = x => .265 + .073 * Math.pow(Math.abs(x) / nose, 4);
  function sideWidth(x, y) {
    const h = belt(x) - y;
    const lower = clamp((.58 - y) / .33, 0, 1);
    const crease = Math.exp(-((h - .078) ** 2) / .00042);
    const waist = Math.exp(-((h - .26) ** 2) / .008);
    return width(x) - .052 * lower ** 1.25 + .007 * crease - .005 * waist
      - .022 * Math.exp(-Math.max(0, h) / .024);
  }
  function bottom(x) {
    const d = Math.min(Math.abs(x - axle), Math.abs(x + axle));
    if (d > archRadius) return sill(x);
    return Math.max(sill(x), tireRadius + Math.sqrt(Math.max(0, archRadius ** 2 - d ** 2)));
  }
  const sidePoint = (x, y, sign, relief = 0) => v(x, y, sign * (sideWidth(x, y) + relief));

  for (const sign of [-1, 1]) {
    // Include exact arch tangent stations; ordinary axial sampling flattens their lower corners.
    const xs = [...sample(t => lerp(tail, nose, t), 80)];
    for (const center of [-axle, axle])
      xs.push(...sample(t => center + archRadius * Math.cos(PI * t), 44));
    const stations = [...new Set(xs)].sort((a, b) => a - b);
    const xAt = u => stations[Math.round(u * (stations.length - 1))];
    surface(stations.length - 1, 26, (u, t) => {
      const x = xAt(u);
      return sidePoint(x, lerp(bottom(x), belt(x), t), sign);
    }, paint, sign < 0);
    surface(stations.length - 1, 2, (u, t) => {
      const x = xAt(u), y = bottom(x);
      return v(x, y - .008 * t, sign * lerp(sideWidth(x, y), .53, t));
    }, steel, sign > 0);
    for (const x0 of [-axle, axle]) {
      const arc = t => {
        const a = PI * t;
        const x = x0 + archRadius * Math.cos(a);
        return sidePoint(x, tireRadius + archRadius * Math.sin(a), sign, .002);
      };
      bead(sample(arc, 28), .0062, paint, false, 45);
      surface(40, 2, (u, t) => {
        const a = PI * u;
        return v(x0 + .319 * Math.cos(a), tireRadius + .319 * Math.sin(a), sign * lerp(.536, .679, t));
      }, rubber, sign < 0);
    }
    const accent = t => {
      const x = lerp(tail + .047, nose - .056, t);
      return sidePoint(x, belt(x) - .098, sign, .0035);
    };
    bead(sample(accent, 24), .005, satin, false, 44);
    bead(sample(t => sidePoint(lerp(-.80, .80, t), .305, sign, .003), 6), .007, chrome);

    // Door aperture, fitted pull handle and the lock cylinder.
    const door = [[.69,.875],[.698,.79],[.713,.59],[.676,.369],[.624,.335],
      [-.36,.335],[-.427,.355],[-.469,.491],[-.47,.738],[-.466,.884]];
    const line = door.map(([x,y]) => sidePoint(x,y,sign,.002));
    bead(line, .005, black, false, 48);
    const handleZ = sign * (sideWidth(-.346,.783) + .006);
    oval(-.337,.772,handleZ,.062,.025,.011,black);
    oval(-.342,.789,handleZ + .015 * sign,.067,.011,.013,chrome);
    oval(-.407,.767,handleZ + .003 * sign,.011,.011,.011,satin);
    const marker = sidePoint(1.54,.713,sign,.005);
    oval(marker.x,marker.y,marker.z,.043,.017,.009,chrome);
    oval(marker.x,marker.y,marker.z+.007*sign,.035,.012,.007,amber);
  }

  // The bonnet and boot have a slight central crown and folded fender crests.
  function deckHeight(x, z) {
    const a = clamp(Math.abs(z) / (width(x) - .022), 0, 1);
    return belt(x) + .028 * (1 - a ** 4) + .009 * Math.exp(-((a - .78) ** 2) / .008);
  }
  const midStart = -1.40, midEnd = .74;
  function deck(x0, x1) {
    surface(32, 24, (u, t) => {
      const x = lerp(x0,x1,u), z = (2*t-1) * (width(x)-.022);
      return v(x, deckHeight(x,z), z);
    }, paint, true);
  }
  deck(tail,midStart); deck(midEnd,nose);
  for (const sign of [-1,1]) {
    surface(45, 5, (u,t) => {
      const x = lerp(midStart,midEnd,u), z = sign * lerp(.602,width(x)-.022,t);
      return v(x,deckHeight(x,z),z);
    },paint,sign > 0);
    const hoodSeam = sample(t => {
      const x=lerp(.746,1.80,t), z = sign * lerp(.593,.555,t);
      return v(x,deckHeight(x,z)+.002,z);
    },14);
    bead(hoodSeam,.004,black);
    const trunkSeam = sample(t => {
      const x=lerp(-1.80,-1.392,t), z=sign*lerp(.539,.555,t);
      return v(x,deckHeight(x,z)+.002,z);
    },8);
    bead(trunkSeam,.0035,black);
  }
  for (const [x,w] of [[.755,.593],[1.800,.555],[-1.797,.539]]) {
    bead(sample(t => {const z=(2*t-1)*w;return v(x,deckHeight(x,z)+.002,z);},16),.0035,black);
  }

  // Greenhouse coordinates interpolate from the rounded sill to the narrower drip rail.
  const frontAt = h => lerp(.775,.354,h) + .018 * Math.sin(PI*h);
  const rearAt = h => lerp(-1.419,-.785,h) - .026 * Math.sin(PI*h);
  function cabinPoint(u, h, sign) {
    const x = lerp(rearAt(h), frontAt(h), u);
    const y = lerp(deckHeight(x,.650)-.002, 1.317+.024*Math.sin(PI*u),h);
    const z = sign*lerp(.651+.015*Math.sin(PI*u),.540+.018*Math.sin(PI*u),h);
    return v(x,y,z);
  }
  function rounded(u0, u1, v0, v1, ru, rv) {
    const corners = [[u1-ru,v1-rv,0],[u0+ru,v1-rv,PI/2],
      [u0+ru,v0+rv,PI],[u1-ru,v0+rv,1.5*PI]];
    const points = [];
    for (let i = 0; i < corners.length; i++) {
      const [x, y, a] = corners[i];
      const curve = sample(t => [x + ru * Math.cos(a + PI*t/2), y + rv * Math.sin(a + PI*t/2)], 4);
      points.push(...curve);
      const end = curve[4], [nx, ny, na] = corners[(i + 1) % 4];
      const next = [nx + ru*Math.cos(na), ny + rv*Math.sin(na)];
      for (let j = 1; j < 8; j++) points.push([lerp(end[0], next[0], j/8), lerp(end[1], next[1], j/8)]);
    }
    return points;
  }
  function frame(surfacePoint, inner, outer, frameMaterial, flip) {
    surface(inner.length,1,(u,t) => {
      const i = Math.round(u*inner.length) % inner.length;
      return surfacePoint(lerp(inner[i][0],outer[i][0],t), lerp(inner[i][1],outer[i][1],t));
    },frameMaterial,flip);
  }
  for (const sign of [-1,1]) {
    const p = (u,h) => cabinPoint(u,h,sign);
    const outer = rounded(0,1,0,1,0,0);
    const opening = rounded(.100,.983,.034,.957,.030,.083);
    frame(p,opening,outer,paint, sign>0);
    // One curved pane behind the mullions prevents open seams at oblique angles.
    surface(24,9,(u,h) => {
      const pt=p(lerp(.094,.987,u),lerp(.03,.963,h)); pt.z-=.006*sign; return pt;
    },glass,sign<0);
    // Straight segments in UV follow the slight bend of each sill and drip rail.
    const loopPoints = opening.map(([u, h]) => p(u, h));
    bead(loopPoints,.009,black,true,120);
    bead(loopPoints.map(pt=>v(pt.x,pt.y,pt.z+.004*sign)),.0045,chrome,true,120);
    // A near-vertical B pillar and an operable vent light mark the early two-door.
    for (const [bottomX, topX, radius, material] of [[-.465,-.472,.017,steel],[.531,.351,.006,satin]]) {
      const points = sample(h => {
        const t=lerp(.041,.952,h),x=lerp(bottomX,topX,h);
        const pt=p((x-rearAt(t))/(frontAt(t)-rearAt(t)),t);pt.z+=sign*.003;
        return pt;
      },16);
      bead(points,radius,material);
      if (radius>.01) bead(points.map(pt=>v(pt.x+.011,pt.y,pt.z+.009*sign)),.0035,chrome);
    }
    const rail = sample(t=>p(t,1),20);
    bead(rail,.0085,chrome,false,40);
    const beltTrim = sample(t=>{const pt=p(t,0);pt.z+=sign*.006;return pt;},28);
    bead(beltTrim,.009,chrome,false,50);
  }
  function crossGlass(u,h,front) {
    const right=cabinPoint(front?1:0,h,1);
    const n=2*u-1;
    const crown=(1-n*n);
    return v(right.x+(front?1:-1)*(.060+.012*h)*crown,
      right.y+(.005+.024*h)*crown,right.z*n);
  }
  for (const front of [true,false]) {
    const p=(u,h)=>crossGlass(u,h,front);
    const outer=rounded(0,1,0,1,0,0), opening=rounded(.012,.988,.032,.962,.050,.106);
    frame(p,opening,outer,paint,front);
    surface(24,12,(u,h)=>p(lerp(.010,.990,u),lerp(.024,.969,h)),glass,!front);
    const ring = opening.map(([u, h]) => p(u, h));
    bead(ring,.010,black,true,140);
    bead(ring.map(pt=>v(pt.x+(front?1:-1)*.005,pt.y+.002,pt.z)),.0048,chrome,true,140);
  }
  surface(20,26,(u,t)=>{
    const side=cabinPoint(u,1,1), n=t*2-1, curve=1-n*n;
    return v(side.x+lerp(-.072,.072,u)*curve,
      side.y+curve*(.029+.010*Math.sin(PI*u)),n*side.z);
  },paint,true);
  // The black plenum and rear shelf close the view through the lower glass.
  box(.674,.863,0,.15,.045,1.23,black);
  box(-1.25,.856,0,.34,.039,1.23,black);
  for (const side of [-1,1]) {
    const pivot=crossGlass(.5+side*.22,.035,true);
    const joint=crossGlass(.5+side*.22+.081,.112,true);
    const pa=crossGlass(.5+side*.22-.026,.066,true);
    const pb=crossGlass(.5+side*.22+.181,.157,true);
    for(const pt of [pivot,joint,pa,pb]) pt.x+=.012;
    rod(pivot,joint,.006,steel);
    rod(pa,pb,.007,black);
    oval(pivot.x,pivot.y,pivot.z,.011,.011,.011,satin);
    const m=v(1.105,.91,side*.665);
    oval(m.x,m.y,m.z,.048,.011,.028,chrome);
    bead([m,v(1.116,.947,side*.70),v(1.165,1.002,side*.768)],.010,chrome,false,10);
    oval(1.171,1.015,side*.769,.043,.052,.059,chrome);
    oval(1.139,1.018,side*.775,.008,.042,.048,steel);
    oval(1.135,1.019,side*.775,.005,.036,.044,satin);
  }

  // Rolling assemblies. Turned profiles create the changing highlights on the
  // polished wheel covers, with separate radial openings in the pressed-steel rim.
  for (const x of [-axle,axle]) for(const sign of [-1,1]) {
    const axis=v(0,0,sign), origin=v(x,tireRadius,.637*sign);
    const lathe=(profile,material,segments=56)=>revolution(profile,segments,material,origin,axis);
    lathe([[.153,-.063],[.214,-.076],[.255,-.070],[.275,-.056],[.283,-.039],[.284,.034],
      [.280,.052],[.271,.063],[.252,.070],[.221,.074],[.172,.070],[.153,.063],[.153,-.063]],rubber);
    // Narrow raised rings and a single white stripe on the original-style cross-ply tire.
    for (const [r,z,dr,m] of [[.261,.067,.002,tread],[.246,.072,.0025,tread],
      [.212,.075,.006,ivory],[.182,.072,.002,tread]]) {
      lathe([[r-dr,z-.001],[r-dr*.75,z],[r+dr*.75,z],[r+dr,z-.001]],m);
    }
    for(const z of [-.036,-.013,.012,.036]) {
      lathe([[.284,z-.0017],[.2845,z],[.284,z+.0017]],tread,64);
    }
    lathe([[.001,.055],[.14,.055],[.152,.065],[.159,.075],[.167,.073],[.172,.067]],steel);
    lathe([[.153,.067],[.157,.073],[.164,.075],[.167,.072],[.169,.069]],chrome);
    lathe([[.001,.106],[.052,.107],[.074,.103],[.092,.096],[.104,.085],
      [.116,.083],[.123,.087],[.132,.086],[.141,.077],[.154,.072]],chrome);
    lathe([[.104,.085],[.109,.084],[.113,.084],[.114,.085]],steel);
    for (let i=0;i<14;i++) {
      const a=2*PI*i/14, radius=.145;
      const slot=oval(x+radius*Math.cos(a),tireRadius+radius*Math.sin(a),
        sign*(.637+.077),.0045,.010,.003,steel);
      slot.rotation.z=a;
    }
    lathe([[.001,.111],[.019,.111],[.022,.108],[.022,.106]],satin,32);
    const stem=sidePoint(x+.126,tireRadius+.088,sign);
    stem.z=sign*.714;
    oval(stem.x,stem.y,stem.z,.004,.005,.010,black);
  }

  // End panels bow forward at the center and meet the side surfaces at each corner.
  function endPoint(sign,zNorm,h) {
    const end=sign>0?nose:tail, edgeY=lerp(sill(end),belt(end),h);
    const half=sideWidth(end,edgeY);
    const z=zNorm*half, round=1-zNorm*zNorm;
    return v(end+sign*.018*round,edgeY+round*.028*h**5,z);
  }
  for(const sign of [-1,1]) {
    surface(32,20,(u,h)=>endPoint(sign,2*u-1,h),paint,sign>0);
  }
  box(0,.269,0,3.37,.032,1.06,steel);
  for (const sign of [-1,1]) {
    box(0,.285,.503*sign,3.10,.072,.073,black);
    box(0,.278,.662*sign,1.60,.028,.085,paint);
  }
  const frontX = z => nose+.037-.033*(z/.675)**2;
  const grilleW=.535;
  surface(32,8,(u,h)=>{
    const z=(2*u-1)*grilleW;
    return v(frontX(z),lerp(.551,.780,h),z);
  },black,true);
  // Closely spaced grille ribs sit underneath a bright horizontal grid.
  for(let i=-19;i<=19;i++) {
    const z=i*.027;
    box(frontX(z)+.003,.665,z,.007,.211,.006,steel);
  }
  for (let i=0;i<7;i++) {
    const y=.567+i*.0335;
    bead(sample(t=>{const z=lerp(-grilleW,grilleW,t);return v(frontX(z)+.008,y+.004*(z/grilleW)**2,z);},12),
      i===0||i===6?.0055:.0039,i%2===0?chrome:satin,false,18);
  }
  for (const y of [.551,.782]) {
    bead(sample(t=>{const z=lerp(-.632,.632,t);return v(frontX(z)+.010,y+.005*(z/.65)**2,z);},18),
      .008,chrome,false,24);
  }
  const headY=.684, headZ=.555;
  for (const sign of [-1,1]) {
    const z=sign*headZ;
    const pos=v(frontX(z)-.006,headY,z);
    const lamp=(profile,material,segments=48)=>revolution(profile,segments,material,pos,v(1,0,0));
    lamp([[.001,.001],[.118,.001],[.13,.006],[.125,.027],[.112,.035]],black);
    lamp([[.110,.032],[.114,.038],[.121,.036],[.126,.027],[.127,.014]],chrome);
    lamp([[.001,.053],[.040,.051],[.082,.046],[.108,.035],[.112,.032]],lens);
    const face=(dy,dz)=>pos.x+.0535-.021*(dy*dy+dz*dz)/(.112**2);
    for(let i=-6;i<=6;i++){
      const dz=i*.0155, limit=Math.sqrt(.104**2-dz**2);
      bead(sample(t=>{const dy=lerp(-limit,limit,t);return v(face(dy,dz),headY+dy,z+dz);},8),.0014,optical,false,10);
    }
    for(const dy of [-.046,.045]){
      const limit=Math.sqrt(.104**2-dy**2);
      bead(sample(t=>{const dz=lerp(-limit,limit,t);return v(face(dy,dz)+.0004,headY+dy,z+dz);},9),.0014,optical);
    }
    const indicatorZ=sign*.483;
    oval(frontX(indicatorZ)-.001,.505,indicatorZ,.017,.025,.085,chrome);
    oval(frontX(indicatorZ)+.008,.505,indicatorZ,.015,.019,.073,amber);
    for(const dx of [-.036,0,.036])
      oval(frontX(indicatorZ)+.022,.505,indicatorZ+dx,.002,.016,.0016,optical);
  }
  // Small cloisonné crest in the center of the radiator grille.
  oval(frontX(0)+.017,.678,0,.010,.047,.038,chrome);
  oval(frontX(0)+.025,.678,0,.004,.038,.029,enamel);
  rod(v(frontX(0)+.030,.696,-.018),v(frontX(0)+.030,.696,.018),.0027,chrome);
  rod(v(frontX(0)+.030,.699,0),v(frontX(0)+.030,.659,0),.0027,chrome);

  // Wraparound pressed bumpers. Cross sections include their rolled upper and lower edges.
  function bumper(sign) {
    const base = sign>0?1.894:-1.893;
    const path = new THREE.CatmullRomCurve3([
      v(base-.174*sign,.437,-.714),v(base-.091*sign,.435,-.707),
      v(base-.037*sign,.429,-.681),v(base-.011*sign,.426,-.608),
      v(base,.426,-.38),v(base,.426,0),v(base,.426,.38),v(base-.011*sign,.426,.608),
      v(base-.037*sign,.429,.681),v(base-.091*sign,.435,.707),v(base-.174*sign,.437,.714)
    ]);
    const shape=[[.003,-.035],[.008,-.027],[.008,.018],[.003,.034],
      [-.022,.040],[-.054,.033],[-.054,-.022],[-.025,-.034],[.003,-.035]];
    surface(80,shape.length-1,(u,h)=>{
      const p=path.getPoint(u), dir=path.getTangent(u);
      const [out,y]=shape[Math.round(h*(shape.length-1))];
      return v(p.x+sign*dir.z*out,p.y+y,p.z-sign*dir.x*out);
    },chrome,sign<0);
    for(const s of [-1,1]) {
      const z=.398*s;
      oval(base+.004*sign,.435,z,.020,.070,.022,chrome);
      oval(base+.019*sign,.439,z,.010,.052,.014,black);
    }
  }
  bumper(1);bumper(-1);

  for(const sign of [-1,1]) {
    const z=.527*sign;
    box(-1.862,.692,z,.024,.120,.226,chrome);
    box(-1.877,.692,z,.011,.101,.208,black);
    box(-1.883,.692,z+.028*sign,.010,.089,.142,crimson);
    box(-1.883,.692,z-.074*sign,.010,.089,.053,amber);
    for(let i=-2;i<=2;i++) box(-1.889,.692+i*.014,z+.027*sign,.002,.002,.125,enamel);
  }
  bead(sample(t=>{const z=lerp(-.601,.601,t);return v(-1.871+.013*(z/.60)**2,.791,z);},12),.005,chrome);
  const exhaust=revolution([[.019,0],[.025,0],[.025,.115],[.019,.115],[.019,0]],20,steel,
    v(-1.77,.239,-.43),v(-1,-.08,0).normalize());
  exhaust.name='Tailpipe';

  function plate(sign) {
    const x=sign>0?1.915:-1.905;
    const y=sign>0?.467:.623;
    box(x,y,0,.012,.115,.285,satin);
    let material=black;
    if (typeof document!=='undefined') {
      const canvas=document.createElement('canvas');
      canvas.width=320;canvas.height=128;
      const context=canvas.getContext('2d');
      if(context) {
        context.fillStyle='#23332f';context.fillRect(0,0,320,128);
        context.fillStyle='#e9ebdd';context.textAlign='center';context.textBaseline='middle';
        context.font='600 20px sans-serif';context.fillText('TOYOTA',160,25);
        context.font='bold 68px sans-serif';context.fillText('KE10',160,77);
        const texture=new THREE.CanvasTexture(canvas);
        texture.colorSpace=THREE.SRGBColorSpace;
        material=metal('KE10 display plate',0xffffff,.10,.44,{map:texture});
      }
    }
    const panel=mesh(new THREE.PlaneGeometry(.275,.105),material);
    panel.position.set(x+.0065*sign,y,0);
    panel.rotation.y=sign*PI/2;
    for(const z of [-.123,.123])oval(x+.008*sign,y+.037,z,.003,.003,.003,satin);
  }
  plate(1);plate(-1);
  return root;
}
