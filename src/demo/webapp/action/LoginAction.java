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
 * 标题: 
 * </p>
 * <p>
 * 描述: 
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
 * <p>修改历史记录：</p>
 * ====================================================================<br>
 * 维护单：<br>
 * 修改日期：<br>
 * 修改人：<br>
 * 修改内容：<br>      
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

