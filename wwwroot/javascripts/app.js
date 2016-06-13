$(document).ready(() => {

    //layer btn selected
    $(".toggle.checkbox.base-toggle").checkbox().checkbox('check');
    $('.ui.dropdown').dropdown();
    $('.ui.accordion').accordion();
    $('.tabular.menu .item').tab();
    $('.advanced-search.button').click(function() {
        var btn = $('this');
        var adv = $('#map-container .advanced');
        if (adv.hasClass('shown')) {
            adv.removeClass('shown');
            btn.text('高级');
        } else {
            adv.addClass('shown');
            $('a.item[data-tab="first"]').click();
            btn.text('收起');
        }
    });
    $('.toggle-chart.checkbox').checkbox().checkbox({
        onChecked: function() {
            $('#bottom-left-view').show();
        },
        onUnchecked: function() {
            $('#bottom-left-view').hide();
        }
    });

    var tableFields = {
        projects: ['项目进展情况',
            '填海情况',
            '填海超面积情况',
            '海域使用上报情况',
            '动态监测情况',
            '违法情况',
            '用海调整情况',
            '调整上报情况',
            '调整上报审批情况',
            '确权发证情况',
            '受益方上报情况',
            '受益方上报审批情况'
        ],
        authorizing: ['配号来源', '用海一级类', '用海二级类', '用海方式']
    };

    var chartController = function() {
        var inviewData = 0; //inviewData=0 means data is single series, for normal chart, =1 means stacked chart
        var data0 = []; //data0 is normal chart data
        var data1 = {}; //data1 is stacked chart data
        var table = ''; //database table in use
        var mainField = '';
        var secondField = '';
        var dataSrc0 = {};
        var dataSrc1 = {};
        var chartData = {};
        var chartType = '';
        var container = 'myChart';
        var width = 500;
        var height = 300;

        function changeContainer(contnr) {
            container = contnr;
            showChart();
        }

        function changeSize(w, h) {
            width = w;
            height = h;
            showChart();
        }

        function renderChart(field, tb) {
            dataSrc0 = {};
            chartData = {};
            table = tb;
            mainField = field;
            secondField = '';
            chartType = 'column2d';
            var qstr = 'SELECT `' + field + '` as label, count(`' + field + '` = `' + field + '`) as value FROM gis1.' + tb + ' group by `' + field + '`';
            $.get('/mysql/exq?qs=' + qstr, function(res) {
                data0 = res;
                dataSrc0 = new dataSrc(field + '数量统计');
                showChart();
            })
        }

        function showChart(type) {
            chartType = type ? type : chartType;
            chartData = {
                events: {
                    "chartClick": function(evt, dat) {
                        console.log(evt);
                        console.log(dat);
                    },
                    "dataLabelClick": function(evt, dat) {
                        console.log(evt);
                        console.log(dat);
                    },
                }
            };
            if (chartType.lastIndexOf('stacked') === 0) {
                chartData = data1;
                chartData.chart = dataSrc1[chartType];
            } else {
                chartData.data = data0;
                chartData.chart = dataSrc0[chartType];

            };

            FusionCharts.ready(function() {
                var newChart = new FusionCharts({
                    "type": chartType,
                    "renderAt": container,
                    "width": width,
                    "height": height,
                    "dataFormat": "json",
                    "dataSource": chartData
                });
                newChart.render();
            })
        }

        function switchType(type) {
            if (type !== chartType) {
                chartType = type;
                if (chartType.lastIndexOf('stacked') === 0) {
                    if (secondField == '') {
                        for (let i in tableFields[table]) {
                            if (tableFields[table][i] == mainField) {
                                secondField = tableFields[table][(i + 1) % (tableFields[table].length)];
                                $('select[name=series]').dropdown('set selected', secondField);
                                break;
                            }
                        }
                        $.get('/mysql/get_stacked_data?field1=' + mainField + '&field2=' + secondField + '&tb=' + table, function(res) {
                            data1 = res;
                            dataSrc1 = new stackedMeta(mainField + '按' + secondField + '分类统计', mainField);
                            showChart();
                        });
                    }
                    var tempField = $('select[name=series]').val();
                    if (secondField === tempField) {
                        showChart();
                    } else {
                        $.get('/mysql/get_stacked_data?field1=' + mainField + '&field2=' + secondField + '&tb=' + table, function(res) {
                            data1 = res;
                            dataSrc1 = new stackedMeta(mainField + '按' + secondField + '分类统计', mainField);
                            showChart();
                            secondField = tempField;
                        })
                    }
                } else {
                    showChart();
                }
            }

        }

        function switchSrc(field2) {
            if (secondField !== field2 && mainField !== field2) {
                secondField = field2;
                $.get('/mysql/get_stacked_data?field1=' + mainField + '&field2=' + secondField + '&tb=' + table, function(res) {
                    data1 = res;
                    dataSrc1 = new stackedMeta(mainField + '按' + secondField + '分类统计', mainField);
                    showChart();
                })
            }
        }

        return {
            renderChart: renderChart,
            switchType: switchType,
            switchSrc: switchSrc,
            changeContainer: changeContainer,
            changeSize: changeSize
        }
    }();
    $('.toggle-chart.checkbox').checkbox().checkbox('uncheck');
    //click show charts
    $('.toggle-chart.checkbox').checkbox().checkbox({
        onChecked: function() {
            $('#bottom-left-view').show();
            $('#myChart.chart').html('<div class="ui segment"><div class="ui active inverted dimmer"><div class="ui loader"></div></div><p></p></div>');

            var field = $(this).data('type');
            $('.chart-selection.series.auth').hide();
            $('.chart-selection.series.proj').show();
            $('.series-container').hide();
            $('select[name=chartType]').dropdown('set selected', 'column2d');
            chartController.renderChart(field, 'projects');
        },
        onUnchecked: function() {
            $('#bottom-left-view').hide();
        }
    });

    $('.item.statistic.auth').click(function() {
        $('#bottom-left-view').show();
        $('#myChart.chart').html('<div class="ui segment"><div class="ui active inverted dimmer"><div class="ui loader"></div></div><p></p></div>');
        var field = $(this).data('type');
        $('.chart-selection.series.proj').hide();
        $('.chart-selection.series.auth').show();
        $('.series-container').hide();
        $('select[name=chartType]').dropdown('set selected', 'column2d');
        chartController.renderChart(field, 'authorizing');
    });

    $('select[name=chartType]').change(function() {
        var type = $(this).val()
        if (type.lastIndexOf('stacked') === 0) {
            $('.series-container').show();
        } else {
            $('.series-container').hide();
        }
        chartController.switchType(type);
    });


    $('select[name=series]').change(function() {
        chartController.switchSrc($(this).val());
    });

    //click expand full screen
    $('a#fullScreen').click(function() {
        var btn = $(this);
        var body = $('body');
        if (body.hasClass('full-screen')) {
            body.removeClass('full-screen');
            btn.find('.fa-compress').hide();
            btn.find('.fa-expand').show();
            btn.attr('title', 'exit full screen');
        } else {
            body.addClass('full-screen');
            btn.find('.fa-expand').hide();
            btn.find('.fa-compress').show();
            btn.attr('title', 'expand full screen');
        }
    })
    $('#bottom-left-view #buttons i.fa.fa-expand.expand').click(enlargeChart);
    $('#bottom-left-view #buttons i.fa.fa-compress.compress').click(restoreChart);

    function restoreChart() {
        $('#bottom-left-view').removeClass('large');
        chartController.changeSize(500, 300);
        $(this).hide();
        $('#bottom-left-view #buttons i.fa.fa-expand.expand').show()
    }

    function enlargeChart() {
        $('#bottom-left-view').addClass('large');
        chartController.changeSize(840, 500);
        $(this).hide();
        $('#bottom-left-view #buttons i.fa.fa-compress.compress').show()
    }
})


