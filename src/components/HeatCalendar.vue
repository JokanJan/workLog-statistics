<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import * as echarts from 'echarts';
const chartDom = ref(null);
const props = defineProps(['data', 'chartOption', 'themeColor', 'colors'])


let option, chart;

const _data = reactive({
  dataLength: 0
})

let timeout = null

// 初始化并负值
function initChart() {
  if (!option || !chartDom.value) return;
  // console.clear()
  // console.log('⭐⭐', option, props.title, chartDom.value, props.colorBoard)
  if (!chart) chart = echarts.init(chartDom.value);
  chart.setOption(option);

  if (timeout) clearTimeout(timeout);
  setTimeout(() => {
    chart?.resize({
      duration: 500
    })
  }, 200)
}
function getFontSize(max = 20) {
  let fz = window.innerWidth / 980 * max
  return Math.min(Math.max(fz, 12), max)
};
function refreshChart() {
  let color = props.data.color || '#00bfff'
  option = {
    legend: { show: false },
    visualMap: {
      max: props.chartOption.max,
      // max:5,
      // type:'piecewise',
      inRange: {
        color: [
          props.themeColor + '00',
          props.themeColor
        ]
      },
      show: false,
    },
    calendar: {
      left: 0,
      bottom: 10,
      range: props.chartOption?.range || new Date().getFullYear(),
      cellSize: 8,
      splitLine: {
        lineStyle: {
          width: 3,
          color: "#fff"
        }
      },
      itemStyle: {
        color: '#E5E8E980',
        borderWidth: 4,
        borderColor: '#fff'
      },
      dayLabel: {
        firstDay: 6,
        showWeekend: false,
        show: false,
      },
      monthLabel: {
        show: false,
        align: 'left',
      },
      yearLabel: { show: false },
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: props.data,
      itemStyle: {
        color: "#f37"
      },
      label: {
        show: true,
        formatter: function (params) {
          return params.value[0].split('-')[2] === '01' ? '-' : ''
        },
        color: '#00000080'
      }
    }
  };
  if (!props.chartOption?.max) delete option.visualMap.max;
  initChart()
}
watch(() => props.data, (newVal, oldVal) => {
  refreshChart()
}, { immediate: 1 })

onMounted(() => {
  initChart()
  window.addEventListener('resize', refreshChart)
})

// const style = `width:${width}px;height:${width*.75}px`
</script>

<template>
  <div class="chartBox " ref="chartBoxRef">
    <!-- <div class="overCircle" v-show="themeColor" :style="`background:${themeColor}`"></div> -->
    <!-- <p>{{props.chartOption?.titleFontSize}}</p> -->
    <div class="_chart  fx1" ref="chartDom"></div>
  </div>
</template>

<style lang="scss">
</style>
