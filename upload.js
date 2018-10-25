const fs = require('fs');
const { resolve } = require('path')
const request = require('axios');

(async function upload() {
  const buildingList = await fs.promises
    .readFile("./buildings.json", { encoding: "UTF-8" })
  const buildings = JSON.parse(buildingList);
  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    let {data} = await request.get(`http://localhost:3001/api/buildings/byName/${building.buildingName}`);
    if (data === null) {
      let {data} = await request.post("http://localhost:3001/api/buildings/new", building);
    }
    const fileNames = await fs.promises.readdir("./json")
    const theseFiles = fileNames.filter(e => ~e.search(data.buildingName));
    const floorMap = new Map();
    for (let i = 0; i < theseFiles.length; i++) {
      const thisFile = theseFiles[i];
      const fileRE = /^(([\w\s]+)_(.+?))-(.*).json$/
      const [fileName, uid, buidlingName, floorNumber, layer] = fileRE.exec(thisFile);
      const fullPath = resolve(__dirname, 'json', fileName);
      const svgData = await fs.promises.readFile(fullPath, { encoding: "UTF-8" })
      const svgContent = JSON.parse(svgData);
      if (floorMap.has(floorNumber)) {
        floorMap.get(floorNumber).push(svgContent); 
      } else {
        floorMap.set(floorNumber, [svgContent]);
      }
    }
    for (let i = 0; i < floorMap.size; i++) {
      const floors = floorMap.keys();
      // console.log(floors);
      const floorNumber = [...floors][i];
      // console.log(floorNumber);
      const floorObject = {
        building: data._id,
        layers: floorMap.get(floorNumber),
        floorNumber
      }
      console.log(floorObject);
      try {
        await request.post("http://localhost:3001/api/floorplans/new", floorObject);
      }
      catch (err) {
        console.error(err);
      }
    }
  }
})();
