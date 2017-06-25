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

var conf, datatableConf;

$(function () {
    var gadgetLocation;
    var mytable;

    var init = function () {    
        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf = JSON.parse(data);             
                loadOperator();
                addDatatable();
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

    // Add event listener for opening and closing details
    $('#devSupportTable').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = mytable.row(tr);
        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        } else {
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }
    });

    function getDatatableConf() {
        datatableConf = {};
        datatableConf.operator = conf.operatorName;
        datatableConf.operatorList = conf.operatorNames;

        datatableConf.spIdList = conf.spIds;        
        datatableConf.serviceProvider = conf.serviceProvider;
        
        datatableConf.application = conf.applicationId;
        datatableConf.appList = conf.applications;

        datatableConf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
        datatableConf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();
        return datatableConf;
    };
    
    function addDatatable(){
        mytable = $('#devSupportTable').DataTable({
            "processing": true,
            "serverSide": true,
            scrollY: 800,
            autoWidth: false,
            scrollCollapse: true,
            "ajax": {
                "url": gadgetLocation + '/gadget-controller.jag?action=getDataForTable',
                "data": function (d) {
                    d.a = getDatatableConf();
                }
            },
            "columns": [{
                    "className": 'details-control',
                    "orderable": false,
                    "data": null,
                    "defaultContent": ''
                },
                {
                    "data": "api"
                },
                {
                    "data": "serviceProvider"
                },
                {
                    "data": "responseTime",
                    "render": function (data) {
                        var responseTime_unix_sec = parseInt(data / 1000);
                        return moment.unix(responseTime_unix_sec).format("MM-DD-YYYY HH:mm:ss");
                    }
                },
                {
                    "data": "operatorName"
                },
                {
                    "data": "msisdn"
                },
                {
                    "data": "applicationName"
                },
                {
                    "data": "requestId"
                },
                {
                    "data": "isSuccess"
                },
                {
                    "data": "apiPublisher"
                }
            ],
            "language": {
                "search": "Search Json Content:",
                "searchPlaceholder": "Ex: mess?g*"
            }
        });
    };

    $('#button-search, button[role="date-update"], #btnCustomRange, button[data-toggle="dropdown"]  ').click(function () {
        reloadDatatable();
    });

     $('#btnCustomRange').on('apply.daterangepicker', function(ev, picker) {
       reloadDatatable();
    });

    $('#dropdown-operator, #dropdown-sp, #dropdown-app  ').click(function () {
        reloadDatatable();
    });

    function reloadDatatable() {
        getLoggedInUser();
        getDatatableConf();
        mytable.ajax.reload();
    };

    function loadOperator() {
        conf["provider-conf"]["provider-name"] = "operator";
        conf.operatorName = "all";
        conf.operatorNames = "";
        
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf.operatorNames = setDropdown("#dropdown-operator", "#button-operator", data, conf.operatorName, "operatorName",null, null);
                loadSP();             
                $("#dropdown-operator li a").click(function () {                   
                    providerButtons("#button-operator", this);
                    conf.operatorName = $(this).data('val');
                    loadSP();
                });
            }
        });
    };

    function loadSP() {
        conf["provider-conf"]["provider-name"] = "operatorsp";
        conf.serviceProvider =  0 ;

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf.spIds = setDropdown("#dropdown-sp", "#button-sp", data, conf.serviceProvider, "serviceProviderId", "@carbon.super","serviceProvider");
                loadApp();             
                $("#dropdown-sp li a").click(function () {                                        
                    providerButtons("#button-sp", this);
                    conf.serviceProvider =  "\"" + $(this).data('val') +"\"";
                    loadApp();
                });
            }
        });
    };

    function loadApp() {        
        conf["provider-conf"]["provider-name"] = "app";
        conf.applicationId = 0;
        
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf.applications = setDropdown("#dropdown-app", "#button-app", data, conf.applicationId, "applicationId",null, "applicationName");
                $("#dropdown-app li a").click(function () {
                    providerButtons("#button-app", this);
                    conf.applicationId = $(this).data('val');
                });
            }
        });
    };
    //to hide error messages visible to user. Remove following line for development.
    $.fn.dataTable.ext.errMode = 'none';

    getGadgetLocation(function (gadget_Location) {        
        gadgetLocation = gadget_Location;          
        init();       
            
        $('input[name="daterange"]').daterangepicker({
            timePicker: true,
            timePickerIncrement: 30,
            locale: {
                format: 'MM/DD/YYYY h:mm A'
            }
        });
    });

    function providerButtons(buttonName, parent){
        $(buttonName).text($(parent).text());
        $(buttonName).append('&nbsp;<span class="caret"></span>');
        $(buttonName).val($(parent).text());
    };

    function setDropdown(elementDropdown, elementButton, data, providerAllValue, providerName,  replace, providerName2){
        $(elementDropdown).empty();
        var operatorsItems = "";
        var operatorNames = [];
        var loadedOperator = [];
        var optionname = "";
        operatorNames.push(providerAllValue);
        if(elementDropdown == "#dropdown-operator") {
          optionname = 'All Operator';
        } else if(elementDropdown == "#dropdown-sp") {
          optionname = 'All Service provider';
        } else if(elementDropdown == "#dropdown-app") {
            optionname = 'All Application';
        }

       operatorsItems += '<li><a data-val="all" href="#">' + optionname +'</a></li>';
        for (var i = 0; i < data.length; i++) {
            var operator = data[i];            
            if ($.inArray(operator[providerName], loadedOperator) < 0) {
                if (replace != null){
                    operatorsItems += '<li><a data-val=' + operator[providerName] + ' href="#">' + operator[providerName2].replace(replace, "") + '</a></li>'
                } else if(providerName2 != null){
                    operatorsItems += '<li><a data-val=' + operator[providerName] + ' href="#">' + operator[providerName2] + '</a></li>';
                } else{
                    operatorsItems += '<li><a data-val=' + operator[providerName] + ' href="#">' + operator[providerName] + '</a></li>';
                }
                operatorNames.push(" " + operator[providerName]);
                loadedOperator.push(operator[providerName]);
            }
        }
        if (replace != null){
            $(elementDropdown).html(operatorsItems);
          //  $(elementButton).text('All Service provider');
            $(elementButton).val('<li><a data-val="0" href="#">All</a></li>');
        } else if(providerName2 != null) {
            $(elementDropdown).html($(elementDropdown).html() + operatorsItems);
            $(elementButton).val('<li><a data-val="0" href="#">All</a></li>');
           // $(elementButton).text('All');
        } else{
            $(elementDropdown).html($(elementDropdown).html() + operatorsItems);
            $(elementButton).val('<li><a data-val="all" href="#">All</a></li>');
        }         
        return operatorNames;
    };

    function format(d) {
        // `d` is the original data object for the row
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
            '<tr>' +
            '<td>Json Content:</td>' +
            '<td><pre style="width:1000px !important ">' + formatJsonBody(d.jsonBody) + '</pre></td>' +
            '</tr>' +
            '<tr style="overflow: hidden;">' +
            '<td>Message:</td>' +
            '<td ><pre style="width:1000px !important ">' + formatJsonBody(JSON.stringify(d)) + '</pre></td>' +
            '</tr>' +
            '</table>';
    };

    function formatJsonBody(json) {
        var jsonFormatted = json;
        try {
            jsonFormatted = JSON.stringify(JSON.parse(json), null, '\t');
        } catch (err) {
            console.log('invalid json');
        }
        return jsonFormatted;
    };
});