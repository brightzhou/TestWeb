package demo.common.util;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import cn.com.jdls.foundation.util.StringUtil;
import demo.webapp.form.UserInfoSuiForm;
/**
 * <p>
 * 标题: 将SUI数据设置到UserInfoSuiForm中
 * </p>
 * <p>
 * 描述: 将SUI数据设置到UserInfoSuiForm中
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
public class UserInfoHelper {

    public static UserInfoSuiForm setJsonToForm(UserInfoSuiForm form) {
        String submitData = form.getSubmitData();
        JSONObject obj = getSuiJsonObject(submitData);
        UserInfoSuiForm userInfoSuiForm = (UserInfoSuiForm) JSONObject.toBean(obj, UserInfoSuiForm.class);
        userInfoSuiForm.setPageId(form.getPageId());
        userInfoSuiForm.setPageLines(form.getPageLines());
        return userInfoSuiForm;
    }

    /**
     * 将json转化成Object
     * 
     * @param submitData
     * @return JSONObject
     */
    public static JSONObject getSuiJsonObject(String submitData) {
        JSONObject object = new JSONObject();
        if (!StringUtil.isNullString(submitData)) {
            JSONArray array = JSONArray.fromObject(submitData);
            if (array != null && array.size() > 0) {
                object = array.getJSONObject(0);
            }
        }
        return object;
    }
}
