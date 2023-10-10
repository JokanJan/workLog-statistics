<script setup>
import * as echarts from 'echarts';
const chartDom = ref(null);
const props = defineProps(['data', 'title', 'width', 'colorBoard', 'chartOption'])


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
    title: {
      text: props.title,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: props.chartOption?.titleFontSize ?? 40
      },
      backgroundColor: '#fff',
      borderColor: '#fff',
      borderRadius: 4,
      borderWidth: 2
    },
    legend: {
      show: props.chartOption?.showLegend ?? 1,
      // orient: 'vertical',
      // left: 'left',
      top: 'bottom'
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: props.data.chartOption?.radius || ['40%', '66%'],
        data: Object.keys(props.data).map(it => { return { value: (props.data[it] / 60 / 7.5).toFixed(2), name: it } }).sort((a, b) => { return a.value - b.value }),
        silent: 1,
        label: {
          show: true,
          alignTo: 'edge',
          // alignTo: 'labelLine',
          formatter: '{name|{b}}\n{time|{d}%}{day| | {c} 人天}',
          /* formatter(param) {
            return `${param.name} ( ${(param.value / 60 / 7.5).toFixed(2)}人天 | ${param.percent}%)`;
          }, */
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
          rich: {
            name: {
              fontWeight: 'bold',
              // fontSize: getFontSize(30),
            },
            time: {
              fontWeight: 'bold',
              // fontSize: getFontSize(30),
              color: '#888'
            },
            day: {
              // fontSize: getFontSize(30),
              color: '#888'
            }
          }
        },
        itemStyle: {
          color: (params) => {
            return props.colorBoard ? props.colorBoard[params.data.name] : [];
          },
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  };
  if (!props.colorBoard) delete option.series[0].itemStyle.color;
  initChart()
}
watch(() => props.data, (newVal, oldVal) => {
  console.log(newVal)
  if (!newVal || JSON.stringify(newVal) === '{}') return;
  refreshChart()
}, { immediate: 1 })

onMounted(() => {
  initChart()
  window.addEventListener('resize', refreshChart)
})

// const style = `width:${width}px;height:${width*.75}px`
</script>

<template>
  <div class="chartBox" ref="chartBoxRef">
    <!-- <p>{{props.chartOption?.titleFontSize}}</p> -->
    <div class="_chart  fx1" ref="chartDom"></div>
  </div>
</template>

<style lang="scss">
.chartBox {
  padding-top: 72%;
  width: 100%;
  &:before {
    content: attr(num);
    position: absolute;
    top: 0;
    width: 50%;
    text-align: center;
    font-size: 16em;
    line-height: 1;
    font-weight: bold;
    color: #e5e8e9;
  }
}
._chart {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  &.noData {
    &:before {
      content: '暂无数据';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.5;
    }
  }
}
</style>