function clearSearch() {
    var $input = $('input[name="search"');
    $input.val('');
    var resultDiv = $('#searchResult.results');
    resultDiv.removeClass('visible');
    var links = resultDiv.find(".download-results");
    links.hide();
    $('i.icon.search').show();
    $('i.icon.remove').hide();
    $('.category.results').hide();
}

function stackedMeta(title, xname) {
    this.stackedcolumn2d = {
        "caption": title,
        "xAxisname": xname,
        "yAxisName": "数量",
        "showSum": "1",
        "theme": "fint"
    };
    this.stackedcolumn3d = this.stackedcolumn2d;
}

function dataSrc(title) {
    this.column2d = {
        "caption": title,
        "yAxisName": "数量",
        "theme": "fint"
    };
    this.pie2d = {
        "caption": title,
        "showBorder": "0",
        "use3DLighting": "0",
        "enableSmartLabels": "0",
        "startingAngle": "310",
        "showLabels": "0",
        "showPercentValues": "1",
        "showLegend": "1",
        "centerLabelBold": "1",
        "showTooltip": "0",
        "decimals": "0",
        "useDataPlotColorForLabels": "1",
        "theme": "fint"
    };
    this.column3d = this.column2d;
    this.pie3d = this.pie2d;
    this.line2d = {
        "caption": title,
        "yAxisName": "数量",
        "lineThickness": "2",
        "paletteColors": "#0075c2",
        "baseFontColor": "#333333",
        "baseFont": "Helvetica Neue,Arial",
        "captionFontSize": "14",
        "subcaptionFontSize": "14",
        "subcaptionFontBold": "0",
        "showBorder": "0",
        "bgColor": "#ffffff",
        "showShadow": "0",
        "canvasBgColor": "#ffffff",
        "canvasBorderAlpha": "0",
        "divlineAlpha": "100",
        "divlineColor": "#999999",
        "divlineThickness": "1",
        "divLineIsDashed": "1",
        "divLineDashLen": "1",
        "divLineGapLen": "1",
        "showXAxisLine": "1",
        "xAxisLineThickness": "1",
        "xAxisLineColor": "#999999",
        "showAlternateHGridColor": "0"
    };
}



