<%@ page language="java" contentType="text/html; charset=GBK"
    pageEncoding="GBK"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<%
	String basePath = request.getContextPath();
%>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<title>�޸��û���Ϣ</title>
</head>
<body>
	<h1>�޸��û���Ϣ</h1>
	<hr>
	<form action="<%=basePath%>/userinfoAction.do?method=update" method="post" >
		<table>
		<tr>
		<td>�û�ID:</td><td><input id="userID" name="userID" type="text" /></td>
		</tr>
		<tr>
		<td>�û�����:</td><td><input id="userName" name="userName" type="text" /></td>
		</tr>
		<tr>
		<td>����:</td><td><input id="age" name="age" type="text" /></td>
		</tr>
		<tr>
		<td>����:</td><td><input id="birthday" name="birthday" type="text" /></td>
		</tr>
		<tr>
		<td>��ע:</td><td><input id="remark" name="remark" type="text" /></td>
		</tr>
		<tr>
		<td>�Ա�:</td><td><input id="gender" name="gender" type="text" /></td>
		</tr>
		<tr>
		<td>���:</td><td><input id="marital" name="marital" type="text" /></td>
		</tr>
		<tr>
		<td>����:</td><td><input id="department" name="department" type="text" /></td>
		</tr>
		<tr>
		<td></td><td><input type="submit" id="submit" name="submit" value="�޸�" /></td>
		</tr>
		</table>
	</form>
</body>

</html>