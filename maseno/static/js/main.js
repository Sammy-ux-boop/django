var osmMap=L.tileLayer.provider("OpenStreetMap.Mapnik");
var stadia=L.tileLayer.provider("Stadia.AlidadeSmoothDark");
var basemaps={
    'OSM':osmMap,
    'Stadia Map':stadia
}
var wardsLayer="County_Makueni:Wards"
var RoadCLayer="County_Makueni:ClassC"
var RoadABLayer="County_Makueni:ClassAandB"
var wardsLayer=L.tileLayer.wms(
    "http://localhost:8080/geoserver/County_Makueni/wms",
    {
        layers:wardsLayer,
        Format:"image/png",
        transparent:true,
        version:"1.1.0",
        tiled:true
    }
)
var RoadC=L.tileLayer.wms(
    "http://localhost:8080/geoserver/County_Makueni/wms",
    {
        layers:RoadCLayer,
        Format:"image/png",
        transparent:true,
        version:"1.1.0",
        tiled:true
    }
)
var RoadsAB=L.tileLayer.wms(
    "http://localhost:8080/geoserver/County_Makueni/wms",
    {
        layers:RoadABLayer,
        Format:"image/png",
        transparent:true,
        version:"1.1.0",
        tiled:true
    }
)
var overlayMaps={
    "Makueni Wards":wardsLayer,
    "Road Class A and B":RoadsAB,
    "Road Class C":RoadC,
}

var map=L.map('map',{
    center:[-2.2559,37.8937],
    zoom:13,
    layers:[stadia]
});

var mapLayers=L.control.layers(basemaps,overlayMaps).addTo(map)
