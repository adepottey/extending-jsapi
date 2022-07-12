export default (BaseLayerView2D, Layer) => {
  const CustomBirdLayerView2D = BaseLayerView2D.createSubclass({
    render: function ({ state, context }) {
      this.layer.points.forEach((graphic, i) => {
        // get the screen coordinates for our point
        var screenCoords = state.toScreen(
          [0, 0],
          graphic.geometry.x,
          graphic.geometry.y
        );
        // draw image with upper-left corner at the point
        context.drawImage(
          this.layer.images[i],
          screenCoords[0],
          screenCoords[1]
        );
      });
    },
  });

  var BirdLayer = Layer.createSubclass({
    points: [],
    images: [],

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
