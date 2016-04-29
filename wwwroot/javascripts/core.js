require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/ArcGISDynamicLayer",
    "esri/layers/FeatureLayer",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
    "esri/widgets/Compass",
    "esri/widgets/Compass/CompassViewModel",
    "esri/widgets/Home",
    "esri/widgets/Home/HomeViewModel",
    "dojo/domReady!"
], function(Map, MapView, ArcGISDynamicLayer, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM) {
    var map = new Map({
        basemap: "oceans"
    });

    var view = new MapView({
        container: "map-container",
        map: map,
        zoom: 9,
        center: [121.5, 33]
    });

    /*var lyr = new ArcGISDynamicLayer({
        url: "http://localhost:6080/arcgis/rest/services/04202/MapServer"
    });
    map.add(lyr);*/

    var content = "<b>{FID}</b> {OBJECTID}<br>" +
        "功能区类型:{功能区类型}<br>" + "{SHAPE_LEN}" + "<img src='https://www.google.com/logos/doodles/2016/mohammed-ghani-hikmats-87th-birthday-5708620060688384-hp2x.jpg' />";

    var pt = new PopupTemplate({
        title: '{FID}',
        content: content
    });
    var legendJson = {};
    $.get('http://localhost:6080/arcgis/rest/services/04202/MapServer/legend?f=pjson', function(res) {
        legendJson =    res;
    })
    var zoningLyr = new FeatureLayer({
        id: '功能区划',
        url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/5",
        //popupTemplate: pt
    });
    map.add(zoningLyr);
    var tempLyr = new FeatureLayer({
        url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/2",
        definitionExpression: "用海一级类 = '渔业用海'",
            popupTemplate: new PopupTemplate({
                title: 'title',
                content: "layer.No." +  "<b>{FID}</b>"
            })
    });
    map.add(tempLyr);
    /**/
    var compass = new Compass({
        viewModel: new CompassVM({
            view: view
        })
    }, "compass");
    compass.startup();

    var homeBtn = new Home({
        viewModel: new HomeVM({
            view: view
        })
    }, "home");
    homeBtn.startup();

    var legend = new Legend({ view: view }, 'legend');
    legend.startup();
    var switchLyr = function() {
        var lyrNames = ['确权数据', '确权数据--配号来源', '确权数据--用海一级类', '确权数据--用海二级类', '确权数据--用海方式', '功能区划'];
        var authLyr = new FeatureLayer({
            id: lyrNames[0],
            url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/0",
            popupTemplate: new PopupTemplate({
                title: 'title',
                content: "layer.No." + i + "<b>{FID}</b>"
            })
        });
        map.add(authLyr);

        var lyrs = {};
        lyrs[authLyr.id] = authLyr;
        for (var i = 1; i < 5; i++) {
            var newLyr = new FeatureLayer({
                id: lyrNames[i],
                url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/" + i,
                popupTemplate: new PopupTemplate({
                    title: 'title',
                    content: "layer.No." + i + "<br><b>{FID}</b>{用海一级类}"
                })
            });
            //add but do not show
            newLyr.visible = false;
            map.add(newLyr);
            lyrs[newLyr.id] = newLyr;
        }
        return {
            to: function to(val) {
                for (var lyrid in lyrs) {
                    lyrs[lyrid].visible = false;
                    if (lyrid == lyrNames[val]) {
                        lyrs[lyrid].visible = true;
                    }
                }
                legend.refresh();
                //layerControl.setCheckbox();
            },
            show: function hide(id) {
                lyrs[id].visible = true;
                legend.refresh();
                layerControl.setCheckbox();
            },
            hide: function hide(id) {
                lyrs[id].visible = false;
                legend.refresh();
                layerControl.setCheckbox();
            }
        }
    }();

    $('#aythLyrCata').change(function() {
        switchLyr.to($(this).val());
    });



    var layerControl = function() {
        var specificLyrs = {};
        var lyrNames = ['确权数据', '确权数据--配号来源', '确权数据--用海一级类', '确权数据--用海二级类', '确权数据--用海方式', '功能区划'];

        function setCheckbox() {
            $('.esri-legend-service').each(function() {
                var legendSvcLyr = $(this);
                var label = legendSvcLyr.find('.esri-legend-service-label').text();
                var lyrName = label.substring(label.lastIndexOf(' ') + 1);
                console.log(lyrName);
                var layer = legendSvcLyr.find('.esri-legend-layer').first();
                //loop through table rows
                layer.find('tr').each(function() {
                    var tr = $(this);
                    var tds = tr.find('td');
                    if (tds && tds.length && tds.length > 1) {
                        var sym = $(this).find('td').first();
                        //find the cell has text, which should be catagory info
                        $(this).find('td').each(function() {
                            var td = $(this);
                            if (!(td.find('table')[0])) {
                                var cata = $(this).text();
                                if (cata && cata.length > 0) {
                                    //add the layer
                                    var lyrIndex = lyrNames.indexOf(lyrName);
                                    var tempLyr = new FeatureLayer({
                                        id: lyrName + '_' + cata,
                                        url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/" + lyrIndex,
                                        definitionExpression: lyrName + " = " + "'" + cata + "'"
                                    });
                                    map.add(tempLyr);
                                    specificLyrs[tempLyr.id] = tempLyr;
                                    //add checkbox
                                    var checkBox = $('<input>').attr({ 'type': 'checkbox', 'data-lyr': lyrName, 'data-cata': cata, 'data-lyrid': lyrName + '_' + cata }).prop('checked', true).text(cata).change(function() {
                                        var lyrid = $(this).data('lyrid');
                                        if ($(this).is(':checked')) {
                                            specificLyrs[lyrid].visible = true;
                                            return;
                                        }
                                        specificLyrs[lyrid].visible = false;
                                    });
                                    var newtd = $('<td>').append(checkBox);
                                    //insert checkbox
                                    newtd.insertBefore(sym);
                                }
                            }
                        });
                    }
                });

            });
        }
        return {
            setCheckbox: setCheckbox
        }
    }();
});
