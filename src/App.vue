<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import Pie from './components/Pie.vue'
import HeatCalendar from './components/HeatCalendar.vue'
import Curve from './components/Curve.vue'
import StackBar from './components/StackBar.vue'

class StatisticsData {
  constructor(data) {
    this.total = data?.total || {}
    this.children = data?.children || {}
    this.sortArr = data?.sortArr || []
    this.sortIndex = data?.sortIndex || {}
    this.colors = data?.colors || {}
    this.dailyTotal = data?.dailyTotal || {}
  }
}

const
  displayResult = ref(0),
  textarea = ref(``),
  costCount = ref(0),
  recordCount = ref(0),
  dayCount = ref([]),
  arr = [];
let clacTimeCost = 0
const data = reactive({
  thead: [],
  projects: new StatisticsData(),
  types: new StatisticsData(),
  dailyTotal: { total: {}, projectCostDaily: {}, typeCostDaily: {} },
  dateRange: [],
  dateRangeFloor: null,
  everyday: { zeros: {}, index: {} }
})


// const colorBoard = ['#DC573D', '#D14064', '#76348D', '#5F3FB2', '#4551B2', '#5395EF', '#57A7F2', '#60B9D4', '#4B9489', '#6CAC57', '#99BF55', '#D0DC4D', '#F2C333', '#ED9F2A', '#E6662F', '#715648', '#9F9F9F', '#687B8B']
const colorBoard = ['#FF3D00', '#F51D7E', '#A200F2', '#651DFF', '#2979FF', '#009DFF', '#00BCD4', '#00BFA5', '#64DD17', '#FFAB00', '#FF6F00', '#915039'/* , '#38454C' */]
// const colorBoard = ['#F51D7E','#FF3D00', '#FF6F00', '#FFAB00','#64DD17', '#00BFA5', '#00BCD4',  '#009DFF', '#2979FF',  '#651DFF','#A200F2', '#915039', '#38454C']

const colorBoardR = computed(() => {
  return ['#578ba7', ...colorBoard].reverse()
})


function generateCharts() {
  if (!textarea.value.length) return;
  localStorage.setItem('localData', textarea.value)
  let _arr = textarea.value.split('\n')
  // if (!Array.isArray(_arr)) return;
  clacTimeCost = Date.now()

  costCount.value = 0
  recordCount.value = _arr.length

  data.thead = []
  data.projects = new StatisticsData()
  data.types = new StatisticsData()
  data.dailyTotal = { total: {}, projectCostDaily: {}, typeCostDaily: {} }

  // console.log(_arr)
  try {
    _arr = _arr.map((it, index) => {
      let _item = it.split('\t')
      if (index == 0) {
        data.thead = _item
        return
      }

      let _project = _item[0],
        _type = _item[1],
        _date = _item[4],
        mins = +_item[3];
      data.types.total[_type] = data.types.total[_type] ? data.types.total[_type] += mins : mins;
      data.projects.total[_project] = data.projects.total[_project] ? data.projects.total[_project] += mins : mins;

      costCount.value += mins
      dayCount.value.push(_date)

      // 统计日期范围起止
      if (index == 1) {
        data.dateRange = [_date, _date]
      } else if (index > 1) {
        data.dateRange[0] = _date < data.dateRange[0] ? _date : data.dateRange[0]
        data.dateRange[1] = _date > data.dateRange[1] ? _date : data.dateRange[1]
      }

      // 项目内部统计
      if (!data.projects.children[_project]) data.projects.children[_project] = { pie: {}, dailyTotal: {}, sortArr: [], sortIndex: {} };
      // 统计项目中工作类型环形图
      data.projects.children[_project].pie[_type] = data.projects.children[_project].pie[_type] ? data.projects.children[_project].pie[_type] += mins : mins;
      // 统计项目工作日历
      data.projects.children[_project].dailyTotal[_date] = data.projects.children[_project].dailyTotal[_date] ? data.projects.children[_project].dailyTotal[_date] += mins : mins;

      // 各项目每日工作类型时间分配统计
      // if (!data.projects.children[_project].dailyTotalByType[_type]) data.projects.children[_project].dailyTotalByType[_type] = {};
      // data.projects.children[_project].dailyTotalByType[_type][_date] = data.projects.children[_project].dailyTotalByType[_type][_date] ? data.projects.children[_project].dailyTotalByType[_type][_date] += mins : mins;

      return _item;
    })

    // data.dateRangeFloor = [dateRangeFloor(data.dateRange[0]), dateRangeFloor(data.dateRange[1], 0)]
    data.everyday = generateEmptyDateData(data.dateRange[0], data.dateRange[1])

    // 处理类型排行
    data.types.sortArr = sortNameByCost(data.types.total)
    // data.types. = data.types.sortArr.reduce((obj, v, i) => { obj[v] = i; return obj }, {})
    data.types.sortArr.forEach((typename, index) => {
      data.types.sortIndex[typename] = index;
      data.types.colors[typename] = colorBoard[index % colorBoard.length];
    })
    // 处理项目排行
    data.projects.sortArr = sortNameByCost(data.projects.total)
    // data.projects. = data.projects.sortArr.reduce((obj, v, i) => { obj[v] = i; return obj }, {})
    data.projects.sortArr.forEach((typename, index) => {
      data.projects.sortIndex[typename] = index;
      data.projects.colors[typename] = colorBoardR.value[index % colorBoardR.value.length];
    })
    dayCount.value = [...new Set(dayCount.value)].length
    calcDailyCostByType(_arr.slice(1))
    displayResult.value = 1
    // console.clear()
    console.log(data)
    clacTimeCost = Date.now() - clacTimeCost
  } catch (e) {
    displayResult.value = 0
  }
}

