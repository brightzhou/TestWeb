package demo.webapp.form;

import org.apache.struts.action.ActionForm;

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

