"use strict";

require(["esri/Map", "esri/views/MapView", "esri/layers/MapImageLayer", "esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/widgets/Legend", "esri/widgets/Compass", "esri/widgets/Compass/CompassViewModel", "esri/widgets/Home", "esri/widgets/Home/HomeViewModel", "esri/widgets/BasemapToggle", "esri/widgets/Popup", "esri/tasks/QueryTask", "esri/tasks/support/Query", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/geometry/Circle", "esri/geometry/Point", "esri/renderers/SimpleRenderer", "esri/renderers/ClassBreaksRenderer", "dojo/domReady!"], function (Map, MapView, MapImageLayer, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM, BasemapToggle, Popup, QueryTask, Query, SimpleFillSymbol, SimpleMarkerSymbol, GraphicsLayer, Graphic, Circle, Point, SimpleRenderer, ClassBreaksRenderer) {

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

        $('input[name="search"').keyup(searchForIt).change(searchForIt);

        $('i.icon.search').click(searchForIt);

        var contentID = "<label class='data-fid loader' data-fid='{FID}'>Loading...</label>";
        var contentTable = '<table class="ui celled table"><tbody><tr><td>' + '区域ID' + '</td><td>' + '{FID}' + '</td></tr><tr><td>' + 'radius' + '</td><td>' + '{radius}' + '</td></tr><tr><td>' + '配号来源' + '</td><td>' + '{配号来源}' + '</td></tr><tr><td>' + '用海一级类' + '</td><td>' + '{用海一级类}' + '</td></tr><tr><td>' + '用海二级类' + '</td><td>' + '{用海二级类}' + '</td></tr><tr><td>' + '用海方式' + '</td><td>' + '{用海方式}' + '</td></tr><tr><td class="projects">' + '项目数量' + '</td><td>*</td></tr></tbody></table>';

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

        var zoningLyr = new FeatureLayer({
            id: 'base',
            url: "http://localhost:6080/arcgis/rest/services/区域/MapServer/0"
        });

        map.add(zoningLyr);
        map.reorder(zoningLyr, 0);

        var zoningLyrCtrl = {
            on: true,
            toggle: function toggle() {
                if (this.on) {
                    map.remove(zoningLyr);
                } else {
                    map.add(zoningLyr);
                    map.reorder(zoningLyr, 0);
                };
                this.on = !this.on;
            }
        };

        var lyrIds = ['功能区划', '确权数据', '确权数据--配号来源', '确权数据--用海一级类', '确权数据--用海二级类', '确权数据--用海方式'];

        var authLyrs = [];
        authLyrs[1] = new FeatureLayer({
            id: lyrIds[1],
            outFields: ["*"],
            url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/1",
            popupTemplate: new PopupTemplate({
                title: 'ID: {FID}',
                content: contentTable
            })
        });
        map.add(authLyrs[1]);

        for (var i = 2; i < 6; i++) {
            var tempLyr = new FeatureLayer({
                id: lyrIds[i],
                outFields: ["*"],
                url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/" + i,
                popupTemplate: new PopupTemplate({
                    title: 'ID: {FID}',
                    content: contentTable
                })
            });

            authLyrs[i] = tempLyr;
        }

        var authLyrCtrl = {
            inviewIndex: 1,
            on: true,
            switchTo: function switchTo(val) {
                if (val !== this.inviewIndex) {
                    map.remove(authLyrs[this.inviewIndex]);
                    map.add(authLyrs[val]);
                    map.reorder(authLyrs[val], 1);
                    this.inviewIndex = val;
                }
            },
            show: function show() {
                map.add(authLyrs[this.inviewIndex]);
                map.reorder(authLyrs[this.inviewIndex], 1);
                this.on = true;
            },
            hide: function hide() {
                map.remove(authLyrs[this.inviewIndex]);
                this.on = false;
            },
            toggle: function toggle() {
                if (this.on) {
                    map.remove(authLyrs[this.inviewIndex]);
                    this.on = false;
                } else {
                    map.add(authLyrs[this.inviewIndex]);
                    map.reorder(authLyrs[this.inviewIndex], 1);
                    this.on = true;
                }
            }
        };

        function showVS(results) {
            /*****
                multipul layers for vs different outline size
              ******/
            var features = results.features;

            var sym = new SimpleMarkerSymbol({
                color: [26, 119, 80, 0.7],
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 255, 255],
                    width: 1
                }
            });

            var sym2 = new SimpleFillSymbol({
                color: [26, 119, 80, 0.7],
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 255, 255],
                    width: 2
                }
            });

            var fields = [{
                name: "ObjectID",
                alias: "ObjectID",
                type: "oid"
            }, {
                name: "radius",
                alias: "radius",
                type: "double"
            }, {
                name: "radius2",
                alias: "radius2",
                type: "double"
            }];

            fields = fields.concat(authLyrs[1].fields);

            var colorVisVar = {
                type: "color",
                field: "radius",
                stops: [{
                    value: 4,
                    color: [45, 195, 125, 0.9]
                }, {
                    value: 10,
                    color: [45, 195, 125, 0.4]
                }]
            };

            var colorVisVar2 = {
                type: "color",
                field: "radius2",
                stops: [{
                    value: 4,
                    color: [155, 45, 95, 0.9]
                }, {
                    value: 10,
                    color: [155, 45, 95, 0.4]
                }]
            };
            var sizeVisVar = {
                type: "size",
                field: "radius",
                valueUnit: "unknown",
                stops: [{
                    value: 4,
                    size: 8
                }, {
                    value: 6,
                    size: 24
                }, {
                    value: 8,
                    size: 36
                }, {
                    value: 10,
                    size: 42
                }, {
                    value: 12,
                    size: 100
                }]
            };

            var sizeVisVar2 = {
                type: "size",
                field: "radius2",
                valueUnit: "unknown",
                stops: [{
                    value: 4,
                    size: 42
                }, {
                    value: 6,
                    size: 36
                }, {
                    value: 8,
                    size: 24
                }, {
                    value: 10,
                    size: 8
                }]
            };
            var renderer = new SimpleRenderer({
                // Define a default marker symbol with a small outline
                symbol: new SimpleMarkerSymbol({
                    color: [45, 195, 125, 0.7],
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255, 0.6],
                        width: 1
                    }
                }),
                // Set the color and size visual variables on the renderer
                visualVariables: [colorVisVar, sizeVisVar]
            });

            var renderer2 = new SimpleRenderer({
                // Define a default marker symbol with a small outline
                symbol: new SimpleMarkerSymbol({
                    color: [45, 195, 125, 0.7],
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255, 0.8],
                        width: 1
                    }
                }),
                // Set the color and size visual variables on the renderer
                visualVariables: [colorVisVar2, sizeVisVar2]
            });

            function getSimpleR(outlineWidth) {
                return new SimpleRenderer({
                    // Define a default marker symbol with a small outline
                    symbol: new SimpleMarkerSymbol({
                        color: [45, 195, 125, 0.8],
                        outline: { // autocasts as new SimpleLineSymbol()
                            color: [85, 24 * outlineWidth, 185, 0.6],
                            width: outlineWidth - 4
                        }
                    }),
                    // Set the color and size visual variables on the renderer
                    visualVariables: [sizeVisVar2]
                });
            }
            var featureSets = [[], [], [], []];
            features.forEach(function (feature, index) {
                var attributes = feature.attributes;
                var name = attributes.ZIP + " (" + attributes.PO_NAME + ")";
                var gm = feature.geometry;

                var point = new Point({
                    longitude: gm.longitude ? gm.longitude : gm.centroid.longitude,
                    latitude: gm.latitude ? gm.latitude : gm.centroid.latitude
                });

                var radius = feature.attributes.FID > 1800 ? 10 : feature.attributes.FID > 1700 ? 8 : feature.attributes.FID > 1500 ? 6 : 4;

                var circle = new Circle({
                    radius: radius,
                    radiusUnit: 'miles',
                    center: feature.geometry.getPoint(0, 0)
                });
                feature.attributes.ObjectID = index;

                feature.attributes.radius = radius;

                feature.attributes.radius2 = 14 - radius;
                switch (feature.attributes.radius2) {
                    case 4:
                        featureSets[0].push(feature);
                    case 6:
                        featureSets[1].push(feature);
                    case 8:
                        featureSets[2].push(feature);
                    case 10:
                        featureSets[3].push(feature);
                }
            });
            for (var index in featureSets) {
                var vslyr = new FeatureLayer({
                    source: featureSets[index],
                    fields: fields,
                    objectIdField: "ObjectID",
                    renderer: getSimpleR(index * 2 + 4),
                    geometryType: "polygon",
                    id: 'vs' + index

                });

                map.add(vslyr);

                map.reorder(vslyr, 99);
            }

            var vslyr = new FeatureLayer({
                source: features,
                fields: fields,
                objectIdField: "ObjectID",
                renderer: renderer,
                geometryType: "polygon",
                id: 'vs'

            });

            //map.add(vslyr);

            //map.reorder(vslyr, 99);
            var vslyr2 = new FeatureLayer({
                source: features,
                fields: fields,
                objectIdField: "ObjectID",
                renderer: renderer2,
                geometryType: "polygon",
                id: 'vs2'

            });

            //map.add(vslyr2);

            map.reorder(vslyr2, 99);
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
        }

        authLyrs[1].then(function () {
            //authLyrs[1].queryFeatures().then(showVS);
        });

        $('input.toggle.toggle-zoning').change(function () {
            zoningLyrCtrl.toggle();
        });

        $('input.toggle.toggle-auth').change(function () {
            authLyrCtrl.toggle();
        });

        $('select[name=authLyr]').change(function () {
            authLyrCtrl.switchTo($(this).val());
        });

        var managePopupContent = function () {
            var status = 1;
            return function () {
                var el = $('.esri-popup-content')[0];
                if (status === 1 && el.childElementCount > 0) {
                    $('.esri-popup-content').unbind("DOMSubtreeModified");
                    var fid = $('.esri-popup-content').find('.data-fid.loader').data('fid');
                    if (fid) {
                        $.get('http://localhost:3000/popup_content?id=' + fid, function (htmlStr) {
                            $('.esri-popup-content').html(htmlStr);

                            $('.ui.dropdown').dropdown();
                            $('.popup-content-custom table').find('a').click(function () {
                                var field = $(this).data('type');
                                var qstr = 'SELECT `' + field + '` as label, count(`' + field + '` = `' + field + '`) as value FROM gis1.authorizing group by `' + field + '`';
                                createChart(qstr, field);
                            });
                            $('.esri-popup-content').bind("DOMSubtreeModified", managePopupContent);
                        });
                    }

                    status = 0;
                };
                if (el.childElementCount < 1) {
                    status = 1;
                };
            };
        }();

        /*$('.esri-popup-content').bind("DOMSubtreeModified", managePopupContent);
        view.on('click', function(evt) {
            showCoordinates(evt);
        })
          $.get('http://localhost:6080/arcgis/rest/services/用海信息/MapServer/legend?f=pjson', function(res) {
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

        function searchForIt() {
            var resultDiv = $('#searchResult.results');
            resultDiv.addClass('visible');
            var $input = $('input[name="search"');
            $('i.icon.remove').show();
            $('i.icon.search').hide();
            console.log('http://localhost:3000/search?q=' + $input.val());
            $.get('http://localhost:3000/search?q=' + $input.val(), function (res) {
                console.log(res);
                var resultDiv = $('#searchResult.results');
                resultDiv.find('.result').remove();
                var projects = resultDiv.find('.projects');
                var zones = resultDiv.find('.zones');
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = res.rows[0][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var rs = _step.value;

                        projects.show();
                        $('a.csv1').show();
                        var desc = '';
                        for (var key in rs) {
                            desc = desc + key + ': ' + rs[key];
                        }
                        desc = desc.substring(0, 64) + '...';
                        projects.append(addResult(rs['项目名称'], desc, rs['确权区域ID']));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = res.rows[1][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _rs = _step2.value;

                        zones.show();
                        $('a.csv2').show();
                        var desc = '';
                        for (var _key in _rs) {
                            desc = desc + _key + ': ' + _rs[_key];
                        }
                        desc = desc.substring(0, 64) + '...';
                        zones.append(addResult(_rs.id, desc, _rs.id));
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var links = resultDiv.find(".download-results");
                var csvNames = res.csvs.split(',');

                links.find('.csv1').attr('href', 'http://localhost:3000/csv/' + csvNames[0]);
                links.find('.csv2').attr('href', 'http://localhost:3000/csv/' + csvNames[1]);
                links.show();
            });

            function addResult(title, desc, popid) {
                return $('<a>').attr({ 'class': 'result', 'data-popid': popid }).append($('<div>').attr('class', 'content').append($('<div>').attr('class', 'title').text(title)).append($('<div>').attr('class', 'description').text(desc))).click(function () {
                    var featureId = $(this).data('popid');
                    console.log(authLyrCtrl.inviewIndex);
                    var flayr = authLyrs[authLyrCtrl.inviewIndex];
                    var query = new Query();
                    query.where = "FID = " + featureId;
                    query.returnGeometry = true;
                    query.outFields = ['*'];
                    map.reorder(flayr, 100);
                    flayr.queryFeatures(query).then(function (results) {
                        console.log(results);
                        view.popup.open({
                            features: [results.features[0]],
                            location: results.features[0].geometry.centroid
                        });
                    });
                });
            }
        }
    });

    function showCoordinates(evt) {
        $('#esri_widgets_Attribution_0 > div.esri-attribution__sources').html(evt.mapPoint.latitude + evt.mapPoint.longitude);
    }
});