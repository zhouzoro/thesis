"use strict";

require(["esri/Map", "esri/views/MapView", "esri/layers/ArcGISDynamicLayer", "esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/widgets/Legend", "esri/widgets/Compass", "esri/widgets/Compass/CompassViewModel", "esri/widgets/Home", "esri/widgets/Home/HomeViewModel", "dojo/domReady!"], function (Map, MapView, ArcGISDynamicLayer, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM) {
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

    var content = "<b>{FID}</b> {OBJECTID}<br>" + "功能区类型:{功能区类型}<br>" + "{SHAPE_LEN}" + "<img src='https://www.google.com/logos/doodles/2016/mohammed-ghani-hikmats-87th-birthday-5708620060688384-hp2x.jpg' />";

    var pt = new PopupTemplate({
        title: '{FID}',
        content: content
    });
    var zoningLyr = new FeatureLayer({
        url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/5"
    });
    //popupTemplate: pt
    map.add(zoningLyr);
    /**/
    var compass = new Compass({
        viewModel: new CompassVM({
            view: view
        })
    }, "compassDiv");
    compass.startup();

    var homeBtn = new Home({
        viewModel: new HomeVM({
            view: view
        })
    }, "homeDiv");
    homeBtn.startup();

    var legend = new Legend({ view: view }, 'legend');
    legend.startup();
    var switchLyr = function () {

        var authLyr = new FeatureLayer({
            id: 'authLyr',
            url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/0",
            popupTemplate: new PopupTemplate({
                title: 'title',
                content: "layer.No." + i + "<b>{FID}</b>"
            })
        });
        map.add(authLyr);

        var lyrs = { authLyr: authLyr };
        for (var i = 1; i < 5; i++) {
            var newLyr = new FeatureLayer({
                id: 'feature-' + i,
                url: "http://localhost:6080/arcgis/rest/services/04202/MapServer/" + i,
                popupTemplate: new PopupTemplate({
                    title: 'title',
                    content: "layer.No." + i + "<br><b>{FID}</b>{用海一级类}"
                })
            });
            console.log(newLyr);
            //add but do not show
            newLyr.visible = false;
            map.add(newLyr);
            lyrs[newLyr.id] = newLyr;
        }
        return {
            to: function to(val) {
                for (var lyrid in lyrs) {
                    lyrs[lyrid].visible = false;
                    if (lyrid == 'feature-' + val) {
                        lyrs[lyrid].visible = true;
                    }
                }
                legend.refresh();
                layerControl();
            }
        };
    }();

    $('#aythLyrCata').change(function () {
        switchLyr.to($(this).val());
    });

    var layerControl = function () {
        var specificLyrs = {};

        function setCheckbox() {
            $('.esri-legend-service').each(function () {
                var legendSvcLyr = $(this);
                var label = legendSvcLyr.find('.esri-legend-service-label').text();
                var lyrName = label.substring(label.lastIndexOf(' ') + 1);
                console.log(lyrName);
                var layer = legendSvcLyr.find('.esri-legend-layer').first();
                //loop through table rows
                layer.find('tr').each(function () {
                    var tr = $(this);
                    var tds = tr.find('td');
                    if (tds && tds.length && tds.length > 1) {
                        var sym = $(this).find('td').first();
                        var cata = '';
                        //find the cell has text, which should be catagory info
                        $(this).find('td').each(function () {
                            var td = $(this);
                            if (!td.find('table')[0]) {
                                var txt = $(this).text();
                                if (txt && txt.length > 0) {
                                    //add checkbox
                                    var checkBox = $('<input>').attr({ 'type': 'checkbox', 'data-lyr': lyrName, 'data-cata': txt }).prop('checked', true).text(txt).change(function () {
                                        if ($(this).is(':checked')) {
                                            console.log('y');
                                            //showCata($(this).text())
                                            return;
                                        }
                                        console.log('n');
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
    }();
});