package demo.webapp.action;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

import demo.webapp.form.LoginActionForm;

/**
 * <p>
 * ����: 
 * </p>
 * <p>
 * ����: 
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
 * <p>�޸���ʷ��¼��</p>
 * ====================================================================<br>
 * ά������<br>
 * �޸����ڣ�<br>
 * �޸��ˣ�<br>
 * �޸����ݣ�<br>      
 */
public class LoginAction extends Action {  
    private static Logger log = Logger.getLogger(LoginAction.class);
    @Override  
    public ActionForward execute(ActionMapping mapping, ActionForm form,  
            HttpServletRequest request, HttpServletResponse response)  
            throws Exception {  
        String path = "error";
        LoginActionForm loginActionForm = (LoginActionForm)form;
        String userName = loginActionForm.getUserName();
        String passWord = loginActionForm.getPassWord();
          
        if(null != userName && "admin".equals(userName) && null != passWord && "admin".equals(passWord)) {  
            path = "success";  
            request.setAttribute("userName", userName);  
        } else {  
            path = "error";  
        }  
        return mapping.findForward(path);  
    }  
      
}  

