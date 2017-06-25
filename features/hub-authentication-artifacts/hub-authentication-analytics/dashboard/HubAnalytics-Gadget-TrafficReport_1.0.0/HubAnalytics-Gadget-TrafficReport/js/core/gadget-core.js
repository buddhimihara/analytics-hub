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
$(function () {
    var gadgetLocation;
    var conf;
    var schema;
    var pref = new gadgets.Prefs();

    var providerData;

    var operatorName = "all", serviceProviderId = 0, apiId = 0, applicationId = 0;
    var loggedInUser;
    var selectedOperator;
    var operatorSelected = false;


    var init = function () {


        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: METHOD.GET,
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                conf = JSON.parse(data);

                if(operatorSelected) {
                    conf.operatorName =  selectedOperator;
                } else {
                    conf.operatorName =  operatorName;
                }
                conf.serviceProvider = serviceProviderId;
                conf.api = apiId;
                conf.applicationName = applicationId;
                conf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
                conf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();

                if($("#button-type").val().toLowerCase().trim() == ERROR_TRAFFIC) {
                    conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.FAILURE_SUMMARY_PER_DAY;
                } else {
                    conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.TRAFFIC_SUMMARY_PER_DAY;
                }

                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        schema = data;
                    }
                });
            }
        });
    };

    var getLoggedInUser = function () {
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getLoggedInUser',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                loggedInUser = data.LoggedInUser;
                operatorName = loggedInUser.operatorNameInProfile;
                // hide the operator / serviceProvider drop-down according to logged in user
                hideDropDown(loggedInUser);
            },
            complete : function (xhr, textStatus) {
                if (xhr.status == "403") {
                    window.top.location.reload(false);
                }
            }
        });
    };

    var getProviderData = function (){

        if($("#button-type").val().toLowerCase().trim() == ERROR_TRAFFIC) {
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.HUB_STREAM_FAILURE_SUMMARY_PER_;
        } else {
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.TRAFFIC_SUMMARY_PER_;
        }

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: METHOD.POST,
            data: JSON.stringify(conf),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
                providerData = data;
            }
        });
        if(providerData != '') {
            $("#generateCSV").show();
            if(loggedInUser.isAdmin){
                $("#tableSelect").show();
            }

        } else {
            $("#generateCSV").hide();
            $("#tableSelect").hide();

        }
        return providerData;
    };


    var drawGadget = function (){
        draw('#canvas', conf[CHART_CONF], schema, providerData);
        setInterval(function() {
            draw('#canvas', conf[CHART_CONF], schema, getProviderData());
        },pref.getInt(REFRESH_INTERVAL));
    };

    function getFilterdResult() {
     $("#canvas").html("");
        $("#canvas2").html("");
        $("#showCSV").hide();
        getGadgetLocation(function (gadget_Location) {
            getLoggedInUser();
            gadgetLocation = gadget_Location;
            init();
            getProviderData();
            drawGadget();
        });     
    };

    $("#button-search").click(function() {
        getFilterdResult();
    });
    
    $("#btnLastDay").click(function() {
        getFilterdResult();
    });

      $("#btnLastMonth").click(function() {
          getFilterdResult();
    });


      $("#btnLastYear").click(function() {
        getFilterdResult();
    });

    $('#btnCustomRange').on('apply.daterangepicker', function(ev, picker) {
      getFilterdResult();
    });


    $("#button-generate-tr").click(function () {
        getLoggedInUser();
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            $("#output").html("");
            if(operatorSelected) {
                conf.operatorName =  selectedOperator;
            } else {
                conf.operatorName =  operatorName;
            }
            conf.serviceProvider = serviceProviderId;
            conf.api = apiId;
            conf.applicationName = applicationId;

            conf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
            conf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();

            if($("#button-type").val().toLowerCase().trim() == ERROR_TRAFFIC) {
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.HUB_STREAM_FAILURE_SUMMARY_PER_;
            } else {
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.TRAFFIC_SUMMARY_PER_;
            }

            var btn =  $("#button-generate-tr");
            btn.prop('disabled', true);
            setTimeout(function(){
                btn.prop('disabled', false);
            }, 3000);

            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=generateCSV',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {
                    $("#showCSV").show();
                    $("#list-available-report").show();
                    $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                        + "Please refresh the traffic report"
                        + '</div>' + $("#output").html());
                    $('#success-message').fadeIn().delay(2000).fadeOut();
                }
            });
        });
    });


    $("#list-available-report").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=available',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
                    $("#output").html("<ul class = 'list-group'>")
                    for (var i = 0; i < data.length; i++) {
                        $("#output").html($("#output").html() + "<li class = 'list-group-item'>" +
                            " <span class='btn-label'>" + data[i].name + "</span>" +
                            " <div class='btn-toolbar'>" +
                            "<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ")'>Download</a>" +
                            "</div>" +
                            "</li>");
                    }
                    $("#output").html($("#output").html() + "<ul/>")

                }
            });

        });
    });

    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        init();
        getLoggedInUser();
        loadOperator();
        $("#generateCSV").hide();
        $("#tableSelect").hide();
        $("#showCSV").hide();

        function loadOperator () {

            if (loggedInUser.isOperatorAdmin) {
                loadSP(loggedInUser.operatorNameInProfile);
            } else {
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.OPERATOR_SUMMERY;
                conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;
                conf.operatorName = "all";
                operatorName = "all";
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getData',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        $("#dropdown-operator").empty();
                        var operatorsItems = "";
                        var operatorNames = [];
                        var loadedOperator = [];
                        operatorNames.push(operatorName);
                        operatorsItems += '<li><a data-val="all" href="#">All Operator</a></li>';
                        for (var i = 0; i < data.length; i++) {
                            var operator = data[i];
                            if ($.inArray(operator.operatorName, loadedOperator) < 0) {
                                operatorsItems += '<li><a data-val=' + operator.operatorName + ' href="#">' + operator.operatorName + '</a></li>';
                                if(operator.operatorName.toString() != "all") {
                                    operatorNames.push(" " + "\"" + operator.operatorName +"\"");
                                }
                                loadedOperator.push(operator.operatorName);
                            }
                        }
                        $("#dropdown-operator").html($("#dropdown-operator").html() + operatorsItems);
                        $("#button-operator").val('<li><a data-val="all" href="#">All Operator</a></li>');

                        loadSP(operatorNames);

                        $("#dropdown-operator li a").click(function () {
                            $("#button-operator").text($(this).text());
                            $("#button-operator").append('&nbsp;<span class="caret"></span>');
                            $("#button-operator").val($(this).text());
                            operatorNames = $(this).data('val');
                            loadSP(operatorNames);
                            operatorSelected = true;
                            getFilterdResult();
                        });
                    }
                });
            }
        }

        function loadSP (clickedOperator) {

            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;

            conf.operatorName = clickedOperator;
            selectedOperator = conf.operatorName;
            serviceProviderId =0;

            if (loggedInUser.isServiceProvider) {
                loadApp("\"" + loggedInUser.username + "\"", selectedOperator);
            } else {
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getData',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        $("#dropdown-sp").empty();
                        var spItems = '';
                        var spIds = [];
                        var loadedSps = [];
                        spIds.push(serviceProviderId);
                        spItems += '<li><a data-val="0" href="#">All Service provider</a></li>';
                        for (var i = 0; i < data.length; i++) {
                            var sp = data[i];
                            if($.inArray(sp.serviceProviderId, loadedSps) < 0){
                                spItems += '<li><a data-val='+ sp.serviceProviderId +' href="#">' + sp.serviceProvider.replace("@carbon.super","") +'</a></li>'
                                spIds.push(" "+ "\"" + sp.serviceProviderId + "\"");
                                loadedSps.push(sp.serviceProviderId);
                            }
                        }

                        $("#dropdown-sp").html(spItems);

                       // $("#button-sp").text('All Service provider');
                        $("#button-sp").val('<li><a data-val="0" href="#">All Service provider</a></li>');
                        loadApp(spIds,selectedOperator);
                        $("#dropdown-sp li a").click(function(){

                            $("#button-sp").text($(this).text());
                            $("#button-sp").append('&nbsp;<span class="caret"></span>');
                            $("#button-sp").val($(this).text());
                            spIds = $(this).data('val');
                            serviceProviderId = spIds;
                            if(selectedOperator.toString() == "all") {
                                if(spIds != "0") {
                                    loadApp( "\"" + spIds +"\"", selectedOperator.toString());
                                } else {
                                    if(loggedInUser.isOperatorAdmin) {
                                        loadSP(loggedInUser.operatorNameInProfile);
                                    } else {
                                        loadApp(  spIds , selectedOperator.toString());
                                    }
                                }
                            } else {
                                if(spIds != "0") {
                                    loadApp( "\"" +spIds+"\"","\"" + selectedOperator+"\"");
                                } else {
                                    if(loggedInUser.isOperatorAdmin) {
                                        loadSP(loggedInUser.operatorNameInProfile);
                                    } else {
                                        loadApp(  spIds , selectedOperator.toString());
                                    }
                                }
                            }
                            getFilterdResult();
                        });
                    }
                });
            }
        }

        function loadApp (sps,clickedOperator) {
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.SP;
            applicationId = 0;
            if(sps != "0") {
                conf.serviceProvider = sps;
            }
            conf.operatorName = clickedOperator; //TODO: check this brackets.
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {

                    $("#dropdown-app").empty();
                    var apps = [];
                    var loadedApps = [];
                    var selectedApp = [];
                    var appItems = '<li><a data-val="0" href="#">All Application</a></li>';

                    for ( var i = 0 ; i < data.length; i++) {
                        var app = data[i];
                        if($.inArray(app.applicationId, loadedApps) < 0 ) {
                            appItems += '<li><a data-val='+ app.applicationId +' href="#">' + app.applicationName +'</a></li>'
                            apps.push(" "+ app.applicationId);
                            loadedApps.push(app.applicationId);
                        }
                    }

                    $("#dropdown-app").html( $("#dropdown-app").html() + appItems);
                    $("#button-app").val('<li><a data-val="0" href="#">All</a></li>');
                   // $("#button-app").text('All Application');
                    loadApi(apps);

                    $("#dropdown-app li a").click(function() {

                        $("#button-app").text($(this).text());
                        $("#button-app").append('&nbsp;<span class="caret"></span>');
                        $("#button-app").val($(this).text());

                        selectedApp = $(this).data('val');
                        if(selectedApp == "0") {
                            loadApi(apps);
                            getFilterdResult();
                        } else {
                            loadApi(selectedApp);
                            getFilterdResult();
                        }
                    });
                }
            });
        }

        function loadApi (apps) {
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.APP;
            conf.applicationId = "("+apps+")";
            apiId = 0;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {
                    $("#dropdown-api").empty();
                    var apis = [];
                    var loadedApis = [];
                    var apiItems = '<li><a data-val="0" href="#">All Api</a></li>';
                    for ( var i =0 ; i < data.length; i++) {
                        var api = data[i];
                        if($.inArray(api.apiID, loadedApis) < 0){
                            apiItems += '<li><a data-val='+ api.apiID +' href="#">' + api.api +'</a></li>';
                            loadedApis.push(api.apiID);
                        }
                    }

                    $("#dropdown-api").html( $("#dropdown-api").html() + apiItems);
                    $("#button-api").val('<li><a data-val="0" href="#">All</a></li>');
                   // $("#button-api").text('All API');

                    $("#dropdown-api li a").click(function() {
                        $("#button-api").text($(this).text());
                        $("#button-api").append('&nbsp;<span class="caret"></span>');
                        $("#button-api").val($(this).text());
                        apiId = $(this).data('val');
                        getFilterdResult();
                    });

                }
            });
        }

        $("#button-app").val("All");
        $("#button-api").val("All");
        $("#button-type").val("Api Traffic");

        $('input[name="daterange"]').daterangepicker({
            timePicker: true,
            timePickerIncrement: 30,
            locale: {
                format: 'MM/DD/YYYY h:mm A'
            }
        });
    });

    $("#dropdown-type li a").click(function(){
        $("#button-type").text($(this).text());
        $("#button-type").append('&nbsp;<span class="caret"></span>');
        $("#button-type").val($(this).text());
        getFilterdResult();
    });
});


function downloadFile(index) {
    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        location.href = gadgetLocation + '/gadget-controller.jag?action=get&index=' + index;

    });
}