package demo.webapp.action;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.actions.DispatchAction;

import cn.com.jdls.foundation.architectures.command.commands.BaseCommand;
import cn.com.jdls.foundation.architectures.command.util.CommandException;
import cn.com.jdls.foundation.architectures.command.util.CommandExecutor;
import cn.com.jdls.foundation.architectures.command.util.CommandFactory;
import demo.webapp.form.UserInfoForm;

/**
 * <p>
 * 标题: 处理用户信息CRUD的Action
 * </p>
 * <p>
 * 描述: 处理用户信息CRUD的Action
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
public class UserInfoAction extends DispatchAction {
    private static Logger log = Logger.getLogger(UserInfoAction.class);

    public ActionForward insert(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {

        UserInfoForm userInfoForm = (UserInfoForm) form;
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", userInfoForm.getUserID());
        map.put("username", userInfoForm.getUserName());
        map.put("age", userInfoForm.getAge());
        map.put("birthday", userInfoForm.getBirthday());
        map.put("remark", userInfoForm.getRemark());
        map.put("gender", userInfoForm.getGender());
        map.put("marital", userInfoForm.getMarital());
        map.put("department", userInfoForm.getDepartment());
        String mappingAction = "insertUserInfoCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
        }
        return null;
    }

    public ActionForward delete(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {
        UserInfoForm user = (UserInfoForm) form;
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", user.getUserID());

        String mappingAction = "deleteUserInfoCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
        }
        return null;
    }

    public ActionForward update(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {
        UserInfoForm userInfoForm = (UserInfoForm) form;
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", userInfoForm.getUserID());
        map.put("username", userInfoForm.getUserName());
        map.put("age", userInfoForm.getAge());
        map.put("birthday", userInfoForm.getBirthday());
        map.put("remark", userInfoForm.getRemark());
        map.put("gender", userInfoForm.getGender());
        map.put("marital", userInfoForm.getMarital());
        map.put("department", userInfoForm.getDepartment());
        String mappingAction = "updateUserInfoCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
        }
        return null;
    }

    public ActionForward select(ActionMapping mapping, ActionForm form, HttpServletRequest request,
            HttpServletResponse response) {
        UserInfoForm user = (UserInfoForm) form;
        HashMap<String, Object> map = new HashMap<String, Object>();
        map.put("userid", user.getUserID());

        String mappingAction = "selectUserInfoCmd";
        BaseCommand requestCommand = CommandFactory.getInstance().getCommand(mappingAction, map);
        BaseCommand responseCommand = null;
        if (requestCommand == null) {
            log.info(this.getClass() + "COMMAND 创建失败!");
        } else {
            try {
                responseCommand = CommandExecutor.getInstance().executeCom(requestCommand);
            } catch (CommandException ex) {

            }
            HashMap<String, Object> outmap = responseCommand.getClientCommand().getOutPutDataMap();
        }
        return null;
    }

}
