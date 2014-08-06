package demo.app.receivers;

import java.util.HashMap;

import cn.com.jdls.foundation.architectures.command.commands.xml.command.Clientcommand;
import cn.com.jdls.foundation.architectures.command.receivers.BaseReceiver;
import cn.com.jdls.foundation.architectures.command.util.CommandException;
import demo.app.dao.UserInfoDao;
import demo.common.vo.UserInfoTable;

/**
 * <p>
 * ����: �û���ϢReceiver
 * </p>
 * <p>
 * ����: �û���ϢReceiver
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
public class UserInfoQueryReceiver extends BaseReceiver {

    UserInfoDao userInfoDao = new UserInfoDao();

    public Clientcommand selectCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        UserInfoTable userInfoTb = mapToBean(inMap);
        userInfoDao.select(userInfoTb);
        getClientCommand().setOutPutDataMap(null);
        return getClientCommand();
    }
    
    public Clientcommand insertCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        UserInfoTable userInfoTb = mapToBean(inMap);
        userInfoDao.insert(userInfoTb);
        getClientCommand().setOutPutDataMap(null);
        return getClientCommand();
    }
    public Clientcommand deleteCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        UserInfoTable userInfoTb = mapToBean(inMap);
        userInfoDao.delete(userInfoTb);
        getClientCommand().setOutPutDataMap(null);
        return getClientCommand();
    }
    public Clientcommand updateCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        UserInfoTable userInfoTb = mapToBean(inMap);
        userInfoDao.update(userInfoTb);
        getClientCommand().setOutPutDataMap(null);
        return getClientCommand();
    }

    private UserInfoTable mapToBean(HashMap<String, Object> inMap) {
        Object userID = inMap.get("userid");
        Object userName = inMap.get("username");
        Object age = inMap.get("age");
        Object birthday = inMap.get("birthday");
        Object remark = inMap.get("remark");
        Object gender = inMap.get("gender");
        Object marital = inMap.get("marital");
        Object department = inMap.get("department");
        
        UserInfoTable userInfoTb=new UserInfoTable();
        if (userID != null) {
            userInfoTb.setUserID(userID.toString());
        }else{
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
//        return new UserInfoTable(userID != null ? userID.toString() : null, userName != null ? userName.toString()
//                : null, age != null ? Integer.parseInt(age.toString()) : null, birthday != null ? gbk.toString()
//                : null, remark != null ? remark.toString() : null, sex != null ? sex.toString() : null,
//                marital != null ? marital.toString() : null, department != null ? department.toString() : null);
    }
}
