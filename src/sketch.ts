// import { Vec2, Utils } from '@code-not-art/core';
import {
  Canvas,
  Color,
  Noise,
  Structures,
  Utils,
  Vec2,
  Constants,
} from '@code-not-art/core';
import {
  Sketch,
  SketchProps,
  Params,
  Config,
  FrameData,
} from '@code-not-art/sketch';
import { PaletteType } from '@code-not-art/sketch/dist/sketch/Config';
import { jitterColor } from './utils';
const { repeat } = Utils;
const { TAU } = Constants;

const config = Config({
  menuDelay: 0,
  paletteType: PaletteType.Random,
});

const params = {
  headerUiControls: Params.header('UI Controls'),
  showPalette: Params.checkbox('Show Palette Legend', false),
  headerFlowField: Params.header('Flow Field'),
  visualizeField: Params.checkbox('Visualize Field', false),
  divisions: Params.range('Field Divisions', 100, {
    max: 150,
    min: 0,
    step: 1,
  }),
  vectorWidth: Params.range('Vector Width', 0.5),
  vectorAngle: Params.range('Vector Angle', 0.5),
  noiseResolution: Params.range('Noise Resolution', 1, { max: 5 }),
  useCurl: Params.checkbox('Use Curl', false),
  headerAgents: Params.header('Agents'),
  agentCount: Params.range('Agent Count', 500, { max: 5000, step: 1 }),
  agentSteps: Params.range('Agent Steps', 10, { max: 50, step: 1 }),
  preciseSteps: Params.checkbox('Precise Steps', false),
  useNoise: Params.checkbox('Use Extra Noise', false),
  extraNoiseAmplitude: Params.range('Extra Noise Amplitude', 0.5),
  highlightSize: Params.range('Highlight Size', 0.1),
  colorSelect: Params.select('Color System', 'monochrome', [
    'monochrome',
    'highlight',
    'palette',
  ]),
};
const data = {};

type Props = SketchProps<typeof params, typeof data>;

/**
 * Init is run once on startup, but then not again until the page is refreshed.
 * This can be used for any programatic setup that needs RNG or other sketch properties and that should only ever be run once.
 * @param sketchProps {SketchProps} - Access to canvas context, RNG, color pallete, parameter values, and persistent data
 */
const init = ({}: Props) => {
  console.log('Initializing Sketch...');
};

/**
 * Reset does not run the first time the sketch is drawn, instead it is run between redraws of the sketch.
 * This can be used to reset the data in the sketch props that is passed to the draw and loop methods, or other setup tasks.
 * Note that the canvas is not cleared by default, but can be done here or at the start of hte draw method.
 * @param sketchProps {SketchProps} - Access to canvas context, RNG, color pallete, parameter values, and persistent data
 */
const reset = ({}: Props) => {
  console.log('Resetting Sketch...');
};

/**
 * Runs once for the sketch, after data initialization and before the animation loop begins.
 * @param sketchProps {SketchProps} - Access to canvas context, RNG, color pallete, parameter values, and persistent data
 */
