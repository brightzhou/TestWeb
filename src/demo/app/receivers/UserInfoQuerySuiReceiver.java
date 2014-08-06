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
 * 标题: 页面采用SUI之后的用户信息Receiver
 * </p>
 * <p>
 * 描述: 页面采用SUI之后的用户信息Receiver
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
public class UserInfoQuerySuiReceiver extends BaseSearchReceiver {
    // 实例Logger对象
    Logger log = Logger.getLogger(UserInfoQuerySuiReceiver.class);
    // 建立用户信息Dao对象
    UserInfoDao userInfoDao = new UserInfoDao();
    
    //新增操作
    public Clientcommand insertCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "参数信息为空。");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        if (userInfoDao.insert(userInfoTb)) {
            outMap.put("error", "0");
            outMap.put("result", "添加数据成功");
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "添加数据失败");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //删除操作
    public Clientcommand deleteCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "参数信息为空。");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        if (userInfoDao.delete(userInfoTb)) {
            outMap.put("error", "0");
            outMap.put("result", "删除数据成功");
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "删除数据失败");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //更新操作
    public Clientcommand updateCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "参数信息为空。");
            this.getClientCommand().setOutPutDataMap(outMap);
            return this.getClientCommand();
        }
        UserInfoTable userInfoTb = mapToBean(inMap);
        if (userInfoDao.update(userInfoTb)) {
            outMap.put("error", "0");
            outMap.put("result", "更新数据成功");
        } else {
            outMap.put("error", "-1");
            outMap.put("result", "更新数据失败");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //选取操作
    public Clientcommand selectCmd() throws CommandException {
        HashMap<String, Object> inMap = clientCommand.getInputDataMap();
        HashMap<String, Object> outMap = new HashMap<String, Object>();
        if (inMap == null) {
            outMap.put("error", "-1");
            outMap.put("message", "参数信息为空。");
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
            outMap.put("result", "选择数据失败");
        }
        getClientCommand().setOutPutDataMap(outMap);
        return getClientCommand();
    }
    
    //Map转化为Bean
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
