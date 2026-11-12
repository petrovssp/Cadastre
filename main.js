import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ.js';
import LayerGroup from 'ol/layer/Group.js';
import { TileWMS } from 'ol/source';
import Graticule from 'ol/layer/Graticule.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';

proj4.defs("EPSG:7801","+proj=lcc +lat_0=42.6678756833333 +lon_0=25.5 +lat_1=42 +lat_2=43.3333333333333 +x_0=500000 +y_0=4725824.3591 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);
proj4.defs("EPSG:7800","+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

//Създаване на изглед
const view = new View ({
    center: [2521504, 5286881],
    zoom: 13
})

//Създаване на карта
const map = new Map({
  target: 'map',
  view: view
});

//Добавяне на базови слоеве в картата
const osmMap = new TileLayer({
  source: new OSM(),
  visible: true,
  title: 'OSM'
})

const googleSat = new TileLayer({
  source: new XYZ ({
    url: 'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
  }),
  visible: false,
  title: 'googleSat'
})

//Групиране на базовите слоеве в група

const baseLayerGroup = new LayerGroup({
  layers: [osmMap, googleSat]
})

map.addLayer(baseLayerGroup);


//Превключване на слоевете за базовите карти

const baseLayerElements = document.querySelectorAll('.basemaps > input[type=radio]');
for(let baseLayerElement of baseLayerElements){
  baseLayerElement.addEventListener('change', function(){
    let baseLayerElementValue = this.value;
    baseLayerGroup.getLayers().forEach(function(element, index, array){
      let baseLayerTitle = element.get('title');
      element.setVisible(baseLayerTitle===baseLayerElementValue);
    })
  })
}

//Добавяне на слоеве от Geoserver за област 

const Immovable = new TileLayer({
  source: new TileWMS({
  url: 'https://geoserver.ssp-bg.com/geoserver/Cadastre/wms',
  params:{'VERSION':'1.1.0', tiled: true, 'LAYERS':'Cadastre:immovable'},
  serverType: 'geoserver',
  visible: true
  })
})

const Buildings = new TileLayer({
  source: new TileWMS ({
  url: 'https://geoserver.ssp-bg.com/geoserver/Cadastre/wms',
  params:{'VERSION':'1.1.0', tiled: true, 'LAYERS':'Cadastre:buildings'},
  serverType: 'geoserver',
  visible: true
  })
})


//Групиране на основните слоеве в група
const layersGroup = new LayerGroup ({
  layers: [Immovable, Buildings]
})

map.addLayer(layersGroup);


//Включване и изключване на слоеве

const LayerElements = document.querySelectorAll('.mymaps > input[type=checkbox]');
for(let LayerElement of LayerElements){
  console.log(LayerElements),
  LayerElement.addEventListener('change', function(){
      //console.log(this.Id, this.checked);
      let LayerElementValue = this.value;
      let LayerElementId = this.id;
      let LayerElementCheck = this.checked;
      layersGroup.getLayers().forEach(function(element, index, array){
          let LayerIndex = index;
          if (LayerIndex === parseInt(LayerElementId)){
          element.setVisible(LayerElementCheck);
      };
      })
  })
} 

const myGraticule = new Graticule ({
  showLabels: true
})
map.addLayer(myGraticule);

const scaleBar = new ScaleLine ({
  text: true,
  bar: true,
  steps: 6,
  minWidth: 140
})
map.addControl(scaleBar)

const mouseCoordinates = new MousePosition ({
  coordinateFormat: createStringXY(0),
  projection:'EPSG:7801'
})
map.addControl(mouseCoordinates);

//Избор на проекция за координатите на курсура на мишката

const projectionSelect = document.getElementById('Myprojection');
projectionSelect.addEventListener('change', function(event){
 mouseCoordinates.setProjection(event.target.value);
});


//Изтегляне на векторни данни за Поземлени имоти в geoJSON format 

document.getElementById('download0').addEventListener('click', function () {

  const url = "https://geoserver.ssp-bg.com/geoserver/Cadastre/ows" +
              "?service=WFS&version=1.0.0&request=GetFeature" + 
              "&typeName=Cadastre%3Aimmovable&outputFormat=application%2Fjson";

  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = "Immovable.geojson";
      link.click();
    });
});

//Изтегляне на векторни данни за Сгради в geoJSON format 

document.getElementById('download1').addEventListener('click', function () {

  const url = "https://geoserver.ssp-bg.com/geoserver/Cadastre/ows" +
              "?service=WFS&version=1.0.0&request=GetFeature" + 
              "&typeName=Cadastre%3Abuildings&outputFormat=application%2Fjson";

  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = "Buildings.geojson";
      link.click();
    });
});


//Информация за обекти

map.on('singleclick', function (evt) {
  const viewResolution = map.getView().getResolution();

  const layersToQuery = [
    { name: "Инфо за имот", layer: Immovable },
    { name: "Инфо за сграда", layer: Buildings }
  ];

  const clickableLayers = [];

  const promises = layersToQuery.map(item => {
    const url = item.layer.getSource().getFeatureInfoUrl(
      evt.coordinate,
      viewResolution,
      'EPSG:3857',
      { 'INFO_FORMAT': 'application/json' }
    );

    return fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.features.length > 0) {
          clickableLayers.push({
            name: item.name,
            data: data
          });
        }
      });
  });

  Promise.all(promises).then(() => {
    const choiceDiv = document.getElementById('layerChoice');
    const infoDiv = document.getElementById('info');

    // Скрива старото инфо
    infoDiv.style.display = 'none';
    infoDiv.innerHTML = "";

    // Нулира менюто
    choiceDiv.innerHTML = "";

    // Няма обекти
    if (clickableLayers.length === 0) {
      choiceDiv.style.display = 'none';
      return;
    }

    // Само един слой има обект → директно показваме инфото
    if (clickableLayers.length === 1) {
      choiceDiv.style.display = 'none';
      showFeatureInfo(clickableLayers[0].data, evt.pixel);
      return;
    }

    // Два или повече слоя
    choiceDiv.style.display = 'flex';
    choiceDiv.style.flexDirection = 'row';
    choiceDiv.style.gap = '10px';

    clickableLayers.forEach(item => {
      const btn = document.createElement('button');
      btn.textContent = item.name;
      btn.style.display = "block";
      btn.style.marginBottom = "5px";

      btn.onclick = () => {
        showFeatureInfo(item.data, evt.pixel);
      };

      choiceDiv.appendChild(btn);
    });

   });
});


function showFeatureInfo(data) {
  const infoDiv = document.getElementById('info');

  const props = data.features[0].properties;

  infoDiv.innerHTML = `
    <b>Информация:</b><br>
    ${Object.entries(props)
      .map(([k, v]) => `${k}: ${v}`)
      .join("<br>")}
  `;

  infoDiv.style.display = 'block';
}
