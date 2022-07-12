// const birdsightingUrl = "https://bird-sitings-api.herokuapp.com/sightings";
const birdsightingUrl = "http://localhost:3000/sightings";

import BirdLayerModule from "./BirdLayer.js";

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/request",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/views/2d/layers/BaseLayerView2D",
  "esri/layers/Layer",
  "esri/geometry/support/webMercatorUtils",
], (
  Map,
  MapView,
  FeatureLayer,
  esriRequest,
  Graphic,
  Point,
  BaseLayerView2D,
  Layer,
  webMercatorUtils
) => {
  // custom layer view
  const BirdLayer = BirdLayerModule(BaseLayerView2D, Layer);

  const map = new Map({
    basemap: "topo-vector",
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,

    extent: {
      xmin: -117.22623753491341,
      ymin: 34.03166095348598,
      xmax: -117.0943157667251,
      ymax: 34.0868401321003,
      spatialReference: 4326,
    },
  });
  view.popup.defaultPopupTemplateEnabled = true;

  /* FEATURE LAYER with CUSTOM DATA */
  // custom data source request
  esriRequest(birdsightingUrl).then((resp) => {
    const birdSightings = resp?.data?.sightings?.map((s) => {
      return {
        attributes: s,
        geometry: new Point({ latitude: s.lat, longitude: s.long }),
      };
    });

    // feature layer
    const renderer = {
      type: "simple",
      symbol: {
        type: "simple-marker",
        size: 12,
        color: [50, 104, 114, 0.8],
        outline: "white",
      },
    };
    const featureLayer = new FeatureLayer({
      title: "Bird sightings",
      source: birdSightings,
      renderer: renderer,
      objectIdField: "objectid",
      fields: [
        { name: "birdname", alias: "Bird Name", type: "string" },
        { name: "timestamp", alias: "Date Sighted", type: "date" },
      ],
      popupEnabled: true,
    });

    map.add(featureLayer);
  });

  /* CUSTOM LAYER DATA */
  // custom data source request
  esriRequest(birdsightingUrl).then((resp) => {
    // create list of feature-like objects
    const birdSightings = resp?.data?.sightings?.map((s) => {
      const point = new Point({ latitude: s.lat, longitude: s.long });
      return {
        attributes: s,
        geometry: webMercatorUtils.geographicToWebMercator(point),
      };
    });
    console.log(birdSightings);

    // wrapper for HtmlImageElement onload / onerror
    const loadImage = (src, img) => {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const imgPromises = birdSightings.map((s) => {
      return loadImage(
        `images/${s.attributes.birdname
          .replaceAll(" ", "-")
          .toLowerCase()}.jpg`,
        new Image()
      );
    });

    Promise.all(imgPromises).then((images) => {
      const birdLayer = new BirdLayer({
        title: "Bird Sighting Photo Layer",
        points: birdSightings,
        images,
      });
      map.add(birdLayer);
    });
  });
});
