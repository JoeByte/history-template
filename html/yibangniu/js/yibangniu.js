//我的moko 相关js
(function($) {
	
	if(typeof $.mk == "undefined"){//保证有$.mk
		$.mk = {};
	}
	
	if(typeof $.mk.mymoko == "undefined"){//保证有$.mk.project
		$.mk.mymoko = {};
	}
	
	// 查看与某人的短信
	$.mk.mymoko.seeMessageBox = function (friendId,lastPage){
		$("#operateMessage").hide();
		$("#divReceiveMessageContent").html('<p class="loading thirdColor">读取中 Loading...</p>');
		$.ajax({
			url:"/userMessageAction|receiveMessageByFriendId.action",
			type:"post",
			data:"friendId="+friendId+"&curPage="+lastPage,
			success:function(response){
				$("#divReceiveMessageContent").html(response);
				$("#txtContent_0").focus();
				$("#txtContent_0").characterLimit({numTarget:'#textLength', maxlength:"150"});
			}
		});
	}
	
	//多图片上传进度条入口
	$.mk.mymoko.getMoreUploadStatus = function(divId,type,fileListId,formid){
		var fsize = 0;
		$("#"+fileListId).find('input[type="file"]').each(function(){
			if($(this).val()){
				fsize++;
			}
		});
		if(fsize==0){
			alert("请上传图片!!!");
			return false;
		};
		//如果是身份证上传判断证件号码是否填写
		if($("#txtCardNum").size()>0 && $("#txtCardNumConfirm").size()>0){
			if($.trim($("#txtCardNum").val())=="" || $.trim($("#txtCardNumConfirm").val())==""){
				alert("请输入证件号码。");
				return false;
			}
			if(isCardTrue == "F" || $.trim($("#txtCardNum").val()) != $.trim($("#txtCardNumConfirm").val())){
				alert("请输入正确证件号码！");
				return false;
			}
		}
		$.mk.upload.getUploadStatus(divId,type,fileListId,formid);
	}
	
	//提交 身份证 申请
	$.mk.mymoko.saveApplyCardData = function(ele){
		if(!$.mk.mymoko.checkApplyCardData())
			return false;
		$(ele).attr("disabled", true);
		$("#cardUploadServer").val($('#uploadServerName').val());
		$.ajax({
			url : "/card|saveCardInfo.action",
			data : $("#form_applyCard").serialize(),
			success : function (response){
				if(response != "success"){
					alert("数据错误，请刷新页面再操作!");
					return;
				}
				$("#apply_content").hide();
				$("#apply_auditing").show();
			}
		});
	}
	
	//提交 MP 申请
	$.mk.mymoko.saveApplyMPData = function(ele, applyCard){
		// 有身份证申请项 并且 数据不通过
		if (applyCard == "true" && !$.mk.mymoko.checkApplyCardData())
			return false;
		// mp数据不通过
		if (!$.mk.mymoko.checkApplyMPData())
			return false;
		$(ele).attr("disabled", true);
		$("#cardUploadServer").val($("#uploadServerName").val());
		$("#mpUploadServer").val($("#uploadServerName").val());
		$.ajax({
			url : "/applyMP|saveApplyMpInfo.action",
			data : $("#form_applyMP").serialize(),
			success : function (response){
				if(response != "success"){
					alert("数据错误，请刷新页面再操作!");
					return;
				}
				$("#apply_content").hide();
				$("#apply_auditing").show();
			}
		});
	}
	
	/**
	 * 上传用户身份证图片
	 * type: 1 身份证，2 形象照，3 作品
	 */
	$.mk.mymoko.uploadUserApplyPic = function(type){
		var maxCount = 0;
		var defaultCount = 2;
		var uploadType = "";
		if(type == 1){
			defaultCount = 1;
			maxCount = 5 - $("#userCardDiv div[id^=userCard_]").size();
			uploadType = $("#cardUploadType").val();
		}else if(type == 2){
			$("#uploadApplyType").val("xingxiang");
			maxCount = 10 - $("#userXingXiangDiv div[id^=userXingXiang_]").size();
			uploadType = $("#mpUploadType").val();
		}else if(type == 3){
			$("#uploadApplyType").val("zuopin");
			maxCount = 10 - $("#userZuoPinDiv div[id^=userZuoPin_]").size();
			uploadType = $("#mpUploadType").val();
		}else{
			alert("请选择正确类型上传！");
			return ;
		}
		if(maxCount <= 0){
			alert("上传超过限制！");
			return ;
		}
		if(maxCount > 5)
			maxCount = 5;
		var param = $.param({"uploadType":uploadType,"maxCount":maxCount,"defaultCount":defaultCount});
		$.mokoDialog({url:'/jsps/register/RegisterApplyUpload.jsp?'+param});
	}
	
	//身份证图片上传后处理
	$.mk.mymoko.showUserCardPic = function(picsJson){
		var srcs = new Array();
		for(i = 0;i < picsJson.pic.length; i++)
			srcs.push(picsJson.pic[i].picName);
		var param = $.param({"p[0].uploadType":$("#cardUploadType").val(),"p[0].src": srcs,"p[0].uploadServer":$("#uploadServerName").val()}, true);
		$.ajax({
			url:"/uploadPre|userCard_pre.action",
			type:"post",
			data:param,
			dataType:"json",
			success:function(response){
				if (response.code != 1){
					alert("预览图片出错！");
					return ;
				}
				$.mokoDialog.close();
				_showUserApplyData(response,"userCard");
			}
		});
	}
	
	//MP申请图片上传后处理
	$.mk.mymoko.showUserApplyPic = function(picsJson){
		var srcs = new Array();
		for(i = 0;i < picsJson.pic.length; i++)
			srcs.push(picsJson.pic[i].picName);
		var param = $.param({"p[0].uploadType":$("#mpUploadType").val(),"p[0].src": srcs,"p[0].uploadServer":$("#uploadServerName").val()}, true);
		$.ajax({
			url:"/uploadPre|userMp_pre.action",
			type:"post",
			data:param,
			dataType:"json",
			success:function(response){
				if (response.code != 1){
					var param = $.param({"content":"预览图片出错！"});
					$.mokoDialog({url:"/jsps/register/RegisterTiShiPop.jsp?"+param});
					return ;
				}
				$.mokoDialog.close();
				if($("#uploadApplyType").val() == "xingxiang") {
					//隐藏 身份证与形象照 示例图片
					$(".reg-upload-audit .demo").hide();
					_showUserApplyData(response,"userXingXiang");
				} else {
					_showUserApplyData(response,"userZuoPin");
				}
			}
		});
	}
	
	/**
	 * 删除申请图片
	 */
	$.mk.mymoko.removeUserApplyPic = function(id){
		if(!confirm("确定要删除吗？"))
			return ;
		$("#" + id).remove();
	}
	
	//mp数据验证
	$.mk.mymoko.checkApplyMPData = function () {
		var content;
		var xx_count = $("#userXingXiangDiv div[id^=userXingXiang_]").size();
		var zp_count = $("#userZuoPinDiv div[id^=userZuoPin_]").size();
	    if (xx_count == 0) {
	        content = "本人形象照片没有上传...";
	    } else if (xx_count < 2) {
	         content = "请最少上传2张本人形象照片...";
	    } else if (zp_count == 0) {
	         content = "本人相关作品没有上传...";
	    } else if (zp_count < 2) {
	         content = "请最少上传2张本人相关作品...";
	    }
	    if (content) {
	    	var param = $.param({ "content" : content });
	        $.mokoDialog({ url: "/jsps/register/RegisterTiShiPop.jsp?" + param });
	        return false;
	    }
    	return true;
	}
	
	//身份证数据验证
	$.mk.mymoko.checkApplyCardData = function () {
		var content;
	    if ($("#userCardDiv div[id^=userCard_]").size() < 1) {
	        content = "证件照片没有上传...";
	    } else if ($.trim($("#txtCardNum").val()).length == 0 || isCardTrue == "F") {
	        content = "请输入正确证件号码...";
	    } else if ($.trim($("#txtCardNum").val()) != $.trim($("#txtCardNumConfirm").val())) {
	        content = "两次输入的证件号码不一样,请重新输入。";
	    }
	    if (content) {
	    	var param = $.param({ "content" : content });
	        $.mokoDialog({ url: "/jsps/register/RegisterTiShiPop.jsp?" + param });
	        return false;
	    }
	    return true;
	}
	
	//保存 mp和身份证 时的数据验证
	$.mk.mymoko.saveUserApplyData = function(ele){
		if(!$.mk.mymoko.checkApplyCardData() || !$.mk.mymoko.checkApplyMPData())
			return false;
		
		$("#cardUploadServer").val($("#uploadServerName").val());
		$("#mpUploadServer").val($("#uploadServerName").val());
		$(ele).attr("disabled", true);
		$("#form_registerApply").submit();
		return true;
	}
	
	//mp申请检测上传信息
	$.mk.mymoko.getUploadStatusCard = function(isUploadCard){
		if(isUploadCard=="F"){
			var iDFileList=$("#fileListCard input[name='listUploadCard']");
			var iDCount=0;
			var picIsEmpty = false;
			for(var i=0;i<iDFileList.length;i++){
				if(iDFileList[i].value!="")
					iDCount++;
				else
					picIsEmpty = true;
			}
			if(picIsEmpty || iDCount<1){
				alert("请上传身份证照。");
				return false;
			}
			//如果是身份证上传判断证件号码是否填写
			if($.trim($("#txtCardNum").val())=="" || $.trim($("#txtCardNumConfirm").val())==""){
				alert("请输入证件号码。");
				return false;
			}
			
			if(isCardTrue == "F" || $.trim($("#txtCardNum").val()) != $.trim($("#txtCardNumConfirm").val())){
				alert("请输入正确证件号码！");
				return false;
			}
		}
		var fileList=$("#fileList input[name='listUpload']");
		var count=0;
		for(var i=0;i<fileList.length;i++){
			if(fileList[i].value!="")
				count++;
			else
				picIsEmpty = true;
		}
		if(picIsEmpty){
			alert("请上传个人照片或个人作品。");
			return false;
		}
		if(count<4){
			alert("请上传不少于2张个人照片及2张个人作品。");
			return false;
		}
		$("#btnSubmit").attr("disabled",true);
		if($("#uploadCardPic").size() != 0){
			var type = $("#pic_card_type").val();
			$.mk.upload.getUploadStatus('status',type,'fileListCard','uploadCardPic');
		}else{
			var type = $("#pic_apply_type").val();
			$.mk.upload.getUploadStatus('status',type,'fileList','uploadMpPic');
		}
		return true;
	}

	//用户mip上传 回调函数
	$.mk.mymoko.showUserMipPic = function(picsJson){
		$("#status").html("");
		_loadMipPicItem(picsJson);
		$("#uploadFileList").show();
		count_file = 1;//将上传图片框数量置为1
	}
	
	//flash上传回调 公司简介图片上传
	$.mk.mymoko.callBackCpJianjie = function(picsJson, errMsg){
		$.mk.upload.showUploadErrMsg(errMsg);	//错误信息	
		var _picsJson = eval("(" + picsJson + ")");
		if (!_picsJson || _picsJson.count <= 0)
			return;
	    var src = new Array();
	    for (var i = 0; i < _picsJson.pic.length; i++)
	        src[i] = _picsJson.pic[i].picName;
	    var $param = $.param({'p[0].uploadType' : "post_item",'p[0].src' : src,'p[0].uploadServer' : $("#uploadServerName").val()}, true);
		$.ajax({
			type : "POST",
			url : "/uploadPre|postItem_prepare.action",
			data : $param,
			dataType : "json",
			success : function(response) {
				if (response.code != "1") {
					alert("图片上传出错!");
					return;
				}
				$.mk.upload.loadPicItem(response);
			}
		});
	}

	//flash上传回调 公司联络图片上传
	$.mk.mymoko.callBackCpLianluo = function(picsJson, errMsg){
		$.mk.mymoko.callBackCpJianjie(picsJson, errMsg);
	}

	//flash上传回调 公司招聘图片上传
	$.mk.mymoko.callBackCpZhaopin = function(picsJson, errMsg){
		$.mk.mymoko.callBackCpJianjie(picsJson, errMsg);
	}
	
	//显示用户背景上传图片
	$.mk.mymoko.showUserBackground = function(picsJson){
		//根据图片信息准备数据
		var uploadServerName = $("#uploadServerName").val();
		var webServerName = $("#webServerName").val();
		var data= $.param({'p[0].uploadType': "background_pic",'p[0].src':picsJson.pic[0].picName,'p[0].uploadServer':uploadServerName}, true);
		var yuantu = picsJson.pic[0].picName;
		$.ajax( {
			type : "post",
			url : "/uploadPre|background_prepare.action",
			data : data,
			dataType : "json",
			success : function(data) {
				//准备数据成功后，显示背景
				_showBackground(data,webServerName,yuantu);
			}
		});
	}
	
	/**
	 * ajax请求远程裁剪图片
	 * @param {} picPreUrl 请求路径
	 * @param {} ajaxParam	请求参数 json格式
	 * @param {} uploadType 上传类型
	 */
	$.mk.mymoko.pre_logo_ajax = function(ajaxParam, zoompic){
		$.ajax({
			url:"/uploadPre|userLogoPre.action",
			type:"post",
			data:ajaxParam,
			dataType:"json",
			success:function(response){
				if($("#zoompicstr").size()>0)
					$("#zoompicstr").hide();   //隐藏“预览中...”
				if(response.code != "1"){
					alert("预览头像图片出错！");
					return ;
				}
				var imgWebServer = $("#webServerName").val();
				$("#"+zoompic).attr("src", imgWebServer+response.visitPath);
			}
		});
	}
	
	//显示用户头像上传图片
	$.mk.mymoko.showUserLogo = function(picsJson){
		var picName = picsJson.pic[0].picName;
		var picUrl = picsJson.pic[0].visitPath;
		$("#picName").val(picName);
		$.mk.crop.loadUploadPic(picUrl,140,130,80,169);
	}
	
	/**
	 * 保存头像图片
	 * @param {} picDivID 滤镜外层Div  Id
	 * @param {} uploadTypeID 上传类型Id
	 * @param {} picNameID 图片Id
	 */
	$.mk.mymoko.save_pic = function(picDivID,uploadType, picNameID){
		var bimg = $(picDivID).find(".boximg")[0];
		var picName = $("#" + picNameID).val();
		if(!bimg || picName == ""){
			alert("请上传图片");
			return;
		}
		if(uploadType == null || uploadType == ""){
			alert("操作错误");
			return;
		}
		var picInfo = [];
	    var info = bimg.info();
	    for(var i in info)
	    	picInfo.push(info[i]);
		_save_userLogo(picInfo, picName);		//保存用户头像
	}
	//用户头像保存
	var _save_userLogo = function(picInfo, picName){
		var logoCallBack = function(response){
			if(response == "dataErr")
				alert("修改头像出错！");
			else{
				$("#idPicture").attr("src", response);
				$("#imgUserLogo").attr("src",response);
				if($("#uploadLogoDiv").size() > 0)
					$("#uploadLogoDiv").remove();
			}
			$.mk.upload.cancelUpload("ajax_upload_dialog_parent");	
		}
		var url = "/uploadFigurePhoto|cropAndSave.action";
		_saveImage(picInfo, url, logoCallBack, picName);
	},
	//弹出层上传图片保存
	_saveImage = function(picInfo, saveUrl, callBackFun, picName) {
		var times = picInfo[0];
		var x1 = parseInt(picInfo[1]);
		var y1 = parseInt(picInfo[2]);
		var x2 = parseInt(picInfo[3]);
		var y2 = parseInt(picInfo[4]);
		$.ajax({
			url:saveUrl,
			type:"post",
			data:{"p[0].src":picName,"p[0].uploadServer":$("#uploadServerName").val(),"p[0].x1":x1,"p[0].y1":y1,"p[0].x2":x2,"p[0].y2":y2,"p[0].times":times},
			cache:false,
			success :callBackFun
		});
	},
	//显示背景
	_showBackground = function(data,webServerName,yuantu){
		if(data.code=="1"){
			$("#p0_uploadServer").after('<input type="hidden" name="p[0].src" value="'+data.dest+'" />');
			var thumb=webServerName + data.thumb;
			var picUrl = webServerName + data.dest;
			$("#imgBackgroundPic").attr("src",thumb);
			$("#backgroundImgUrl").val(picUrl);
			$("#src").val(yuantu);
			var image = new Image();
			$(image).one("load",function(){
				$.setBackStyle();
			})
			image.src = thumb;
		}else
			alert("背景图片裁剪出错！");
		$.mk.upload.cancelUpload();	
	},	
	//加载 mip图片
	_loadMipPicItem = function(picsJson){
		var pName = "'picUp'";
		$("#fileList").trigger("clean");
		var picsNum = picsJson.pic.length;
		total += picsNum;
		var picNames = new Array();
		for(i = 0;i < picsNum; i++)
			picNames.push(picsJson.pic[i].picName);
		var param = {"p[0].uploadServer":$("#uploadServerName").val(),"p[0].src":picNames};
		param = $.param(param,true);
		$.ajax({
			url:"/uploadPre|userMipPre.action",
			type:"post",
			data:param,
			dataType:"json",
			success:function(response){
				if(response.code != "1"){
					alert("MIP图片加载出错！");
					return ;
				}
				var img = "";
				var picName = "";
				var imgWebService = $("#webServerName").val();
				for(i=0;i<picsNum;i++){
					num++;
					photoNum++;
					var li = document.createElement("div");
					li.id="photo_" + num;
					li.className = "picBox c";
					img = imgWebService + response.pic[i].visitPath;
					picName = response.pic[i].picName;
					li.innerHTML='<div class="r"><p class="f12 lesserColor c"><a class="mainWhite r" href="javascript:void(0)" onclick="jQuery1.delMipPic(' + num +');return false;">删除图片</a>图片描述：</p>'
								+'<textarea name="picContents" class="borderOn" id="\showlong'+li.id+'\" cols="67" rows="5"  name="imgDes" ></textarea>'
								+'<p class="f12 lesserColor c"><span class="mainColor" id="\showlong'+li.id+'o\">300</span></p></div>'
								+'<div class="simple"><img class="borderOn" align="absmiddle" src="'+img+'" /></div>'
								+'<input type="hidden" name="p[0].src" value="' + picName + '">';	
					document.getElementById('photo').appendChild(li);
					jQuery1("#showlong"+li.id).characterLimit2({maxlength:300,numTarget:'#showlong'+li.id+'o'});
				}	
				if(parseInt(photoNum)+parseInt(document.getElementById('photoVerifyCount').value)>9)
					$("#uploadPic").hide();
			}
		});
	},	
	//认证图片上传后显示
	_showUserApplyData = function(picsJson,id){
		var indexStart = $("#"+id+"Div").attr("index");
		var imgWebServerName = $("#webServerName").val();
		var type = id == "userCard" ? 0 : 1;
		var index = 0;
		for (var i = 0; i < picsJson.pic.length; i++){
			index = parseInt(indexStart) + parseInt(i);
			$("<div id='"+id+"_" + index +"' class='reg-thumb'><img src='"+imgWebServerName + picsJson.pic[i].visitPath +"'/>" +
				"<input type='hidden' name='p[" + type + "].src' value='" + picsJson.pic[i].picName + "'/>" +
				"<input type='button' class='btn' value='删  除' onclick='jQuery1.mk.mymoko.removeUserApplyPic(\""+id+"_"+index+"\");'/></div>").appendTo($("#"+id+"Div"));
		}
		$("#"+id+"Div").attr("index",index + 1);
	};
})(jQuery1);
jQuery1(function() {
	// 短信 搜索
	jQuery1('#messagefindfriendname').pinyinSearch({
		clickCallback : function(id, name, wkey) {
			jQuery1.mk.mymoko.seeMessageBox(id, 1);
		}
	}).autoText();
});