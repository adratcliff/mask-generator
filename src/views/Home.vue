<template>
  <div class="home">
    <div class="images">
      <img ref="pic" :src="imageSrc" @click="onclick">
      <canvas ref="canvas" @click="onclick">Browser does not support HTML5 canvas</canvas>
    </div>
    <div class="controls">
      <div class="file-selection">
        <h5>File</h5>
        <input
          type="file"
          accept="image/*"
          @change="selectFile" />
      </div>
      <div class="colour-selection">
        <h5>Colours</h5>
        <div
          v-for="(col, idx) in targets"
          :key="`col-${idx}`"
          class="colour-record">
          <span class="colour-item">
            <input
              type="color"
              :value="getHex(col)"
              @change="setColour($event, idx)" />
            <span class="colour-code">{{ col | formatRgba }}</span>
          </span>
          <span class="colour-btns">
            <button
              type="button"
              class="btn remove-btn"
              @click="removeColour(idx)">
              x
            </button>
          </span>
        </div>
        <div class="buttons small">
          <button
            type="button"
            class="btn add-btn"
            @click="addNewColour">
            Add New Colour
          </button>
          <button
            type="button"
            class="btn select-btn"
            @click="selectNewColour">
            Select New Colour
          </button>
        </div>
      </div>
      <div class="buttons">
        <button
          type="button"
          class="btn generate-btn"
          @click="generate">
          Generate
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Targets for Happy
const defaultTargets = [
  { r: 54,  g: 148, b: 187, a: 255 }, // Light Blue
  { r: 9,   g: 73,  b: 103, a: 255 }, // Dark Blue
  { r: 127, g: 179, b: 143, a: 255 }, // Light Green
  { r: 58,  g: 109, b: 72,  a: 255 }, // Dark green
  { r: 211, g: 203, b: 229, a: 255 }, // White
];

// Targets for Spider-Man
// const defaultTargets = [
//   { r: 102, g: 21,  b: 19,  a: 255 }, // Red
//   { r: 156, g: 89,  b: 55,  a: 255 }, // Orange
//   { r: 85,  g: 104, b: 136, a: 255 }, // Blue
//   { r: 116, g: 109, b: 125, a: 255 }, // Gray
//   { r: 6,   g: 2,   b: 3,   a: 255 }, // Black
// ];

export default {
  name: 'home',
  data() {
    return {
      width: 0,
      height: 0,
      ratio: 0,
      colourData: [],
      ctx: null,
      processor: null,
      imgData: null,
      imageSrc: require('../assets/grogu-rock.png'),
      targets: [ ...defaultTargets ],
      selectingColour: false,
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
      if (!this.selectingColour) return;
      const x = Math.round(e.offsetX * this.ratio);
      const y = Math.round(e.offsetY * this.ratio);
      const firstElement = (y * this.width * 4) + (x * 4);

      const rgba = {
        r: this.imgData.data[firstElement],
        g: this.imgData.data[firstElement + 1],
        b: this.imgData.data[firstElement + 2],
        a: this.imgData.data[firstElement + 3],
      };

      this.targets.push(rgba);
      this.selectingColour = false;
    },
    selectFile(evt) {
      if (!evt.target.files.length) return;
      const reader = new FileReader();
      reader.onload = () => this.imageSrc = reader.result;
      reader.readAsDataURL(evt.target.files[0]);
    },
    removeColour(idx) {
      this.targets.splice(idx, 1);
    },
    selectNewColour() {
      this.selectingColour = true;
    },
    getHex({ r, g, b }) {
      return '#' + [r, g, b].map(val => val.toString(16)).join('');
    },
    setColour(evt, idx) {
      const hexToDec = start => parseInt(evt.target.value.slice(start, start + 2), 16);
      this.$set(this.targets, idx, {
        r: hexToDec(1),
        g: hexToDec(3),
        b: hexToDec(5),
        a: 255,
      });
    },
    addNewColour() {
      this.targets.push({ r: 0, g: 0, b: 0, a: 0 });
    },
    generate() {
      console.log('Begin processing image data');
      console.time('Process')

      this.processor.postMessage({ img: this.imgData, targets: this.targets });
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
      this.ratio = Math.floor(img.naturalWidth / img.width * 100) / 100;

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