function calcDailyCostByType(_arr) {
  let days = Object.keys(data.everyday.zeros)
  data.projects.dailyTotal = JSON.parse(JSON.stringify(Array(data.projects.sortArr.length).fill(Array(days.length).fill(0))))
  data.types.dailyTotal = JSON.parse(JSON.stringify(Array(data.types.sortArr.length).fill(Array(days.length).fill(0))))
  for (let pj in data.projects.children) {
    let _sort = sortIndex(data.projects.children[pj].pie)
    data.projects.children[pj].sortIndex = _sort.index
    data.projects.children[pj].sortArr = _sort.arr
    data.projects.children[pj].typeCostDailyTotal = JSON.parse(JSON.stringify(Array(_sort.arr.length).fill(Array(days.length).fill(0))))
  }
  _arr.forEach((_item, i, arr) => {
    let _project = _item[0],
      _type = _item[1],
      _date = _item[4],
      mins = +_item[3];
    // 两大表 填充每日类型分配
    data.projects.dailyTotal[data.projects.sortIndex[_project]][data.everyday.index[_date]] += mins
    data.types.dailyTotal[data.types.sortIndex[_type]][data.everyday.index[_date]] += mins

    // 各项目每日任务类型消耗统计
    data.projects.children[_project].typeCostDailyTotal[data.projects.children[_project].sortIndex[_type]][data.everyday.index[_date]] += mins

  })
}

function resetData() {
  textarea.value = ''
  localStorage.clear()
}
/* 补全周一周日 */
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
  let _data = { zeros: {}, index: {} }
  let _day, _time = 0;
  start = new Date(start).getTime()
  end = new Date(end).getTime()
  while (start <= end) {
    _day = convertDate(start);
    _data.zeros[_day] = 0
    _data.index[_day] = _time++
    start += 86400000
  }
  _data.arr = Object.keys(_data.zeros)
  return _data
}
function sortNameByCost(_data) {
  return Object.entries(_data).sort((a, b) => { return b[1] - a[1] }).map(it => it[0])
}
function sortIndex(_data) {
  let _arr = []
  let _obj = Object.entries(_data).sort((a, b) => b[1] - a[1]).reduce((obj, value, index) => {
    obj[value[0]] = index;
    _arr.push(value[0])
    return obj;
  }, {});
  return { arr: _arr, index: _obj }
}

function print() {
  window.print()
}

const startEndDate = computed(() => {
  return data.dateRange[0]?.replaceAll('-', '/') + ' > ' + data.dateRange[1]?.replaceAll('-', '/')
})

