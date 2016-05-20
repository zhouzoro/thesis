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
    "esri/symbols/SimpleFillSymbol",
    "dojo/domReady!"
], function(Map, MapView, MapImageLayer, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM, BasemapToggle, Popup, QueryTask, Query, SimpleFillSymbol) {

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
        var contentID = "<label class='data-fid loader' data-fid='{FID}'>Loading...</label>";
        /*var contentID = '<table class="ui celled table"><tbody><tr><td>' + 'FID' + '</td><td>' + '{FID}' + '</td></tr><tr><td>' + '配号来源' + '</td><td>' + '{配号来源}' + '</td></tr><tr><td>' + '用海一级类' + '</td><td>' + '{用海一级类}' + '</td></tr><tr><td>' + '用海二级类' + '</td><td>' + '{用海二级类}' + '</td></tr><tr><td>' + '用海方式' + '</td><td>' + '{用海方式}' + '</td></tr></tbody></table>'
         */
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
                    title: 'ID: {FID}',
                    content: contentID
                })
            });
            console.log(authLyrs[1]);
            map.add(authLyrs[1]);

            for (var i = 2; i < 6; i++) {
                var tempLyr = new FeatureLayer({
                    id: lyrIds[i],
                    url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/" + i,
                    popupTemplate: new PopupTemplate({
                        title: 'ID: {FID}',
                        content: contentID
                    })
                });
                authLyrs[i] = tempLyr;
            }

            view.whenLayerView(authLyrs[1]).then(function(lyrView) {
                lyrView.watch("updating", function(val) {
                    if (!val) { // wait for the layer view to finish updating

                        // query all the features available for drawing.
                        lyrView.queryFeatures().then(function(results) {
                            console.log(results[0]);
                            var sym = SimpleFillSymbol({
                                color: "red",
                                outline: {
                                    color: [128, 128, 128, 0.5],
                                    width: "0.5px"
                                }
                            });
                            results.forEach(function(result, index) {
                                var attributes = result.attributes;
                                var name = attributes.ZIP + " (" +
                                    attributes.PO_NAME + ")"
                                result.symbol = sym;

                            });
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

        var managePopupContent = function() {
            var status = 1;
            return function() {
                var el = $('.esri-popup-content')[0];
                if (status === 1 && el.childElementCount > 0) {
                    $('.esri-popup-content').unbind("DOMSubtreeModified");
                    var fid = $('.esri-popup-content').find('.data-fid.loader').data('fid');
                    if (fid) {
                        $.get('http://localhost:3000/popup_content?id=' + fid, function(htmlStr) {
                            $('.esri-popup-content').html(htmlStr);

                            $('.ui.dropdown').dropdown();
                            $('.popup-content-custom table').find('a').click(function() {
                                var field = $(this).data('type');
                                var qstr = 'SELECT `' + field + '` as label, count(`' + field + '` = `' + field + '`) as value FROM gis1.authorizing group by `' + field + '`';
                                createChart(qstr, field);
                            });
                            $('.esri-popup-content').bind("DOMSubtreeModified", managePopupContent);
                        })
                    }

                    status = 0;
                };
                if (el.childElementCount < 1) {
                    status = 1;
                };
            }
        }();
        $('.esri-popup-content').bind("DOMSubtreeModified", managePopupContent);
        view.on('click', function(evt) {
            showCoordinates(evt);
        })

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

    });


    function showCoordinates(evt) {
        $('#esri_widgets_Attribution_0 > div.esri-attribution__sources').html(evt.mapPoint.latitude + evt.mapPoint.longitude)
    }
});
