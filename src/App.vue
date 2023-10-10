<script setup>
import { reactive } from 'vue';
import Charts from './components/charts.vue'

const
  displayResult = ref(0),
  textarea = ref(''),
  arr = [];
const data = reactive({
  thead: [],
  projects: {},
  projectTotal: {},
  typeTotal: {},
  total: {},
  typesColorMap: {}
})

// const colorBoard = ['#DC573D', '#D14064', '#76348D', '#5F3FB2', '#4551B2', '#5395EF', '#57A7F2', '#60B9D4', '#4B9489', '#6CAC57', '#99BF55', '#D0DC4D', '#F2C333', '#ED9F2A', '#E6662F', '#715648', '#9F9F9F', '#687B8B']
const colorBoard = ['#FF3D00', '#F51D7E', '#A200F2', '#651DFF', '#2979FF', '#009DFF', '#00BCD4', '#00BFA5', '#64DD17', '#FFAB00', '#FF6F00', '#915039', '#38454C']


function generateCharts() {
  let _arr = textarea.value.split('\n')

  data.thead = []
  data.projects = {}
  data.projectTotal = {}
  data.typeTotal = {}
  data.total = {}
  data.typesColorMap = {}

  // console.log(_arr)
  try {
    _arr.forEach((it, index) => {
      let _item = it.split('\t')
      if (index == 0) {
        data.thead = _item
        return
      }

      let _project = _item[0],
        _type = _item[1],
        mins = _item[3];
      data.typeTotal[_type] = data.typeTotal[_type] ? data.typeTotal[_type] += +mins : +mins;
      data.projectTotal[_project] = data.projectTotal[_project] ? data.projectTotal[_project] += +mins : +mins;

      if (!data.projects[_project]) data.projects[_project] = {};
      data.projects[_project][_type] = data.projects[_project][_type] ? data.projects[_project][_type] += +mins : +mins;
      // data.projectTotal[_project] = data.projectTotal[_project] ? data.projectTotal[_project] += mins : mins;

      // if (!data.typesColorMap[_type]) data.typesColorMap[_type] = colorBoard[Object.keys(data.typesColorMap).length % colorBoard.length];
    })
    setTypesColorMap(data.typeTotal)
    displayResult.value = 1
    console.log(data)
  } catch (e) {
    displayResult.value = 0
  }
}

function setTypesColorMap(_data) {
  // console.clear()
  Object.keys(_data).map(it => { return { value: _data[it], name: it } }).sort((a, b) => { return b.value - a.value }).forEach((it, i, arr) => {
    let _type = it.name
    console.log(_type, data.typesColorMap, colorBoard.length)
    if (!data.typesColorMap[_type]) data.typesColorMap[_type] = colorBoard[Object.keys(data.typesColorMap).length % colorBoard.length];
    // if (i + 1 == arr.length) displayResult.value = 1;
  })
}
</script>

<template>
  <div class="body">
    <div>
      <textarea class="textarea" v-model="textarea"></textarea>
      <button @click="generateCharts">生成</button>
    </div>
    <p>{{ Object.keys(data.projectTotal) }}</p>
    <div class="result" v-if="displayResult">
      <Charts :data="data.projectTotal" title="项目时间分配" />
      <Charts :data="data.typeTotal" title="工作内容分配" :colorBoard="data.typesColorMap" />
      <!-- <Charts :data="data.projects['兴水治水']" title="兴水治水" /> -->

      <div class="dg col2">
        <template v-for="item in Object.keys(data.projectTotal)" :key="item">
          <!-- <p>{{data.projects[item]}}</p> -->
          <Charts :data="data.projects[item]" :title="item" :colorBoard="data.typesColorMap" />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.body {
  padding: 1em;
}

.textarea {
  width: 100%;
  padding: inherit;
}

.dg.col2 {
  grid-template-columns: 1fr 1fr;
}
</style>
