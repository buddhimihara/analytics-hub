/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var getConfig, validate, isProviderRequired, draw, update;

(function() {

    var CHART_LOCATION = '/extensions/chart-templates/';

    /**
     * return the config to be populated in the chart configuration UI
     * @param schema
     */
    getConfig = function(schema) {
        var chartConf = require(CHART_LOCATION + '/line-chart/config.json').config;
        /*
         dynamic logic goes here
         */

        var columns = [];

        columns.push("None");
        for (var i = 0; i < schema.length; i++) {
            columns.push(schema[i]["fieldName"]);
        }

        for (var i = 0; i < chartConf.length; i++) {
            if (chartConf[i]["fieldName"] == "color") {
                chartConf[i]["valueSet"] = columns;
                break;
            }
        }

        return chartConf;
    };

    /**
     * validate the user inout for the chart configuration
     * @param chartConfig
     */
    validate = function(chartConfig) {
        return true;
    };

    /**
     * TO be used when provider configuration steps need to be skipped
     */
    isProviderRequired = function() {

    }


    /**
     * return the gadget content
     * @param chartConfig
     * @param schema
     * @param data
     */
    draw = function(placeholder, chartConfig, _schema, data, loggedInUser) {
        _schema = updateUserPrefXYTypes(_schema, chartConfig);
        var schema = toVizGrammarSchema(_schema);

        chartConfig.colorAPI = "api";
        chartConfig.colorSP = "serviceProvider";
        chartConfig.colorMNO = "operatorName";

        chartConfig.count = "totalTaxAmount" //TODO: change this to total amount

        var groupData = [];
        var groupDataSP = [];
        var groupDataMNO = [];
        var arcConfig = buildChart2Config(chartConfig);
        var archConfigSp = buildChart2ConfigSP(chartConfig);
        var archConfigMNO = buildChart2ConfigMNO(chartConfig);
        var totalAmount = 0;
        var groupRow;

        data.forEach(function (row) {
            groupRow = JSON.parse(JSON.stringify(row));
            totalAmount += groupRow[arcConfig.x];
        });

        if (loggedInUser.isAdmin) {
            data.forEach(function(row) {
                var notAvailable = true;
                var notAvailableSp = true;
                var notAvailableMNO = true;
                var groupRow = JSON.parse(JSON.stringify(row));
                var groupRowSP = JSON.parse(JSON.stringify(row));
                var groupRowMNO = JSON.parse(JSON.stringify(row));


                groupData.forEach(function(row2) {
                    if (groupRow[arcConfig.color] == row2[arcConfig.color]) {
                        notAvailable = false;
                    }
                });

                groupDataSP.forEach(function (row2) {
                    if (groupRowSP[archConfigSp.color] == row2[archConfigSp.color]) {
                        notAvailableSp = false;
                    }
                });

                groupDataMNO.forEach(function (row2) {
                    if (groupRowMNO[archConfigMNO.color] == row2[archConfigMNO.color]) {
                        notAvailableMNO = false;
                    }
                });

                if (notAvailable) {
                    groupRow[arcConfig.x] = 0;

                    data.forEach(function(row2) {
                        if (groupRow[arcConfig.color] == row2[arcConfig.color]) {
                            groupRow[arcConfig.x] += ((row2[arcConfig.x])/totalAmount)*100;
                        }
                    });

                    groupData.push(groupRow);
                }

                if (notAvailableSp) {
                    groupRowSP[archConfigSp.x] = 0;
                    data.forEach(function(row2) {

                        if (groupRowSP[archConfigSp.color] == row2[archConfigSp.color]) {
                            groupRowSP[archConfigSp.x] += ((row2[archConfigSp.x])/totalAmount)*100;
                        }
                    });

                    groupDataSP.push(groupRowSP);
                }

                if (notAvailableMNO) {
                    groupRowMNO[archConfigMNO.x] = 0;
                    data.forEach(function(row2) {

                        if (groupRowMNO[archConfigMNO.color] == row2[archConfigMNO.color]) {
                            groupRowMNO[archConfigMNO.x] += ((row2[archConfigMNO.x])/totalAmount)*100;
                        }
                    });
                    groupDataMNO.push(groupRowMNO);
                }
            });
        } else if (loggedInUser.isServiceProvider) {
            data.forEach(function(row) {
                var notAvailable = true;
                var notAvailableMNO = true;
                var groupRow = JSON.parse(JSON.stringify(row));
                var groupRowMNO = JSON.parse(JSON.stringify(row));


                groupData.forEach(function(row2) {
                    if (groupRow[arcConfig.color] == row2[arcConfig.color]) {
                        notAvailable = false;
                    }
                });

                groupDataMNO.forEach(function (row2) {
                    if (groupRowMNO[archConfigMNO.color] == row2[archConfigMNO.color]) {
                        notAvailableMNO = false;
                    }
                });

                if (notAvailable) {
                    groupRow[arcConfig.x] = 0;

                    data.forEach(function(row2) {
                        if (groupRow[arcConfig.color] == row2[arcConfig.color]) {
                            groupRow[arcConfig.x] += ((row2[arcConfig.x])/totalAmount)*100;
                        }
                    });

                    groupData.push(groupRow);
                }

                if (notAvailableMNO) {
                    groupRowMNO[archConfigMNO.x] = 0;
                    data.forEach(function(row2) {

                        if (groupRowMNO[archConfigMNO.color] == row2[archConfigMNO.color]) {
                            groupRowMNO[archConfigMNO.x] += ((row2[archConfigMNO.x])/totalAmount)*100;
                        }
                    });
                    groupDataMNO.push(groupRowMNO);
                }
            });
        } else if (loggedInUser.isOperatorAdmin) {
            data.forEach(function(row) {
                var notAvailable = true;
                var notAvailableSp = true;
                var groupRow = JSON.parse(JSON.stringify(row));
                var groupRowSP = JSON.parse(JSON.stringify(row));

                groupData.forEach(function(row2) {
                    if (groupRow[arcConfig.color] == row2[arcConfig.color]) {
                        notAvailable = false;
                    }
                });

                groupDataSP.forEach(function (row2) {
                    if (groupRowSP[archConfigSp.color] == row2[archConfigSp.color]) {
                        notAvailableSp = false;
                    }
                });

                if (notAvailable) {
                    groupRow[arcConfig.x] = 0;

                    data.forEach(function(row2) {
                        if (groupRow[arcConfig.color] == row2[arcConfig.color]) {
                            groupRow[arcConfig.x] += ((row2[arcConfig.x])/totalAmount)*100;
                        }
                    });

                    groupData.push(groupRow);
                }

                if (notAvailableSp) {
                    groupRowSP[archConfigSp.x] = 0;
                    data.forEach(function(row2) {

                        if (groupRowSP[archConfigSp.color] == row2[archConfigSp.color]) {
                            groupRowSP[archConfigSp.x] += ((row2[archConfigSp.x])/totalAmount)*100;
                        }
                    });

                    groupDataSP.push(groupRowSP);
                }
            });
        }



        var view1 = {
            id: "chart-1",
            schema: schema,
            chartConfig: arcConfig,
            data: function() {
                if (groupData) {
                    var result = [];
                    groupData.forEach(function(item) {
                        var row = [];
                        schema[0].metadata.names.forEach(function(name) {
                            row.push(item[name]);
                        });
                        result.push(row);
                    });
                    wso2gadgets.onDataReady(getHighestVal(result.sort(compare)));
                }
            }
        };

        var view2 = {
            id: "chart-2",
            schema: schema,
            chartConfig: archConfigSp,
            data: function() {
                if (groupDataSP) {
                    var result = [];
                    groupDataSP.forEach(function(item) {
                        var row = [];
                        schema[0].metadata.names.forEach(function(name) {
                            row.push(item[name]);
                        });
                        result.push(row);
                    });
                    wso2gadgets.onDataReady(getHighestVal(result.sort(compare)));
                }
            }
        };

        var view3 = {
            id: "chart-3",
            schema: schema,
            chartConfig: archConfigMNO,
            data: function() {
                if (groupDataMNO) {
                    var result = [];
                    groupDataMNO.forEach(function(item) {
                        var row = [];
                        schema[0].metadata.names.forEach(function(name) {
                            row.push(item[name]);
                        });
                        result.push(row);
                    });
                    wso2gadgets.onDataReady(getHighestVal(result.sort(compare)));
                }
            }
        };


        try {

            wso2gadgets.init("#canvas", view1);
            var view1 = wso2gadgets.load("chart-1");

            wso2gadgets.init("#canvas2", view2);
            var view2 = wso2gadgets.load("chart-2");

            wso2gadgets.init("#canvas3", view3);
            var view2 = wso2gadgets.load("chart-3");

        } catch (e) {
            console.error(e);
        }

    };

    //sort array by totalAmount
    compare = function(a, b) {
        //return a[6] - b[6];
        return a[15] - b[15]; //TODO:undo this to 6

    };

    getHighestVal = function (array) {
        if (array.length >= 10) {
            return array;
        } else {
            return array.slice(0,10);
        }
    }

    /**
     *
     * @param data
     */
    update = function(data) {
        wso2gadgets.onDataReady(data, "append");
    };

    buildChart2Config = function(_chartConfig) {
        var conf = {};
        conf.x = _chartConfig.count;
        conf.color = _chartConfig.colorAPI;
        conf.height = 400;
        conf.width = 450;
        conf.xType = _chartConfig.xType;
        conf.yType = _chartConfig.yType;
        conf.padding = { "top": 0, "left": 0, "bottom": 40, "right": 50 };
        conf.maxLength = _chartConfig.maxLength;
        conf.charts = [];
        conf.charts[0] = {
            type: "arc",
            mode: "pie"
        };

        return conf;
    };

    buildChart2ConfigSP = function(_chartConfig) {
        var conf = {};
        conf.x = _chartConfig.count;
        conf.color = _chartConfig.colorSP;
        conf.height = 400;
        conf.width = 450;
        conf.xType = _chartConfig.xType;
        conf.yType = _chartConfig.yType;
        conf.padding = { "top": 0, "left": 0, "bottom": 40, "right": 50 };
        conf.maxLength = _chartConfig.maxLength;
        conf.charts = [];
        conf.charts[0] = {
            type: "arc",
            mode: "pie"
        };

        return conf;
    };

    buildChart2ConfigMNO = function(_chartConfig) {
        var conf = {};
        conf.x = _chartConfig.count;
        conf.color = _chartConfig.colorMNO;
        conf.height = 400;
        conf.width = 450;
        conf.xType = _chartConfig.xType;
        conf.yType = _chartConfig.yType;
        conf.padding = { "top": 0, "left": 0, "bottom": 40, "right": 50 };
        conf.maxLength = _chartConfig.maxLength;
        conf.charts = [];
        conf.charts[0] = {
            type: "arc",
            mode: "pie"
        };

        return conf;
    };


}());