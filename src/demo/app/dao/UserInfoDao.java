package demo.app.dao;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import cn.com.jdls.foundation.dao.BaseDao;
import cn.com.jdls.foundation.dao.DAOManager;
import cn.com.jdls.foundation.dao.DAOResult;
import cn.com.jdls.foundation.dao.DataRow;
import cn.com.jdls.foundation.dao.DataSet;
import demo.common.vo.UserInfoTable;

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
 * <p>
 * 修改历史记录：
 * </p>
 * ====================================================================<br>
 * 维护单：<br>
 * 修改日期：<br>
 * 修改人：<br>
 * 修改内容：<br>
 */

public class UserInfoDao extends BaseDao {
    private static Logger log = Logger.getLogger(UserInfoDao.class);
    DAOManager daoManager = DAOManager.getInstance();

    public ArrayList select(UserInfoTable userInfoTb) {
        try {
            String taskName = "selectUserInfo";
            boolean exist = daoManager.existTask(taskName);
            if (exist) {
                ArrayList params = new ArrayList();
                ArrayList param = new ArrayList();
                params.add(userInfoTb.getUserID());
                param.add(params);

                DAOResult rst = daoManager.select(taskName, param);
                if (rst.isSuccess()) {
                    
                    log.info("---------Select First User Info-------------");
                    log.info("userid::" + rst.getFirstSqlResultFirstRowCell(0));
                    log.info("username::" + rst.getFirstSqlResultFirstRowCell(1));
                    log.info("age::" + rst.getFirstSqlResultFirstRowCell(2));
                    log.info("birthday::" + rst.getFirstSqlResultFirstRowCell(3));
                    log.info("remark::" + rst.getFirstSqlResultFirstRowCell(4));
                    log.info("gender::" + rst.getFirstSqlResultFirstRowCell(5));
                    log.info("marital::" + rst.getFirstSqlResultFirstRowCell(6));
                    log.info("department::" + rst.getFirstSqlResultFirstRowCell(7));
                    if(!rst.isEmpty(0)){
                        ArrayList returnList = new ArrayList();
                        DataSet ds = rst.toDataSet(0);
                        while (ds.hasNext()) {
                            DataRow dataRow = (DataRow) ds.next();
                            UserInfoTable obj = setUserInfoTable(dataRow);
                            returnList.add(obj);
                           }
                           return returnList;
                    }

                } else {
                    log.debug("Select Fail:" + rst.getError());
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }
    
    private UserInfoTable setUserInfoTable(DataRow dataRow) {
        UserInfoTable userInfoTb=new UserInfoTable();
        String userID = dataRow.getFieldValueByName("userID");
        String userName = dataRow.getFieldValueByName("userName");
        String age = dataRow.getFieldValueByName("age");
        String birthday = dataRow.getFieldValueByName("birthday");
        String remark = dataRow.getFieldValueByName("remark");
        String gender = dataRow.getFieldValueByName("gender");
        String marital = dataRow.getFieldValueByName("marital");
        String department = dataRow.getFieldValueByName("department");
        if (userID != null) {
            userInfoTb.setUserID(userID);
        } 
        if (userName != null) {
            userInfoTb.setUserName(userName);
        }
        if (age != null) {
            userInfoTb.setAge(Integer.parseInt(age));
        }
        if (birthday != null) {
            userInfoTb.setBirthday(birthday);
        }
        if (remark != null) {
            userInfoTb.setRemark(remark);
        }
        if (gender != null) {
            userInfoTb.setGender(gender);
        }
        if (marital != null) {
            userInfoTb.setMarital(marital);
        }
        if (department != null) {
            userInfoTb.setDepartment(department);
        }
        return userInfoTb;
    }
    
//    public boolean selectAll(UserInfoTable userInfoTb) {
//        try {
//            String taskName = "selectUserInfo";
//            boolean exist = daoManager.existTask(taskName);
//            if (exist) {
//                ArrayList params = new ArrayList();
//                ArrayList param = new ArrayList();
//                params.add(userInfoTb.getUserID());
//                param.add(params);
//
//                DAOResult rst = daoManager.select(taskName, param);
//                if (rst.isSuccess()) {
//                    log.info("---------Select First User Info-------------");
//                    log.info("userid::" + rst.getFirstSqlResultFirstRowCell(0));
//                    log.info("username::" + rst.getFirstSqlResultFirstRowCell(1));
//                    log.info("age::" + rst.getFirstSqlResultFirstRowCell(2));
//                    log.info("birthday::" + rst.getFirstSqlResultFirstRowCell(3));
//                    log.info("remark::" + rst.getFirstSqlResultFirstRowCell(4));
//                    log.info("sex::" + rst.getFirstSqlResultFirstRowCell(5));
//                    log.info("marital::" + rst.getFirstSqlResultFirstRowCell(6));
//                    log.info("department::" + rst.getFirstSqlResultFirstRowCell(7));
//                    return true;
//                } else {
//                    log.debug("Select Fail:" + rst.getError());
//                }
//            }
//        } catch (Exception ex) {
//            ex.printStackTrace();
//        }
//        return false;
//    }

    public boolean insert(UserInfoTable userInfoTb) {
        String taskName = "insertUserInfo";
        boolean exist = daoManager.existTask(taskName);
        if (exist) {
            try {
                ArrayList params = new ArrayList();
                ArrayList param = new ArrayList();
                params.add(userInfoTb.getUserID());
                params.add(userInfoTb.getUserName());
                params.add(userInfoTb.getAge());
                params.add(userInfoTb.getBirthday());
                params.add(userInfoTb.getRemark());
                params.add(userInfoTb.getGender());
                params.add(userInfoTb.getMarital());
                params.add(userInfoTb.getDepartment());
                param.add(params);
                DAOResult rst = daoManager.insert(taskName, param);
                if (rst.isSuccess()) {
                    log.info("Insert Success!");
                    return true;
                } else {
                    log.debug("Insert Fail:" + rst.getError());

                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        return false;
    }

    public boolean delete(UserInfoTable userInfoTb) {
        String taskName = "deleteUserInfo";
        boolean exist = daoManager.existTask(taskName);
        if (exist) {
            try {
                ArrayList params = new ArrayList();
                ArrayList param = new ArrayList();
                params.add(userInfoTb.getUserID());
                param.add(params);
                DAOResult rst = daoManager.delete(taskName, param);
                if (rst.isSuccess()) {
                    log.info("Delete Success!");
                    return true;
                } else {
                    log.info("Delete Fail:" + rst.getError());
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        return false;
    }

    public boolean update(UserInfoTable userInfoTb) {
        String taskName = "updateUserInfo";
        boolean exist = daoManager.existTask(taskName);
        if (exist) {
            try {
                ArrayList params = new ArrayList();
                ArrayList param = new ArrayList();
                params.add(userInfoTb.getUserName());
                params.add(userInfoTb.getAge());
                params.add(userInfoTb.getBirthday());
                params.add(userInfoTb.getRemark());
                params.add(userInfoTb.getGender());
                params.add(userInfoTb.getMarital());
                params.add(userInfoTb.getDepartment());
                params.add(userInfoTb.getUserID());
                param.add(params);
                DAOResult rst = daoManager.update(taskName, param);
                if (rst.isSuccess()) {
                    log.info("Update Success!");
                    return true;
                } else {
                    log.info("Update Fail:" + rst.getError());
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        return false;
    }

}