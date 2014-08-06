package demo.webapp.form;

import org.apache.struts.action.ActionForm;

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
@SuppressWarnings("serial")  
public class LoginActionForm extends ActionForm {
    private String userName;

    private String passWord;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassWord() {
        return passWord;
    }

    public void setPassWord(String passWord) {
        this.passWord = passWord;
    }
}

