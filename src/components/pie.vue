<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import * as echarts from 'echarts';
const chartDom = ref(null);
const props = defineProps(['data', 'title', 'width', 'colorBoard', 'chartOption', 'themeColor', 'colors'])


let option, chart;

const _data = reactive({
  dataLength: 0
})

let timeout = null

// 初始化并负值
function initChart() {
  if (!option || !chartDom.value) return;
  if (!chart) chart = echarts.init(chartDom.value);
  chart.setOption(option);

  if (timeout) clearTimeout(timeout);
  setTimeout(() => {
    chart?.resize({
      duration: 500
    })
  }, 200)
}
function refreshChart() {
  let color = props.data.color || '#00bfff'
  option = {
    title: {
      show: props.chartOption?.title?.show ?? 1,
      text: props.chartOption?.title?.text ?? '',
      left: 'center',
      top: props.chartOption?.title?.top ?? 'center',
      padding: [8, 5, 4, 5],
      textStyle: {
        // color: props.themeColor || '#333',
        color: '#303030',
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
      top: props.chartOption?.legend?.top || 'bottom',
      itemWidth: 16,
      itemHeight: 16,
      icon: 'circle'
    },
    grid: {
      top: 0,
      bottom: 0
    },
    color: props.colors,
    series: [
      {
        name: props.title?.text ?? '',
        type: 'pie',
        radius: props.chartOption?.data?.radius ?? ['40%', '66%'],
        center: props.chartOption?.data?.center ?? ['50%', '50%'],
        // roseType: 'radius',
        data: Object.keys(props.data).map(it => { return { value: (props.data[it] / 60 / 7.5).toFixed(2), name: it } }).sort((a, b) => { return b.value - a.value }),
        clockwise: 0,
        silent: props.chartOption?.silent ?? 1,
        label: {
          show: true,
          alignTo: 'edge',
          formatter: '{name|{b}}\n{time|{d}%}{day| | {c} 人天}',
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
          textBorderWidth: 2,
          textBorderColor: '#fff',
          textShadowColor: '#000',
          textShadowOffsetX: 2,
          textShadowOffsetY: 5,
          rich: {
            name: {
              fontWeight: 'bold',
            },
            time: {
              fontWeight: 'bold',
              color: '#888'
            },
            day: {
              color: '#888'
            }
          }
        },
        labelLine: {
          minTurnAngle: 116,
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
  if (!props.colors) delete option.color;
  initChart()
}
watch(() => props.data, (newVal, oldVal) => {
  // console.log(newVal)
  // if (!newVal || JSON.stringify(newVal) === '{}') return;
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
    <div class="chartTitle tac" :style="`font-size:${props.chartOption?.titleFontSize??40}px`" v-if="props.title">
      <b class="main" :data-title="props.title?.text">{{props.title?.text}}</b>
      <svg class="tri ac" width="16" height="9" v-show="themeColor">
        <path d="M0 0 L16 0 L8 9 Z" :fill="themeColor" />
      </svg>
      <p class="sub">{{props.title?.sub }}</p>
    </div>
    <p>{{data.chartOption}}</p>
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
    width: 5%;
    text-align: center;
    font-size: 16em;
    line-height: 1;
    font-weight: bold;
    color: #e5e8e9;
  }

  .cover {
    opacity: 1;
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
.chartTitle {
  z-index: 1;
  position: absolute;
  left: 50%;
  top: 50%;
  max-width: 45%;
  transform: translate(-50%, -50%);
  .main {
    z-index: 1;
    position: relative;
    display: block;
    line-height: 1.2;
    -webkit-text-stroke: 4px #fff;
    border-radius: 4px;
    &::before {
      content: attr(data-title);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      text-align: inherit;
      color: #303030;
      -webkit-text-stroke: 0;
    }
  }
  .sub {
    margin-top: 1em;
    line-height: 0;
    font-size: 0.6em;
    color: #9a9a9a;
  }
  .tri {
    margin-top: 0.2em;
    display: block;
    mix-blend-mode: darken;
  }
}
</style>
``
