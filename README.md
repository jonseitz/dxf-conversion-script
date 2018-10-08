# DXF Conversion Script

A quickie script to read in a directory of dxf files, strip out most of the layers, and write to SVG and JSON formats. 

Used as the first stage of [My Mapping Project](https://github.com/jonseitz/inclusive-harvard-map).

## Usage

1. Copy all dxf files into `./dxf`.

2. This uses ESM for ES module compatibility. To run the script, use:

```bash
node -r esm index.js
```
