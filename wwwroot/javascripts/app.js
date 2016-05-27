$(document).ready(() => {
    /*****
    search results => popup => table
    chart: view all; year accum; vase-vesa

    */


    //layer btn selected
    $("input[value='on']").click();
    $('.ui.dropdown').dropdown();
    $('.ui.accordion').accordion();

    //click show charts
    $('#status > div > a').click(function() {
        var field = $(this).data('type');
        var qstr = 'SELECT `' + field + '` as label, count(`' + field + '` = `' + field + '`) as value FROM gis1.authorizing group by `' + field + '`';
        createChart(qstr, field);
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

function createChart(qstr, title) {
    $('#bottom-left-view').show();
    $('.chart-container').show();
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
                data: dataSrc.data,
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
    formData.append('id', fid);
    xhr.send(formData);
}
