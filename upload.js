import fs from 'fs';
import {resolve} from 'path';
import request from 'axios';

(function upload() {
  const mb = buildings.map(async (building) => {
  // try {
      // const {status} = await request.post("http://localhost:8888/api/buildings/new", building);
      // if (status === 500) {
        // throw new Error(data.error);
      // }
    // } catch (err) {
    // } finally {
    const {data} = await request.get(`http://localhost:8888/api/buildings/byName/${building.buildingName}`);
    const floorMap = new Map();
    const paths = await fs.promises.readdir("./json")
    const layers = await paths.map(async (path) => {
      const fileRE = /^(([\w\s]+)_(.+?))-(.*).json$/
      const details = fileRE.exec(path);
      if (details && details[1] === building.buildingName) {
        const fullPath = resolve(__dirname, "json", path);
        const file = await fs.promises.open(fullPath, 'r');
        const content = await file.readFile({encoding: "UTF-8"});
        // console.log(details);
        if (floorMap.has(details[1])) {
          const thisFloor = floorMap.get(details[1]);
          thisFloor.layers.push(JSON.parse(content));
          floorMap.set(details[1], thisFloor);
      }
      else {
        floorMap.set(details[1], {
          building: mongoBuildings.get(details[2].id),
          floorNumber: details[3],
          layers: [JSON.parse(content)]
        });
      }
      await file.close();
      return content;
    }
  });
  await Promise.all(layers);
  await floorMap.forEach(async (floor, tag) => {
    // console.log(`posting ${tag}`);
    return await request.post("http://localhost:8888/api/floorplans/new", floor);
  });
})();
