export default function Info(){
	return (
		<div id='info' className="flexible vertical center1">
			
			<h2>Documentation</h2>

			<div>

				<div>
					<h4>Data sources</h4>
					The data used to create the Above Ground Biomass map are:
					Sentinel-2 and Sentinel-1.
					Both data have 10-meter resolution. Which is the highest for free satellite. 
					Both data are acquired in 06-01-2023.
					Samples data is acquired from Space4Good.
					The reason the selected data is from 06-01-2023 because it has the highest correlation with the samples.
				</div>

				<div>
					<h4>Data preprocess</h4>
					Both data sources will be use to generate spectral indices such as EVI, NDBI, NDWI, MNDWI, NBR, RI (normalized difference between Sentinel-1 VV dan VH band), and many more.
					After trying multiple correlation with the samples, it is selected the most importance variables.
					The most importance features are MNDWI, NBR, and RI.
				</div>

				<div>
					<h4>Features extraction</h4>
					The selected features with best importance then used as features for the model where the AGB from the samples is used as label.
					The samples then used to extract the value of the features.
				</div>

				<div>
					<h4>Model training & accuracy assessment</h4>
					The samples is split randomly to train and test with 4:1 ratio.
					The model used to train the data is Random Forest Regression. It is used because of it ability to regress non-linear data with high accuracy.
					The model will be applied to test data to check the accuracy.
				</div>

			</div>

		</div>	
	)
}