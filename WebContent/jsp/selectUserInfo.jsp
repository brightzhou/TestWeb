<%@ page language="java" contentType="text/html; charset=GBK"
    pageEncoding="GBK"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<%
	String basePath = request.getContextPath();
%>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<title>��ѯ�û���Ϣҳ��</title>
</head>
<body>
	<h1>��ѯ�û���Ϣ</h1>
	<hr>
	<form action="<%=basePath%>/userinfoAction.do?method=select" method="post" >
		<table>
		<tr>
		<td>�û�ID:</td><td><input id="userID" name="userID" type="text" /></td>
		</tr>
		
		<tr>
		<td></td><td><input type="submit" id="submit" name="submit" value="��ѯ" /></td>
		</tr>
		</table>
	</form>
</body>
</html>