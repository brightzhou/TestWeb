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
 * ����: ��ѯ���õ�struts��ActionForm���࣬�����˽�����ĸ�ʽ
 * </p>
 * <p>
 * ����: ��ѯ���õ�struts��ActionForm���࣬�����˽�����ĸ�ʽ
 * </p>
 * <p>
 * ��Ȩ: ˰��������Źɷ����޹�˾
 * </p>
 * <p>
 * ����ʱ��: 2014��8��1��
 * </p>
 * <p>
 * ����: Administrator
 * </p>
 * <p>
 * �޸���ʷ��¼��
 * </p>
 * ====================================================================<br>
 * ά������<br>
 * �޸����ڣ�<br>
 * �޸��ˣ�<br>
 * �޸����ݣ�<br>
 */

public class BaseSearchForm extends BaseForm {
    public void setRowCount(int rowCount) {
        this.rowCount = rowCount;
    }

    public HashMap toHashMap() {
        HashMap result = new HashMap();
        Class c = this.getClass();
        this.putField2HashMap(c, "taskId", result);// added by lhy 200505171513
                                                   // ��BASEFORM�е�taskId���浽HASHMAP
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

    // ���ֶε�ֵ�Ž�HashMap������
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
     * ��ѯ���ؽ��ΪһArrayList,����Ԫ��ҲΪһArrayList
     */
    private ArrayList resultList = new ArrayList();
    /**
     * ��ҳ����
     */
    private String pageURL = "";
    /**
     * ��¼����
     */
    private int rowCount = 0;
    /**
     * ÿҳ����
     */
    private int pageLines = 20;
    private String countInfo = "";
    /**
     * action���֣�����ȷ�������receiver
     */
    private String actionMapping = "";
    private String pageId = "1";
    private String userRevenues;
    private cn.com.jdls.foundation.dao.DataSet dataSet = new DataSet(null, null, 0);
    private String field1 = ""; // �����ֶ�1
    private String field2 = ""; // �����ֶ�2
    private String field3 = ""; // �����ֶ�3
    private String field4 = ""; // �����ֶ�4
    private String field5 = ""; // �����ֶ�5

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
     * �õ��û�����URL
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
                                                                                   // �������ֵ����������ŵ�����
                }
            }
        }
        return strbuf.toString();
    }

    /**
     * 
     * @param request
     * @param dataSet
     *            ��ҳ��ʾ�����ݣ��ṹΪһDataSet����
     * @param rowCount
     *            �ܹ���¼����
     * @param pageId
     *            ��ǰҳ��
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
     *            ��ҳ��ʾ�����ݣ��ṹΪһArrayListǶ��һArrayList
     * @param rowCount
     *            �ܹ���¼����
     * @param pageId
     *            ��ǰҳ��
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
            strBuf.append("<font color=\"red\">�޼�¼!</font>");
        } else {
            pageURL = this.getURL(request);
            int iPageNum = ((int) (rowCount - 1) / pageLines) + 1;
            if (pageId > iPageNum) {
                pageId = iPageNum;
                this.pageId = String.valueOf(iPageNum);
            }
            if (iPageNum > 1) { // ����һҳʱ��ʾ
                if (pageId > 1) {
                    strBuf.append("<a href='" + pageURL + "&pageId=1'><font color='#0000FF'>��ҳ</font></a> ");
                    strBuf.append("<a href='" + pageURL + "&pageId=" + (pageId - 1)
                            + "'><font color='#0000FF'>��ҳ</font></a> ");
                } else {
                    strBuf.append(" <font color='#828282'>��ҳ ��ҳ</font> ");
                }
                if (pageId < iPageNum) {
                    strBuf.append(" <a href='" + pageURL + "&pageId=" + (pageId + 1)
                            + "'><font color='#0000FF'>��ҳ</font></a> ");
                    strBuf.append("<a href='" + pageURL + "&pageId=" + iPageNum
                            + "'><font color='#0000FF'>βҳ</font></a> ");
                } else {
                    strBuf.append(" <font color='#828282'>��ҳ βҳ</font> ");
                }
            }
            int endRow = (pageId * pageLines >= rowCount) ? rowCount : pageId * pageLines;
            strBuf.append(" ��" + ((pageId - 1) * pageLines + 1) + "��" + endRow + "��/��" + rowCount + "�� ��" + pageId
                    + "ҳ/��" + iPageNum + "ҳ");
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
     * SUI��ҳ
     */
    private int pageIndex = 0;
    /**
     * SUI��ҳ
     */
    private int pageSize = 20;
    /**
     * sui�ύjson����
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
