package demo.common.util;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import cn.com.jdls.foundation.architectures.command.commands.xml.command.Inputrow;
import cn.com.jdls.foundation.architectures.command.forms.BaseForm;
import cn.com.jdls.foundation.dao.DataSet;

/**
 * <p>
 * 标题: 查询所用的struts的ActionForm基类，定义了结果集的格式
 * </p>
 * <p>
 * 描述: 查询所用的struts的ActionForm基类，定义了结果集的格式
 * </p>
 * <p>
 * 版权: 税友软件集团股份有限公司
 * </p>
 * <p>
 * 创建时间: 2014年8月1日
 * </p>
 * <p>
 * 作者: Administrator
 * </p>
 * <p>
 * 修改历史记录：
 * </p>
 * ====================================================================<br>
 * 维护单：<br>
 * 修改日期：<br>
 * 修改人：<br>
 * 修改内容：<br>
 */

public class BaseSearchForm extends BaseForm {
    public void setRowCount(int rowCount) {
        this.rowCount = rowCount;
    }

    public HashMap toHashMap() {
        HashMap result = new HashMap();
        Class c = this.getClass();
        this.putField2HashMap(c, "taskId", result);// added by lhy 200505171513
                                                   // 把BASEFORM中的taskId保存到HASHMAP
        if (this instanceof demo.common.util.BaseSearchForm) {
            this.putField2HashMap(c, "pageLines", result);
            this.putField2HashMap(c, "pageId", result);
            this.putField2HashMap(c, "actionMapping", result);
            this.putField2HashMap(c, "userRevenues", result);
            result.put("rowCount", new Integer(rowCount).toString());
        }

        Field[] fields = c.getDeclaredFields(); // Look up fields.
        Inputrow irow = new Inputrow();
        for (int i = 0; i < fields.length; i++) { // Display them.
            putField2HashMap(c, fields[i].getName(), result);
        }
        return result;
    }

    // 将字段的值放进HashMap对象中
    private void putField2HashMap(Class c, String field, HashMap result) {
        String method = "get" + field.substring(0, 1).toUpperCase() + field.substring(1);

        Method setCommand = null;
        try {
            setCommand = c.getMethod(method, null);
        } catch (Exception ex) {
            throw new RuntimeException("Can't find Method " + method + ":" + ex.getMessage() + "!");
        }
        Object o = null;
        try {
            o = setCommand.invoke(this, null);
            result.put(field, o);
        } catch (Exception ex) {
            throw new RuntimeException("Invoke" + method + " Error:" + ex.getMessage() + "!");
        }

    }

    /**
     * 查询返回结果为一ArrayList,内中元素也为一ArrayList
     */
    private ArrayList resultList = new ArrayList();
    /**
     * 分页导航
     */
    private String pageURL = "";
    /**
     * 记录总数
     */
    private int rowCount = 0;
    /**
     * 每页行数
     */
    private int pageLines = 20;
    private String countInfo = "";
    /**
     * action名字，用来确定具体的receiver
     */
    private String actionMapping = "";
    private String pageId = "1";
    private String userRevenues;
    private cn.com.jdls.foundation.dao.DataSet dataSet = new DataSet(null, null, 0);
    private String field1 = ""; // 备用字段1
    private String field2 = ""; // 备用字段2
    private String field3 = ""; // 备用字段3
    private String field4 = ""; // 备用字段4
    private String field5 = ""; // 备用字段5

    public String getCountInfo() {
        return countInfo;
    }

    public void setCountInfo(String countInfo) {
        this.countInfo = countInfo;
    }

    public String getActionMapping() {
        return actionMapping;
    }

    public void setActionMapping(String actionMapping) {
        this.actionMapping = actionMapping;
    }

    public int getPageLines() {
        return pageLines;
    }

    public int getRowCount() {
        return rowCount;
    }

    public void setPageLines(int pageLines) {
        this.pageLines = pageLines;
    }

    public ArrayList getResultList() {
        return resultList;
    }

    public String getPageURL() {
        return pageURL;
    }

    /**
     * 得到用户请求URL
     * 
     * @param request
     * @return String
     */
    private String getURL(HttpServletRequest request) {
        StringBuffer strbuf = new StringBuffer();
        strbuf.append(request.getRequestURI());
        strbuf.append("?p=1");
        Enumeration emParams = request.getParameterNames();
        while (emParams.hasMoreElements()) {
            String sParam = (String) emParams.nextElement();
            if (sParam.equals("pageId") || sParam.equals("p") || sParam.equals("action")) {
                continue;
            }
            String[] value = request.getParameterValues(sParam);
            if (value != null && value.length > 0) {
                for (int i = 0; i < value.length; i++) {
                    String sValue = value[i];
                    strbuf.append("&" + sParam + "=" + URLEncoder.encode(sValue)); // edit
                                                                                   // by
                                                                                   // lhy
                                                                                   // 20050826
                                                                                   // 处理参数值中有特殊符号的问题
                }
            }
        }
        return strbuf.toString();
    }

