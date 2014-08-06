<%@ page language="java" contentType="text/html; charset=GBK"
    pageEncoding="GBK"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<%
	String basePath = request.getContextPath();
%>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<title>修改用户信息</title>
</head>
<body>
	<h1>修改用户信息</h1>
	<hr>
	<form action="<%=basePath%>/userinfoAction.do?method=update" method="post" >
		<table>
		<tr>
		<td>用户ID:</td><td><input id="userID" name="userID" type="text" /></td>
		</tr>
		<tr>
		<td>用户名字:</td><td><input id="userName" name="userName" type="text" /></td>
		</tr>
		<tr>
		<td>年龄:</td><td><input id="age" name="age" type="text" /></td>
		</tr>
		<tr>
		<td>生日:</td><td><input id="birthday" name="birthday" type="text" /></td>
		</tr>
		<tr>
		<td>备注:</td><td><input id="remark" name="remark" type="text" /></td>
		</tr>
		<tr>
		<td>性别:</td><td><input id="gender" name="gender" type="text" /></td>
		</tr>
		<tr>
		<td>婚否:</td><td><input id="marital" name="marital" type="text" /></td>
		</tr>
		<tr>
		<td>部门:</td><td><input id="department" name="department" type="text" /></td>
		</tr>
		<tr>
		<td></td><td><input type="submit" id="submit" name="submit" value="修改" /></td>
		</tr>
		</table>
	</form>
</body>

</html>