/*
 *  Copyright (c) 2016 WSO2.Telco Inc. (http://www.wso2telco.com) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2telco.analytics.hub.report.engine.internel.util;

import org.wso2.carbon.analytics.datasource.commons.Record;
import org.wso2telco.analytics.hub.report.engine.internel.model.ResponseTimeRangeData;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

public class CSVWriter {

    public static void writeCSV(List<Record> records, int bufSize, String filePath,
                                Map<String, String> dataColumns, List<String> columnHeads) throws IOException {

        File file = new File(filePath);
        file.getParentFile().mkdirs();
        FileWriter writer = new FileWriter(file, true);
        BufferedWriter bufferedWriter = new BufferedWriter(writer, bufSize);

        StringBuilder sb = new StringBuilder();

        for (String columnName : columnHeads) {
            if (sb.length() > 0) {
                sb.append(',');
            }
            sb.append(columnName);
        }

        sb.append(System.getProperty("line.separator"));
        bufferedWriter.write(sb.toString());

        for (Record record : records) {
            sb = new StringBuilder();

            for (String key : dataColumns.keySet()) {
                if (sb.length() > 0) {
                    sb.append(',');
                }
                if (dataColumns.get(key).equals("date")) {
                    Date date = new Date(Long.parseLong(record.getValues().get(key).toString()));
                    Format format = new SimpleDateFormat("yyyy MM dd HH:mm:ss");
                    sb.append(format.format(date));
                } else {
                    sb.append(clearSpecialCharacters(record.getValues().get(key)));
                }
            }

            sb.append(System.getProperty("line.separator"));

            bufferedWriter.write(sb.toString());
        }
        bufferedWriter.flush();
        bufferedWriter.close();
    }

    public static void writeResponseTImeCSV(List<Record> records, int bufSize, String filePath,
                                            Map<String, String> dataColumns, List<String> columnHeads) throws IOException {

        File file = new File(filePath);
        file.getParentFile().mkdirs();
        FileWriter writer = new FileWriter(file, true);
        BufferedWriter bufferedWriter = new BufferedWriter(writer, bufSize);

        StringBuilder sb = new StringBuilder();

        for (String columnName : columnHeads) {
            if (sb.length() > 0) {
                sb.append(',');
            }
            sb.append(columnName);
        }

        sb.append(System.getProperty("line.separator"));

        List<ResponseTimeRangeData> responseTimeRangeDataList = new ArrayList<>();
        for (Record record : records) {

            ResponseTimeRangeData responseTimeRangeData = new ResponseTimeRangeData();
            responseTimeRangeData.setCount((Integer) record.getValue("totalResponseCount"));
            responseTimeRangeData.setRange(clearSpecialCharacters(record.getValue("responseTimeRange")));
            responseTimeRangeDataList.add(responseTimeRangeData);
        }

        Map<String, Integer> summedMap = responseTimeRangeDataList.stream().collect(
                Collectors.groupingBy(ResponseTimeRangeData::getRange, Collectors.summingInt
                        (ResponseTimeRangeData::getCount)));

        LinkedHashMap<String, Integer> sortedMap = summedMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (oldValue, newValue) -> oldValue, LinkedHashMap::new));

        Iterator<Map.Entry<String, Integer>> iterator = sortedMap.entrySet().iterator();
        while (iterator.hasNext()) {

            Map.Entry<String, Integer> next = iterator.next();
            String key = next.getKey();
            Integer value = next.getValue();

            sb.append(key).append(",").append(value).append(System.getProperty("line.separator"));
        }

        bufferedWriter.write(sb.toString());
        bufferedWriter.flush();
        bufferedWriter.close();
    }

    public static void writeTrafficCSV(List<Record> records, int bufSize, String filePath) throws IOException {

        File file = new File(filePath);
        file.getParentFile().mkdirs();
        FileWriter writer = new FileWriter(file, true);
        BufferedWriter bufferedWriter = new BufferedWriter(writer, bufSize);

        Map<String, Integer> apiCount = new HashMap<>();
        Integer count = 0;

        if (records.size() > 0) {
            for (Record record : records) {
                String key = record.getValues().get("api").toString();
                if (apiCount.containsKey(key)) {
                    count = apiCount.get(key) + Integer.parseInt(record.getValues().get("totalCount").toString());
                } else {
                    count = Integer.parseInt(record.getValues().get("totalCount").toString());
                }
                apiCount.put(key, count);
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("API");
        sb.append(',');
        sb.append("Total Count");
        sb.append(System.getProperty("line.separator"));

        if (records.size() > 0) {
            for (String key : apiCount.keySet()) {
                sb.append(key);
                sb.append(',');
                sb.append(apiCount.get(key));
                sb.append(System.getProperty("line.separator"));
            }
            bufferedWriter.write(sb.toString());
        } else {
            bufferedWriter.write("No data available for this date range");
        }
        bufferedWriter.flush();
        bufferedWriter.close();

    }

    public static void writeErrorCSV(List<Record> records, int bufSize, String filePath, Map<String, String> dataColumns,
                                     List<String> columnHeads) throws IOException {

        File file = new File(filePath);
        file.getParentFile().mkdirs();
        FileWriter writer = new FileWriter(file, true);
        BufferedWriter bufferedWriter = new BufferedWriter(writer, bufSize);
        StringBuilder sb = new StringBuilder();

        for (String columnName : columnHeads) {
            if (sb.length() > 0) {
                sb.append(',');
            }
            sb.append(columnName);
        }
        sb.append(System.getProperty("line.separator"));
        bufferedWriter.write(sb.toString());

        for (Record record : records) {
            sb = new StringBuilder();

            for (String key : dataColumns.keySet()) {
                if (sb.length() > 0) {
                    sb.append(',');
                }
                if ("_timestamp".equalsIgnoreCase(key)) {
                    sb.append(record.getValue("year"))
                            .append("/")
                            .append(record.getValue("month"))
                            .append("/").append(record.getValue("day"));
                } else {
                    Object value = record.getValue(key);
                    if (value == null) {
                        value = "";
                    }
                    sb.append(clearSpecialCharacters(value));
                }
            }
            sb.append(System.getProperty("line.separator"));
            bufferedWriter.write(sb.toString());
        }
        bufferedWriter.flush();
        bufferedWriter.close();
        writer.close();
    }


    private static String getValue(Object val) {

        if (val != null) {
            return val.toString();
        } else {
            return "";
        }

    }

    /**
     * Handling special characters which creates errors in csv file.
     * New line and tab will be replaced with a space.
     */
    private static String clearSpecialCharacters(Object str) {
        if (str != null) {
            return str.toString().replace("\n", " ").replace("\r", " ").replace("\t", " ").replace(",", " ");
        }
        return null;
    }

}
