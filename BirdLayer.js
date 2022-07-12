const borderInPx = 8;

export default (BaseLayerView2D, Layer) => {
  const CustomBirdLayerView2D = BaseLayerView2D.createSubclass({
    render: function ({ state, context }) {
      this.layer.points.forEach((point, i) => {
        // get the screen coordinates for our point
        const screenCoords = state.toScreen(
          [0, 0],
          point.geometry.x,
          point.geometry.y
        );
        const image = this.layer.images[i];
        // background rectangle / border with upper-left corner at the point
        context.fillStyle = "black";
        context.fillRect(
          screenCoords[0],
          screenCoords[1],
          image.width + 2 * borderInPx,
          image.height + 2 * borderInPx
        );
        // draw image
        context.drawImage(
          image,
          screenCoords[0] + borderInPx,
          screenCoords[1] + borderInPx
        );
        // add text
        context.fillStyle = "white";
        context.font = "40px Arial";
        context.fillText(
          point.attributes.birdname,
          screenCoords[0] + borderInPx,
          screenCoords[1] + 40 + borderInPx
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
