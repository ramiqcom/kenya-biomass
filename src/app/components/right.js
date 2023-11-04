'use client';

import Select from 'react-select';
import { useEffect, useState } from 'react';
import { Map, SentinelTile, AgbTile } from './map';
import tiling from './tileServer';
import { Grid } from 'gridjs-react';
import roi from './roi.json' assert { type: 'json' };
import { point, booleanIntersects } from '@turf/turf';


// Panel components
export default function Panel(prop){
	// Modal
	const { modalRef, coord, disabledButton, setDisabledButton } = prop;

	// Layer list
	let layerList = [ 'AGB', 'Sentinel' ];
	layerList = layerList.map(value => new Object({ label: value, value: value }));

	// Layer state
	const [ layer, setLayer ] = useState(layerList[0]);

	// Show sentinel bands state
	const [ bandsShow, setBandsShow ] = useState('none');

	// Show biomass legend state
	const [ legendShow, setLegendShow ] = useState('flex');

	// Download link
	const [ downloadLink, setDownloadLink ] = useState('https://storage.googleapis.com/gee-ramiqcom-bucket/space4good/AGB_Kenya.tif');

	return (
		<div id='panel' className="flexible vertical space">
			<div id="title">Kenya Biomass Map</div>

			<div className='flexible stretch-vertical stretch-space space'>
				<Select 
					options={layerList}
					value={layer}
					onChange={value => {
						setLayer(value);
						setDisabledButton(true);

						if (value.value == 'Sentinel'){
							setBandsShow('flex');
							setLegendShow('none');
							SentinelTile.setOpacity(1);
							AgbTile.setOpacity(0);
							setDownloadLink('https://storage.googleapis.com/gee-ramiqcom-bucket/space4good/Images_2023_January.tif');
						} else {
							setBandsShow('none');
							setLegendShow('flex');
							AgbTile.setOpacity(1);
							SentinelTile.setOpacity(0);
							setDownloadLink('https://storage.googleapis.com/gee-ramiqcom-bucket/space4good/AGB_Kenya.tif');
						}

						setDisabledButton(false);
					}}
					className='data-select'
					isDisabled={disabledButton}
				/>
				
				<button className='fa fa-location-arrow' onClick={() => {
					const geojson = L.geoJSON(roi);
					const bounds = geojson.getBounds();
					Map.fitBounds(bounds);
				}}></button>

				<a style={{ display: 'flex' }} href={downloadLink} download>
					<button className='fa fa-download'></button>
				</a>
			</div>

			<Sentinel bandsShow={bandsShow} modalRef={modalRef} setDisabledButton={setDisabledButton} disabledButton={disabledButton} />
			<Legend legendShow={legendShow} />

			<Stats coord={coord}/>
		</div>	
	)
}

// Composite option for Sentinel-2
function Sentinel(prop){
	const { modalRef, bandsShow, disabledButton, setDisabledButton } = prop;

	// Sentinel bands
	let bands = [ 'BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2', 'VV', 'VH', 'NBR', 'MNDWI', 'RI' ];
	bands = bands.map(band => new Object({ label: band, value: band }));

	// RGB channel
	const [red, setRed] = useState({ label: 'NIR', value: 'NIR' });
	const [green, setGreen] = useState({ label: 'SWIR1', value: 'SWIR1' });
	const [blue, setBlue] = useState({ label: 'SWIR2', value: 'SWIR2' })

	// Function when the band changed
	async function loadSentinel(){
		setDisabledButton(true);
		modalRef.current.show();
		const { sentinel } = await tiling([red.value, green.value, blue.value]);
		SentinelTile.setUrl(sentinel);
		modalRef.current.close();
		setDisabledButton(false);
	}

	// Useeffect when band changed
	useEffect(() => {
		// Load if the Sentine tile already loaded
		if (SentinelTile) {
			loadSentinel();
		}
	}, [red, green, blue]);
	
	return (
		<div id='sentinel-bands' className='flexible space' style={{ display: bandsShow }}>
			<Select
				options={bands}
				value={red}
				onChange={value => red.value !== value.value ? setRed(value) : null}
				isDisabled={disabledButton}
			/>

			<Select
				options={bands}
				value={green}
				onChange={value => green.value !== value.value ? setGreen(value) : null}
				isDisabled={disabledButton}
			/>

			<Select
				options={bands}
				value={blue}
				onChange={value => blue.value !== value.value ? setBlue(value) : null}
				isDisabled={disabledButton}
			/>
		</div>
	)
}

