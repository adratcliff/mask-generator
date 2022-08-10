<template>
  <div class="home">
    <div>
      <img v-show="false" ref="pic" src="../assets/happy.png">
      <canvas ref="canvas" @click="onclick">Browser does not support HTML5 canvas</canvas>
    </div>
  </div>
</template>

<script>
import rgbToHsl from '../utils/rgbToHsl';

const hslCategories = [ 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta' ];

export default {
  name: 'home',
  data() {
    return {
      hslCategories,
      width: 0,
      height: 0,
      rgba: {
        red: [],
        green: [],
        blue: [],
        alpha: [],
      },
      colorData: [],
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
      let x = e.offsetX, y = e.offsetY;
      console.log(x,y)
      console.log(this.getRgbaValue(x, y, this.rgba2d), rgbToHsl(this.getRgbaValue(x, y, this.rgba2d)))
    },
    getRgbaValue(x, y, rgba) {
      return {
        r: rgba.red[y][x],
        g: rgba.green[y][x],
        b: rgba.blue[y][x],
        a: rgba.alpha[y][x],
      };
    },
  },
  mounted() {
    if (window.Worker) {
      this.processor = new Worker('imageProcessor.js');
      this.processor.onmessage = ({ data }) => console.log('proc', data)
    }

    const img = this.$refs.pic;
    img.addEventListener('load', () => {
      this.width = img.naturalWidth;
      this.height = img.naturalHeight;

      const c = this.$refs.canvas;
      c.width = this.width;
      c.height = this.height;

      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, this.width, this.height);
      this.processor.postMessage(imgData);
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