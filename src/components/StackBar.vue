<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import * as echarts from 'echarts';
const chartDom = ref(null);
const props = defineProps(['data', 'x', 'dataName', 'chartOption', 'colorBoard', 'themeColor', 'colors'])


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
const month = [0, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function refreshChart() {
    option = {
        silent: props.chartOption?.silent ?? 1,
        legend: { show: false },
        margin: 0,
        padding: 0,
        backgroundStyle: { color: '#fff' },
        grid: {
            top: 16,
            bottom: 16,
            left: 10,
            right: 10,
        },
        xAxis: {
            type: 'category',
            data: props.x,
            position: props.chartOption?.xAxis?.position || 'bottom',
            boundaryGap: props.chartOption?.xAxis?.boundaryGap ?? 1,
            axisLine: { onZero: 0, show: 0 },
            axisTick: { show: 0 },
            axisLabel: {
                show: props.chartOption?.xAxis?.axisLabel?.show ?? 1,
                margin: 6,
                fontSize: 9,
                fontFamily: 'poppins',
                // interval:1,
                hideOverlap: 0,
                formatter: function (value, index) {
                    let d = value.slice(-2);
                    return d == '01' ? month[value.slice(5, 7)] : d;
                }
            }
        },
        yAxis: {
            type: 'value',
            inverse: props.chartOption?.yAxis?.inverse || 0,
            splitLine: { show: 0 },
            axisLabel: { show: 0 },
            max: 'dataMax'
        },
        color: Array.isArray(props.colorBoard) ? props.colorBoard : Object.values(props.colorBoard),
        series: props.data.map((it, i) => {
            return {
                type: props.chartOption?.data.type ?? 'bar',
                data: it,
                name: props.dataName[i],
                symbol: 'none',
                stack: props.chartOption?.data.stack ?? '',
                barWidth: props.chartOption?.data?.barWidth ?? null,
                barCategoryGap: 2,
                showBackground: props.chartOption?.data?.showBackground ?? 1,
                markLine: {
                    symbol: 'circle',
                    symbolSize: 3,
                    label: { show: 0 },
                    lineStyle: {
                        color: '#b5b8ba',
                        type: [2, 6],
                    },
                    emphasis: { disabled: 1 },
                    data: [{
                        name: '一天',
                        yAxis: props.chartOption?.data?.markLine?.yAxis || -1,
                    }]
                },
                backgroundStyle: {
                    color: '#F4F5F7'
                },
                itemStyle: {
                    borderWidth: 0.25,
                    borderColor: '#fff',
                }
            }
        })
    };
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
    <div class="chartBox" ref="chartBoxRef">
        <div class="_chart  fx1" ref="chartDom"></div>
    </div>
</template>

<style lang="scss">
</style>
