// List of the area polygon (Area 1)
var tempelhof1 = ee.Geometry.Polygon([
    [
      [13.3992395, 52.4751637],
      [13.3976945, 52.4787709],
      [13.3926735, 52.4770719],
      [13.3928022, 52.4747978],
      [13.3992395, 52.4751637]
    ]
]);
  
// List of the area polygon (Area 2)
var tempelhof2 = ee.Geometry.Polygon([
[
    [13.4117279, 52.4756604],
    [13.4099683, 52.4760525],
    [13.4082517, 52.4763139],
    [13.4064064, 52.4764184],
    [13.4044752, 52.4765491],
    [13.4033594, 52.4766276],
    [13.4026298, 52.4765753],
    [13.4013424, 52.4762877],
    [13.3994112, 52.4758172],
    [13.400012, 52.4751376],
    [13.4117279, 52.4756604]
]
]);

// List of the area polygon (Area 3)
var tempelhof3 = ee.Geometry.Polygon([
[
    [13.4038744, 52.4666936],
    [13.4041748, 52.4705367],
    [13.3966217, 52.4704321],
    [13.3976945, 52.469308],
    [13.397952, 52.4685498],
    [13.3976945, 52.4678178],
    [13.4038744, 52.4666936]
]
]);
  
// Display the polygon on the map
Map.centerObject(tempelhof1, 13);
Map.addLayer(tempelhof1, {color: 'FF0000'}, 'Area 1');
Map.addLayer(tempelhof2, {color: 'FF0000'}, 'Area 2');
Map.addLayer(tempelhof3, {color: 'FF0000'}, 'Area 3');
  
// Function to calculate NDVI
function calculateNDVI(image) {
    var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
    return image.addBands(ndvi).set('system:time_start', image.get('system:time_start'));
}
  
// collection of ndvi data per month
function collectionNDVI(polygon) {
    
    // Load Landsat 8 Collection 2 Tier 1 image collection (surface reflectance)
    var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .filterBounds(polygon)
      .filterDate('2016-01-01', ee.Date(Date.now()))
      .map(function(image) {
        // Apply scaling factors for the Landsat 8 Collection 2
        var opticalBands = image.select(['SR_B4', 'SR_B5'])
                                .multiply(0.0000275)
                                .add(-0.2);
        return image.addBands(opticalBands, null, true);
      })
      .map(calculateNDVI)
      .select('NDVI');
    
    // Function to get NDVI by month
    var monthlyNDVI = ee.List.sequence(2016, ee.Date(Date.now()).get('year')).map(function(year) {
      return ee.List.sequence(1, 12).map(function(month) {
        var start = ee.Date.fromYMD(year, month, 1);
        var end = start.advance(1, 'month');
        var monthlyCollection = collection.filterDate(start, end);
        
        // Check if the collection for the month is empty
        var count = monthlyCollection.size();
        return ee.Algorithms.If(count.gt(0), 
          // If there are images, calculate the mean NDVI for the month
          ee.Feature(null, {
            'NDVI': monthlyCollection.mean().reduceRegion({
              reducer: ee.Reducer.mean(),
              geometry: polygon,
              scale: 30
            }).get('NDVI'),
            'month': month,
            'year': year
          }),
          // If no images, return null values for NDVI
          ee.Feature(null, {
            'NDVI': null,
            'month': month,
            'year': year
          })
        );
      });
    }).flatten();
  
    // Convert to a FeatureCollection for export or further use
    return ee.FeatureCollection(monthlyNDVI);
}

print(collectionNDVI(tempelhof1));
print(collectionNDVI(tempelhof2));
print(collectionNDVI(tempelhof3));