<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
body {
  height: 100vh;
  padding: 24px;
  margin: 0;
  box-sizing: border-box;
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
    #nav {
      padding: 30px;
      a {
        font-weight: bold;
        color: #2c3e50;
        &.router-link-exact-active {
          color: #42b983;
        }
      }
    }
  }
}

</style>
