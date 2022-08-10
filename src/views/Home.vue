<template>
  <div class="home">
    <div>
      <img v-show="false" ref="pic" src="../assets/happy.png">
      <canvas ref="canvas" @click="onclick">Browser does not support HTML5 canvas</canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      width: 0,
      height: 0,
      colourData: [],
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
        console.log(data)
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

      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, this.width, this.height);
      console.log('Begin processing image data');
      console.time('Process')
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