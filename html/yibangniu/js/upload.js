var uploadData={};//上传成功后的数据 
/**
 * 上传相关js
 */
(function ($){
	
	if(typeof $.mk == "undefined"){
		$.mk = {};
	}
	
	if(typeof $.mk.upload == "undefined"){
		$.mk.upload = {};
	}

/**********************************************flex上传*******************************************************/

	//多文件上传删除
	$.mk.upload.delFile = function(obj,fileSize){
		var id = obj.id.split("_")[1];
		$("#tr_" + id).remove();
		$("#fileCount").text(parseInt($("#fileCount").text())-1);
		$("#sizeCount").text(parseInt($("#sizeCount").text())-fileSize);
		$("tr[name='picTr']").each(function(i){
			this.id = "tr_" + i;
			$(this).find("div[name='progressDiv']").attr("id","progress_" + i);
			$(this).find("span[name='progress_span']").attr("id","span_pro_" + i);
			$(this).find("img").attr("id","a_" + i);
		});
		$("#FileUpload").get(0).delFile(id);
	}
	
	//上传文件
	$.mk.upload.uploadFile = function(){
		if($("tr[name='picTr']").size()==0){
			alert("请选择图片!");
			return;
		}
		$("#loadImgBtn").attr("disabled",true);
		$("#FileUpload").get(0).flexUploadFile();
	}
	
	//Flex回调更新当前文件的上传进度
	$.mk.upload.uploadProgress = function(index,progressSize){
		$("#curFileCount").html(parseInt(index) + 1);
		if(progressSize!="已完成")
			$("#progress_" + index).css("width",progressSize);
		$("#span_pro_" + index).html(progressSize);
	}
	
	$.mk.upload.swfLoadSuccess = function(){
		$("#swfLoading").hide();
	}
	
	//切换到批量多文件上传
	$.mk.upload.batchUpload = function(){
		var uploadUrl = "";
		var upKey = "";
		$.ajax({
			url:"/commonAction|getUploadUrl.action",
			type:"get",
			dataType:"jsonp",
			async:false,
			success:function(response){
				if(response == "dataErr" || response == ""){
					alert("数据错误,请刷新页面重新操作！");
					_setUploadButton(false);	
					return;
				}else{
					$("#webServerName").val(response.webserver);
					$("#uploadServerName").val(response.uploadserver);
					$("#uploadToken").val(response.upKey);
					uploadUrl = response.uploadserver + "/flexUploadServlet";
					upKey = response.upKey;
				}
			}
		});
		
		var objId = $("#curImgId").val();
		var uploadDomain = $("#uploadDomain").val();
		var imgDomain = $("#imgDomain").val();
		var maxFileSize = $("#fileSize").val();
		var maxFileCount = $("#flexFileCount").val();
		var imageType = $("#imgType").val();
		$("tr[name='picTr']").remove();
		$("#fileCount").text("0");
		$("#sizeCount").text("0");
		$("#commonDiv").hide();
		$("#batchDiv").show();
		$("#swfLoading").show();
		var so = new SWFObject(imgDomain + "/flash/FileUpload.swf?id=10", "FileUpload", "60", "28", "9", "#FFFFFF");
		so.addParam("allowScriptAccess","always");
		so.addParam("wmode","transparent");
		so.addVariable("uploadUrl", uploadUrl);
	 	so.addVariable("maxFileSize", maxFileSize);
		so.addVariable("maxFileCount", maxFileCount);
		so.addVariable("imageType", imageType);
		so.addVariable("delFile_jsFunction", "delFile");
		so.addVariable("uploadFile_jsFunction", "flexUploadFile");
		so.addVariable("addFile_jsFunction","addFileToItem");
		so.addVariable("browseFile_cbFunction", "jQuery1.mk.module.loadFiles");
		so.addVariable("progressBar_cbFunction", "jQuery1.mk.upload.uploadProgress");
		so.addVariable("uploadSuccess_cbFunction",flexUploadCallBack);
		so.addVariable("swfLoadedCom_cbFunction","jQuery1.mk.upload.swfLoadSuccess");
		so.addVariable("browerImgUrl",imgDomain + "/images/flexBrower.jpg");
		so.addVariable("upKey", upKey);
		so.write("swfDiv");
	}
	
	//切换到普通上传
	$.mk.upload.commonUpload = function(){
		$("#batchDiv").hide();
		$("#commonDiv").show();
	}
	
	/**********************************************上传进度*******************************************************/
	var timeUpload = null;
	var requestCountTag = 0;
	//上传进度条入口
	/**
	 * divId: 进度条div ID    type：上传类型	fileListId：file元素ID	formid：FORMID	cancelid：取消上传类型  
	 */
	$.mk.upload.getUploadStatus = function(divId,type,fileListId,formid){
		var picCount = 0;
		var picIsEmpty = false;
		$("#" + fileListId).find('input[type="file"]').each(function(){
			if($(this).val()!="")
				picCount ++;
			else
				picIsEmpty = true;
		});
		if(picIsEmpty || picCount == 0){
			alert("请上传图片!!!");
			return false;
		};
		
		//上传、保存按钮不可用		
		_setUploadButton(true);	
		if($("#divSubmitCardInfo").size()!=0)
			$("#divSubmitCardInfo").show();		
		requestCountTag = 0;
		
			//获取上传服务信息
		var url = "/commonAction|getUploadUrl.action";
		if($("#hid_mokoadmin_domain").size() > 0)
			url = $("#hid_mokoadmin_domain").val() + url;
		
		var uploadUrlMsg = "";
		$.ajax({
			url:url,
			type:"get",
			dataType:"jsonp",
			async:false,
			success:function(response){
				if(response == "dataErr" || response == ""){
					alert("数据错误,请刷新页面重新操作！");
					_setUploadButton(false);	
					return;
				}else{
					var webserver = response.webserver;
					var uploadserver = response.uploadserver;
					var upKey = response.upKey;
					var uploadurl = response.uploadurl;
					//此get请求作用：与上传服务建立握手
					$.ajax({
						url:uploadurl,
						type:"get",
						dataType:"jsonp",
						async:false,
						success:function(response){
							$("#webServerName").val(webserver);
							$("#uploadServerName").val(uploadserver);
							$("#uploadToken").val(upKey);
							$("#" + formid).attr("action", uploadurl);
							$("#" + formid).submit();
							
							//打开进度条层
							$("#"+divId).show();
							$("#"+divId).html("");	
							setTimeout(function(){_showUploadStatus(uploadurl, divId, type);}, 2000);
						}
					});
				}
			}
		});
		return true;
	}

	//取消上传、完成上传 清除上传服务器中的session
	$.mk.upload.cancelUpload = function(dialogId){
		if(timeUpload != null)
			clearTimeout(timeUpload);
		if($("input[name='uploadFileSubBtn']").size() != 0)
			$("input[name='uploadFileSubBtn']").attr("disabled", false);
		//删除上传进度
		var url = "/commonAction|cancelUpload.action?upkey=" + $("#uploadToken").val();
		if($("#hid_mokoadmin_domain").size() > 0)
			url = $("#hid_mokoadmin_domain").val() + url;
		$.ajax({
			url:url,
			type:"post",
			async:false,
			success:function(response){}
		});
		$.mokoDialog.close(dialogId);
	}
	
	//flash上传错误信息
	$.mk.upload.showUploadErrMsg = function(errMsg){
		if(errMsg != null && errMsg.length > 0)		
			alert(errMsg);
	}
	
	//显示图片模块
	$.mk.upload.loadPicItem = function(picsJson, option){
		var picsNum = picsJson.pic.length;
		if(picsNum < 1){
			$("#status").hide();
			$.mokoDialog.close();
			return;
		}
		//加载单个图片，加载完后继续回调加载下一个
		var picIndex = picsNum;
		$.mk.upload.loadNextPic = function () {
			if(--picIndex < 0)
				return;
			var param = {
				yuantu : picsJson.pic[picIndex].yuantu,
				visitPath : picsJson.pic[picIndex].visitPath
			}
			jQuery1.mk.module.loadImage(param,option);
		}
		$.mk.upload.loadNextPic();
		$.mokoDialog.close();
	}
	
	//处理上传图片数据
	_showUploadPicData = function(response,type){
		try{
			//显示上传图片
			if(response.code == "1" && response.pic.length > 0)
				_showPicByType(response,type);
			else if(response.code == "102")
				alert("上传图片超过5M限制！");
			else if(response.code == "103")
				alert("上传总大小超过限制！");
			else //上传错误信息
				alert("上传出错！");
		}catch(e){
			alert("上传出错！");
		}
		finally{
			//上传、保存按钮可用	
			_setUploadButton(false);
		}
	}
	
	//根据上传类型显示上传图片
	_showPicByType = function(response,type){
		if(type == "post_cover")		//展示封面
			$.mk.post.showPostCoverPic(response);	
		else if(type == "post_item")    //展示明细
			$.mk.post.showPostItemPic(response);
		else if(type == "project_cover")//项目封面
			$.mk.project.showProjectMokoShowPic(response);
		else if(type == "user_card")		//身份证上传
			$.mk.mymoko.showUserCardPic(response);
		else if(type == "user_apply")		//MP申请
			$.mk.mymoko.showUserApplyPic(response);
		else if(type == "user_header")	//用户头像
			$.mk.mymoko.showUserLogo(response);
		else if(type == "face_senior_dynamic")	//高级、动态封面
			$.mk.face.showFaceUploadPic(response);
		else if(type == "face_simple")	//简单封面
			$.mk.face.showFaceSimplePic(response);
		else if(type == "user_mip")		//MIP上传
			$.mk.mymoko.showUserMipPic(response);
		else if(type == "blog_pic")     //微博图片
			$.mk.blog.showBlogPic(response);
		else if(type == "background_pic") //用户背景图片上传
			$.mk.mymoko.showUserBackground(response);
		else if(type == "cpgroup")			//分组上传
			$.mk.company.showCpGroupPic(response);
		else if(type == "guanggaopic")		//广告上传
			$.mk.guanggao.showGuanggaoPic(response);
		else if(type == "mtg5_news")		//mtg5新闻图片上传
			$.mk.mtg5news.showMtg5newsPic(response);
		else if(type == "mspapply")	
			$.mk.msp.setPhoto(response);	//msp报名
		else if(type == "mtg_cover")
			$.mk.mtgmanage.showMtgCover(response);
		else if(type == "mtg_item")
			$.mk.mtgmanage.showMtgItem(response);
		else if(type == "mtg_shangpin")
			$.mk.mtgmanage.showMtgShangpin(response);
		else if(type == "mtg5_video_cover")
			$.mk.mtg5Video.showMtg5VideoCover(response);
		else if(type == "mtg_video_ad_left")
			$.mk.mtg5Video.showMtg5LeftAd(response);
		else if(type == "mtg_video_ad_right")
			$.mk.mtg5Video.showMtg5RightAd(response);
		else if(type == "mtg_video_pingwei")
			$.mk.mtg5Video.showMtg5Pingwei(response);
		else if(type == "mtg_video_shangpin")
			$.mk.mtg5Video.showMtg5Shangpin(response);
		else if(type=="mokoevent_yuantu")
			$.mk.mokoevent.showMokoEventCover(response);
		else if(type=="zm_yuantu")
			$.mk.zhaomu.showZMCover(response);
		else if(type == "ppsapply")	
			$.mk.pps.setPhoto(response);	//pps报名
	}
	
	//显示进度条
	_showUploadStatus = function(url,divId,type){
		$.ajax({
			url:url,
			type:"get",
			dataType:"jsonp",
			success:function(response){
				try{
					if(response != null && response != "" && response != "null"){
						var bytesRead = response.bytesRead;
						var totalSize = response.totalSize;
						var fileLength = response.fileLength;
						
						//进度条
						if(totalSize > 0 && bytesRead > 0){	
							var progressPercent = Math.ceil((bytesRead / totalSize) * 100);
							var msgHtml = "<div class=\"uping\"><div class=\"borderOn\"><div class=\"bg\" style=\"width:" + progressPercent + "%;\"></div></div><span class=\"font12\">总大小:" + fileLength + "(" + progressPercent + "%)</span></div>";
							if(type == "blog_pic" || type == "user_header" || type == "background_pic" || type == "mspapply")
								msgHtml = "<div class=\"uping\"><div class=\"bd\"><div class=\"bg mBC\" style=\"width:" + progressPercent + "%;\"></div></div><span class=\"f12\">总大小:" + fileLength + "(" + progressPercent + "%)</span></div>";
							else if(type == "cpgroup" || type == "guanggaopic")
								msgHtml = progressPercent + "%";
							$("#"+divId).html(msgHtml);
						}
						if (response.code == "2"){
							timeUpload = setTimeout(function(){
								_showUploadStatus(url, divId, type);
							}, 1000);
							return ;
						}else {//上传中
							clearTimeout(timeUpload);//上传后清理timeUpload
							uploadData.pic=response.pic; 							
							var msgHtml = "<div class=\"uping\"><span class=\"font12\">总大小:" + response.fileLength + "</span></div>";
							if(type == "blog_pic" || type == "user_header" || type == "background_pic")
								msgHtml = "<div class=\"uping\"><span class=\"f12\">总大小:" + response.fileLength + "</span></div>";
							else if(type == "cpgroup" || type == "guanggaopic")
								msgHtml = "总大小:" + response.fileLength;
							$("#"+divId).html(msgHtml);
							_showUploadPicData(response,type);//显示图片
						}
					}else{
						requestCountTag++;
						if(requestCountTag >= 15){
							clearTimeout(timeUpload);
							$("#"+divId).html("");	
							alert("上传出错！");
							_setUploadButton(false);	//设置上传按钮可用
						}
						timeUpload = setTimeout(function(){
								_showUploadStatus(url, divId, type);
							}, 1000);
					}
				}catch(e){
					clearTimeout(timeUpload);//上传后清理timeUpload
					alert("上传出错！");
				}
			},
			error : function(data) {
				alert("上传出错！");
			}
		});
	}
	
	//设置上传按钮 是否可用
	_setUploadButton = function(disabled){
		if($("input[name='uploadFileSubBtn']").size()!=0)
			$("input[name='uploadFileSubBtn']").attr("disabled", disabled);
		if($("#btnSave").size()!=0)
			$("#btnSave").attr("disabled",disabled);
	}
	//设置图片水印
	$.mk.upload.setWaterColor = function(waterRadio){
		$("#waterColor").val(waterRadio.value);
	}
})(jQuery1);