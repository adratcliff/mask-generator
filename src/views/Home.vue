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
        <div class="colour-records">
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
      <div class="colour-selection">
        <h5>Blur</h5>
        <input
          type="number"
          min="0"
          max="50"
          v-model="blur.dist"
          @input="updateDist" />
      </div>
      <div class="buttons">
        <button
          type="button"
          class="btn"
          :disabled="generation !== null"
          @click="generate">
          Generate
        </button>
        <button
          type="button"
          class="btn"
          :disabled="!generated"
          @click="save">
          Save
        </button>
      </div>
      <div v-if="generation !== null" class="progress">
        <div class="bar">
          <div class="background" />
          <div class="progress-indicator" :style="`width: ${generation}%;`" />
        </div>
        <span class="total">{{ generation }}%</span>
      </div>
    </div>
    <a id="link" />
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

const defaultFile = 'grogu-rock.png';

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
      imageSrc: require(`../assets/${defaultFile}`),
      fileName: defaultFile,
      targets: [ ...defaultTargets ],
      selectingColour: false,
      blur: { dist: 1 },
      generated: false,
      generation: null,
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
      reader.onload = () => {
        this.imageSrc = reader.result;
        this.generated = false;
      };
      reader.readAsDataURL(evt.target.files[0]);
      this.fileName = evt.target.files[0].name;
    },
    removeColour(idx) {
      this.targets.splice(idx, 1);
    },
    selectNewColour() {
      this.selectingColour = true;
    },
    getHex({ r, g, b }) {
      return '#' + [r, g, b].map(val => val.toString(16).padStart(2, '0')).join('');
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

      this.generation = 0;
      this.processor.postMessage({ img: this.imgData, targets: this.targets, blur: this.blur });
    },
    save() {
      const link = document.getElementById('link');
      link.setAttribute('download', `${this.fileName.split('.').slice(0, -1).join('.')}-c${this.targets.length}-b${this.blur.dist}.png`);
      link.setAttribute('href', this.$refs.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
      link.click();
    },
    updateDist() {
      this.blur.dist = Math.max(Math.min(Math.floor(this.blur.dist), 50), 0);
    },
  },
  mounted() {
    if (window.Worker) {
      this.processor = new Worker('imageProcessor.js');
      this.processor.onmessage = ({ data }) => {
        switch (data.type) {
          case 'set-data':
            this.ctx.putImageData(new ImageData(new Uint8ClampedArray(data.value), this.width, this.height), 0, 0);
            this.generated = true;
            this.generation = null;
            console.timeEnd('Process');
            break;
          case 'set-progress':
            console.log(data.value)
            this.generation = Math.floor(data.value);
            break;
          default:
            break;
        }
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

      this.imgData = this.ctx.getImageData(0, 0, this.width, this.height);
    });
  },
  filters: {
    capitalise(val) {
      return val.split('')[0].toUpperCase() + val.slice(1);
    },
    formatRgba(val) {
      const padVal = a => val[a].toString().padStart(3, ' ');
      return `R: ${padVal('r')}, G: ${padVal('g')}, B: ${padVal('b')}, A: ${padVal('a')}`;
    },
  }
}
</script>

<style lang="scss" scoped>
button.btn {
  cursor: pointer;
  outline: 0;
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 6px 12px;
  font-size: 1rem;
  border-radius: .25rem;
  transition: color .15s ease-in-out,
    background-color .15s ease-in-out,
    border-color .15s ease-in-out,
    box-shadow .15s ease-in-out;
  color: #0d6efd;
  border-color: #0d6efd;
  &:hover:not(:disabled) {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
  &:disabled {
    color: #7d8388;
    border-color: #c9c9c9;
  }
}

.home {
  display: flex;
  flex-direction: row;
  height: 100%;
  .images {
    max-width: 80vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    img, canvas {
      max-height: 45vh;
      max-width: 75vw;
    }
  }
  .controls {
    padding: 0 24px;
    width: 100%;
    text-align: left;
    h5 {
      margin: 0 0 12px;
      font-weight: 600;
      font-size: 14px;
    }
    .colour-selection {
      margin: 24px 0;
      .colour-records {
        max-height: 75vh;
        overflow-y: auto;
        padding-right: 4px;
        .colour-record {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
          .colour-item {
            display: flex;
            align-items: center;
            .colour-code {
              font-family: monospace;
              white-space: break-spaces;
              margin-left: 8px;
            }
          }
          .colour-btns {
            .remove-btn {
              margin-left: 8px;
              padding: 0px 8px;
              color: #dc3545;
              border-color: #dc3545;
              &:hover {
                color: #fff;
                background-color: #dc3545;
                border-color: #dc3545;
              }
            }
          }
        }
      }
    }
    .progress {
      margin-top: 12px;
      display: flex;
      align-items: center;
      .bar {
        width: 85%;
        height: 20px;
        position: relative;
        .background {
          height: 20px;
          width: 100%;
          position: absolute;
          top: 0;
          border-radius: 4px;
          background-color: #c9c9c944;
        }
        .progress-indicator {
          height: 20px;
          position: absolute;
          top: 0;
          border-radius: 4px;
          background-color: #0d6efd;
          transition: width ease 0.3s;
        }
      }
      .total {
        width: 15%;
        text-align: right;
      }
    }
    .buttons {
      display: flex;
      justify-content: space-around;
      margin-top: 12px;
      &.small button {
        font-size: 0.8rem;
        line-height: 1rem;
        padding: 4px 8px;
        color: #6c757d;
        border-color: #6c757d;
        &:hover {
          color: #fff;
          background-color: #6c757d;
          border-color: #6c757d;
        }
      }
    }
  }
}
</style>