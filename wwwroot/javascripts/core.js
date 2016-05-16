require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
    "esri/widgets/Compass",
    "esri/widgets/Compass/CompassViewModel",
    "esri/widgets/Home",
    "esri/widgets/Home/HomeViewModel",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Popup",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/widgets/Search",
    "dojo/domReady!"
], function(Map, MapView, MapImageLayer, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM, BasemapToggle, Popup, QueryTask, Query, Search) {

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
    view.then(function() {

    map.on('mouse-move', showCoordinates);
        var content = "<b>{FID}</b> {OBJECTID}<br>" +
            "功能区类型:{功能区类型}<br>" + "{SHAPE_LEN}" + "<img src='https://www.google.com/logos/doodles/2016/mohammed-ghani-hikmats-87th-birthday-5708620060688384-hp2x.jpg' />";
        var tableContent = '<table class="ui celled table"><tbody><tr><td>' + 'FID' + '</td><td>' + '{FID}' + '</td></tr><tr><td>' + '配号来源' + '</td><td>' + '{配号来源}' + '</td></tr><tr><td>' + '用海一级类' + '</td><td>' + '{用海一级类}' + '</td></tr><tr><td>' + '用海二级类' + '</td><td>' + '{用海二级类}' + '</td></tr><tr><td>' + '用海方式' + '</td><td>' + '{用海方式}' + '</td></tr></tbody></table>'

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
            nextBasemap: "hybrid"
        }, 'basemap');
        basemapToggle.startup();

        //var legend = new Legend({ view: view }, 'legend');

        var legend = new Legend({
            view: view
        });
        legend.startup();

        view.ui.add(legend, "bottom-right");

        //==widgets======================//


        var authLyrCtrl = function() {

            var lyrIds = ['功能区划', '确权数据', '确权数据--配号来源', '确权数据--用海一级类', '确权数据--用海二级类', '确权数据--用海方式'];
            var authLyrs = [];
            authLyrs[1] = new FeatureLayer({
                id: lyrIds[1],
                url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/1",
                popupTemplate: new PopupTemplate({
                    title: 'title',
                    content: tableContent
                })
            });
            map.add(authLyrs[1]);

            for (var i = 2; i < 6; i++) {
                var tempLyr = new FeatureLayer({
                    id: lyrIds[i],
                    url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/" + i,
                    popupTemplate: new PopupTemplate({
                        title: 'title',
                        content: tableContent
                    })
                });
                authLyrs[i] = tempLyr;
            }

            var searchWidget = new Search({
                view: view,
                allPlaceholder: '搜索',
                maxResults: 1000,
                sources: [{
                    featureLayer: new FeatureLayer({
                        url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/3",
                    }),
                    searchFields: ["用海一级类"],
                    displayField: "用海一级类",
                    exactMatch: false,
                    outFields: ["FID", "用海一级类", "用海方式"],
                    name: "用海一级类",
                    placeholder: "搜索用海一级类",
                }, {
                    featureLayer: new FeatureLayer({
                        url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/4",
                    }),
                    searchFields: ["FID", "用海二级类"],
                    suggestionTemplate: "{FID}, 用海二级类: {用海二级类}",
                    exactMatch: false,
                    outFields: ["FID", "用海一级类", "用海二级类"],
                    name: "用海二级类",
                }, {
                    featureLayer: new FeatureLayer({
                        url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/5",
                    }),
                    searchFields: ["FID", "用海方式"],
                    suggestionTemplate: "{FID}, 用海方式: {用海方式}",
                    exactMatch: false,
                    outFields: ["FID", "用海一级类", "用海方式"],
                    name: "用海方式",
                }]
            });
            searchWidget.startup();

            view.ui.add(searchWidget, {
                position: "top-left",
                index: 0
            });
            view.whenLayerView(authLyrs[1]).then(function(lyrView) {
                lyrView.watch("updating", function(val) {
                    if (!val) { // wait for the layer view to finish updating

                        // query all the features available for drawing.
                        lyrView.queryFeatures().then(function(results) {
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
                inviewIndex: 1,
                on: true,
                switchTo: function(val) {
                    console.log('switching');
                    console.log(this.inviewIndex);
                    console.log(val);
                    if (val !== this.inviewIndex) {
                        map.remove(authLyrs[this.inviewIndex]);
                        console.log('switching');
                        map.add(authLyrs[val]);
                        this.inviewIndex = val;
                    }
                },
                show: function() {
                    map.add(authLyrs[this.inviewIndex]);
                    this.on = true;
                },
                hide: function() {
                    map.remove(authLyrs[this.inviewIndex]);
                    this.on = false;
                },
                toggle: function() {
                    if (this.on) {
                        map.remove(authLyrs[this.inviewIndex]);
                        this.on = false;
                    } else {
                        map.add(authLyrs[this.inviewIndex]);
                        this.on = true;
                    }
                }
            }
        }();


        var zoningLyrCtrl = function() {

            var zoningLyr = new FeatureLayer({
                id: '功能区划',
                url: "http://localhost:6080/arcgis/rest/services/zoning/MapServer/0",
            });

            return {
                on: false,
                toggle: function() {
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
            }
        }();

        $('input.toggle.toggle-zoning').change(function() {
            zoningLyrCtrl.toggle();
        })

        $('input.toggle.toggle-auth').change(function() {
                authLyrCtrl.toggle();
            })
            /*$('input.toggle.toggle-zoning').change(function() {
                if ($(this).val() == 'on') {
                    authLyrCtrl.show;
                } else {
                    authLyrCtrl.hide;

                }
            })*/
        $('select[name=authLyr]').change(function() {
            console.log($(this).val());
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

        /*$.get('http://localhost:6080/arcgis/rest/services/用海信息/MapServer/legend?f=pjson', function(res) {
            legendJson = JSON.parse(res);
            for (var i = 1; i < 6; i++) {
                var layerTemp = legendJson.layers[i];
                var layerLegend = layerTemp.legend;
                var tempSrc = new dataSrc();
                tempSrc.chart.subCaption = layerTemp.layerName;
                tempSrc.chart.xAxisName = layerTemp.layerName;
                var queryStatesTask = new QueryTask({
                    url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/" + i
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

        var tempSrc = new dataSrc();
        tempSrc.data = [{
            "label": "Jan",
            "value": "420000"
        }, {
            "label": "Feb",
            "value": "810000"
        }, {
            "label": "Mar",
            "value": "720000"
        }, {
            "label": "Apr",
            "value": "550000"
        }, {
            "label": "May",
            "value": "910000"
        }, {
            "label": "Jun",
            "value": "510000"
        }, {
            "label": "Jul",
            "value": "680000"
        }, {
            "label": "Aug",
            "value": "620000"
        }, {
            "label": "Sep",
            "value": "610000"
        }, {
            "label": "Oct",
            "value": "490000"
        }, {
            "label": "Nov",
            "value": "900000"
        }, {
            "label": "Dec",
            "value": "730000"
        }];

        //renderCol3d(tempSrc);
    });


    function showCoordinates(evt) {
        console.log(evt);
        $('#esri_widgets_Attribution_0 > div.esri-attribution__sources').html()
    }
});
