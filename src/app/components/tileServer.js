'use server';

// Import packages
import 'node-self';
import ee from '@google/earthengine';
import pify from 'pify';
import { auth, init, mapid } from './eePromise';

/**
 * Main function
 * @param {[ string, string, string ]} sentinelTile 
 * @param {boolean} agbTile
 * @param {{ lat: number, lng: number }} coord
 * @returns {Promise.<{ sentinel: url, agb: url } | { sentinel: url }>}
 */
export default async function main(sentinelTile, agbTile, coord) {
	await auth(JSON.parse(process.env.EE_KEY));
	await init(null, null);
	
	// Sentinel image
	const image = ee.Image(process.env.SENTINEL);

	// AGB image
	const agb = ee.Image(process.env.AGB);

	// Final data
	const result = {};

	if (sentinelTile) {
		const visualized = visual(image, sentinelTile);
		const [ obj, error ] = await mapid({ image: visualized });
		result.sentinel = obj.urlFormat;
	};

	if (agbTile) {
		const visualized = agb.visualize({ min: 5, max: 15, palette: ['#ffffcc','#c2e699','#78c679','#31a354','#006837'] });
		const [ obj, error ] = await mapid({ image: visualized });
		result.agb = obj.urlFormat;
	};

	if (coord) {
		const combined = ee.Image([image, agb]).toFloat();
		const reduce = combined.reduceRegion({
			geometry: ee.Geometry.Point(coord.lng, coord.lat),
			scale: 10,
			reducer: ee.Reducer.first(),
			maxPixels: 1e13
		});
		const evalDict = pify(reduce.evaluate, { multiArgs: true, errorFirst: false }).bind(reduce);
		const [ obj, error ] = await evalDict();
		result.value = obj;
	}

	return result;
}

/**
 * Image stretch visualization
 * @param {ee.Image} image 
 * @param {[ String, String, String ]} bands 
 * @returns { ee.Image }
 */
function visual(image, bands){
  // Percentile
  const percent = image.select([...new Set(bands)]).reduceRegion({
    geometry: image.geometry(),
    scale: 100,
    maxPixels: 1e13,
    reducer: ee.Reducer.percentile([1, 99])
  });

  const min = bands.map(band => percent.get(band + '_p1'));
  const max = bands.map(band => percent.get(band + '_p99'));
  
  return image.visualize({ bands, min, max });
}