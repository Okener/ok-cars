// Each asynchronous builder yields a static group in vehicle coordinates (metres).
const builders = {
  exterior: async T => {
    const [body, cabin] = await Promise.all([import('./exterior.js'), import('./system-cabin.js')]);
    return new T.Group().add(body.buildExterior(T), cabin.buildInterior(T));
  },
  interior: async T => (await import('./system-cabin.js')).buildInterior(T),
  drivetrain: async T => (await import('./system-drivetrain.js')).buildDrivetrain(T),
  electrical: async T => (await import('./system-electrical.js')).buildElectrical(T),
  engine: async T => (await import('./system-engine.js')).buildEngine(T),
};
export function buildLayer(id, THREE) {
  return builders[id](THREE);
}
