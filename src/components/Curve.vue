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
        legend: { show: false },
        margin: 0,
        padding: 0,
        grid: {
            top: 16,
            bottom: 16,
            left: 10,
            right: 10,
        },
        silent: props.chartOption?.silent ?? 1,
        xAxis: {
            type: 'time',
            axisLine: { show: 1, lineStyle: { width: 1, color: '#e5e8ea80' } }
        },
        yAxis: {
            type: 'value',
            splitLine: { show: 0 },
            axisLabel: { show: 0 },
            max: 'dataMax'
        },
        series: {
            type: 'line',
            data: props.data,
            symbol: 'none',
            areaStyle: {
                // color: 'props.themeColor'
                color: '#E5E8EA'
            },
            lineStyle: {
                width: 0
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
        <div class="_chart  fx1" ref="chartDom"></div>
    </div>
</template>

<style lang="scss">
</style>
