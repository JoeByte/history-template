(function ($){

	if(typeof $.mk == "undefined"){
		$.mk = {};
	}
	
	if(typeof $.mk.pay == "undefined"){
		$.mk.pay = {};
	}
	
	//点击银行图片 设置单选框
	$.mk.pay.choosePayBankAndMoney = function(bankID){
		$("#" + bankID).attr("checked",true);
	}
	
	//支付下一步(判断浏览器)
	$.mk.pay.ybPayNext = function(){
		if(document.all)
			$.mk.pay.ybPayNextSubmit();
		else
			_showCheckPayTips("isIe");
	}
	
	//支付下一步
	$.mk.pay.ybPayNextSubmit = function(){
		var bankSize = $("[name=payBank]:checked").size();
		if(bankSize <= 0){
			_showCheckPayTips("bankSize");
			return;
		}
		
		var moneySize = $("[name=payMoney]:checked").size();
		if(moneySize <= 0){
			_showCheckPayTips("moneySize");
			return;
		}
		
		var customMoneySize = $("[id=MCustom]:checked").size();
		if(customMoneySize > 0){
			var inputValue = $("#MCustomInput").val();
			if(/^[1-9]\d*$/.test(inputValue))
				$("#MCustom").val(inputValue);
			else{
				_showCheckPayTips("customMoneySize");
				return;
			}
		}
		var isMsp = $("#isMsp").val();
		var isPay = $("#isPay").val();
		var toType = $("#toType").val();
		if(toType == 1){
			var toUser = $("#toUserID").val();
			if(toUser == "" || toUser == 0){
				_showCheckPayTips("toUser");
				return;
			}
		}
		
		var bankID = $("[name=payBank]:checked").val();
		var money = $("[name=payMoney]:checked").val();
		$("#bankID").val(bankID);
		$("#money").val(money);
		$("#payNext").submit();
	}
	
	//支付宝支付下一步--订单支付
	$.mk.pay.aliPayOrderNext = function(formID){	
		var moneySize = $("[name=payMoney]:checked").size();
		if(moneySize <= 0){
			_showCheckPayTips("moneySize");
			return;
		}
		
		var customMoneySize = $("[id=MCustom]:checked").size();
		if(customMoneySize > 0){
			var inputValue = $("#MCustomInput").val();
			if(/^[1-9]\d*$/.test(inputValue))
				$("#MCustom").val(inputValue);
			else{
				_showCheckPayTips("customMoneySize");
				return;
			}
		}
		var toType = $("#toType").val()
		if(toType == 1){
			var toUser = $("#toUserID").val();
			if(toUser == "" || toUser == 0){
				_showCheckPayTips("toUser");
				return;
			}
		}
		var money = $("[name=payMoney]:checked").val();
		$("#money").val(money);
		var orderID = $("#orderID").val();
		$.mokoDialog.close();
		$.mokoDialog({url:"/jsps/order/payOrderStatus.jsp?orderID="+orderID,width:600,initFn:function(){
			$("#"+formID).submit();
		}});
	}
	//支付宝支付下一步
	$.mk.pay.aliPayNext = function(formID){	
		var moneySize = $("[name=payMoney]:checked").size();
		if(moneySize <= 0){
			_showCheckPayTips("moneySize");
			return;
		}
		
		var customMoneySize = $("[id=MCustom]:checked").size();
		if(customMoneySize > 0){
			var inputValue = $("#MCustomInput").val();
			if(/^[1-9]\d*$/.test(inputValue))
				$("#MCustom").val(inputValue);
			else{
				_showCheckPayTips("customMoneySize");
				return;
			}
		}
		var toType = $("#toType").val()
		if(toType == 1){
			var toUser = $("#toUserID").val();
			if(toUser == "" || toUser == 0){
				_showCheckPayTips("toUser");
				return;
			}
		}
		var money = $("[name=payMoney]:checked").val();
		$("#money").val(money);
		var isMsp = $("#isMsp").val();
		$.mokoDialog.close();
		$.mokoDialog({url:"/jsps/pay/PayOkSmailPoP.jsp?ismsp="+isMsp,width:600,initFn:function(){
			$("#"+formID).submit();
		}});
	}
	//检测是否支付成功
	$.mk.pay.checkPay = function(orderID){
		$.ajax({
			url : "/orderManager|checkPayStatus.action",
			type : "post",
			data : {"orderID":orderID},
			success : function(response){
				if(response==null||response=="")
					return;
				if(response=="success"){
					$.mokoDialog.close();
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=42"});
				}
				if(response=="fail"){
					$.mokoDialog.close();
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=53"});
				}
			}
		});
	}
	//网上银行--支付订单
	$.mk.pay.goPayOrder = function(formID){
		var orderID = $("#orderID").val();
		$.mokoDialog.close();
		$.mokoDialog({url:"/jsps/order/payOrderStatus.jsp?orderID="+orderID,width:600,initFn:function(){
			$("#"+formID).submit();
		}});	
	}
	//去网上银行进行充值
	$.mk.pay.goPay = function(formID){
		var isMsp = $("#isMsp").val();
		var isPay = $("#isPay").val();
		$.mokoDialog.close();
		$.mokoDialog({url:"/jsps/pay/PayOkSmailPoP.jsp?isMsp="+isMsp+"&isPay="+isPay,width:600,initFn:function(){
			$("#"+formID).submit();
		}});				
	}
	
	//充值遇到问题
	$.mk.pay.payErr = function(url){
		$.mokoDialog.close();
		$.openPage(url);
	}
	
	//充值完成
	$.mk.pay.payOK = function(isMsp,isPay){
		$.mokoDialog.close();
		if(isMsp=="t"||isPay=="f"){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=42"});
		}else{
			$.location("/payManager|showPayItemPage.action");
		}
	}
	
	//清除充值明细
	$.mk.pay.clearPayItem = function(){
		if(!confirm("确定要清除所有明细吗？"))
			return ;
		$.location("/payManager|clearPayItem.action");
	}
	
	$.mk.pay.clearPayConsumeItem = function(){
		if(!confirm("确定要清除所有明细吗？"))
			return ;
		$.location("/payManager|clearPayConsumeItem.action");
	}
	
	//验证提示弹出层
	_showCheckPayTips = function(tipsType){
		var param = $.param({"tipsType":tipsType});
		$.mokoDialog({url:"/jsps/pay/payAlert.jsp?"+param,width:450});
	}
})(jQuery1);

jQuery1(function() {
	// 给关注人充值 输入框自动文本
	jQuery1('#findfriendname').autoText();
	// 给关注人充值 添加拼音搜索
	jQuery1('#findfriendname').pinyinSearch({
		clickCallback : function(id, name, wkey) {
			jQuery1("#toUserID").val(id);
			$(this).val(name);
		}
	});
});