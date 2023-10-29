<script setup>
import { onMounted, reactive } from 'vue';
import Pie from './components/pie.vue'
import HeatCalendar from './components/HeatCalendar.vue'

const
  displayResult = ref(0),
  textarea = ref(``),
  arr = [];
const data = reactive({
  thead: [],
  projects: {},
  projectTotal: {},
  typeTotal: {},
  total: {},
  typesColorMap: {},
  projectMap: [],
  dateRange: [],
  dateRangeFloor: null,
})

// const colorBoard = ['#DC573D', '#D14064', '#76348D', '#5F3FB2', '#4551B2', '#5395EF', '#57A7F2', '#60B9D4', '#4B9489', '#6CAC57', '#99BF55', '#D0DC4D', '#F2C333', '#ED9F2A', '#E6662F', '#715648', '#9F9F9F', '#687B8B']
const colorBoard = ['#FF3D00', '#F51D7E', '#A200F2', '#651DFF', '#2979FF', '#009DFF', '#00BCD4', '#00BFA5', '#64DD17', '#FFAB00', '#FF6F00', '#915039'/* , '#38454C' */]
// const colorBoard = ['#F51D7E','#FF3D00', '#FF6F00', '#FFAB00','#64DD17', '#00BFA5', '#00BCD4',  '#009DFF', '#2979FF',  '#651DFF','#A200F2', '#915039', '#38454C']

const colorBoardR = computed(() => {
  return ['#578ba7', ...colorBoard].reverse()
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
        _date = _item[4],
        mins = _item[3];
      data.typeTotal[_type] = data.typeTotal[_type] ? data.typeTotal[_type] += +mins : +mins;
      data.projectTotal[_project] = data.projectTotal[_project] ? data.projectTotal[_project] += +mins : +mins;

      // 统计日期范围起止
      if (index == 1) {
        data.dateRange = [_date, _date]
      } else if (index > 1) {
        data.dateRange[0] = _date < data.dateRange[0] ? _date : data.dateRange[0]
        data.dateRange[1] = _date > data.dateRange[1] ? _date : data.dateRange[1]
      }

      // 项目内部统计
      if (!data.projects[_project]) data.projects[_project] = { pie: {}, calendar: {} };
      // 统计项目中工作类型环形图
      data.projects[_project].pie[_type] = data.projects[_project].pie[_type] ? data.projects[_project].pie[_type] += +mins : +mins;
      // 统计项目工作日历
      data.projects[_project].calendar[_date] = data.projects[_project].calendar[_date] ? data.projects[_project].calendar[_date] += +mins : +mins;
    })
    // data.dateRangeFloor = [dateRangeFloor(data.dateRange[0]), dateRangeFloor(data.dateRange[1], 0)]
    // generateEmptyDateData(data.dateRange[0], data.dateRange[1])
    setTypesColorMap(data.typeTotal)
    displayResult.value = 1
    console.log(data)
  } catch (e) {
    displayResult.value = 0
  }
}

function dateRangeFloor(date, isStart = 1) {
  let _date = new Date(date),
    _day = (_date.getDay() + 6) % 7,
    _eDate = _date.getTime() + 86400000 * [(6 - _day), -_day][isStart];
  return convertDate(_eDate)
}
function convertDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-')
}

function generateEmptyDateData(start, end) {
  data.everyday = {}
  start = new Date(start).getTime()
  end = new Date(end).getTime()
  while (start <= end) {
    data.everyday[convertDate(start)] = 0
    start += 86400000
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
    <!-- {{ data }} -->
    <div class="inputForm df fdc aic" style="gap:1em">
      <textarea class="textarea" v-model="textarea"></textarea>
      <button class="btn" @click="generateCharts">生成</button>
    </div>
    {{ data.dateRangeFloor }}
    <!-- <p>{{ data.projectMap }}</p> -->
    <div class="result" v-if="displayResult">
      <Pie :data="data.projectTotal" title="项目时间分配" :colors="colorBoardR" />
      <Pie :data="data.typeTotal" title="工作内容分配" :colorBoard="data.typesColorMap" />
      <!-- <Pie :data="data.projects['兴水治水']" title="兴水治水" /> -->

      <div class="dg col2" style="margin-top: 1em;">
        <template v-for="(item,index) in data.projectMap" :key="item">
          <!-- <p>{{data.projects[item]}}</p> -->
          <div>
            <HeatCalendar class="heatCalendar" :data="Object.entries({...{},...data.everyday,...data.projects[item].calendar})" :themeColor="colorBoardR[index]" :chartOption="{range:data.dateRange, max:Math.max(...Object.values(data.projects[item].calendar))}" />
            <Pie :data="data.projects[item].pie" :title="item" :colorBoard="data.typesColorMap" :chartOption="{radius:'66%',showLegend:0,titleFontSize:20}" :num="index+1" :themeColor="colorBoardR[index]" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.heatCalendar{position: absolute;bottom: 0;}
// .heatCalendar { padding-top: 80px; }
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
@page :first {
  margin: 0 1cm 1cm 1cm;
}
@page {
  margin: 1cm;
}
</style>
