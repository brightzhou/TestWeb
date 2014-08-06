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
 * ����: �����û���ϢCRUD��Action
 * </p>
 * <p>
 * ����: �����û���ϢCRUD��Action
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
            log.info(this.getClass() + "COMMAND ����ʧ��!");
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
            log.info(this.getClass() + "COMMAND ����ʧ��!");
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
            log.info(this.getClass() + "COMMAND ����ʧ��!");
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
            log.info(this.getClass() + "COMMAND ����ʧ��!");
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
