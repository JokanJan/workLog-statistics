<script setup>
import { onMounted, reactive } from 'vue';
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
  typesColorMap: {},
  projectMap: []
})

// const colorBoard = ['#DC573D', '#D14064', '#76348D', '#5F3FB2', '#4551B2', '#5395EF', '#57A7F2', '#60B9D4', '#4B9489', '#6CAC57', '#99BF55', '#D0DC4D', '#F2C333', '#ED9F2A', '#E6662F', '#715648', '#9F9F9F', '#687B8B']
const colorBoard = ['#FF3D00', '#F51D7E', '#A200F2', '#651DFF', '#2979FF', '#009DFF', '#00BCD4', '#00BFA5', '#64DD17', '#FFAB00', '#FF6F00', '#915039'/* , '#38454C' */]
// const colorBoard = ['#F51D7E','#FF3D00', '#FF6F00', '#FFAB00','#64DD17', '#00BFA5', '#00BCD4',  '#009DFF', '#2979FF',  '#651DFF','#A200F2', '#915039', '#38454C']

const colorBoardR = computed(()=>{
  return ['#578ba7',...colorBoard].reverse()
})


function generateCharts() {
  if (!textarea.value.length) return;
  let _arr = textarea.value.split('\n')
  // if (!Array.isArray(_arr)) return;

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
    data.projectMap = []
    data.projectMap.push(...Object.keys(data.projectTotal).sort((a, b) => data.projectTotal[b] - data.projectTotal[a]))
    // if (i + 1 == arr.length) displayResult.value = 1;
  })
}

function print() {
  window.print()
}

const isPrint = ref(0)
onMounted(() => {
  window.onbeforeprint = () => {
    isPrint.value = 1
  }
  window.onafterprint = () => {
    isPrint.value = 0
  }
})
</script>

<template>
  <div class="body ac">
    <div class="inputForm df fdc aic" style="gap:1em">
      <textarea class="textarea" v-model="textarea"></textarea>
      <button class="btn" @click="generateCharts">生成</button>
    </div>
    <!-- <p>{{ data.projectMap }}</p> -->
    <div class="result" v-if="displayResult">
      <Charts :data="data.projectTotal" title="项目时间分配" :colors="colorBoardR"/>
      <Charts :data="data.typeTotal" title="工作内容分配" :colorBoard="data.typesColorMap" />
      <!-- <Charts :data="data.projects['兴水治水']" title="兴水治水" /> -->

      <div class="dg col2" style="margin-top: 1em;">
        <template v-for="(item,index) in data.projectMap" :key="item">
          <!-- <p>{{data.projects[item]}}</p> -->
          <Charts :data="data.projects[item]" :title="item" :colorBoard="data.typesColorMap" :chartOption="{radius:'66%',showLegend:0,titleFontSize:20}" :num="index+1" :titleColor="colorBoardR[index]" />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.btn {
  padding: .5em;
  height: 3em;
  width: 8em;
  cursor: pointer;
}
.body {
  padding: 1em;
  max-width: 960px;
}

.textarea {
  width: 100%;
  padding: 1em;
  box-sizing: border-box;
}

.dg.col2 {
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  >* {
    border-bottom: 1px solid #e5e8ea;
    &:last-child, &:nth-last-child(2):nth-child(odd) {
      border: 0;
    }
  }
}
.result {
  max-width: 2400px;
}
@media print {
  .inputForm {
    display: none;
  }
  // .chartBox:before {opacity: 0.25; }
  // .body{zoom:2}
}
@page :first{
  margin: 0 1cm 1cm 1cm;
}
@page {
  margin: 1cm;
}
</style>
