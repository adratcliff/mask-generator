<template>
  <div class="home">
    <div>
      <img ref="pic" src="../assets/spider-man.jpg">
      <canvas ref="canvas" @click="onclick">Browser does not support HTML5 canvas</canvas>
    </div>
  </div>
</template>

<script>
// Targets for Happy
// const targets = [
//   { r: 54,  g: 148, b: 187, a: 255 }, // Light Blue
//   { r: 9,   g: 73,  b: 103, a: 255 }, // Dark Blue
//   { r: 127, g: 179, b: 143, a: 255 }, // Light Green
//   { r: 58,  g: 109, b: 72,  a: 255 }, // Dark green
//   { r: 211, g: 203, b: 229, a: 255 }, // White
// ];

// Targets for Spider-Man
const targets = [
  { r: 102, g: 21,  b: 19,  a: 255 }, // Red
  { r: 6,   g: 2,   b: 3,   a: 255 }, // Black
  { r: 85,  g: 104, b: 136, a: 255 }, // Blue
  { r: 156, g: 89,  b: 55,  a: 255 }, // Orange
];

export default {
  name: 'home',
  data() {
    return {
      width: 0,
      height: 0,
      colourData: [],
      ctx: null,
      processor: null,
    };
  },
  methods: {
    transformTo2d(data) {
      return data.reduce((acc, cur, idx) => {
        acc[Math.floor(idx / this.width)].push(cur);
        return acc;
      }, Array.from(new Array(this.width)).map(() => []));
    },
    onclick(e) {
      const x = e.offsetX;
      const y = e.offsetY;
      console.log(x,y)
    },
  },
  mounted() {
    if (window.Worker) {
      this.processor = new Worker('imageProcessor.js');
      this.processor.onmessage = ({ data }) => {
        this.ctx.putImageData(new ImageData(new Uint8ClampedArray(data), this.width, this.height), 0, 0);
        console.timeEnd('Process');
      };
    }

    const img = this.$refs.pic;
    img.addEventListener('load', () => {
      this.width = img.naturalWidth;
      this.height = img.naturalHeight;

      const c = this.$refs.canvas;
      c.width = this.width;
      c.height = this.height;

      this.ctx = c.getContext('2d');
      this.ctx.drawImage(img, 0, 0);

      const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
      console.log('Begin processing image data');
      console.time('Process')

      this.processor.postMessage({ img: imgData, targets });
    });
  },
  filters: {
    capitalise(val) {
      return val.split('')[0].toUpperCase() + val.slice(1);
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  max-width: 40vw;
}

.color-record {
  display: flex;
  align-items: center;
  justify-content: center;
  .sampler {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
}
</style>