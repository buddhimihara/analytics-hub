package org.wso2telco.analytics.hub.report.engine.internel.model;

/**
 * Created by isuru on 6/22/17.
 */
public class ResponseTimeRangeData {

    private String range;
    private int count;

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
