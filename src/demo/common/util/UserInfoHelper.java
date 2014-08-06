package demo.common.util;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import cn.com.jdls.foundation.util.StringUtil;
import demo.webapp.form.UserInfoSuiForm;
/**
 * <p>
 * ����: ��SUI�������õ�UserInfoSuiForm��
 * </p>
 * <p>
 * ����: ��SUI�������õ�UserInfoSuiForm��
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
     * ��jsonת����Object
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