// Legend panel
function Legend(prop) {
	return (
		<div id='legend' className='flexible vertical' style={{ display: prop.legendShow }}>
			<div id='legend-label' className='flexible'>
				<div>5</div>
				<div>AGB Ton/Ha</div>
				<div>15</div>
			</div>
			<div id='biomass' />
		</div>
	)
}

// Click value menu
function Stats(prop) {
	const { coord } = prop;

	const [agb, setAgb] = useState(null);
	const [blue, setBlue] = useState(null);
	const [green, setGreen] = useState(null);
	const [red, setRed] = useState(null);
	const [nir, setNir] = useState(null);
	const [swir1, setSwir1] = useState(null);
	const [swir2, setSwir2] = useState(null);
	const [vv, setVv] = useState(null);
	const [vh, setVh] = useState(null);
	const [nbr, setNbr] = useState(null);
	const [mndwi, setMndwi] = useState(null);
	const [ri, setRi] = useState(null);
	const [message, setMessage] = useState(undefined);
	const [messageColor, setMessageColor] = useState('red');

	// Function to change value
	async function callValue(coordinate) {
		[setAgb, setBlue, setGreen, setRed, setNir, setSwir1, setSwir2, setVv, setVh, setNbr, setMndwi, setRi].map(set => set('Loading...'))

		const { value } = await tiling(null, null, coordinate);
		const { agb: AGB, BLUE, GREEN, RED, NIR, SWIR1, SWIR2, VV, VH, NBR, MNDWI, RI } = value;

		console.log(AGB);
		setAgb(AGB.toFixed(2));
		setBlue(BLUE.toFixed(2));
		setGreen(GREEN.toFixed(2));
		setRed(RED.toFixed(2));
		setNir(NIR.toFixed(2));
		setSwir1(SWIR1.toFixed(2));
		setSwir2(SWIR2.toFixed(2));
		setVv(VV.toFixed(2));
		setVh(VH.toFixed(2));
		setNbr(NBR.toFixed(2));
		setMndwi(MNDWI.toFixed(2));
		setRi(RI.toFixed(2));
	}

	// Use effect everytime the map is clicked
	useEffect(() => {
		if (coord) {
			const coordinate = { lat: coord.lat, lng: coord.lng };
			const pointData = point([ coordinate.lng, coordinate.lat ]);

			if (booleanIntersects(pointData, roi)) {
				callValue(coordinate);
				setMessage(undefined);
			} else {
				setMessage('Clicked point is outside of the region');
			}
		}
	}, [coord]);

	return (
		<>
			<div style={{ textAlign: 'center' }}>
				Click on map to see value!
			</div>

			<Grid 
				columns={['Variable', 'Value', 'Unit']}
				data={[
					['AGB', agb, 'Ton/Ha'],
					['BLUE', blue, 'Reflectance'],
					['GREEN', green, 'Reflectance'],
					['RED', red, 'Reflectance'],
					['NIR', nir, 'Reflectance'],
					['SWIR1', swir1, 'Reflectance'],
					['SWIR2', swir2, 'Reflectance'],
					['VV', vv, 'dB'],
					['VH', vh, 'dB'],
					['NBR', nbr, 'Unitless'],
					['MNDWI', mndwi, 'Unitless'],
					['RI', ri, 'Unitless']
				]}
			/>

			<div id='table-message' style={{ color: messageColor, textAlign: 'center' }} onClick={() => setMessage(undefined)}>
				{message}
			</div>	
		</>
	)
}