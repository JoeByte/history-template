/**
 * 关于第三方账户绑定功能的js
 */
(function($) {
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	
	if (typeof $.mk.bd == "undefined") {
		$.mk.bd = {};
	}
	
	var $syncTypeCheckBox = null;
	
	/****************************************新浪账户绑定相关 start******************************************/

	//弹出授权新浪微博的弹出层
	$.mk.bd.bindSina = function(state){
		$.mokoDialog.close();
		$.mokoDialog({url : "/jsps/partnerbind/sina/SinaPop.jsp?state=" + state, fixed : false});
	}
	//添加新浪微博的授权关联
	$.mk.bd.bindSinaCallBack = function(isBindSina, sinaUserScreenName){
		if(!isBindSina){
			alert("关联出错");
			$.mokoDialog.close();
			return;
		}
		if($("#divBindSina").size() != 0){
			$("#divBindSina-bind").hide();
			$("#divBindSina-cancle-accounts-name").html(sinaUserScreenName);
			$("#divBindSina-cancle").show();
		}
		if($syncTypeCheckBox != null) $syncTypeCheckBox.prop("checked", true);
		$.mokoDialog.close();
	}
	//取消授权操作
	$.mk.bd.cancleBindSina = function(){
		$.ajax({
			url:"/sinaBind|cancleBindAjax.action",
			type:"get",
			data:"",
			success:function(response){
				if(response == "success"){
					$("#divBindSina-cancle").hide();
					$("#sync-sina-weibo").prop("checked", false);
					$syncTypeCheckBox = null;
					$("#divBindSina-bind").show();
				}else
					alert("数据错误,请刷新页面重新操作！");
			}
		});
	}

	//授权iframe loading
	$.mk.bd.stateChangeIE = function(_frame){
     if (_frame.readyState=="interactive"){//state: loading ,interactive, complete
    	 $("#sina-pop-load").hide(); 
         $(_frame).show();
     }   
    }
	$.mk.bd.stateChangeFirefox = function(_frame){
		$("#sina-pop-load").hide(); 
        $(_frame).show();
    }
	//弹出层账户绑定回调
	$.mk.bd.sinaLoginCallback = function(state, url){
		if(state == 1){
			$.mokoDialog.close();
			$.reload();
		}
		if(state == 2){
			$.mokoDialog.close();
			$.location(encodeURI(url));
		}
	}
	/****************************************新浪账户绑定相关 end******************************************/
	/****************************************QQ账户绑定相关 start*****************************************/

	var qqOauth2LoginWindow = null;
	//弹出QQ授权窗口
	$.mk.bd.bindQQ = function(qqBindUrl){
		$.mokoDialog.close();
		qqOauth2LoginWindow = window.open(qqBindUrl, "qqOauth2Login" ,"height=525, width=585, top=100, left=200, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes");
	}
	
	//弹出层账户绑定回调
	$.mk.bd.qqLoginCallback = function(state, url){
		qqOauth2LoginWindow.close();
		if(state == 1)
			$.reload();
		if(state == 2)
			$.location(encodeURI(url));
	}
	
	//QQ授权回调页面处理
	$.mk.bd.bindQQCallBack = function(isBindQQ, qqScreenName){
		qqOauth2LoginWindow.close();
		if(!isBindQQ){
			alert("关联出错");
			return;
		}
		if($("#divBindSina").size() != 0){
			$("#divBindQQ-bind").hide();
			$("#divBindQQ-cancle-accounts-name").html(qqScreenName);
			$("#divBindQQ-cancle").show();
		}
		if($syncTypeCheckBox != null) $syncTypeCheckBox.prop("checked", true);
	}

	//取消授权操作
	$.mk.bd.cancleBindQQ = function(){
		$.ajax({
			url:"/qqBind|cancleBindAjax.action",
			type:"get",
			data:"",
			success:function(response){
				if(response == "success"){
					$("#divBindQQ-cancle").hide();
					$("#sync-qzone").prop("checked", false);
					$("#sync-qq-weibo").prop("checked", false);
					$syncTypeCheckBox = null;
					$("#divBindQQ-bind").show();
				}else
					alert("数据错误,请刷新页面重新操作！");
			}
		});
	}
	
	//账号关联页面设置昵称及关联图片
	$.mk.bd.setConnectInfo = function(){
		var nickName = decodeURI(decodeURI($.getCookie("MOKO_CONNECT_NICKNAMEKEY")));
		var className = $.getCookie("MOKO_CONNECTKEY");
		var accountsInfo = "";
		if(className == "qq")
			accountsInfo = "<span>" + nickName + "</span>&nbsp;&nbsp;欢迎使用QQ帐号访问MOKO!";
		if(className == "sina")
			accountsInfo = "<span>" + nickName + "</span>&nbsp;&nbsp;欢迎使用新浪微博帐号访问MOKO!";
		$("#connect-accounts-info").html(accountsInfo);
		$("#connect-accounts-logo").addClass(className);
	}
	/****************************************QQ账户绑定相关 end*****************************************/
	//发布展示checkbox检测token是否有效
	$.mk.bd.checkToken = function(obj, isPrivacySetting){
		$syncTypeCheckBox = $(obj);
		if(!$syncTypeCheckBox.prop("checked")){
			if(isPrivacySetting) _cancelSync($syncTypeCheckBox.val());
			return false;
		}
		var checkurl = $syncTypeCheckBox.attr("checkurl");
		if(checkurl == undefined || checkurl == "")
			return false;
		tag = true;
		$.ajax({
			url:checkurl,
			type:"get",
			async:false,
			success:function(response){
				if(response != "success"){
					$syncTypeCheckBox.prop("checked", false);
					_checkTokenFaild($syncTypeCheckBox.val());
					tag = false;
				}else if(isPrivacySetting)
					_setSync($syncTypeCheckBox.val());
			}
		});
		if(isPrivacySetting)
			$syncTypeCheckBox = null;
		return tag;
	}

	//token验证失败时的操作
	_checkTokenFaild = function(syncType){
		if(syncType == "W" || syncType == "Z"){//QWeibo || QZone
			$.mk.bd.bindQQ($("#syncQQBindUrl").val());
			return;
		}
		if(syncType == "S"){//Weibo
			$.mk.bd.bindSina($("#syncBindType").val());
			return;
		}
	}

	//账号关联页面设置同步类型
	_setSync = function(syncType){
		if(syncType == "W" || syncType == "Z")//QWeibo || QZone
			url = "/qqBind|setSyncAjax.action";
		if(syncType == "S")//Weibo
			url = "/sinaBind|setSyncAjax.action";
		$.ajax({
			url:url,
			type:"post",
			data:{"syncType":syncType},
			success:function(response){}
		});
	}
	
	//账号关联页面取消同步类型
	_cancelSync = function(syncType){
		if(syncType == "W" || syncType == "Z")//QWeibo || QZone
			url = "/qqBind|cancelSyncAjax.action";
		if(syncType == "S")//Weibo
			url = "/sinaBind|cancelSyncAjax.action";
		$.ajax({
			url:url,
			type:"post",
			data:{"syncType":syncType},
			success:function(response){}
		});
	}
	
})(jQuery1);