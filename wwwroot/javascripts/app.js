$(document).ready(() => {
    $("input.toggle-auth").click();
    $('.ui.dropdown').dropdown();
    $('.ui.accordion').accordion();

    $('#status > div > a').click(function() {
        showStats($(this).data('type'));
    });
    showStats();
})

function showLegend() {
    $('#top-right-legend').addClass('shown');
    $('.show-legend').css('display', 'none');
    $('.hide-legend').css('display', 'inline-block');
}

function hideLegend() {
    $('#top-right-legend').removeClass('shown');
    $('.hide-legend').css('display', 'none');
    $('.show-legend').css('display', 'inline-block');
}

function showStats() {
    /*var qstrs = {},
        titles = {};
    titles['progress_status'] = '项目进展状态';
    qstrs['progress_status'] = 'select sum(progress_status = 0) as "开工", sum(progress_status = 1) as "竣工", sum(progress_status = 2) as "验收" from projects';
    titles['reclaiming'] = '填海统计';
    qstrs['reclaiming'] = 'select sum(reclaiming = 0) as "无填海", sum(reclaiming = 1) as "填海" from projects';
    titles['rec_status'] = '填海超面积情况统计';
    qstrs['rec_status'] = 'select sum(rec_status = 0) as "超面积", sum(rec_status = 1) as "正常" from projects';
    titles['submit_status'] = '海域使用上报情况';
    qstrs['submit_status'] = 'select sum(submit_status = 0) as "已上报", sum(submit_status = 1) as "上报预警", sum(submit_status = 2) as "上报报警" from projects';
    titles['monitoring'] = '动态监测情况';
    qstrs['monitoring'] = 'select sum(monitoring = 0) as "未监测", sum(monitoring = 1) as "已监测" from projects';
    titles['legal_status'] = '违法情况';
    qstrs['legal_status'] = 'select sum(legal_status = 0) as "违法", sum(legal_status = 1) as "合法" from projects';
    titles['ajust_status'] = '用海调整情况';
    qstrs['ajust_status'] = 'select sum(ajust_status = 0) as "无调整", sum(ajust_status = 1) as "有调整" from projects';
    titles['ajust_submit_status'] = '用海调整上报情况';
    qstrs['ajust_submit_status'] = 'select sum(ajust_submit_status = 0) as "未上报", sum(ajust_submit_status = 1) as "已上报" from projects';
    titles['ajust_approval_status'] = '用海调整审批情况';
    qstrs['ajust_approval_status'] = 'select sum(ajust_approval_status = 0) as "未通过", sum(ajust_approval_status = 1) as "已通过" from projects';
    titles['auth_certified_status'] = '确权发证情况';
    qstrs['auth_certified_status'] = 'select sum(auth_certified_status = 0) as "未发证", sum(auth_certified_status = 1) as "已发证" from projects';
    titles['benif_submit_status'] = '利益相关者上报情况';
    qstrs['benif_submit_status'] = 'select sum(benif_submit_status = 0) as "未上报", sum(benif_submit_status = 1) as "已上报" from projects';
    titles['benif_approval_status'] = '利益相关者上报审批情况';
    qstrs['benif_approval_status'] = 'select sum(benif_approval_status = 0) as "未通过", sum(benif_approval_status = 1) as "已通过" from projects';
*/
    $('#status > div > a').click(function() {
        var field = $(this).data('type');
        var qstr = 'SELECT `' + field + '` as label, count(`' + field + '` = `' + field + '`) as value FROM gis1.authorizing group by `' + field + '`';
        console.log(qstr);
        createChart(qstr, field);
    });
}

function createChart(qstr, title) {
    $('#bottom-left-view').show();
    $.get('http://localhost:3000/exq?qs=' + qstr, function(res) {


        var data = res;
        /*for (let key in res[0]) {
            data.push({
                "label": key,
                "value": res[0][key]
            })
        }*/

        var tempSrc = new dataSrc(title, data);
        var newChart = new fChart(title, tempSrc, "myChart");
        newChart.startup();

    })

}

function fChart(title, dataSrc, container, initType = 'column2d') {
    this.show = function(chartType) {

        FusionCharts.ready(function() {
            var tempData = {
                data: dataSrc.data
            };
            tempData["chart"] = dataSrc[chartType];
            var newChart = new FusionCharts({
                "type": chartType,
                "renderAt": container,
                "width": "500",
                "height": "300",
                "dataFormat": "json",
                "dataSource": tempData
            });

            newChart.render();
        })
    };
    this.startup = function() {
        this.show(initType);
        var $selectChart = $('select[name=chartType]');
        $selectChart.off('change');
        $selectChart.val(initType);
        $selectChart.change(() => {
            this.show($selectChart.val());
        });

    };
}

function dataSrc(title, data) {
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
    this.column3d = {
        "caption": title,
        "yAxisName": "数量",
        "theme": "fint"
    };
    this.pie3d = {
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
    this.data = data;
}

function toggleEdit() {
    var editBtn = $(this);
    var submitBtn = editBtn.next('.button.submit');

}

function startEdit() {
    var editBtn = $(this);
    var container = editBtn.parent('.popup-content-custom');
    editBtn.addClass('hidden');
    container.find('.in-edit').removeClass('hidden');
    $('td.display').addClass('hidden');
    $('td.input').removeClass('hidden');
}

function cancelEdit() {
    var container = $(this).parent('.popup-content-custom');
    var editBtn = container.find('.edit');
    container.find('.in-edit').addClass('hidden');
    editBtn.removeClass('hidden');
    $('td.input').addClass('hidden');
    $('td.display').removeClass('hidden');
}

function submitEdit() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', '/update');

    xhr.onload = function() {
        var json = JSON.parse(xhr.responseText);
        hero.css({ 'background': 'url("http://' + window.location.host + json.location + '")', 'background-size': 'cover' });
        $('.input-hero-img').val(json.location).change();
        //label.removeClass('pct').addClass('btn').text('change');
        $('.temp-input').remove();
    };
    //xhr.upload.addEventListener("progress", updateProgress, false);
    var frm = $(this).next('form')[0];
    var formData = new FormData(frm);
    var fid = $(this).data('id');
    formData.append('id',fid);
    xhr.send(formData);
}
