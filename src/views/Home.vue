<template>
  <div class="home">
    <img ref="pic" src="../assets/logo.png">
    <canvas ref="canvas">Browser does not support HTML5 canvas</canvas>
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      width: 0,
      height: 0,
      rgba: {
        red: [],
        green: [],
        blue: [],
        alpha: [],
      },
    };
  },
  computed: {
    rgba2d() {
      return {
        red: this.transformTo2d(this.rgba.red),
        green: this.transformTo2d(this.rgba.green),
        blue: this.transformTo2d(this.rgba.blue),
        alpha: this.transformTo2d(this.rgba.alpha),
      }
    },
  },
  methods: {
    transformTo2d(data) {
      return data.reduce((acc, cur, idx) => {
        acc[Math.floor(idx / this.width)].push(cur);
        return acc;
      }, Array.from(new Array(this.width)).map(() => []));
    },
    getUniqueColors() {
      const findColor = data => data.filter((val, idx) => this.rgba.red[idx] || this.rgba.green[idx] || this.rgba.blue[idx]);
      const rgbOnlyColor = {
        red: findColor(this.rgba.red),
        green: findColor(this.rgba.green),
        blue: findColor(this.rgba.blue),
      };

      return Object.values(rgbOnlyColor.red).reduce((acc, cur, idx) => {
        const obj = { r: cur, g: rgbOnlyColor.green[idx], b: rgbOnlyColor.blue[idx] };
        if (acc.findIndex(val => val.r === obj.r && val.g === obj.g && val.b === obj.b) !== -1) return acc;
        acc.push(obj);
        return acc;
      }, []);
    }
  },
  mounted() {
    const img = this.$refs.pic;
    img.addEventListener('load', () => {
      this.width = img.clientWidth;
      this.height = img.clientHeight;

      const c = this.$refs.canvas;
      c.width = this.width; c.height =this. height;

      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0,this.width , this.height);
      const getRgbaVals = (data, val) => data.filter((v, idx) => idx % 4 === val);

      this.rgba = {
        red: getRgbaVals(imgData.data, 0),
        green: getRgbaVals(imgData.data, 1),
        blue: getRgbaVals(imgData.data, 2),
        alpha: getRgbaVals(imgData.data, 3),
      };

      // console.log(this.getUniqueColors().sort((a, b) => a.r - b.r || a.g - b.g || a.b - b.b))

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
}
</script>
