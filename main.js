//const birdSitingUrl = "https://bird-sitings-api.herokuapp.com/sitings";
const birdSitingUrl = "http://localhost:3000/sitings";

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

  esriRequest(birdSitingUrl).then((resp) => {
    const birdSitings = resp?.data?.sitings?.map((s) => {
      return {
        attributes: s,
        geometry: new Point({ latitude: s.y, longitude: s.x }),
      };
    });
    console.log(birdSitings);

    // feature layer
    const fields = [
      { name: "birdname", alias: "Bird Name", type: "string" },
      { name: "timestamp", alias: "Date Sighted", type: "date" },
    ];
    const renderer = {
      type: "simple",
      symbol: {
        type: "simple-marker",
        size: 12,
        color: [50, 104, 114, 0.8],
        outline: "white",
      },
    };
    let featureLayer = new FeatureLayer({
      title: "Bird Sitings",
      source: birdSitings,
      renderer: renderer,
      objectIdField: "objectid",
      fields,
      popupEnabled: true,
    });

    map.add(featureLayer);

    // custom layer view
    const BirdLayer = BirdLayerModule(BaseLayerView2D, Layer);
    const graphics = birdSitings
      .filter((g) => g.geometry && g.geometry.spatialReference)
      .map(
        (g) =>
          new Graphic({
            attributes: g.attributes,
            geometry: webMercatorUtils.geographicToWebMercator(g.geometry),
          })
      );

    // wrapper for HtmlImageElement onload / onerror
    const loadImage = (src, img) => {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const promises = ["House Finch"].map((n) => {
      return loadImage("images/house-finch.jpg", new Image());
    });
    Promise.all(promises).then((images) => {
      const birdLayer = new BirdLayer({
        title: "Bird Siting Photo Layer",
        graphics,
        image: images[0],
      });
      map.add(birdLayer);
    });
  });
});
