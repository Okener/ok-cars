# ok-cars

Motor Atlas is a three-dimensional car teardown viewer. The first vehicle is a reconstruction of the 1966 Toyota Corolla E10 two-door sedan. Select its exterior, interior, chassis, electronics, or engine and drag the model to orbit. The chassis view exposes the drivetrain from the engine to the rear axle, along with the wheels, brakes, suspension, steering, and underbody structure.

## Run locally

Use Node.js 22.12 or later.

```sh
cd motor-atlas
npm ci
npm run dev
```

Open the local URL printed by Vite. To serve a production build, run `npm run build` and then `npm run preview` from the same directory.

## Add a vehicle

Add the make, model/generation, available layers, preview images, and an asynchronous model loader to `motor-atlas/src/catalog.js`. The controls and deep links are generated from this catalog. Each vehicle module implements `buildLayer(id, THREE)` and returns a group of static meshes. Supply geometry in metres with +X pointing toward the front and +Y up. The Corolla's module in `src/vehicles/corolla/` contains a working example.

The viewer loads geometry for the selected layer, combines opaque meshes by material, and releases the previous layer's buffers and materials. All views reuse a single WebGL canvas. Rendering is event-driven, with pixel density capped for high-resolution displays. The layer selector uses static WebP thumbnails.

The demonstration uses Toyota's published sedan dimensions and representative specifications. Internal assemblies and wiring are schematic reconstructions. [Toyota vehicle archive](https://www.toyota-global.com/company/history_of_toyota/75years/vehicle_lineage/car/id60003154/index.html)