const draw = ({ canvas, palette, params, rng }: Props) => {
  console.log('Drawing Sketch...');

  const isPalette = params.colorSelect.value === 'palette';
  const isHighlight = params.colorSelect.value === 'highlight';
  const background = isPalette ? palette.colors[0] : new Color('#101214');
  const highlightOrigin = new Vec2(
    rng.float(0.45, 0.55),
    rng.float(0.45, 0.55),
  );

  const colors = isPalette
    ? palette.colors.slice(1)
    : [
        new Color('#444'),
        new Color('#777'),
        new Color('#aaa'),
        new Color('#ccc'),
        // new Color('#eee'),
      ];

  canvas.fill(background);

  const octaves = [1];
  const preciseStepSize = 0.001;
  const largeStepSize = 0.02;

  const noiseA = Noise.simplex3(rng.int(0, 1000000), { octaves });
  const noiseB = Noise.simplex3(rng.int(0, 1000000), {
    octaves: [1, 2],
    frequency: 10,
  });

  const getNoiseAngle = (position: Vec2): number => {
    return noiseA(position.x, position.y, params.vectorAngle.value * 3) * TAU;
  };

  /**
   *
   * @param position uv coordinates from the grid position (0-1 values)
   * @returns
   */
  const getCurlAngle = (position: Vec2): number => {
    const delta = 0.03;
    const x0 = position.x;
    const x1 = position.x + delta;
    const y0 = position.y;
    const y1 = position.y + delta;
    const z = params.vectorAngle.value * 3;

    const dx = (noiseA(x1, y0, z) - noiseA(x0, y0, z)) / delta;
    const dy = (noiseA(x0, y1, z) - noiseA(x0, y0, z)) / delta;
    return new Vec2(dy, dx).angle();
    // const value = dy;
    // return value * TAU;
    // return (position.x + position.y) * params.vectorAngle.value * TAU;
    // return rng.next() * TAU;
    // return 0;
  };

  const getAngle = (uv: Vec2): number =>
    params.useCurl.value
      ? getCurlAngle(uv.scale(params.noiseResolution.value))
      : getNoiseAngle(uv.scale(params.noiseResolution.value));

  const getAmplitude = (position: Vec2): number => {
    const value =
      noiseB(position.x, position.y, params.vectorAngle.value * 3) + 0.5;
    // return Utils.clamp(value * 5, { max: 20 });
    return 5;
  };

  const horizontalDiv = canvas.get.width() / (params.divisions.value + 1);
  const verticalDiv = canvas.get.height() / (params.divisions.value + 1);
  const strokeWidth =
    (params.vectorWidth.value * Math.min(horizontalDiv, verticalDiv)) / 2;
  const visualizeField = () => {
    rng.push('draw field');
    const centers = Structures.grid({
      columns: params.divisions.value,
      rows: params.divisions.value,
    });
    centers.forEach((tile) => {
      const center = tile.uv
        .scale(canvas.get.maxDim())
        .add(canvas.get.maxDim() / (1 + params.divisions.value) / 2);
      const angle = getAngle(tile.uv);
      const amplitude = getAmplitude(tile.uv);

      // canvas.draw.circle({
      //   center: center,
      //   radius,
      //   fill: rng.chooseOne(palette.colors),
      // });

      const start = center;
      canvas.draw.line({
        start,
        end: start.add(Vec2.unit().rotate(angle).scale(amplitude).scale(7)),
        stroke: {
          color: new Color('white').set.alpha(0.7),
          width: strokeWidth * 2,
        },
      });
    });
    rng.pop();
  };

  const uvToCanvas = (uv: Vec2): Vec2 => uv.scale(canvas.get.size());

  const agentStep = (uv: Vec2, amplitude: number): Vec2 => {
    const angle = getAngle(uv);
    const stepSize = params.preciseSteps.value
      ? preciseStepSize
      : largeStepSize;
    const mainStep = Vec2.unit()
      .rotate(angle)
      .scale(stepSize * amplitude);
    // const noiseStep = Vec2.unit()
    //   .rotate(noiseB(uv.x, uv.y, 0))
    //   .scale(
    //     params.useNoise.value
    //       ? stepSize *
    //           params.extraNoiseAmplitude.value *
    //           amplitude *
    //           uv.diff(new Vec2(0.5, 0.5)).magnitude()
    //       : 0,
    //   );
    // return uv.add(mainStep).add(noiseStep);
    const noiseStep = mainStep.rotate(
      noiseB(uv.x, uv.y, 0) *
        (params.useNoise.value ? params.extraNoiseAmplitude.value : 0),
    );
    return uv.add(noiseStep);
  };

  const drawAgent = (id: number) => {
    let pos = new Vec2(rng.float(-0.01, 1.01), rng.float(-0.01, 1.01));
    const path = new Structures.Path(uvToCanvas(pos));

    const highlightTest = (pos: Vec2) =>
      pos.diff(highlightOrigin).magnitude() < params.highlightSize.value;
    let highlightedAgent = highlightTest(pos);

    repeat(
      params.agentSteps.value *
        (params.preciseSteps.value ? largeStepSize / preciseStepSize : 1),
      (_, stop) => {
        pos = agentStep(pos, id % 2 ? 1 : -1);
        if (!pos.within(canvas.get.size())) {
          stop();
        }
        highlightedAgent = highlightedAgent || highlightTest(pos);
        path.line(uvToCanvas(pos));
      },
    );

    rng.push('color select');
    const lineColor =
      isHighlight && ((highlightedAgent && rng.bool(0.85)) || rng.bool(0.04))
        ? jitterColor(rng.chooseOne(palette.colors.slice(1, 3)), rng)
        : rng.chooseOne(colors);
    rng.pop();

    canvas.draw.path({
      path,
      stroke: {
        color: lineColor.set.alpha(0.7),
        width: strokeWidth,
      },
    });
  };

  const drawAgents = () => {
    repeat(params.agentCount.value, (index) => drawAgent(index));
  };

  if (params.visualizeField.value) {
    visualizeField();
  } else {
    drawAgents();
  }

  if (params.showPalette.value) {
    drawLegend(canvas, palette.colors);
  }
};

export default Sketch<typeof params, typeof data>({
  config,
  params,
  initialData: data,
  init,
  draw,
  // loop,
  reset,
});

/**
 * Draws a legend, a sight to behold
 * With colors that will never grow old
 */
function drawLegend(canvas: Canvas, colors: Color[]) {
  const legendRadius = 25;

  colors.forEach((color, index) => {
    const center = new Vec2(
      legendRadius * 2,
      legendRadius * 2 + index * legendRadius * 2.8,
    );
    canvas.draw.circle({
      radius: legendRadius * 1.3,
      center,
      fill: 'white',
    });
    canvas.draw.circle({
      radius: legendRadius,
      center,
      fill: color.rgb(),
    });
  });
}
