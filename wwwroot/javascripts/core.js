require([
    "esri/Map",
    "esri/views/MapView",
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
    "esri/symbols/SimpleMarkerSymbol",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "dojo/domReady!"
], function(Map, MapView, FeatureLayer, PopupTemplate, Legend, Compass, CompassVM, Home, HomeVM, BasemapToggle, Popup, QueryTask, Query, SimpleFillSymbol, SimpleMarkerSymbol, GraphicsLayer, Graphic, Point, SimpleRenderer, ClassBreaksRenderer) {

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

        $('input[name="search"').change(searchForIt);


        $('i.icon.search').click(searchForIt);

        var contentID = "<label class='data-fid loader' data-fid='{FID}'>Loading...</label>";
        var contentTable = '<table class="ui celled table"  data-fid="{FID}">' +
            '<tbody>' +
            '<tr><td>区域ID</td><td>{FID}</td></tr>' +
            '<tr><td>配号来源</td><td>{配号来源}</td></tr>' +
            '<tr><td>用海一级类</td><td>{用海一级类}</td></tr>' +
            '<tr><td>用海二级类</td><td>{用海二级类}</td></tr>' +
            '<tr><td>用海方式</td><td>{用海方式}</td></tr>' +
            '<tr><td class="projects">项目</td><td>{数量}<a href="#" class="projects-link" data-zone={FID} onclick="showProjects()">点击查看项目详情</a></td></tr>' +
            '</tbody>' +
            '</table>';
        var searchTemplate = '<table class="ui celled table"  data-fid="{FID}">' +
            '<tbody>' +
            '<tr><td class="projects">搜索结果项目数量</td><td>{数量}<a href="#" class="projects-link" data-zone={FID} onclick="showProjects()"> 点击查看项目详情</a></td></tr>' +
            '<tr><td class="projects">项目平均相关程度</td><td>{相关程度}</td></tr>' +
            '<tr><td>区域ID</td><td>{FID}</td></tr>' +
            '<tr><td>配号来源</td><td>{配号来源}</td></tr>' +
            '<tr><td>用海一级类</td><td>{用海一级类}</td></tr>' +
            '<tr><td>用海二级类</td><td>{用海二级类}</td></tr>' +
            '<tr><td>用海方式</td><td>{用海方式}</td></tr>' +
            '</tbody>' +
            '</table>';

        function vsTemplate(val, field) {
            var contentTemplate = '<table class="ui celled table"  data-fid="{FID}">' +
                '<tbody>' +
                '<tr><td class="projects">' + val + '项目数量</td><td>{数量}<a href="#" class="projects-link" data-zone={FID} data-field=' + field + ' data-val=' + val + ' onclick="showProjects()"> 点击查看项目详情</a></td></tr>' +
                '<tr><td>配号来源</td><td>{配号来源}</td></tr>' +
                '<tr><td>用海一级类</td><td>{用海一级类}</td></tr>' +
                '<tr><td>用海二级类</td><td>{用海二级类}</td></tr>' +
                '<tr><td>用海方式</td><td>{用海方式}</td></tr>' +
                '</tbody>' +
                '</table>';
            return new PopupTemplate({
                title: '区域ID: {FID}',
                content: contentTemplate
            })
        }
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
            url: "http://localhost:6080/arcgis/rest/services/区域/MapServer/0",
        });

        map.add(zoningLyr);
        map.reorder(zoningLyr, 0);

        var zoningLyrCtrl = {
            on: true,
            toggle: function() {
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

        for (var i = 1; i < 6; i++) {
            var tempLyr = new FeatureLayer({
                id: lyrIds[i],
                outFields: ["*"],
                url: "http://localhost:6080/arcgis/rest/services/用海信息/MapServer/" + i,
                popupTemplate: new PopupTemplate({
                    title: '区域ID: {FID}',
                    content: contentTable
                })
            });

            if (i == 1) map.add(tempLyr);

            authLyrs[i] = tempLyr;
        }

        var authLyrCtrl = {
            inviewIndex: 1,
            on: true,
            switchTo: function(val) {
                if (val !== this.inviewIndex) {
                    map.remove(authLyrs[this.inviewIndex]);
                    map.add(authLyrs[val]);
                    map.reorder(authLyrs[val], 1);
                    this.inviewIndex = val;
                }
            },
            toggle: function() {
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
        var fillColor = [
            [26, 59, 180, 0.7],
            [155, 45, 95, 0.7],
            [26, 119, 80, 0.7],
            [126, 119, 80, 0.7],
            [176, 189, 140, 0.7],
            [49, 145, 85, 0.7],
            [26, 119, 180, 0.7]
        ];
        var outlineColor = [
            [255, 255, 255, 0.6],
            [26, 59, 180, 0.6],
            [155, 45, 95, 0.6],
            [26, 119, 80, 0.6],
            [126, 119, 80, 0.6],
            [26, 119, 180, 0.6]
        ];
        var sizeVisVar = {
            type: "size",
            field: "数量",
            valueUnit: "unknown",
            stops: [{
                value: 1,
                size: 8
            }, {
                value: 2,
                size: 24
            }, {
                value: 3,
                size: 36
            }, {
                value: 4,
                size: 42
            }]
        };

        var fields = [{
            name: "ObjectID",
            alias: "ObjectID",
            type: "oid"
        }, {
            name: "数量",
            alias: "数量",
            type: "double"
        }, {
            name: "相关程度",
            alias: "相关程度",
            type: "number"
        }].concat(authLyrs[1].fields);;

        function showVS(features, val, field, id) {

            var title = field + ': ' + val + '项目';
            var color = fillColor[((id - 1) % 7)];
            var outColor = outlineColor[Math.floor((id - 1) / 7)];
            $('.checkbox[data-field="' + field + '"][data-val="' + val + '"]').find('.symbol').css({
                "background": "rgba(" + color.toString() + ")"
            });
            var renderer = new SimpleRenderer({
                symbol: new SimpleMarkerSymbol({
                    color: color,
                    outline: {
                        color: outColor,
                        width: 2
                    }
                }),
                visualVariables: [sizeVisVar]
            });


            var vslyr = new FeatureLayer({
                id: id,
                title: title,
                source: features,
                fields: fields,
                objectIdField: "ObjectID",
                renderer: renderer,
                geometryType: "polygon"

            });

            map.add(vslyr);

            map.reorder(vslyr, 99);
            return vslyr;
        }


        var VsCtrl = function() {
            var vsLayers = {};
            var baseLayer = authLyrs[1];
            var inviewLyrs = [];
            var vsVisible = true;
            var layerCount = 0;

            function setUp(item) {
                if (zoningLyrCtrl.on) $('input.toggle.toggle-zoning').click();
                if (authLyrCtrl.on) $('input.toggle.toggle-auth').click();
                var field = item.data('type');
                var content = item.next('.content');
                var values = [];
                content.find('.vs-selection input[type="checkbox"]').each(function() {
                    if ($(this).val() !== '全部') {
                        layerCount++;
                        var lyrid = layerCount;
                        addVsLyr($(this).val(), field, lyrid);
                        $(this).attr("data-id", lyrid);
                    }
                });
            }

            function addVsLyr(val, field, lyrid) {
                var popTempt = vsTemplate(val, field);
                getZoneCount(val, field).then(function(rows) {

                    baseLayer.queryFeatures().then(function(results) {
                        vsLayers[lyrid] = showVS(setVsAttr(rows, results, popTempt), val, field, lyrid);
                        inviewLyrs.push(lyrid);
                    });
                });
            }

            function addLyr(key) {
                for (let id in vsLayers) {
                    if (id == key) {
                        map.add(vsLayers[id]);
                    }
                }
            }

            function removeLyr(key) {
                for (let id of inviewLyrs) {
                    if (id == key) {
                        map.remove(vsLayers[id]);
                    }
                }
            }
            return {
                setUp: setUp,
                addVsLyr: addVsLyr,
                addLyr: addLyr,
                removeLyr: removeLyr
            }
        }();

        var searchLayerControl = function() {
            var pLayer = {};
            var zLayer = {};
            var opVisVar = {
                type: "opacity",
                field: "相关程度",
                valueUnit: "unknown",
                stops: [{
                    value: 1e-10,
                    opacity: 0.01
                }, {
                    value: 1e-7,
                    opacity: 0.05
                }, {
                    value: 2e-7,
                    opacity: 0.1
                }, {
                    value: 3e-7,
                    opacity: 0.2
                }, {
                    value: 3e-6,
                    opacity: 0.4
                }, {
                    value: 1e-3,
                    opacity: 0.5
                }, {
                    value: 1e-2,
                    opacity: 0.7
                }, {
                    value: 1e-1,
                    opacity: 0.8
                }, {
                    value: 1,
                    opacity: 1
                }]
            };

            function addpLayer(features) {
                var title = '用海项目搜索结果';
                var color = fillColor[5];
                var outColor = outlineColor[0];
                var renderer = new SimpleRenderer({
                    symbol: new SimpleMarkerSymbol({
                        color: color,
                        outline: {
                            color: outColor,
                            width: 2
                        }
                    }),
                    visualVariables: [sizeVisVar, opVisVar]
                });


                pLayer = new FeatureLayer({
                    title: title,
                    source: features,
                    fields: fields,
                    objectIdField: "ObjectID",
                    renderer: renderer,
                    geometryType: "polygon"
                });

                map.add(pLayer);
                map.reorder(pLayer, 99);
            }

            function addzLayer(features) {
                var title = '确权区域搜索结果';

                zLayer = new FeatureLayer({
                    title: title,
                    source: features,
                    fields: fields,
                    objectIdField: "ObjectID",
                    geometryType: "polygon"
                });

                map.add(zLayer);
                map.reorder(zLayer, 1);
            }

            function show(projs, zones) {
                clearSR();
                $('.vs-selection .checkbox.allin').checkbox('uncheck');

                if (zoningLyrCtrl.on) $('input.toggle.toggle-zoning').click();

                if (authLyrCtrl.on) $('input.toggle.toggle-auth').click();
                authLyrs[1].queryFeatures().then(function(results) {
                    var features = results.features;
                    var pFeatures = [];
                    var zFeatures = [];
                    features.forEach(function(feature, index) {

                        for (let z of zones) {
                            if (z.id == feature.attributes.FID) {
                                zFeatures.push(feature);
                            }
                        }
                        var relevance = 0;
                        var pCount = 0
                        for (let p of projs) {
                            if (p['确权区域ID'] == feature.attributes.FID) {
                                relevance += p.relevance;
                                pCount++;
                            }
                        }
                        if (pCount) {
                            feature.attributes['数量'] = pCount;
                            feature.attributes['相关程度'] = relevance / pCount;
                            feature.popupTemplate.content = searchTemplate;
                            pFeatures.push(feature);
                        }
                    });
                    addzLayer(zFeatures);
                    addpLayer(pFeatures);

                });
            }

            function clearSR() {
                map.remove(pLayer);
                map.remove(zLayer);
                pLayer = {};
                zLayer = {};
            }
            return {
                show: show,
                clear: clearSR
            }
        }();

        function getZoneCount(val, field) {
            return new Promise(function(resolve, reject) {
                var url = '/mysql/zone_count?field=' + field + '&val=' + val;
                $.get(url, function(res) {
                    resolve(res);
                })
            })
        }

        function setVsAttr(rows, results, popTempt) {
            var features = results.features;
            var wantedFeatures = [];
            features.forEach(function(feature, index) {
                feature.popupTemplate = popTempt;
                for (let row of rows) {
                    if (row.zone == feature.attributes.FID) {
                        feature.attributes['数量'] = row.count;
                        wantedFeatures.push(feature);
                    }
                }
            });
            return wantedFeatures;
        }

        function searchForIt() {
            var resultDiv = $('#searchResult.results');
            var projects = resultDiv.find('.projects');
            projects.hide();
            projects.find('.result').remove();
            var zones = resultDiv.find('.zones');
            zones.hide();
            zones.find('.result').remove();
            resultDiv.append('<div class="ui segment"><div class="ui active inverted dimmer"><div class="ui loader"></div></div><p></p></div>');
            resultDiv.addClass('visible');
            var $input = $('input[name="search"');
            $('i.icon.remove').show();
            $('i.icon.search').hide();
            $.get('/mysql/search?q=' + $input.val(), function(res) {
                resultDiv.find('.segment').remove();
                console.log(res.rows[0].length);

                console.log(res.rows[1].length);
                for (let i in res.rows[0]) {
                    if (i < 5) {
                        var rs = res.rows[0][i];
                        projects.show();
                        $('a.csv1').show();
                        var desc = '';
                        for (let key in rs) {
                            desc = desc + key + ': ' + rs[key] + ', ';
                        }
                        desc = desc.substring(0, 54) + '...';
                        projects.append(addResult(rs['项目名称'], desc, rs['确权区域ID']))
                    }
                }

                for (let i in res.rows[1]) {
                    if (i < 5) {
                        var rs = res.rows[1][i];
                        zones.show();
                        $('a.csv2').show();
                        var desc = '';
                        for (let key in rs) {
                            if (key == 'init_date') {
                                rs[key] = rs[key].substring(0, 10);
                            }
                            desc = desc + key + ': ' + rs[key] + ', ';
                        }
                        desc = desc.substring(0, 48) + '...';
                        zones.append(addResult(rs.id, desc, rs.id))
                    }
                }
                var links = resultDiv.find(".download-results");
                var csvNames = res.csvs.split(',');

                links.find('.csv1').attr('href', '/mysql/csv/' + csvNames[0]);
                links.find('.csv2').attr('href', '/mysql/csv/' + csvNames[1]);
                links.show();
                searchLayerControl.show(res.rows[0], res.rows[1]);
            })

            function addResult(title, desc, popid) {
                return $('<a>').attr({ 'class': 'result', 'data-popid': popid })
                    .append($('<div>').attr('class', 'content')
                        .append($('<div>').attr('class', 'title').text(title))
                        .append($('<div>').attr('class', 'description').text(desc))
                    ).click(function() {
                        var featureId = $(this).data('popid');
                        console.log(authLyrCtrl.inviewIndex);
                        var flayr = authLyrs[authLyrCtrl.inviewIndex];
                        var query = new Query();
                        query.where = "FID = " + featureId;
                        query.returnGeometry = true;
                        query.outFields = ['*'];
                        map.reorder(flayr, 100);
                        flayr.queryFeatures(query).then(function(results) {
                            console.log(results);
                            view.popup.open({
                                features: results.features,
                                location: results.features[0].geometry.centroid
                            });
                        })
                        showProj(popid);

                    });
            }
        }

        $('input.toggle.toggle-zoning').change(function() {
            zoningLyrCtrl.toggle();
        });

        $('input.toggle.toggle-auth').change(function() {
            authLyrCtrl.toggle();
        });

        $('select[name=authLyr]').change(function() {
            authLyrCtrl.switchTo($(this).val());
        });

        $('#searchDiv i.icon.remove').click(searchLayerControl.clear);

        $('.title.item.statistic.proj').click(setVSField);

        function setVSField() {
            if ($(this).hasClass('active')) {
                clear();
            } else {
                VsCtrl.setUp($(this));
                $(this).unbind('click', setVSField);
                $(this).find('.checkbox.allin').checkbox('check');
            }
        }

        $('.vs-selection .checkbox.allin').checkbox().checkbox({
            onChecked: function() {
                var vss = $(this).parent('.checkbox').parent('.vs-selection');
                vss.find('.checkbox:not(.allin)').checkbox('check');
            },
            onUnchecked: function() {
                var vss = $(this).parent('.checkbox').parent('.vs-selection');
                vss.find('.checkbox:not(.allin)').checkbox('uncheck');
            }
        }).checkbox('check');

        $('.vs-selection .checkbox:not(.allin)').checkbox().checkbox({
            onChecked: function() {
                VsCtrl.addLyr($(this).data('id'));
            },
            onUnchecked: function() {
                VsCtrl.removeLyr($(this).data('id'));
            }
        }).checkbox('check');

    });

    function showCoordinates(evt) {
        $('#esri_widgets_Attribution_0 > div.esri-attribution__sources').html(evt.mapPoint.latitude + evt.mapPoint.longitude)
    }
});
