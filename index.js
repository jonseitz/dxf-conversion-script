import * as dxf from "dxf";
import fs from "fs";
import { xml2json } from "xml-js";
import { resolve } from "path";

const layers = [ 
//  'A-WALL-INTR',
  'A-FLOR-EVTR',
  'A-FLOR-TPTN',
//  'A-FLOR-HRAL',
  'A-FLOR-STRS',
  'EC1 Area Polygons', 
  'P-FIXT',
];

(function main() {
  //read in all files in the dxf directory
  fs.promises.readdir("./dxf")
  .then(async (paths) => {
    return await paths.forEach(async (path) => {
      const fullPath = resolve(__dirname, "dxf", path);
      console.log(`opening ${fullPath}`);
      const file = await fs.promises.open(fullPath, 'r');
      //grab file contents
      const content = await file.readFile({encoding: "UTF-8"});
      await file.close();
      let parsed = dxf.parseString(content);
      //loop through entities, removing those from unneeded layers
      let newEntities = [];
      parsed.entities.forEach(entity => {
        if (layers.includes(entity.layer)) {
          newEntities.push(entity);
        }
      })
      parsed.entities = newEntities;  
      //write an svg version of the file
      const svgName = path.replace(/\.dxf$/, "-mod.svg");
      const svgPath = resolve(__dirname, "svg", svgName); 
      console.log(`writing svg file to ${svgName}`);
      const svgFile = await fs.promises.open(svgPath, 'w');
      const svgVersion = dxf.toSVG(parsed);
      await svgFile.writeFile(svgVersion);
      await svgFile.close();
      console.log(`wrote ${svgPath}`)
      //create a json representation of the svg data
      const jsonName = path.replace(/\.dxf$/, "-mod.json");
      const jsonPath = resolve(__dirname, "json", jsonName); 
      console.log(`writing json file to ${jsonName}`);
      const jsonFile = await fs.promises.open(jsonPath, 'w');
      const jsonVersion = xml2json(svgVersion, {compact: true, spaces: 2});
      await jsonFile.writeFile(jsonVersion);
      console.log(`wrote ${jsonPath}`)
      await jsonFile.close();
    });
  })
})()

