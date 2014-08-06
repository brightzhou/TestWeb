package demo.common.util;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;

import org.apache.log4j.Logger;

/**
 * <p>
 * Title: 返回结果Result的公共处理
 * </p>
 * <p>
 * <p>
 * Description:
 * </p>
 * Author: Administrator </p>
 * <p>
 * Copyright: 浙江龙山税友软件股份有限公司
 * </p>
 * <p>
 * Create Time: 10:34:39 AM
 * 
 * @version 1.0
 */
public class ReturnResultUtil {

    private static Logger log = Logger.getLogger(ReturnResultUtil.class);

    /**
     * 将字符串返回至页面
     * 
     * @param str
     *            需要返回的字符串
     * @param response
     *            STRUTS HttpServletResponse
     */
    public static void returnResult(HttpServletResponse response, String str) {
        response.setContentType("text/html;charset=UTF-8");
        try {
            response.getWriter().print(str);
        } catch (IOException e) {
            log.error("返回数据失败" + e.getMessage());
        }
    }
    public static void returnResult(HttpServletResponse response, JSONArray jsonArray) {
        response.setContentType("text/html;charset=UTF-8");
        try {
            response.getWriter().print(jsonArray);
        } catch (IOException e) {
            log.error("返回数据失败" + e.getMessage());
        }
    }
}
