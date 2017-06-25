
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

    var operatorName = "all", serviceProviderId = 0;
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
                if(!(loggedInUser.isAdmin)) {
                    $("#directiondd").hide();
                    $("#generate-error-csv").hide();
                }
            },
            complete : function (xhr, textStatus) {
                if (xhr.status == "403") {
                    window.top.location.reload(false);
                }
            }
        });
    };

    var getProviderData = function (){

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

        return providerData;
    };

    function getFilterdResult() {
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            init();
            getProviderData();
        });
    };

    $("#button-search").click(function() {
        getGadgetLocation(function (gadget_Location) {
            getLoggedInUser();
            gadgetLocation = gadget_Location;
            init();
            getProviderData();
        });
    });

    $("#button-generate-bill-csv").click(function () {
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

            var year = $("#button-year").val();
            var month = $("#button-month").val();
            var isDirectionSet = true;

            if(loggedInUser.isAdmin) {
                var direction = $("#button-dir").val();
                if (direction === "") {
                    isDirectionSet = false;
                    $("#popupcontent p").html('Please select direction');
                    $('#notifyModal').modal('show');
                    return;
                } else {
                    conf.direction = direction;
                }
            }

            if(year === "") {
                $("#popupcontent p").html('Please select year');
                $('#notifyModal').modal('show');
            }
            else if(month === "") {
                $("#popupcontent p").html('Please select month');
                $('#notifyModal').modal('show');
            } else if (isDirectionSet) {

                $("#list-summery-report").removeClass("hidden");
                conf.year = year;
                conf.month = month;

                var btn = $("#button-generate-bill-csv");
                btn.prop('disabled', true);
                setTimeout(function () {
                    btn.prop('disabled', false);
                }, 2000);

                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=generateCSV',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {

                        $("#list-available-report").show();
                        $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                            + "Please refresh the billing report"
                            + '</div>' + $("#output").html());
                        $('#success-message').fadeIn().delay(2000).fadeOut();
                    }
                });
            }
        });
    });


    $("#button-generate-error-csv").click(function () {
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

            var year = $("#button-year").val();
            var month = $("#button-month").val();
            var isDirectionSet = true;

            if(loggedInUser.isAdmin) {
                var direction = $("#button-dir").val();
                if (direction === "") {
                    isDirectionSet = false;
                    $("#popupcontent p").html('Please select direction');
                    $('#notifyModal').modal('show');
                    return;
                } else {
                    conf.direction = direction;
                }
            }

            if(year === "") {
                $("#popupcontent p").html('Please select year');
                $('#notifyModal').modal('show');
            }
            else if(month === "") {
                $("#popupcontent p").html('Please select month');
                $('#notifyModal').modal('show');
            } else if (isDirectionSet) {

                $("#list-error-report").removeClass("hidden");
                conf.year = year;
                conf.month = month;

                var btn = $("#button-generate-bill-csv");
                btn.prop('disabled', true);
                setTimeout(function () {
                    btn.prop('disabled', false);
                }, 2000);

                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=generateErrorCSV',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {

                        $("#list-error-report").show();
                        $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                            + "Please refresh the billing error report"
                            + '</div>' + $("#output").html());
                        $('#success-message').fadeIn().delay(2000).fadeOut();
                    }
                });
            }
        });
    });

    $("#button-generate-bill-pdf").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function (gadget_Location) {
            var serviceProviderName = $("#button-sp").val();

            gadgetLocation = gadget_Location;
            if(operatorSelected) {
                conf.operatorName =  selectedOperator;
            } else {
                conf.operatorName =  operatorName;
            }
            conf.serviceProvider = serviceProviderId;
            var year = $("#button-year").val();
            var month = $("#button-month").val();
            var isDirectionSet = true;

            if(loggedInUser.isAdmin) {
                var direction = $("#button-dir").val();
                if (direction === "") {
                    isDirectionSet = false;
                    $("#popupcontent p").html('Please select direction');
                    $('#notifyModal').modal('show');
                    return;
                } else {
                    conf.direction = direction;
                }
            }

            if(year === "") {
                $("#popupcontent p").html('Please select year');
                $('#notifyModal').modal('show');
            } else if(month === "") {
                $("#popupcontent p").html('Please select month');
                $('#notifyModal').modal('show');
            } else if (isDirectionSet) {
                conf.year = year;
                conf.month = month;
                $("#list-the-bill").removeClass("hidden");


                var btn = $("#button-generate-bill-pdf");
                btn.prop('disabled', true);
                setTimeout(function () {
                    btn.prop('disabled', false);
                }, 2000);

                setTimeout(function () {
                    $.ajax({
                        url: gadgetLocation + '/gadget-controller.jag?action=generateBill',
                        method: "POST",
                        data: JSON.stringify(conf),
                        contentType: "application/json",
                        async: true,
                        success: function (data) {
                            $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                                + "Please refresh the billing report"
                                + '</div>' + $("#output").html());
                            $('#success-message').fadeIn().delay(2000).fadeOut();
                        }
                    });
                }, 100);

            }
        });
    });


    $("#list-summery-report").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=availableCSV',
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
                            "<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ", \"csv\")'>Download</a>" +
                            "<a class='btn btn-primary btn-xs' onclick='removeFile(" + data[i].index + ", \"csv\")'>Remove</a>" +
                            "</div>" +
                            "</li>");
                    }
                    $("#output").html($("#output").html() + "<ul/>")

                }
            });

        });
    });

    $("#list-error-report").click(function () {
        getLoggedInUser();
        $("#output").html("");
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=availableErrorCSV',
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
                            "<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ", \"csv\")'>Download</a>" +
                            "<a class='btn btn-primary btn-xs' onclick='removeFile(" + data[i].index + ", \"csv\")'>Remove</a>" +
                            "</div>" +
                            "</li>");
                    }
                    $("#output").html($("#output").html() + "<ul/>")

                }
            });

        });
    });

    $("#list-the-bill").click(function () {
        getLoggedInUser();
        $("#output").html("");

        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=availablePDF',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
                    $("#output").html("<ul class = 'list-group'>")
                    for (var i = 0; i < data.length; i++) {
                        var pdf = "pdf";
                        $("#output").html($("#output").html() + "<li class = 'list-group-item'>" +
                            " <span class='btn-label'>" + data[i].name + "</span>" +
                            " <div class='btn-toolbar'>" +
                            "<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ",  \"pdf\")'>Download</a>" +
                            "<a class='btn btn-primary btn-xs' onclick='removeFile(" + data[i].index + ", \"pdf\")'>Remove</a>" +
                            "</div>" +
                            "</li>");
                    }
                    $("#output").html($("#output").html() + "<ul/>")

                }
            });

        });
    });

    var createYearSelectBox = function () {
        var currentYear = new Date().getFullYear();
        for (var i = 1; i <= 3; i++) {
            $("#dropdown-year").append(
                $('<li><a data-val='+currentYear+' href="#">'+currentYear+'</a></li>')
            );
            currentYear--;
        }
        $("#dropdown-year li a").click(function(){
            $("#button-year").text($(this).text());
            $("#button-year").append('&nbsp;<span class="caret"></span>');
            $("#button-year").val($(this).text());
        });
    }

    $("#button-dir").click(function () {
            var direction = $("#button-dir").val();
            if (direction == 'nb') {
                $("#operatordd").hide();
            }
    });

    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        init();
        getLoggedInUser();
        createYearSelectBox();
        loadOperator();
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

                        });
                    }
                });
            }
        }

        function loadSP (clickedOperator) {
            getLoggedInUser();
            conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
            conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;

            conf.operatorName = clickedOperator;
            selectedOperator = conf.operatorName;
            serviceProviderId =0;

            if (!loggedInUser.isServiceProvider) {

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

                        $("#dropdown-sp li a").click(function(){
                            getLoggedInUser();
                            $("#button-sp").text($(this).text());
                            $("#button-sp").append('&nbsp;<span class="caret"></span>');
                            $("#button-sp").val($(this).text());
                            spIds = $(this).data('val');
                            serviceProviderId = spIds;
                            if(selectedOperator.toString() == "all") {
                                if(spIds == "0" && loggedInUser.isOperatorAdmin) {
                                    loadSP(loggedInUser.operatorNameInProfile);
                                }
                            }
                        });
                    }
                });
            }
        }

        $("#button-type").val("Billing");

    });
    $("#dropdown-direction li a").click(function () {
        if ($(this).data('val') == 'nb') {
            $("#operatordd").hide();
        } else {
            $("#operatordd").show();
        }
        $("#button-dir").text($(this).text());
        $("#button-dir").append('&nbsp;<span class="caret"></span>');
        $("#button-dir").val($(this).data('val'));
    });

    $("#dropdown-month li a").click(function () {
        $("#button-month").text($(this).text());
        $("#button-month").append('&nbsp;<span class="caret"></span>');
        $("#button-month").val($(this).data('val'));
    });
});


function downloadFile(index, type) {
    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        location.href = gadgetLocation + '/gadget-controller.jag?action=get&index=' + index +'&type='+ type;

    });
}

function removeFile(index, type) {
    getGadgetLocation(function(gadget_Location) {
        gadgetLocation = gadget_Location;
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=remove&index=' + index+'&type='+ type,
            method: METHOD.POST,
            contentType: CONTENT_TYPE,
            async: false,
            success: function(data) {
                if(type == 'csv') {
                    $("#list-summery-report").click();
                    $("#list-error-report").click();
                } else {
                    $("#list-the-bill").click();
                }
            }
        });
    });
}