const isPrint = ref(0)
onMounted(() => {
  let localData = localStorage.getItem('localData')
  if (localData) textarea.value = localData;
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
    <div class="pf aic jcsb hide">
      <div class="df aic jcc vhide" style="gap:.5em;opacity: .88;">
        <img src="https://tools.jokan.site/static/icon.png" style="width: 16px;object-fit:contain;">
        <b style="color: #216;">JOKAN</b>
      </div>
      <span> {{startEndDate}} </span>
    </div>
    <!-- {{ data }} -->
    <div class="inputForm df fdc aic" style="gap:1em">
      <h1>工作量统计分析</h1>
      <textarea class="textarea" v-model="textarea"></textarea>
      <div class="df fdr" style="gap:1em">
        <button class="btn btn_sub tss_eoe" @click="resetData">重置</button>
        <button class="btn btn_main tss_eoe" @click="generateCharts">生成</button>
      </div>
      <p class="subtxt" v-show="clacTimeCost">【用时 {{ clacTimeCost }} ms】共 {{ recordCount }} 条记录 ，{{ dayCount }}工作日 </p>
    </div>
    <!-- {{ data.dateRangeFloor }} -->
    <!-- <p>{{ data.projects.sortArr }}</p> -->
    <div class="result" v-if="displayResult">
      <div>
        <Pie :data="data.projects.total" :colors="colorBoardR" :chartOption="{title:{text:'项目时间分配',top:'39%'},data:{center:['50%','44%']}}" style="padding-top: 65%;" />
        <div style="top: 10px;">
          <StackBar class="stackbar" :data="data.projects.dailyTotal" :dataName="data.projects.sortArr" :x="data.everyday.arr" :colorBoard="data.projects.colors" :chartOption="{data:{stack:'a',markLine:{yAxis:450} }}" style="padding-top: 120px;" />
          <!-- <StackBar class="stackbar" :data="data.types.dailyTotal" :dataName="data.types.sortArr" :x="data.everyday.arr" :colorBoard="data.types.colors" :chartOption="{xAxis:{position:'top',axisLabel:{show:0}},yAxis:{inverse:1},data:{type:'line',markLine:{yAxis:450} }}" style="padding-top: 120px;" /> -->
          <StackBar class="stackbar" :data="data.types.dailyTotal" :dataName="data.types.sortArr" :x="data.everyday.arr" :colorBoard="data.types.colors" :chartOption="{xAxis:{position:'top',axisLabel:{show:0}},yAxis:{inverse:1},data:{stack:'line',markLine:{yAxis:450} }}" style="padding-top: 120px;" />
        </div>
        <Pie :data="data.types.total" :colorBoard="data.types.colors" :chartOption="{title:{text:'工作内容分配'},legend:{top:'4%'},data:{}}" style="padding-top: 65%;" />
      </div>
      <!-- <Pie :data="data.projects.children['兴水治水']" title="兴水治水" /> -->

      <div class="dg col2" style="margin-top: 1em;">
        <template v-for="(item,index) in data.projects.sortArr" :key="item">
          <!-- <p>{{data.projects.children[item]}}</p> -->
          <div style="overflow: hidden;">
            <!-- <p>{{ data.projects.children[item].sortArr.map(it=>data.types.colors[it]) }}</p> -->
            <Curve class="subChart" :data="Object.entries({...data.everyday.zeros,...data.projects.children[item].dailyTotal})" :themeColor="colorBoardR[index%colorBoardR.length]" :chartOption="{range:data.dateRange, max:Math.max(...Object.values(data.projects.children[item].dailyTotal))}" style="bottom: -15px;padding-top: 66px;" />
            <StackBar class="subChart" :data="data.projects.children[item].typeCostDailyTotal" :dataName="data.projects.children[item].sortArr" :x="data.everyday.arr" :colorBoard="data.projects.children[item].sortArr.map(it=>data.types.colors[it])" :chartOption="{xAxis:{position:'top',boundaryGap:0,axisLabel:{show:0}},data:{stack:'a',barWidth:3,showBackground:0,markLine:{yAxis:0}} }" style="bottom: -15px;padding-top: 66px;opacity: .6;" />
            <HeatCalendar class="subChart" :data="Object.entries({...data.everyday.zeros,...data.projects.children[item].dailyTotal})" :themeColor="colorBoardR[index%colorBoardR.length]" :chartOption="{range:data.dateRange, max:Math.max(...Object.values(data.projects.children[item].dailyTotal))}" style="mix-blend-mode: multiply;" />
            <Pie :data="data.projects.children[item].pie" :title="{text:item,sub:`${(data.projects.total[item]/450).toFixed(2)} 人天 (${+(data.projects.total[item]/costCount*100).toFixed(1)}%)`}" :colorBoard="data.types.colors" :chartOption="{showLegend:0,titleFontSize:20}" :num="index+1" :themeColor="colorBoardR[index%colorBoardR.length]" />
          </div>
        </template>
      </div>
    </div>
  </div>
  <!-- <p>{{ data.everyday.zeros }}</p> -->
</template>

<style lang="scss">
html {
  font-size: 12px;
}
.subtxt {
  color: #9a9a9a;
}
// .dg{display: grid;}
.stackbar {
  margin: -12px 0;
}
.subChart {
  position: absolute;
  top: auto;
  bottom: 0;
}
// .heatCalendar { padding-top: 80px; }
.btn {
  width: 8em;
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
}
.result {
  max-width: 2400px;
}
@page {
  size: A4;
  print-color-adjust: exact;
}
@page :first {
  margin: 0 1cm 1cm 1cm;
}
@media print {
  .inputForm {
    display: none;
  }
  .pf {
    position: fixed;
    z-index: 5;
    bottom: 4em;
    display: flex;
    width: calc(100% - 2em);
    text-align: center;
    color: #aaa;
    gap: .5em;
    >* {
      display: inherit;
      gap: .5em;
    }
  }
  .subChart {
    margin: 0
  }
}
</style>
