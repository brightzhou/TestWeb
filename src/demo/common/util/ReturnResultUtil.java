package demo.common.util;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;

import org.apache.log4j.Logger;

/**
 * <p>
 * Title: ���ؽ��Result�Ĺ�������
 * </p>
 * <p>
 * <p>
 * Description:
 * </p>
 * Author: Administrator </p>
 * <p>
 * Copyright: �㽭��ɽ˰������ɷ����޹�˾
 * </p>
 * <p>
 * Create Time: 10:34:39 AM
 * 
 * @version 1.0
 */
public class ReturnResultUtil {

    private static Logger log = Logger.getLogger(ReturnResultUtil.class);

    /**
     * ���ַ���������ҳ��
     * 
     * @param str
     *            ��Ҫ���ص��ַ���
     * @param response
     *            STRUTS HttpServletResponse
     */
    public static void returnResult(HttpServletResponse response, String str) {
        response.setContentType("text/html;charset=UTF-8");
        try {
            response.getWriter().print(str);
        } catch (IOException e) {
            log.error("��������ʧ��" + e.getMessage());
        }
    }
    public static void returnResult(HttpServletResponse response, JSONArray jsonArray) {
        response.setContentType("text/html;charset=UTF-8");
        try {
            response.getWriter().print(jsonArray);
        } catch (IOException e) {
            log.error("��������ʧ��" + e.getMessage());
        }
    }
}
