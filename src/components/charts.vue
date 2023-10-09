<script setup>
import * as echarts from 'echarts';
const chartDom = ref(null);
const props = defineProps(['data', 'title','width'])


let option, chart;

const _data = reactive({
  dataLength: 0
})

let timeout = null

// 初始化并负值
function initChart() {
  if (!option) return;
  // console.clear()
  console.log(option)
  if (!chart) chart = echarts.init(chartDom.value);
  chart.setOption(option);

  if (timeout) clearTimeout(timeout);
  setTimeout(() => {
    chart?.resize({
      duration: 500
    })
  }, 1000)
}
function refreshChart() {
  let color = props.data.color || '#00bfff'
  option = {
    title: {
      text: props.title,
      left: 'center',
      top: 'center',
      textStyle:{
        fontSize:24
      }
    },
    legend: {
      // orient: 'vertical',
      // left: 'left',
      top: 'bottom'
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: ['40%','66%'],
        data: Object.keys(props.data).map(it => { return { value: (props.data[it] / 60 / 7.5).toFixed(2), name: it } }).sort((a, b) => { return b.value - a.value }),
        label: {
          show: true,
          // alignTo: 'edge',
          alignTo: 'labelLine',
          formatter: '{name|{b}}\n{time|{d}%} {day|| {c} 人天}',
          /* formatter(param) {
            return `${param.name} ( ${(param.value / 60 / 7.5).toFixed(2)}人天 | ${param.percent}%)`;
          }, */
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
          rich: {
            name:{
              fontWeight:'bold',
            },
            time: {
              fontWeight:'bold',
              color: '#888'
            },
            day: {
              color: '#888'
            }
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  };
  initChart()
}
watch(() => props.data, (newVal, oldVal) => {
  console.log(newVal)
  if (!newVal || JSON.stringify(newVal) === '{}') return;
  refreshChart()
}, { immediate: 1 })

/* onMounted(() => {
  initChart()
}) */

// const style = `width:${width}px;height:${width*.75}px`
</script>

<template>
  <div class="chartBox" ref="chartBoxRef">
    <div class="_chart  fx1" :class="{'noData': !option}" ref="chartDom"></div>
  </div>
</template>

<style lang="scss">
.chartBox{padding-top: 75%;width: 100%;}
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
