package demo.webapp.action;

import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.actions.DispatchAction;

import cn.com.jdls.foundation.architectures.command.commands.BaseCommand;
import cn.com.jdls.foundation.architectures.command.util.CommandException;
import cn.com.jdls.foundation.architectures.command.util.CommandExecutor;
import cn.com.jdls.foundation.architectures.command.util.CommandFactory;
import demo.common.util.ReturnResultUtil;
import demo.common.util.UserInfoHelper;
import demo.common.vo.UserInfoTable;
import demo.webapp.form.UserInfoSuiForm;
/**
 * <p>
 * 标题: 采用SUI之后处理用户信息CRUD的Action
 * </p>
 * <p>
 * 描述: 采用SUI之后处理用户信息CRUD的Action
 * </p>
 * <p>
 * 版权: 税友软件集团股份有限公司
 * </p>
 * <p>
 * 创建时间: 2014年8月4日
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
public class UserInfoSuiAction extends DispatchAction {
    private static Logger log = Logger.getLogger(UserInfoSuiAction.class);

    public ActionForward insert(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {

        JSONObject json = new JSONObject();
        // 1.取得form数据,将json转为object
        UserInfoSuiForm userInfoSuiForm = (UserInfoSuiForm) form;
        userInfoSuiForm = UserInfoHelper.setJsonToForm(userInfoSuiForm);
        // 2.放入map
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", userInfoSuiForm.getUserID().trim());
        map.put("username", userInfoSuiForm.getUserName().trim());
        map.put("age", userInfoSuiForm.getAge());
        map.put("birthday", userInfoSuiForm.getBirthday().trim().substring(0, 10));
        map.put("remark", userInfoSuiForm.getRemark().trim());
        map.put("gender", userInfoSuiForm.getGender().trim());
        map.put("marital", userInfoSuiForm.getMarital().trim());
        map.put("department", userInfoSuiForm.getDepartment().trim());
        // 3.设置command
        String mappingAction = "insertUserInfoSuiCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                // 4.调用command
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
            if (!"0".equals(outmap.get("error"))) {
                json.put("error", "-1");
                json.put("message", outmap.get("message"));
            } else {
                json.put("error", "0");
                json.put("result", outmap.get("result").toString());
            }
            ReturnResultUtil.returnResult(response, json.toString());

        }
        return null;
    }

    public ActionForward delete(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {
        JSONObject json = new JSONObject();
        // 1.取得form数据,将json转为object
        UserInfoSuiForm userInfoSuiForm = (UserInfoSuiForm) form;
        userInfoSuiForm = UserInfoHelper.setJsonToForm(userInfoSuiForm);
        // 2.放入map
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", userInfoSuiForm.getUserID().trim());
        // 3.设置command
        String mappingAction = "deleteUserInfoSuiCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                // 4.调用command
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
            if (!"0".equals(outmap.get("error"))) {
                json.put("error", "-1");
                json.put("message", outmap.get("message"));
            } else {
                json.put("error", "0");
                json.put("result", outmap.get("result").toString());
            }
            ReturnResultUtil.returnResult(response, json.toString());

        }
        return null;
    }

    public ActionForward update(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {
        JSONObject json = new JSONObject();
        // 1.取得form数据,将json转为object
        UserInfoSuiForm userInfoSuiForm = (UserInfoSuiForm) form;
        userInfoSuiForm = UserInfoHelper.setJsonToForm(userInfoSuiForm);
        // 2.放入map
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("username", userInfoSuiForm.getUserName().trim());
        map.put("age", userInfoSuiForm.getAge());
        map.put("birthday", userInfoSuiForm.getBirthday().trim().substring(0, 10));
        map.put("remark", userInfoSuiForm.getRemark().trim());
        map.put("gender", userInfoSuiForm.getGender().trim());
        map.put("marital", userInfoSuiForm.getMarital().trim());
        map.put("department", userInfoSuiForm.getDepartment().trim());
        map.put("userid", userInfoSuiForm.getUserID().trim());
        // 3.设置command

        String mappingAction = "updateUserInfoSuiCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                // 4.调用command
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
            if (!"0".equals(outmap.get("error"))) {
                json.put("error", "-1");
                json.put("message", outmap.get("message"));
            } else {
                json.put("error", "0");
                json.put("result", outmap.get("result").toString());
            }
            ReturnResultUtil.returnResult(response, json.toString());

        }
        return null;
    }

    public ActionForward select(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {
        
        JSONObject json = new JSONObject();
        // 1.取得form数据,将json转为object
        UserInfoSuiForm userInfoSuiForm = (UserInfoSuiForm) form;
        userInfoSuiForm = UserInfoHelper.setJsonToForm(userInfoSuiForm);
        // 2.放入map
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", userInfoSuiForm.getUserID().trim());
        // 3.设置command
        String mappingAction = "selectUserInfoSuiCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        JSONArray jsonArray = new JSONArray();
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                // 4.调用command
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
            if (!"0".equals(outmap.get("error"))) {
                json.put("error", "-1");
                json.put("message", outmap.get("message"));
            } else {
                ArrayList<UserInfoTable> resultList= (ArrayList<UserInfoTable>)outmap.get("result");
                
                for (UserInfoTable result:resultList){
                    JSONObject jo = new JSONObject();
                    jo.put("userID", result.getUserID().trim());
                    jo.put("userName", result.getUserName().trim());
                    jo.put("age", result.getAge());
                    jo.put("birthday", result.getBirthday().trim());
                    jo.put("remark", result.getRemark().trim());
                    jo.put("gender", result.getGender().trim());
                    jo.put("marital", result.getMarital().trim());
                    jo.put("department", result.getDepartment().trim());
                    jsonArray.add(jo);
                }
            }
            ReturnResultUtil.returnResult(response, jsonArray.getJSONObject(0).toString());

        }
        return null;
    }

}