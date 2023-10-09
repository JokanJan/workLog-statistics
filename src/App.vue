<script setup>
import { reactive } from 'vue';
import Charts from './components/charts.vue'

const
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

const colorBoard = ['#DC573D', '#D14064', '#76348D', '#5F3FB2', '#4551B2', '#5395EF', '#57A7F2', '#60B9D4', '#4B9489', '#6CAC57', '#99BF55', '#D0DC4D', '#F2C333', '#ED9F2A', '#E6662F', '#715648', '#9F9F9F', '#687B8B']


function generateCharts() {
  let _arr = textarea.value.split('\n')

  data.thead = []
  data.projects = {}
  data.projectTotal = {}
  data.typeTotal = {}
  data.total = {}

  console.log(_arr)
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
  console.log(data)
}

function setTypesColorMap(data) {
  console.clear()
  let _arr = Object.keys(data).map(it => { return { value: data[it], name: it } }).sort((a, b) => { return b.value - a.value }).forEach((it,i)=>{
    let _type = it.name
    console.log(_type)
    // if (!data.typesColorMap[_type]) data.typesColorMap[_type] = colorBoard[Object.keys(data.typesColorMap).length % colorBoard.length];
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
    <Charts :data="data.projectTotal" title="项目时间分配" />
    <Charts :data="data.typeTotal" title="工作内容分配" :colorBoard="data.typesColorMap" />
    <!-- <Charts :data="data.projects['兴水治水']" title="兴水治水" /> -->

    <div class="dg col2">
      <template v-for="item in Object.keys(data.projectTotal)">
        <!-- <p>{{data.projects[item]}}</p> -->
        <div>
          <Charts v-if="data.projects[item]" :data="data.projects[item]" :title="item" :colorBoard="data.typesColorMap" />
        </div>
      </template>
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
