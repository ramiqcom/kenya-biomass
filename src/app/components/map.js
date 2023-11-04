// Import tile server
import tiling from './tileServer';

export let Map;
export let SentinelTile;
export let AgbTile;
export let Features;

export default async function initMap(id, modal, setCoord, setDisabledButton){
	// Show modal
	modal.current.show();

	// Assign map
	Map = L.map(id, 
		{ 
			center: { lat: 0.04163, lng: 35.27773 } ,
			zoom: 14,
		}, 
	);
	Map.on('click', e => { setCoord(e.latlng) });
	
	const basemap = L.tileLayer('http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}')
		.addTo(Map);

	// Fetch tile
	const tile = await tiling(['NIR', 'SWIR1', 'SWIR2'], true);

	// Sentinel image tile
	SentinelTile = L.tileLayer(tile.sentinel, { opacity: 0 }).addTo(Map);

	// AGB image tile
	AgbTile = L.tileLayer(tile.agb).addTo(Map);

	// Features for analysis
	Features = L.geoJSON([]);
	
	// Hide modal
	modal.current.close();

	// Enable button
	setDisabledButton(false);
}