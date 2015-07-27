$(document).ready(function(){
	
	//set the height to full screen height
	$("#s6-tall-wrap").height($(window).height());
	//set the current tag 
	$("#s6-tall-wrap").attr("img-tag", 0);
	//the position attr will be set to fixed while scroll into view.
	//implemented in udn_traffice.js
	$('#highcharts-container').highcharts({
        chart: {
            backgroundColor: '#232323',
            type: 'line'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: [{
            categories: ['93', '94', '95', '96', '97', '98','99', '100', '101', '102', '103'],
            color:'#FFFFFF',
            crosshair: true
        }],
        yAxis: [
            
            { // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            lineColor:'#ededed',
            title: {
                text: 'A2',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            lineColor:'#ededed',
            title: {
                text: 'A1',
                style: {
                    color: Highcharts.getOptions().colors[9]
                }
            },
            labels: {
                format: '{value} ',
                style: {
                    color: Highcharts.getOptions().colors[9]
                }
            },
            opposite: true
        }],
         plotOptions: {
            series: {
                marker: {
                    fillColor: '#FFFFFF',
                    radius: 6,
                    lineWidth: 3,
                    lineColor: null // inherit from series
                }
            }
        },
        
        tooltip: {
            shared: true
        },
         legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'A1',
            type: 'line',
            color: '#4fabba',
            marker: {
                symbol:'circle',
            },
            lineWidth: 4,
            yAxis: 1,
            data: [2502
, 2767, 2999, 2463, 2150, 2016, 1973,
2037, 1964, 1867, 1770],
            tooltip: {
                valueSuffix: ' 人'
            }

        }, {
            name: 'A2',
            type: 'line',
            color: '#6d6d6d',
            marker: {
                symbol:'circle',
            },
            lineWidth: 4,
            data: [134719, 153047, 157898, 161508, 167977, 182733, 217678, 233739, 247501, 276521, 306072],
            tooltip: {
                valueSuffix: '人'
            }
        }]
    });

});