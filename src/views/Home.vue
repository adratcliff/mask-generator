<template>
  <div class="home">
    <div>
      <img v-show="false" ref="pic" src="../assets/happy.png">
      <canvas ref="canvas" @click="onclick">Browser does not support HTML5 canvas</canvas>
    </div>
    <div>
      <!-- <div
        v-for="(color, index) in hslCategories"
        :key="`category-${color}`">
        <h5>{{ color | capitalise }}</h5>
        <div
          v-for="(subcolor, subcolorIndex) in hslGrouped[index]"
          :key="`${color}-${subcolorIndex}`"
          class="color-record">
          <div class="sampler" :style="`background-color: hsl(${subcolor.h}, ${subcolor.s}%, ${subcolor.l}%)`" />
          H: {{ subcolor.h }}
          S: {{ subcolor.s }}
          L: {{ subcolor.l }}
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import rgbToHsl from '../utils/rgbToHsl';
import {
  hslArraySort,
  rgbArraySort,
} from '../utils';

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
    };
  },
  computed: {
    // rgba2d() {
    //   return {
    //     red: this.transformTo2d(this.rgba.red),
    //     green: this.transformTo2d(this.rgba.green),
    //     blue: this.transformTo2d(this.rgba.blue),
    //     alpha: this.transformTo2d(this.rgba.alpha),
    //   }
    // },
    // uniqueColors() {
    //   const findColor = data => data.filter((val, idx) => this.rgba.red[idx] || this.rgba.green[idx] || this.rgba.blue[idx]);
    //   const rgbOnlyColor = {
    //     red: findColor(this.rgba.red),
    //     green: findColor(this.rgba.green),
    //     blue: findColor(this.rgba.blue),
    //   };

    //   return Object.values(rgbOnlyColor.red).reduce((acc, cur, idx) => {
    //     const obj = { r: cur, g: rgbOnlyColor.green[idx], b: rgbOnlyColor.blue[idx] };
    //     if (acc.findIndex(val => val.r === obj.r && val.g === obj.g && val.b === obj.b) !== -1) return acc;
    //     acc.push(obj);
    //     return acc;
    //   }, []);
    // },
    // hslColors() {
    //   return this.uniqueColors.reduce((acc, cur) => {
    //     const { h, s, l } = rgbToHsl(cur);
    //     const obj = {
    //       h: Math.round(h),
    //       s: Math.round(s * 100),
    //       l: Math.round(l * 100),
    //     };

    //     if (acc.findIndex(val => val.h === obj.h && val.s === obj.s && val.l === obj.l) !== -1) return acc;
    //     acc.push(obj);
    //     return acc;
    //   }, []);
    // },
    // hslGrouped() {
    //   return this.hslColors.reduce((acc, cur) => {
    //     acc[Math.floor((cur.h + 30) / 60) % 6].push(cur);
    //     return acc;
    //   }, Array.from(new Array(6)).map(() => [])).map(hslArraySort);
    // },
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
    const img = this.$refs.pic;
    img.addEventListener('load', (e) => {
      this.width = img.naturalWidth;
      this.height = img.naturalHeight;

      const c = this.$refs.canvas;
      c.width = this.width; c.height = this.height;

      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0,this.width , this.height);
      // const getRgbaVals = (data, val) => data.filter((v, idx) => idx % 4 === val);

      // this.rgba = {
      //   red: getRgbaVals(imgData.data, 0),
      //   green: getRgbaVals(imgData.data, 1),
      //   blue: getRgbaVals(imgData.data, 2),
      //   alpha: getRgbaVals(imgData.data, 3),
      // };
      setTimeout(() => {
        this.colorData = imgData.data.reduce((acc, cur, idx) => {
          const curIdx = acc.length > 1 ? acc.length - 1 : 0;
          switch (idx % 4) {
            case 0:
              acc.push({ r: cur });
              break;
            case 1:
              acc[curIdx].g = cur;
              break;
            case 2:
              acc[curIdx].b = cur;
              break;
            case 3:
              acc[curIdx].a = cur;
              Object.assign(acc[curIdx], rgbToHsl(acc[curIdx]));
              break;
          }
          return acc;
        }, []);
      }, 500);

      // console.log(hslArraySort(this.hslColors));

      // console.log(rgbArraySort(this.uniqueColors));

      // this.$nextTick(() => {
      //   console.log(this.rgba2d.green.map(a => a.map(val => val ? 'o' : ' ').join('')).join('\n'))
      // })

      // let str = '';
      // for (let i = 0; i < (width * height); i++) {
      //   if (i % 200 === 0) str += '\n';
      //   str += (rgba.red[i] || rgba.green[i] || rgba.blue[i]) ? 'm' : ' ';
      // }
      // console.log(str)
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