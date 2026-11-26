// Catalog entries stay lightweight. Geometry is imported only for the selected vehicle.
const assetPath = '/models/corolla-e10';
const corolla = {
  id: 'corolla-e10',
  model: 'Corolla',
  generation: 'E10',
  generationName: 'First generation',
  years: '1966–1970',
  body: '2-door sedan',
  source: 'https://www.toyota-global.com/company/history_of_toyota/75years/vehicle_lineage/car/id60003154/index.html',
  specifications: [
    ['Reference model', '1966 Corolla Deluxe (KE10-D)'],
    ['Body style', '2-door sedan, 5 seats'],
    ['Engine', '1,077 cc K-series inline-four'],
    ['Transmission', '4-speed manual'],
    ['Drive layout', 'Front-engine, rear-wheel drive'],
    ['Length × width × height', '3,845 × 1,485 × 1,380 mm'],
    ['Wheelbase', '2,285 mm'],
    ['Curb weight', '710 kg'],
  ],
  load: () => import('./vehicles/corolla/index.js'),
  layers: [
    {
      id: 'exterior', contactOpacity: .85, direction: [5.5, 2.55, -6.8], name: 'Exterior', subtitle: 'Body & trim', icon: 'car',
      description: 'Explore the two-door body shell, chrome trim, and round headlamps of the first-generation Corolla.',
    },
    {
      id: 'interior', direction: [-3.1, 3.15, -4.3], name: 'Interior', subtitle: 'Cabin & controls', icon: 'seat',
      description: 'Look inside the right-hand-drive cabin, with separate front seats, a rear bench, and a floor-mounted gear lever.',
    },
    {
      id: 'chassis', aliases: ['drivetrain'], contactOpacity: .55, direction: [2.6, 3.2, -4.9], name: 'Chassis', subtitle: 'Suspension & drivetrain', icon: 'chassis',
      description: 'Follow the engine, gearbox, and propeller shaft to the rear axle. Orbit the exposed chassis to inspect the steering linkage, front struts, and rear leaf springs.',
    },
    {
      id: 'electrical', contactOpacity: .1, direction: [2.0, 3.45, -4.1], name: 'Electronics', subtitle: 'Wiring & ignition', icon: 'bolt',
      description: 'Trace a schematic of the battery, ignition circuit, and lighting harness through the car.',
    },
    {
      id: 'engine', direction: [3.2, 2.3, -4.15], name: 'Engine', subtitle: 'K-series inline-four', icon: 'engine',
      description: 'Inspect the longitudinal 1,077 cc K-series engine, including its rocker cover, air cleaner, and belt-driven accessories.',
    },
  ].map(layer => ({ ...layer, thumbnail: assetPath + '/' + layer.id + '.webp' })),
};
export const makes = [{ id: 'toyota', name: 'Toyota', models: [corolla] }];