function showProjects() {
    var popup = $('.esri-popup-renderer-text.esri-popup-renderer-content-element');
    var link = popup.find('.projects-link');
    popup.html('<div class="ui segment"><div class="ui active inverted dimmer"><div class="ui loader"></div></div><p></p></div>');

    var url = '/mysql/get_projects?zone=' + link.data('zone');
    if (link.data('field')) {
        url += '&field=' + link.data('field') + '&val=' + link.data('val');
    };
    $.get(url, function(htmlStr) {
        if (htmlStr == '') {
            popup.html('该区域没有项目信息');
            return;
        }
        popup.html(htmlStr);
        if (link.data('field')) {
            $('h1.esri-title').append(': ' + link.data('val') + '项目');
        };
        $('.projects .ui.styled.fluid.accordion').accordion();
        $('.projects .content .edit-project').click(startEdit);
        $('.content a.enlarge').click(function() {
            showProj($(this).data('id'));
        });
    })
}

function showProj(id) {
    $.get('/mysql/project?id=' + id, function(html) {
        $('#modal').html('<i class="close fa fa-remove" />');
        $('#modal').append(html);
        $('#modal').modal('show');
        $('.modal .content .edit-project').click(startEdit);
    })
}

function deleteProject() {
    $('#modal .content').html('<div class="ui segment"><div class="ui active inverted dimmer"><div class="ui loader"></div></div><p></p></div>');
    $.get($(this.data('href')), function(res) {
        if (res.ok) {
            $('#modal .loader').text('信息已删除');

        } else {
            $('#modal .loader').text('删除时发生错误');
        }

    })
}



function startEdit() {
    var url = '/mysql/edit_project?id=' + $(this).data('id');
    $('#modal .content').html('<div class="ui segment"><div class="ui active inverted dimmer"><div class="ui loader"></div></div><p></p></div>');

    $.get(url, function(res) {

        $('#modal .content').html(res);
        $('.ui.dropdown').dropdown();
        $('#modal').modal('show');
        $('.save-project').click(function() {
            var id = $(this.data('id'));
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/mysql/edit_project？id=' + id);

            xhr.onload = function() {
                var res = JSON.parse(xhr.responseText);
                if (res.ok) {
                    $.get('/mysql/project?id=' + res.id, function(html) {
                        $('#modal .content').html($(html).find('.content'));
                        $('.modal .content .edit-project').click(startEdit);
                    })
                }
            };
            var formData = new FormData($('form.project')[0]);
            xhr.send(formData);
        })

    })

}