    /**
     * 
     * @param request
     * @param dataSet
     *            当页显示的数据，结构为一DataSet类型
     * @param rowCount
     *            总共记录数，
     * @param pageId
     *            当前页号
     */
    public void setResultDataSet(HttpServletRequest request, String resultName, DataSet dataSet, int rowCount,
            int pageId) {
        request.setAttribute(resultName, dataSet);
        if (rowCount < 0) {
            return;
        }
        this.dataSet = dataSet;
        makePageUrl(request, rowCount, pageId);
    }

    /**
     * 
     * @param request
     * @param resultList
     *            当页显示的数据，结构为一ArrayList嵌套一ArrayList
     * @param rowCount
     *            总共记录数，
     * @param pageId
     *            当前页号
     */
    public void setResult(HttpServletRequest request, String resultName, ArrayList resultList, int rowCount, int pageId) {
        request.setAttribute(resultName, resultList);
        if (rowCount < 0) {
            return;
        }
        this.resultList = resultList;
        makePageUrl(request, rowCount, pageId);
    }

    public void makePageUrl(HttpServletRequest request, int rowCount, int pageId) {

        StringBuffer strBuf = new StringBuffer();

        this.rowCount = rowCount;
        if (rowCount == 0) {
            strBuf.append("<font color=\"red\">无记录!</font>");
        } else {
            pageURL = this.getURL(request);
            int iPageNum = ((int) (rowCount - 1) / pageLines) + 1;
            if (pageId > iPageNum) {
                pageId = iPageNum;
                this.pageId = String.valueOf(iPageNum);
            }
            if (iPageNum > 1) { // 超过一页时显示
                if (pageId > 1) {
                    strBuf.append("<a href='" + pageURL + "&pageId=1'><font color='#0000FF'>首页</font></a> ");
                    strBuf.append("<a href='" + pageURL + "&pageId=" + (pageId - 1)
                            + "'><font color='#0000FF'>上页</font></a> ");
                } else {
                    strBuf.append(" <font color='#828282'>首页 上页</font> ");
                }
                if (pageId < iPageNum) {
                    strBuf.append(" <a href='" + pageURL + "&pageId=" + (pageId + 1)
                            + "'><font color='#0000FF'>下页</font></a> ");
                    strBuf.append("<a href='" + pageURL + "&pageId=" + iPageNum
                            + "'><font color='#0000FF'>尾页</font></a> ");
                } else {
                    strBuf.append(" <font color='#828282'>下页 尾页</font> ");
                }
            }
            int endRow = (pageId * pageLines >= rowCount) ? rowCount : pageId * pageLines;
            strBuf.append(" 第" + ((pageId - 1) * pageLines + 1) + "到" + endRow + "条/共" + rowCount + "条 第" + pageId
                    + "页/共" + iPageNum + "页");
        }
        this.pageURL = strBuf.toString();
    }

    public String getPageId() {
        return pageId;
    }

    public void setPageId(String pageId) {
        this.pageId = pageId;
    }

    public String getUserRevenues() {
        return userRevenues;
    }

    public void setUserRevenues(String userRevenues) {
        this.userRevenues = userRevenues;
    }

    public cn.com.jdls.foundation.dao.DataSet getDataSet() {
        return dataSet;
    }

    public void setDataSet(cn.com.jdls.foundation.dao.DataSet dataSet) {
        this.dataSet = dataSet;
    }

    public String getField1() {
        return field1;
    }

    public void setField1(String field1) {
        this.field1 = field1;
    }

    public String getField2() {
        return field2;
    }

    public void setField2(String field2) {
        this.field2 = field2;
    }

    public String getField3() {
        return field3;
    }

    public void setField3(String field3) {
        this.field3 = field3;
    }

    public String getField4() {
        return field4;
    }

    public void setField4(String field4) {
        this.field4 = field4;
    }

    public String getField5() {
        return field5;
    }

    public void setField5(String field5) {
        this.field5 = field5;
    }

    /**
     * SUI分页
     */
    private int pageIndex = 0;
    /**
     * SUI分页
     */
    private int pageSize = 20;
    /**
     * sui提交json数据
     */
    private String submitData;

    /**
     * @return the pageIndex
     */
    public int getPageIndex() {
        return pageIndex;
    }

    /**
     * @param pageIndex
     *            the pageIndex to set
     */
    public void setPageIndex(int pageIndex) {
        this.pageId = String.valueOf(pageIndex + 1);
        this.pageIndex = pageIndex;
    }

    /**
     * @return the pageSize
     */
    public int getPageSize() {
        return pageSize;
    }

    /**
     * @param pageSize
     *            the pageSize to set
     */
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
        this.pageLines = pageSize;
    }

    /**
     * @return the submitData
     */
    public String getSubmitData() {
        return submitData;
    }

    /**
     * @param submitData
     *            the submitData to set
     */
    public void setSubmitData(String submitData) {
        this.submitData = submitData;
    }
}
