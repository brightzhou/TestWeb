package demo.app.receivers;

import java.util.ArrayList;
import java.util.HashMap;

import org.apache.log4j.Logger;

import cn.com.jdls.foundation.architectures.command.commands.xml.command.Clientcommand;
import cn.com.jdls.foundation.architectures.command.receivers.BaseSearchReceiver;
import cn.com.jdls.foundation.architectures.command.util.CommandException;
import cn.com.jdls.foundation.dao.DAOResult;
import demo.app.dao.UserInfoDao;
import demo.common.vo.UserInfoTable;
/**
 * <p>
 * ����: ҳ�����SUI֮����û���ϢReceiver
 * </p>
 * <p>
 * ����: ҳ�����SUI֮����û���ϢReceiver
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
public class UserInfoQuerySuiReceiver extends BaseSearchReceiver {
    // ʵ��Logger����
    Logger log = Logger.getLogger(UserInfoQuerySuiReceiver.class);
    // �����û���ϢDao����
    UserInfoDao userInfoDao = new UserInfoDao();
    
    //��������
    public Clientcommand insertCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "������ϢΪ�ա�");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        if (userInfoDao.insert(userInfoTb)) {
            outMap.put("error", "0");
            outMap.put("result", "������ݳɹ�");
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "�������ʧ��");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //ɾ������
    public Clientcommand deleteCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "������ϢΪ�ա�");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        if (userInfoDao.delete(userInfoTb)) {
            outMap.put("error", "0");
            outMap.put("result", "ɾ�����ݳɹ�");
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "ɾ������ʧ��");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //���²���
    public Clientcommand updateCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "������ϢΪ�ա�");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        if (userInfoDao.update(userInfoTb)) {
            outMap.put("error", "0");
            outMap.put("result", "�������ݳɹ�");
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "��������ʧ��");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //ѡȡ����
    public Clientcommand selectCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "������ϢΪ�ա�");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        ArrayList returnList=userInfoDao.select(userInfoTb);
        if (returnList!=null) {
            outMap.put("error", "0");
            outMap.put("result", returnList);
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "ѡ������ʧ��");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //Mapת��ΪBean
    private UserInfoTable mapToBean(HashMap<String, Object> inMap) {
        Object userID = inMap.get("userid");
        Object userName = inMap.get("username");
        Object age = inMap.get("age");
        Object birthday = inMap.get("birthday");
        Object remark = inMap.get("remark");
        Object gender = inMap.get("gender");
        Object marital = inMap.get("marital");
        Object department = inMap.get("department");

        UserInfoTable userInfoTb = new UserInfoTable();
        if (userID != null) {
            userInfoTb.setUserID(userID.toString());
        } else {
            return null;
        }
        if (userName != null) {
            userInfoTb.setUserName(userName.toString());
        }
        if (age != null) {
            userInfoTb.setAge(Integer.parseInt(age.toString()));
        }
        if (birthday != null) {
            userInfoTb.setBirthday(birthday.toString());
        }
        if (remark != null) {
            userInfoTb.setRemark(remark.toString());
        }
        if (gender != null) {
            userInfoTb.setGender(gender.toString());
        }
        if (marital != null) {
            userInfoTb.setMarital(marital.toString());
        }
        if (department != null) {
            userInfoTb.setDepartment(department.toString());
        }
        return userInfoTb;
        // return new UserInfoTable(userID != null ? userID.toString() : null,
        // userName != null ? userName.toString()
        // : null, age != null ? Integer.parseInt(age.toString()) : null,
        // birthday != null ? gbk.toString()
        // : null, remark != null ? remark.toString() : null, sex != null ?
        // sex.toString() : null,
        // marital != null ? marital.toString() : null, department != null ?
        // department.toString() : null);
    }
}
