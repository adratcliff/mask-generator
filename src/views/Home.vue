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
      rgba: {},
    };
  },
  methods: {
  },
  mounted() {
    const img = this.$refs.pic;
    img.addEventListener('load', e => {
      this.width = img.clientWidth;
      this.height = img.clientHeight;

      const c = this.$refs.canvas;
      c.width = this.width; c.height =this. height;

      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0,this. width,this. height);
      const getRgbaVals = (data, val) => data.filter((v, idx) => idx % 4 === val);

      this.rgba = {
        red: getRgbaVals(imgData.data, 0),
        green: getRgbaVals(imgData.data, 1),
        blue: getRgbaVals(imgData.data, 2),
        alpha: getRgbaVals(imgData.data, 3),
      };

      // const g = (getRgbaVals2(imgData.data, 0))
      // console.log(g)
      // console.log(g.map(a => a.map(val => val ? 'o' : ' ').join('')).join('\n'))

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
