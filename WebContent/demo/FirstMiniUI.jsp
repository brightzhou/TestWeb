<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>Hello MiniUI!</title>
<!--jQuery js-->
<script src="../scripts/sui/base/jquery-1.6.2.min.js"
	type="text/javascript"></script>
<!--MiniUI-->
<link href="../scripts/sui/themes/default/miniui.css" rel="stylesheet"
	type="text/css" />
<link href="../scripts/sui/themes/default/plugin.css" rel="stylesheet"
	type="text/css" />
<link href="../scripts/sui/themes/icons.css" rel="stylesheet"
	type="text/css" />
<script src="../scripts/sui/mini-all-min.js" type="text/javascript"></script>

</head>
<body>
	<input id="helloBtn" class="mini-button" text="Hello"
		onclick="onHelloClick" />
	<script type="text/javascript">
    jQuery(function(){
      init();  //页面初始化一定要这么写，这样能确保运行此代码时，miniui已加载完成，不能直接写在外面，
	})
	function init(){
	}
    function onHelloClick(e) {
	    var button = e.sender;
	    mini.alert("Hello MiniUI!");
    }
    </script>
</body>
</html>