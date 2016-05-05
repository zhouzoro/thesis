"use strict";

require(["esri/Map", "esri/views/MapView", "esri/layers/MapImageLayer", "esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/widgets/Legend", "esri/widgets/Compass", "esri/widgets/Compass/CompassViewModel", "esri/widgets/Home", "esri/widgets/Home/HomeViewModel", "esri/widgets/BasemapToggle", "esri/widgets/Popup", "esri/tasks/QueryTask", "esri/tasks/support/Query", "dojo/domReady!"], function (Map, MapView, MapImageLayer, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM, BasemapToggle, Popup, QueryTask, Query) {

    var map = new Map({
        basemap: "oceans"
    });

    var view = new MapView({
        container: "map-container",
        map: map,
        zoom: 9,
        center: [121, 33]
    });
    var services = ['zoning', 'authorized', 'authorized_source', 'authorized_cata1', 'authorized_cata2', 'authorized_method'];
    view.then(function () {

        var content = "<b>{FID}</b> {OBJECTID}<br>" + "功能区类型:{功能区类型}<br>" + "{SHAPE_LEN}" + "<img src='https://www.google.com/logos/doodles/2016/mohammed-ghani-hikmats-87th-birthday-5708620060688384-hp2x.jpg' />";
        var tableContent = '<table class="ui celled table"><tbody><tr><td>' + 'FID' + '</td><td>' + '{FID}' + '</td></tr><tr><td>' + '配号来源' + '</td><td>' + '{配号来源}' + '</td></tr><tr><td>' + '用海一级类' + '</td><td>' + '{用海一级类}' + '</td></tr><tr><td>' + '用海二级类' + '</td><td>' + '{用海二级类}' + '</td></tr><tr><td>' + '用海方式' + '</td><td>' + '{用海方式}' + '</td></tr></tbody></table>';

        //==widgets======================//
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

        var basemapToggle = new BasemapToggle({
            view: view,
            nextBasemap: "dark-gray"
        }, 'basemap');
        basemapToggle.startup();

        //var legend = new Legend({ view: view }, 'legend');

        var legend = new Legend({
            view: view
        });
        legend.startup();

        view.ui.add(legend, "bottom-right");
        //==widgets======================//

        var authLyrCtrl = function () {

            var lyrIds = ['功能区划', '确权数据', '确权数据--配号来源', '确权数据--用海一级类', '确权数据--用海二级类', '确权数据--用海方式'];
            var authLyrs = [];
            authLyrs[1] = new FeatureLayer({
                id: lyrIds[1],
                url: "http://localhost:6080/arcgis/rest/services/allofit/MapServer/1",
                popupTemplate: new PopupTemplate({
                    title: 'title',
                    content: tableContent
                })
            });
            map.add(authLyrs[1]);
            var inviewIndex = 1;
            for (var i = 2; i < 6; i++) {
                var tempLyr = new FeatureLayer({
                    id: lyrIds[i],
                    url: "http://localhost:6080/arcgis/rest/services/allofit/MapServer/" + i,
                    popupTemplate: new PopupTemplate({
                        title: 'title',
                        content: tableContent
                    })
                });
                authLyrs.push(tempLyr);
            }

            view.whenLayerView(authLyrs[1]).then(function (lyrView) {
                lyrView.watch("updating", function (val) {
                    if (!val) {
                        // wait for the layer view to finish updating

                        // query all the features available for drawing.
                        lyrView.queryFeatures().then(function (results) {
                            console.log(results[0]);

                            /*graphics = results;
                            var fragment = document.createDocumentFragment();
                            results.forEach(function(result, index) {
                            var attributes = result.attributes;
                            var name = attributes.ZIP + " (" +
                            attributes.PO_NAME + ")"
                            // Create a list zip codes in NY
                            domConstruct.create("li", {
                            className: "panel-result",
                            tabIndex: 0,
                            "data-result-id": index,
                            textContent: name
                            }, fragment);
                            });
                            domConstruct.place(fragment, listNode, "only");*/
                        });
                    }
                });
            });
            /*on(listNode, on.selector("li", a11yclick), function(evt) {
                var target = evt.target;
                var resultId = domAttr.get(target, "data-result-id");
                  // get the graphic corresponding to the clicked zip code
                var result = resultId && graphics && graphics[parseInt(resultId,
                    10)];
                  if (result) {
                    // open the popup at the centroid of zip code polygon
                    // and set the popup's features which will populate popup content and title.
                    view.popup.open({
                        features: [result],
                        location: result.geometry.centroid
                    });
                }
            });*/

            return {
                on: true,
                switchTo: function to(val) {
                    if (val !== inviewIndex) {
                        map.remove(authLyrs[inviewIndex]);
                        map.add(authLyrs[val]);
                    }
                },
                show: function show() {
                    map.add(authLyrs[inviewIndex]);
                    this.on = true;
                },
                hide: function hide() {
                    map.remove(authLyrs[inviewIndex]);
                    this.on = false;
                }
            };
        }();

        var zoningLyrCtrl = function () {

            var zoningLyr = new FeatureLayer({
                id: '功能区划',
                url: "http://localhost:6080/arcgis/rest/services/zoning/MapServer/0"
            });

            return {
                on: false,
                toggle: function toggle() {
                    if (this.on) {
                        map.remove(zoningLyr);
                    } else {

                        map.add(zoningLyr);
                        if (authLyrCtrl.on) {
                            authLyrCtrl.hide;
                            authLyrCtrl.show;
                        }
                    };
                    this.on = !this.on;
                }
            };
        }();

        $('input.toggle.toggle-zoning').change(function () {
            zoningLyrCtrl.toggle();
            console.log(zoningLyrCtrl.on);
        });

        $('input.toggle.toggle-zoning').change(function () {
            if ($(this).val() == 'on') {
                authLyrCtrl.show;
            } else {
                authLyrCtrl.hide;
            }
        });
        $('select[name=authLyr]').change(function () {
            authLyrCtrl.switchTo($(this).val());
        });

        function dataSrc() {
            this.chart = {
                "caption": "确权数据分类",
                "subCaption": "用海一级类",
                "xAxisName": "用海一级类",
                "yAxisName": "数量",
                "theme": "fint"
            };
            this.data = [];
        }
        var col3dShow = [];

        /*$.get('http://localhost:6080/arcgis/rest/services/allofit/MapServer/legend?f=pjson', function(res) {
            legendJson = JSON.parse(res);
            for (var i = 1; i < 6; i++) {
                var layerTemp = legendJson.layers[i];
                var layerLegend = layerTemp.legend;
                var tempSrc = new dataSrc();
                tempSrc.chart.subCaption = layerTemp.layerName;
                tempSrc.chart.xAxisName = layerTemp.layerName;
                var queryStatesTask = new QueryTask({
                    url: "http://localhost:6080/arcgis/rest/services/allofit/MapServer/" + i
                });
                var promiseResults = [];
                for (var j = layerLegend.length - 1; i >= 0; i--) {
                    var legd = layerLegend[i];
                    promiseResults.push(new Promise((resolve, reject) => {
                        var query = new Query();
                        query.where = layerTemp.layerName + " = " + "'" + legd.label + "'";
                        queryStatesTask.execute(query).then(function(result) {
                            console.log(result.features.length);
                            var tempData = {
                                "label": legd.label,
                                "value": result.features.length
                            };
                            resolve(tempData);
                        });
                    }))
                }
                Promise.all(promiseResults).then(function(dataArr) {
                    console.log(dataArr);
                    tempSrc.data = dataArr;
                    renderCol3d(tempSrc);
                  })
            }
        })*/
    });
});