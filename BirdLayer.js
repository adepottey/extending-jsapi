export default (BaseLayerView2D, Layer) => {
  const CustomBirdLayerView2D = BaseLayerView2D.createSubclass({
    render: function (renderParameters) {
      const state = renderParameters.state;
      const ctx = renderParameters.context;

      this.layer.graphics.forEach((graphic) => {
        const mapCoords = [graphic.geometry.x, graphic.geometry.y];
        var screenCoords = state.toScreen([0, 0], mapCoords[0], mapCoords[1]);
        // if no images are drawing, check to make sure that the image's onload callback has fired before creating the layerview
        ctx.drawImage(this.layer.image, screenCoords[0], screenCoords[1]);
      });
    },
  });

  var BirdLayer = Layer.createSubclass({
    graphics: [],
    image: undefined,

    createLayerView: function (view) {
      if (view.type !== "2d") {
        return;
      }

      return new CustomBirdLayerView2D({
        view: view,
        layer: this,
      });
    },
  });

  return BirdLayer;
};
