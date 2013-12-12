/**
 * 公共的业务js
 */
// 检测证件是否正确 全局变量 T表示通过，F表示未通过
var isCardTrue = "F";
/**mip 全局变量**/
var total = 0;
var photoNum = 0;
var imageId="";
var num = 0;

/**mip全局变量结束**/
(function($){
	// 邮箱激活成功提示
	$.addresults_=function(type){
		$.mokoDialog.close();
		if(type=="message")
			$.mokoDialog({url:"/jsps/markresult/MessageSuccessView.jsp",time:1});
		else
			$.mokoDialog({url:"/jsps/markresult/ResultSuccessView.jsp"});		// 邮箱激活成功 
	}
	
	
	
	$.addresult_=function(s){
		$.mokoDialog.close();
		var param = $.param({"o":s});
		$.mokoDialog({url:"/jsps/markresult/ResultErrorView.jsp?"+param,time:1});
	}
	
	//非机构用户提示
	$.showUserIsNotCpTips=function(){
		$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=4"});
	}
	
	$.faceGiveGift=function(url){
		$.location(url);
	}
	
	/** ***************************************一句话简介************************************************************ */
	// 弹出一句话简介层
	$.popYijuhua=function(objId){
		var param = $.param({contentId:objId,content:$("#"+objId).html()});
		$.mokoDialog({url:'/jsps/common/yijuhuapopedit.jsp?'+param,initFn:function(){
			$("#popContent").focus();
		}});
	}
	// 保存一句话简介
	$.updateYijuhua=function(popContentId,parentContentId){
		var content = $.trim($("#"+popContentId).val());
		$.ajax({
			url:"/mgrindex|updateYijuhuaAjax.action",
			type:"post",
			data:{yijuhua:content},
			success:function(response){
				$("#"+parentContentId).attr("title",content);
				$("#"+parentContentId).text(content);
				$.mokoDialog.close();
				$.ie6maxMinWH(parentContentId);
			}
		})
	}
	
	$.setNavSysetMenu = function(){
		$('#navmenu_syset').click(function(event){
			$('#navmenu_company,#navmenu_personal').removeClass('active');
			$(this).toggleClass('active');
			$('#msgMore').toggleClass('dn');
			event.stopPropagation();
		});
		$('body').click('nav_dropdownmenu_syset_click', function(){
			$('#navmenu_syset').removeClass('active');
			$('#msgMore').removeClass('dn'); 
		});
	}
	
	//导航菜单
	$.setNavDropdownMenu = function(){
		$('#navmenu_company,#navmenu_personal').click(function(event){
			$('#navmenu_company,#navmenu_personal,#navmenu_syset').removeClass('active');
			$('#msgMore').removeClass('dn'); 
			$(this).toggleClass('active');
			event.stopPropagation();
		});
		$('body').click('nav_dropdownmenu_click', function(){
			$('#navmenu_company,#navmenu_personal').removeClass('active');
		});
		$.setNavSysetMenu();
	}
	//设置登录用户头部信息
	$.setLogoutHeader=function(key, id, fsLevel){
		var loginkey = $.getCookie(key);
		if(loginkey == null || loginkey == "")
			return;
		$.ajax({
			url:"/mgrindex|findUserMsgAjax.action",
			type:"post",
			success:function(response){
				if(response == null || response == "")
					return;
				var userInfo = eval("(" + response + ")");
				var userInfo_nickname = userInfo.nickname;
				if(userInfo.nickname.length > 8)
					userInfo.nickname = userInfo.nickname.substring(0,8) + "...";
				var htmlStr = "<li><a id='headerNickName' href='/"+userInfo.webkey+"/index.html' class='active' hidefocus='true'>"+userInfo_nickname+"</a></li>\
								<li id='navmenu_syset' class='dropdown'>\
									<a href='javascript:void(0);' hidefocus='true' class='dropdown-toggle'>设置 <span class='fs10'>▼</span></a>\
									<ul class='dropdown-menu'>\
										<li><a href='/privacySetting.action?flag=1#baseset' hidefocus='true'>基本设置</a></li>";
						if(userInfo.level != fsLevel){
							htmlStr += "<li><a href='/privacySetting.action?flag=1#privacyset' hidefocus='true'>隐私设置</a></li>\
										<li><a href='/privacySetting.action?flag=1#background' hidefocus='true'>背景设置</a></li>";
						}
							htmlStr += "<li><a href='/privacySetting.action?flag=1#partnerbind' hidefocus='true'>账号关联</a></li>\
										<li><a href='/payManager|showYbPayIndexPage.action?toType=0' hidefocus='true'>充值</a></li>\
									</ul>\
								</li>\
							<li><a href='javascript:void(0);' onclick='jQuery1.mk.login.logout();return false;' hidefocus='true'>退出</a></li>";
				$('#'+id).html(htmlStr);
				$.setNavSysetMenu();
				
				$("#searchButtonNav").removeAttr('onclick');
				if(userInfo.level == fsLevel){
					$("#searchButtonNav").bind('click', function(event){
						$.showFsAlertSuccess();
						return false;
					});
				}else{
					$("#searchButtonNav").bind('click', function(event){
						$.searchContent('findNameNav', 'findFormNav');
						return false;
					});
				}
				
				setTimeout(function(){
					$.mk.msg.headerNewMessage("sendMessageTime", "musicDomain", userInfo.webkey);
				},500);
			}
		});	
	}
	
	//截取图片前面的域名
	$.subPicName=function(picSrc){
		var picPath = picSrc.replace("http://", "");
		picPath = picPath.substring(picPath.indexOf("/"));
		return picPath;
	}
	
	/*------------拉黑-------------------*/
	$.black=function(blackuserid){
		if(!confirm('真的要把这个用户拉入黑名单吗?')){
			return false;
		}
		$.ajax({
			url:"/subscribeUpdate|addBlackMessageAjax.action",
			type:"post",
			data:"subscribeId="+blackuserid,
			success:function(response){
				var str = "count.black";
				if(response.indexOf(str)!=-1){
					alert("该用户已经在你黑名单!");
				}else{
					alert("操作成功!");
				}
			}
		});
	}
	
	$.checkTextNum=function(){
		var content = $("#userContent").val();
		if(content.length>100){
			$.mokoDialog({id:"checkTextNumPop",url:"/jsps/common/alertPop.jsp?tip=34"});
			$("#userContent").val(content.substring(0,100));
			return;
		}
	}
	
	/*---------------美空身份照MIP----------------*/
	/** ****************************************MIP身份照显示************************************************* */
	// 管理身份照
	$.toManagerPhoto=function(){
		$.location("/photoverifyupdate|managerPhotoList.action");
	}
	// 美空身份照上传页面
	$.photoVerify=function(){
		$.location("/photoverifyupdate|photoVerifys.action");
	}
	// 美空身份照显示页面
	$.photoList=function(url){	
		$.location(url); 
	}
	
	/** ****************************************上传MIP身份照************************************************* */

	// 删除图片（假删除，只是隐藏了图片层当点击保存时候物理删除）
	$.delMipPic=function(id){
		// id：图片Id
		if(!confirm('确定要删除吗？')){
			return false;
		}
		photoNum--;
		imageId += id+",";
		$("#photo_"+id).empty();
		document.getElementById('photo').removeChild(document.getElementById("photo_"+id));
	}

	// 保存操作时候调用后台Action对操作进行保存
	$.photoSubmit=function(){
		if($("input[name='p[0].src']").length == 0){
			alert("请上传图片~");
			return;
		}
		$("#p0_uploadServer").val($("#uploadServerName").val());
		$.mk.upload.cancelUpload();
		document.getElementById("btnSave").disabled=true;
		document.getElementById('addPost').submit(); 
	}
	
	/** ****************************************管理MIP身份照************************************************* */
	var imgIdList="";
	var imagesStr="";
	// 选中管理标签
	$.addTag=function(){
		$("#updateMip").show();
		$("#orderMip").hide();
	}
	// 选中排序标签
	$.orderTag=function(){
		$("#orderMip").show();
		$("#updateMip").hide();
	}
	// 删除图片
	$.delPicEdit=function(id){
		if(!confirm('确定要删除吗？')){
			return false;
		}
		$("#photo_"+id).remove();
		$("#order_"+id).remove();
	}
	// 点击保存时调用后台Action，对操作进行更改
	$.updatePhoto=function(fmName){
		document.getElementById(fmName).submit();
	}
	
	// 保存简介
	$.updateJianJieData=function(){
		if($.mk.common.setValueBeforeSubmit("jianjie")){
			$("#p0_uploadServer").val($("#uploadServerName").val());
			$("#saveJianjie").submit();
			$("#btnJianjie").attr("disabled", true);
		}
	}
	// 保存联络
	$.updateLianLuoData=function(){
		if($.mk.common.setValueBeforeSubmit("lianluo")){
			$("#p0_uploadServer").val($("#uploadServerName").val());
			$("#saveLianluo").submit();
			$("#btnLianLuo").attr("disabled", true);
		}
	}
	// 保存招聘
	$.updateZhaoPinData=function(){
		if($.mk.common.setValueBeforeSubmit("zhaopin")){
			$("#p0_uploadServer").val($("#uploadServerName").val());
			$("#saveZhaopin").submit();
			$("#btnZhaoPin").attr("disabled", true);
		}
	}
	// 换一组行业明星(行业频道页面)
	$.nextHangYeStarByPinDao=function(vocationId,description){
		$.ajax({
			url:"/postChannel|showHangYeStarAjax.action",
			type:"get",
			data:{"vocationId":vocationId,"description":description,"random":Math.random()},
			success:function(response){
				$("#hangyeStarDiv").html(response);
			}
		});
	}
	
	/**------------------------------微薄相关---------------------------------------------*/
	// 检验是否转发微博
	$.checkBlogZhuanFa=function(obj){
		if(obj.checked)
			obj.value = "T";
		else
			obj.value = "F";
	}

	// 检验是否转发微博（点击span的事件）
	$.checkSpanBlogZhuanFa=function(objId){
		if($("#"+objId).attr("checked")){
			$("#"+objId).attr("checked",false)
			$("#"+objId).val("F");
		}else{
			$("#"+objId).attr("checked",true)
			$("#"+objId).val("T");
		}
	}
	
	// 检验是否给原文作者评论
	$.checkBlogComment=function(obj){
		if(obj.checked)
			obj.value = "T";
		else
			obj.value = "F";
	}
	

	// 微博添加评论
	$.addComment=function(blogID){
		if($("#user_level").val()==5){// 5=fs级别
			$.mk.blog.applyMPView(2);
			return;
		}
		var content = $.trim($("#blogCommentContent").val());
		if(content==""){
			alert("怎么也要写些东西哟~");
			return false;
		}
		if($.stringUtil.getContentLength(content)>140){
			alert("内容应限制在140个字节内！");
			return false;
		}
		$("#blogCommentContent").val(content);
		$("#SendStr").hide();
		$("#replySending").show();
		$.ajax({
			url:"/blogUpdate|addBlogCommentAjax.action",
			type:"post",
			data:$("#SendComment").serialize(),
			success:function(response){
				if(response == "dataErr"){
					alert("数据错误,请刷新页面重新操作！");
					return;
				}
				$("#com_ment").after(response);
				$("#commentCount_"+blogID).text(parseInt($("#commentCount_"+blogID).text())+1);
				$("input[name='chkAddType']").attr("checked",false);
				$("input[name='chkAddType']").val("F");
				if($("input[name='chkYcAddType']").size() != 0){
					$("input[name='chkYcAddType']").attr("checked",false);
					$("input[name='chkYcAddType']").val("F");
				}
				$("#replySending").hide();
				$("#SendStr").show();
				$("#blogCommentContent").val("");
				$("#textlefts").html(140);
				//用户资料浮动层
				$(".userFloatLayer").aero();
			}
		});
	}
	
	// 检测评论回复的内容是否为空，或者超过最多字数限制，参数为回复文本域的ID,参数sending为“发送中”字样ID
	$.checkCommentReplyValue=function(comentId,nickName) {
		var txtContent = $.trim($("#"+comentId+"replyComments").val());
		if(txtContent=="" || txtContent==("回复"+nickName+":")){
			alert("怎么也要写些东西哟~");
			return false;
		}
		if($.stringUtil.getContentLength(txtContent)>140){
			alert("回复的内容的字数不能超过140个！");
			return false;
		}
		$("#"+comentId+"replyComments").val(txtContent);
		$("#addComment"+comentId).show();
		$("#"+comentId+"replyComments1").attr("disabled",true);
		$.ajax({
			url:"/blogUpdate|addBlogReCommentAjax.action",
			type:"post",
			data:$("#recommentForm"+comentId).serialize(),
			success:function(response){
				if(response == "dataErr"){
					alert("数据错误,请刷新页面重新操作！");
					return;
				}
				$("#com_ment").after(response);
				$("input[name='chkAddType']").attr("checked",false);
				$("input[name='chkAddType']").val("F");
				$("#addComment"+comentId).hide();
				$("#divReComment_"+comentId).hide();
				$("#"+comentId+"replyComments1").removeAttr("disabled");
				$("#"+comentId+"replyComments").css({'height':'20px'});
				$("#textleft_"+comentId).html(140);
				//用户资料浮动层
				$(".userFloatLayer").aero();
			}
		});
	}
	
	// 删除微博评论
	$.delBlogComment=function(blogID, commentID, divID){
		if(!confirm('您确认删除记录吗？'))
			return false;
		$.ajax({
			url:"/blogUpdate|delBlogCommentAjax.action",
			type:"post",
			data:{"blogID":blogID,"commentID":commentID},
			success:function(response){
				if(response == "dataErr")
					alert("数据错误,请刷新页面重新操作！");
				else{
					$("#commentCount_"+blogID).text(parseInt($("#commentCount_"+blogID).text())-1);
					$("#" + divID).remove();
				}
			}
		});
	}
	
	// 给@用户名加链接
	$.addAtLink2Name=function(elementId,mokocc) {
		var $objContainers = $("[id^=\""+elementId+"\"]");
		if($objContainers.size() == 0)
			return;
		$objContainers.each(function(i, element){
			element = $(element);
			var context = element.html();
			var atList = $.getATList(context);			//获取需要替换AT 链接的内容集合
			var stUrlList = $.getShortURLList(context);	//获取需要替换short url 链接的内容集合
			if((atList == null || atList.length <= 0) && (stUrlList == null || stUrlList.length <= 0))
				return;
			if(stUrlList != null && stUrlList.length > 0){	//替换 short url
				stUrlList = $.distinctEl(stUrlList);
				$.each(stUrlList, function(i, url){
					context = $.replaceAll(context, url, $.getShortUrl(url));
				});
			}
			
			if(atList != null && atList.length > 0){	//替换 AT 链接
				$.each(atList, function(i, atText){
					context = $.replaceAll(context, atText, $.addLink(atText.replace("@", ""),mokocc));
				});
			}
			element.html(context);
		});
	}
	
	// 显示层
	$.showReComment=function(commentId,nickName){
		$("div[name='divRecomment']").hide();
		$("#divReComment_"+commentId).show();
		var $textarea = $("#"+commentId+"replyComments");
		$textarea.focus().val("回复@"+nickName+":");
		$("input[name='chkAddType']").attr("checked",false).val("F");
		var $chkYcAddType = $("input[name='chkYcAddType']");
		if($chkYcAddType.size() != 0){
			$chkYcAddType.attr("checked",false).val("F");
		}
		$textarea.autoResize();
	}
	
	
	/**
	 * 显示事件MSP
	 */
	$.showEventIndexMspPost=function(){
		$.ajax({
			url:"/eventShow|showEventIndexPostAjax.action",
			type:"get",
			data:"",
			success:function(response){
				if(response!="dataErr"){
					$("#eventMsp").html(response);
				}
			}
		});
	}
	/**
	 * 在明星计划页里添加msp展示
	 */
	$.showMspPost=function(num){
		$.ajax({
			url:"/mspTopic|showNewMspPostAjax.action?curPage="+num,
			type:"get",
			data:"",
			success:function(response){
				if(response!="dataErr"){
					$("#eventMsp").html(response);
				}
			}
		});
	}
	$.popApply = function(){
		$.mokoDialog({url:"/jsphtml/msp/MspPopApply.jsp"});
	}
	$.popCApply = function(){
		$.mokoDialog({url:"/jsphtml/msp/MspPopCApply.jsp"});
	}
	$.popUApply = function(){
		$.mokoDialog({url:"/jsphtml/msp/MspPopUApply.jsp"});
	}
	// 用户名加链接
	$.addLink=function(tname,mokocc) {
	    return "<a class='mC hU userFloatLayer' nickname='"+tname+"' title='"+tname+"' alt='"+tname+"' hidefocus='true' href='" + mokocc +"/n/" + tname + "' target='_blank'>@" + tname + "</a>";
	}
	
	//short url
	$.getShortURLList=function(context){
		return context.match(/(http|https):\/\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+([-A-Z0-9a-z\$\.\+\!\_\*\(\)\/\,\:;@&=\?~#%]*)*/gi);
	}
	//short url 链接
	$.getShortUrl=function(url) {
		return '<a class="mC hU" hidefocus="true" target="_blank" href="' + url + '">' + url + '</a>';
	}
	
	$.getATList=function(context){
		return context.match(/@[-_a-zA-Z0-9\u4e00-\u9fa5]+/gi);
	}
	
	/*--------------分类目录----------------------*/
	// 分类目录js
	// 设置选择用户类型列表
	$.setUserType=function(objetId,type) {
		var	types = ["全部会员","MVP", "VIP", "MP", "FS"];
		var	values = ["0", "3", "2", "1", "5"];
		var options = "";
		for(var i=0; i < types.length; i++) {
			options += "<option value=" + values[i];
			if(values[i] == type){ 
				options += " selected";
			}
			options += " >" + types[i] + "</option>";
	    }
	    $("#"+objetId).html(options);
	}
	// 设置选择用户性别
	$.setUserSex=function(selectId,sex){
		var sexValue = ["性别","男","女"];
		var sexType = ["2","1","0"]
		var option = "";
		for(var i=0;i<sexType.length;i++){
			if((i==0&&sex=="")||sex==sexType[i])
				option += "<option selected value='"+sexType[i]+"'>"+sexValue[i]+"</option>";
			else
				option += "<option value='"+sexType[i]+"'>"+sexValue[i]+"</option>";
		}
		$("#"+selectId).html(option);
	}
	/*--------------分类目录 ----------------------*/
	// 选择关注用户
	$.guanzhu=function(){
		$("div.box").click(function () {
			$(this).toggleClass("active");
	    });
	}
	// 选择分类下的所有用户
	$.guanzhuall=function(chkObj, eId){
		if(chkObj.checked)
			$("#" + eId + " > div.box").addClass("active");
		else
			$("#" + eId + " > div.box").removeClass("active");
	}
	// 添加关注数据
	$.addGuanZhuData=function(btnObj, divID){
		var imgs = $("#" + divID + " > div.box.active > img");
		if(imgs.size() == 0){
	    	$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=1"});
			return;
		}
		var userIDs = "";
		imgs.each(function(){
			userIDs += $(this).attr("uid-value") + ",";
		});
		$(btnObj).prop("disabled", true);
		$.ajax({
				url:"/catalog|addGuanZhuDataAjax.action",
				type:"post",
				data:{"guanZhuUserIDs":userIDs},
				success:function(response){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=2"});
	    			$(btnObj).prop("disabled", false);
				}
			});
	}
	// 设置选择用户等级列表
	$.setChooseUserLevel=function(objId,type){
		var types = ["全部会员","MVP","VIP","MP"];
		var values = ["0","3", "2", "1"];
		var options = "";
		for(var i=0; i < types.length; i++) {
			options += "<option value=" + values[i];
			if(values[i] == type) 
				options += " selected";
			options += " >" + types[i] + "</option>";
	    }
	    $("#"+objId).html(options);
	}
	// 点击筛选checkbox 筛选用户
	$.chooseStatus=function(chxObj, elID){
		if(chxObj.checked)
			$("#" + elID).val(chxObj.value);
		else	
			$("#" + elID).val("F");
		$.submitVocationForm();	
	}
	// 根据用户等级、性别下拉框 筛选用户
	$.chooseSelect=function(selectObj, elID){
		$("#" + elID).val(selectObj.value);
		$.submitVocationForm();	
	}
	// 职业大类选择
	$.chooseRootSelect=function(selectObj, catalogID, vocationID){
		$("#" + catalogID).val(selectObj.value);
		$("#" + vocationID).val("0");
		$.submitVocationForm();	
	}
	// 提交筛选条件
	$.submitVocationForm=function(){
		document.getElementById("vocationForm").submit(); 
	}
	// 设置选择查询
	$.checkRadio=function(formID, urlID){
		var url = $("#" + urlID).val();
		$("#" + formID).attr("action", url);	
	}
	// 查询展示
	$.searchContent=function(content, formID){
		var value = $("#" + content).val();
		if(value.trim() == ""){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=3"});
			return false;
		}
		$searchForm = $("#" + formID);
		$searchForm[0].submit();
	}

	
	/*------------上传头像-------------------*/
	// 点击上传头像调用弹出层
	$.logoDialog=function(){
		$.mk.crop.ajax_pop_photo("/jsps/profile/ProfileFigureEdit.jsp","",140,130,80,169);
	};

	// 复选框全选
	$.checkAllCheckBox=function(itemCheckBoxName,allCheckBoxId){
		$("input[name='" + itemCheckBoxName + "']:checkbox").attr("checked",$("#" + allCheckBoxId).prop("checked"));
	}

	/** ****************************************上传及保存身份证照片***************************************** */
	$.openAddCardPhoto=function(){
		$.location("/card|showAddCard.action?&random=" + Math.random());
	}

	// 未登录情况下点击发送短信，加好友，关注TA按钮时弹出该层
	$.popNotLogin=function(){
		$.mk.login.popNotLogin("/jsps/common/loginPop.jsp");
	}

	// 切换显示YOUKU上传视频
	$.showYukouDiv=function(){
		$.ajax({
			url:"/video|youkuVideoLogin.action",
			type:"get",
			success:function(response){
				$.getScript(response,
					function(){
						$("#citeHref").attr("class", "gC b");
						$("#uploadHref_tudou").attr("class", "gC b");
						$("#uploadHref").attr("class", "gC mBd");
						$("#citeVideo").hide();
						$("#UploadVideo_tudou").hide();
						$("#uploadVideo").show();
					}
				);
			}
		});
	}

	// 切换显示MOKO引用视频
	$.showMokoDiv=function(){
		$("#uploadHref").attr("class", "gC b");
		$("#uploadHref_tudou").attr("class", "gC b");
		$("#citeHref").attr("class", "gC mBd");
		$("#uploadVideo").hide();
		$("#UploadVideo_tudou").hide();
		$("#citeVideo").show();
	}

	// youku视频成功后回调返回视频信息
	$.completeVideoUpload=function(response){
		var json = eval("(" + response + ")");
		$("#videoURL").val("http://player.youku.com/player.php/sid/"+json.videoid+"/v.swf");
		$("#confirmCiteVideo2").removeAttr("disabled");
	}

	// 招募 开始
	$.openZMPage=function(el){
		var $zmId = $("#" + el);
		if($zmId.size() == 0){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=10"});
			return;
		}
		var zmID = $zmId.val();
		$.ajax({
			url:"/zmAction|getUserMsg.action",
			type:"post",
			data:$.param({"zmID" : zmID}),
			success:function(response){
				if(response == "noLogin")
					$.popNotLogin();
				else if(response == "error")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=10"});
				else if(response=="end")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=11"});
				else if(response == "false")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=7"});
				else if(response == "fs")
					$.showFsAlertSuccess();
				else
					$.openZMPop(response, zmID)
			}
		}); 	    
	}
	// 打开投票小页面
	$.openZMPop=function(response, zmID){
		var json = eval("(" + response + ")")
		$.mokoDialog.close();
		var param = $.param({mobile1:json.mobile1,mobile2:json.mobile2,msnorqq:json.msnorqq,email:json.email,zmID:zmID});
		$.mokoDialog({url:"/jsps/backstage/BackstageMokoCallEdit.jsp?"+param,width:620});
	}
	
	//返回
	$.goBack=function(url){
		$.location(url);
	}
	
	//招募投票(支持一下)
	$.addZmVote = function(zmID, toUserID, type){
		var param = $.param({
			"zmID" : zmID,
			"toUserID" : toUserID
		});
		$.ajax({
			url:"/zmAction|addVote.action",
			type:"post",
			data:param,
			success:function(data){
				if(data == "noLogin")
					$.popNotLogin();
				else if(data == "dataErr")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=10"});
				else if(data=="end")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=12"});
				else if(data == "fs")
					$.showFsAlertSuccess();//提示只有FS以上用户才有此权限
				else{
					var $support_num;
					if(type == undefined)
						type = 0;
					if(type == 2)
						$support_num = $("#support-num-"+toUserID+"-"+type);
					else
						$support_num = $("#support-num-"+toUserID);
					var totalcount = $support_num.text();
					totalcount++;
					$support_num.text(totalcount);
					$.mokoDialog({url:"/jsps/zhaomu/ZmAddVoteSuccessView.jsp?type="+type,time:1});
				}
			}
		});
	}

	//招募报名用户列表ajax分页
	$.changeZmUserShowPage = function(zmID, sort, total, curPage, isInit){
		var $mrc_inner_loading = $("#mrc-inner-loading");
		$mrc_inner_loading.css("visibility","visible");
		var param = $.param({
			"zmID" : zmID,
			"curPage" : curPage,
			"zmUserItemCount" : total,
			"sort" : sort
		});
		$.ajax({
			url:"/zmAction|showZmUser.action",
			type:"post",
			data:param,
			success:function(data){
				var $zmUserShowAjaxMessage = $("#zmUserShowAjaxMessage");
				if(!isInit)
					$(window).scrollTop($zmUserShowAjaxMessage.offset().top - 5);
				$zmUserShowAjaxMessage.html(data);
			}
		});
	}
	
	//招募报名用户列表ajax分页
	$.showLenovoUser = function(zmID){
		var param = $.param({
			"zmID" : zmID
		});
		$.ajax({
			url:"/zmAction|showLenovoUser.action",
			type:"post",
			data:param,
			success:function(data){
				$("#lenovoUserShowAjax").html(data);
			}
		});
	}
	//招募报名用户列表ajax分页
	$.showLenovoNewUser = function(zmID,total,curPage,isInit){
		var param = $.param({
			"zmID" : zmID,
			"curPage" : curPage,
			"zmUserItemCount" : total
		});
		$.ajax({
			url:"/zmAction|showLenovoNewUser.action",
			type:"post",
			data:param,
			success:function(data){
				if(!isInit)
					$(window).scrollTop($("#lenovoNewUserShowAjax").offset().top - 5);
				$("#lenovoNewUserShowAjax").html(data);
			}
		});
	}
	//打开腾讯微博分享
	$.openZmQQWeibo = function(url,desc,pic){
		var url = encodeURIComponent(url);
		var desc = encodeURIComponent(desc);
		var pic = encodeURIComponent(pic);
		var qqShareUrl = "http://share.v.t.qq.com/index.php?c=share&a=index&f=q2&url="+url+"&appkey=801154025&assname=&title="+desc+"&pic="+pic;
		$.openPage(qqShareUrl);
	}
	//打开新浪微博分享
	$.openZmSinaWeibo = function(url,desc,pic){
		var url = encodeURIComponent(url);
		var desc = encodeURIComponent(desc);
		var pic = encodeURIComponent(pic);
		var sinaShareUrl = "http://service.weibo.com/share/share.php?url="+url+"&appkey=3870602502&title="+desc+"&pic="+pic+"&ralateUid=1705284204&language=";
		$.openPage(sinaShareUrl);
	}
	// 招募 结束
	/*--------------我的首页美空联络---------------------*/
	/*
	 * BackstageMokoCallEdit.jsp
	 */

	// 美空联络弹出层
	$.popMokoCallInfo=function(url){
		$.mokoDialog.close();
		var param = $.param({random:Math.random()});
		$.mokoDialog({url:url+"?"+param});
	}
	// 保存美空联络信息
	$.saveMokoCallInfo=function(type){
		var mobileReg=/^1[3|4|5|8][0-9]\d{8}$/;
		var emailReg = /\b(^[_A-Za-z0-9-]+(\..[_A-Za-z0-9-]+)*@(.+\.)+.+$)\b/;
		if($("#mobile1").val().trim()==""){
			$.mokoDialog({id:"checkMokoCallInfoPop",url:"/jsps/common/alertPop.jsp?tip=36"});
			return;
		}
		if(!mobileReg.test($("#mobile1").val().trim())){
			$.mokoDialog({id:"checkMokoCallInfoPop",url:"/jsps/common/alertPop.jsp?tip=37"});
			return;
		}
		if(($("#mobile2").val().trim()!="")&&(!mobileReg.test($("#mobile2").val().trim()))){
			$.mokoDialog({id:"checkMokoCallInfoPop",url:"/jsps/common/alertPop.jsp?tip=37"});
			return;
		}
		if(($("#email_call").val().trim()!="")&&(!emailReg.test($("#email_call").val().trim()))){
			$.mokoDialog({id:"checkMokoCallInfoPop",url:"/jsps/common/alertPop.jsp?tip=38"});
			return;
		}
		if(type == 'on' || type == 'off'){
			$.ajax({
				url:"/mgrindex|editMokoCallInfo.action?flag="+type,
				type:"post",
				data:$("#mokoCallForm").serialize(),
				success:function(response){
					$.mokoDialog.close();
					$.reload();
				}
			});
		}else if(type == 'zm'){	
			$.ajax({
				url:"/zmAction|saveZMUserMsg.action",
				type:"post",
				data:$("#mokoCallForm").serialize(),
				success:function(response){
					if(response == 'ok'){
						$.mokoDialog.close();
						$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=6"});
					}else{
						$.mokoDialog.close();
						$.reload();
					}
				}
			});
		}	
	}

	/**
	 * ************************************申请MP上传图片
	 * 开始**********************************************
	 */
	// 激活MP申请
	$.updateMPActive=function(){
		var weblogKey = $.trim($("#weblogKey").val());
		if(!$.checkWeblogKeyIsOk(weblogKey)){
		    var param = $.param({"type":0});
		    $.mokoDialog({url:'/jsps/applymp/ApplyMpAlert.jsp?'+param});
			return;
		}
		$.checkWeblogIsExist(weblogKey);
	}
	// 检测weblogkey
	$.checkWeblogIsExist=function(weblogKey){
		$.ajax({
			url:"/applyMP|checkWeblogIsExist.action",
			type:"get",
			data:{"weblogKey":weblogKey},
			success:function(response){
				if(response=="success"){
					$.confirmUpdateWkey(weblogKey);
				}else{
					var param = $.param({"type":1});
		    		$.mokoDialog({url:'/jsps/applymp/ApplyMpAlert.jsp?'+param});
				}
			}
		});
	}
	// 检测weblogKey的长度及地址是否合法
	$.checkWeblogKeyIsOk=function(weblogKey){
		if(weblogKey.length <= 0)
			return false;
		if(weblogKey.length<4 || weblogKey.length>20 || !(/\b(^[A-Za-z0-9]{4,20}$)\b/.test(weblogKey)))
			return false;
		return true;
	}
	// 弹出激活成功提示框
	$.confirmUpdateWkey=function(weblogKey){
		var param = $.param({"type":2,"weblogKey":weblogKey});
		$.mokoDialog({url:'/jsps/applymp/ApplyMpAlert.jsp?'+param});
	}
	//修改wKey
	$.updateWKey=function(weblogKey){
		$.ajax({
			url:"/applyMP|updateMPActive.action",
			type:"post",
			data:{"weblogKey":weblogKey},
			success:function(response){
				if(response=="success"){
					var param = $.param({"type":3});
					$.mokoDialog({url:'/jsps/applymp/ApplyMpAlert.jsp?'+param});
				}
			}
		});
	}

	// 初始MP申请时：判断如果不是FS用户的处理
	$.initApplyMP=function(levelId,wKey){
		if(levelId!=5) // 不是FS用户
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?" + $.param({"tip":39,"weblogKey":wKey})});
	}

	/**
	 * ************************************申请MP上传图片
	 * 结束**********************************************
	 */

	// 举报
	$.complaintAjax=function(toUserId,commentType,tid){
		$.mk.common.clearBlogSearchDiv();
		if(!confirm("确定要举报吗?"))
			return;
		$.ajax({
			url:"/reportadd|complaint.action",
			type:"post",
			data:{toUserId:toUserId,commentType:commentType,tid:tid},
			success:function(response){
				if(response=="success")
					alert("举报成功!");
				else
					alert("此信息已被举报过啦!");
			}
		})
	}
	// 系统消息里加关注
	$.sysSubscribeTa=function(subscribeId,name){
		$.ajax({
			url:"/subscribeUpdate|checkIsMySubscribe.action",
			type:"get",
			data:{subscribeId:subscribeId},
			success:function(response){
				if(response=="success")
					$.subscribeTA('',subscribeId,name);
				else
					alert("你已经关注过了。");
			}
		})
	}

	/**
	 * 封面添加关注弹出层
	 * 
	 * @param {}
	 *            btnId
	 * @param {}
	 *            subscribeId
	 * @param {}
	 *            name
	 */
	$.subscribeTA=function(btnId,subscribeId,name){
		var strText='<div class="popBox0 addGz bd">'+
					'	<h5 class="bd_1 cf"><a class="mC hU" href="javascript:void(0);" onclick="jQuery1.mokoDialog.close();return false;">关闭</a>关注TA</h5>'+
					'	<br /><br /><br /><p class="text gC">你关注<span class="mC">'+name+'</span>吗?</p><br /><br />'+
					'	<p class="text gC">关注TA,你会收到TA的所有微博...<br />TA就可以给你发信息了...</p><br />'+
					'	<div class="button">'+
					'		<input id="subBtn" class="bt_2 mC" type="button" onclick="jQuery1.faceAddSub(\'' + btnId + '\',' + subscribeId + ',\'' + name + '\')" value="确 定" />'+
					'		<input class="bt_2 gC" type="button" onclick="jQuery1.mokoDialog.close();" value="取 消" />'+
					'	</div>'+
					'</div>';
		$.mokoDialog({content:strText});
	}


	/**
	 * 封面添加关注
	 * 
	 * @param {}
	 *            subscribeId 关注人Id
	 */
	$.faceAddSub=function(btnId,subscribeId, name){
		$.mokoDialog.close();
		$.ajax({
			url:"/subscribeUpdate|faceAddSubscribe.action",
			type:"post",
			data:{subscribeId:subscribeId},
			success:function(response){
				if(response=="error"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=10"});
					return;
				}
				if(response=="black"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=40"});// 位于黑名单中的用户需要先解除才可以关注
					return;
				}
				if(response=="reblack"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=41"});// 位于该用户的黑名单，对方解除黑名单后才可添加关注
					return;
				}					
				if(btnId!=""){
					var textTag = "已关注";
					var subTag = "single";
					if(response=="doubleSub"){
						textTag = "<span class=\"bFollow\">相互关注</span>";
						subTag = "double";
					}
					$("#" + btnId).html(textTag + "&nbsp;&nbsp;<a class=\"g1mC u\" href=\"javascript:void(0);\" onclick=\"jQuery1.popCancleSubscribe('"+subTag+"','"+btnId+"', " + subscribeId + ", '" + name + "');return false;\" hidefocus=\"ture\" >取消</a>");
				}					
			}
		});
	}

	/**
	 * 添加关注弹出层
	 * 
	 * @param {}
	 *            btnId
	 * @param {}
	 *            subscribeId
	 * @param {}
	 *            name
	 */
	$.subAddTA=function(subscribeId,type,name){
		var strText='<div class="justice sure"><h5 class="font14 lesserColor">你关注<span class="mainColor">'+name+
					'</span>吗？</h5><p class="lesserColor weight700">关注TA,你会收到TA的所有动态...<br />TA就可以给你发信息了...</p>' +
					'<div class="button" style="text-align:center;"><input id="subBtn" class="buttonL_2 font14 mainColor weight700" type="button" value="关注TA" onfocus="this.blur()"' + 
					' onclick="jQuery1.subPageAddSub(\'' + subscribeId + '\',' + type + ')"/>&nbsp;&nbsp;&nbsp;&nbsp;'+
					'<input class="buttonL_2 font14" type="button" value="取 消" onfocus="this.blur()" onclick="jQuery1.mokoDialog.close();"/></div></div>';
		var strTitle="关注TA";
		$.mokoDialog({content:strText});
	}

	$.subPageAddSub=function(subscribeId, type){
		$.mokoDialog.close();
		$.ajax({
			url:"/subscribeUpdate|faceAddSubscribe.action",
			type:"post",
			data:{subscribeId:subscribeId},
			success:function(response){
				if(response=="error"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=10"});
					return;
				}
				if(response=="black"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=40"});// 位于黑名单中的用户需要先解除才可以关注
					return;
				}
				if(response=="reblack"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=41"});// 位于该用户的黑名单，对方解除黑名单后才可添加关注
					return;
				}			
				var	subText = "已关注";
				if(response=="doubleSub")
					subText = "相互关注";
				if(type == 1)
					$("#li_" + subscribeId).html(subText);	// ajax更改提示字样
				else
					$("#li_addSub_" + subscribeId).html('<span class="borderColor font12">' + subText + '</span>');
			}
		});
	}

	$.popCancleSubscribe=function(type,elID, touserid, name){
		var param = $.param({"type":type,"elID":elID,"touserid":touserid,"name":name});
		$.mokoDialog({url:"/jsps/subscribe/SubscribeCancleFace.jsp?"+param});
	}

	/**
	 * 解除关注关系
	 * 
	 * @param {}
	 *            touserid 关注人Id
	 */
	$.cancleSubscribeFace=function(type,elID, touserid, name){
		$.mokoDialog.close();
		$.ajax({
			url:"/subscribeUpdate|cancleSubscribeFaceAjax.action",
			type:"post",
			data:{subscribeId:touserid},
			success:function(response){
				if(response == "error"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=10"});
					return;
				}
				if(response == "ok"){
					var strText = "";
					var levelId = $("#sub_user_level").val();
					if(levelId == 5){
						if(type == "double")
							strText = "你的粉丝&nbsp;&nbsp;";
					}else{
						strText = "<a class=\"mC u plus\" href=\"javascript:void(0);\" onclick=\"jQuery1.subscribeTA('"+elID+"'," + touserid + ",'" + name + "');return false;\" hidefocus=\"ture\" >加关注</a>";
						if(type == "double")
							strText = "你的粉丝&nbsp;&nbsp;<a class=\"mC hU plus\" href=\"javascript:void(0);\" onclick=\"jQuery1.subscribeTA('"+elID+"'," + touserid + ",'" + name + "');return false;\" hidefocus=\"ture\" >加关注</a>";
					}
					$("#" + elID).html(strText);
				}
			}
		});
	}

	/**
	 * 判断是否链接可用(登录可用)
	 * 
	 * @param {}
	 *            obj user对象
	 * @param {}
	 *            wKey 用户weblogKey
	 * @param {}
	 *            domain 域名
	 */
	$.checkLoginPop=function(obj,wKey,domain){
		if(obj=="")
			$.popNotLogin();
		else
			$.location(domain + "/" + wKey);
	}

	// 检测证件是否可用
	$.checkCardNum=function(obj,cardNumConfirmObj){
		var cardNum = $.trim(obj.value);
		var $cardNumConfirmObj = $('#'+cardNumConfirmObj);
		var cardNumConfirm = $.trim($cardNumConfirmObj.val());
		if(cardNum == ""){
			$("#spCardNum").empty();
			if(cardNumConfirm == "")
				$("#spCardNumConfirm").empty();
			var param = $.param({"content":"请输入正确证件号码..."});
			$.mokoDialog({url:"/jsps/register/RegisterTiShiPop.jsp?"+param});
			isCardTrue = "F";
			return;
		}
		$.ajax({
			url:"/card|checkCardNumAjax.action",
			type:"get",
			data:{cardNum:cardNum},
			success:function(response){
				if(response=="success"){
					$("#spCardNum").html("<img class=\"correct\" src=\""+mokosimg+"/images/n.gif\" />");
					isCardTrue = "T";
				}else {
					$("#spCardNum").html("<img class=\"error\" src=\""+mokosimg+"/images/n.gif\" />此证件号码已被他人使用。");
					isCardTrue = "F";
				}
				if(cardNumConfirm == "")
					return;
				$.checkCardNumConfirm($cardNumConfirmObj[0], obj.id);
			}
		})
	}
	// 确认两次输入证件号码检测
	$.checkCardNumConfirm=function(obj,cardNumObj){
		var cardNum = $.trim($("#"+cardNumObj).val());
		var cardNumConfirm = $.trim(obj.value);
		if(cardNum == "" && cardNumConfirm == ""){
			$("#spCardNum").empty();
			$("#spCardNumConfirm").empty();
			return;
		}
		if(cardNum!=cardNumConfirm)
			$("#spCardNumConfirm").html("<img class=\"error\" src=\""+mokosimg+"/images/n.gif\" />两次输入的证件号码不一样,请重新输入。");
		else
			$("#spCardNumConfirm").html("<img class=\"correct\" src=\""+mokosimg+"/images/n.gif\" />");
	}
	/** *******************************************评论(个人展示，微博)********************************************************* */
	// 替换到@昵称上的链接
	$.replaceAtUrl=function(str){
		if(str == null || str == "")
			return str;
		str = $.replaceAll(str,"<A", "<a");
		str = $.replaceAll(str,"</A>", "</a>");
		str = $.replaceAll(str,"</a>", "");
		var check1 = str.indexOf("<a");
		var check2 = str.indexOf(">");
		if(check1 != -1 && check2 != -1){
			var temp = str.substring(0, check1) + str.substring(check2 + 1);
			return $.replaceAtUrl(temp);
		}
		return str;
	}

	// 显示评论回复框(个人展示，微博)
	$.showCommentHuiFu=function(objId,nickName){
		if($("#user_level").val()==5){// 5=fs级别
			$.mk.blog.applyMPView(2);
			return;
		}
		var userId = $("#upUserId" + objId).val();
		if($.mk.blog.checkIsBlack(userId))
			return ;
		$(".sMicroblog").hide();
		$("#huiFu_"+objId).show();
		$("#"+objId+"replyComments").val("回复@"+nickName+"：");
		$.focusLastTextArea(objId+"replyComments");
	}
	// 发送评论(个人展示，微博)
	$.sendCommentData=function(objId){
		var commentContent = $.trim($("#"+objId+"replyComments").val());
		if(commentContent==""){
			alert("怎么也要写些东西哟~");
			return false;
		}
		$("#reContent"+objId).val(commentContent);
		if($("#reContent"+objId).val()==""){
			alert("怎么也要写些东西哟~");
			return false;
		}
		$("#btnHuiFu"+objId).attr("disabled",true);
		$("#sending"+objId).show();
		$.ajax({
			url:"/commentAction|saveCommentData.action",
			type:"post",
			data:$("#fmComment"+objId).serialize(),
			success:function(response){
				if (response == "dataErr")
					alert("数据错误,请刷新页面重新操作！");
				else{
					$.mk.message.result_hand("success","message");
					$("#huiFu_"+objId).hide();
				}
				
				$("#sending"+objId).hide();
				$("#btnHuiFu"+objId).attr("disabled",false);
			}
		});
	}
	// 全选
	$.delAllCommentData=function(obj){
		if($(obj).prop("checked"))
			$("input[name='chkCommentTmp']").attr("checked",true);
		else
			$("input[name='chkCommentTmp']").attr("checked",false);
	}
	// 删除评论
	$.delCommentData=function(){
		var flag;
		var ids="";
		var values="";
		var chkName;
		chkName=document.getElementsByName("chkCommentTmp");
		if(chkName!=null&&chkName.length>0){
			for(var i=0;i<chkName.length;i++){
				if(chkName[i].checked){
					flag="ok";
					ids+=chkName[i].id.split("_")[1]+",";
					values+=chkName[i].value+",";
				}
			}
		}
		if(flag!="ok") {
			alert("你还没有选择项！！！");
			return;
		}
		if(!confirm('确定删除所选信息吗？'))
			return;
		var arrayValues = values.split(",");
		for(var i=0;i<arrayValues.length-1;i++){
			$("#delCommentBefore").after('<input type="hidden" name="chkComment" value="'+arrayValues[i]+'" />');
		}
		$.ajax({
			url:"/commentAction|delCommentData.action",
			type:"post",
			data:$("#fmAllComment").serialize(),
			success:function(response){
				$("input[name='chkComment']").remove();
				$("#chkAllComment").attr("checked",false);
				var arrayIds = ids.split(",");
				for(var i=0;i<arrayIds.length-1;i++){
					$("#divComment_"+arrayIds[i]).remove();
				}
			}
		});
	}
	// 打开项目报名内容层
	$.openProjectContent=function(pID){
		$("#" + pID).text($("#" + pID).attr("title"));	
	}
	// 关闭项目报名内容层
	$.closeProjectContent=function(pID){
		$("#" + pID).text(($("#" + pID).attr("title")).substring(0, 58) + "...");
	}

	$.goUrl=function(url){
		$.location(url);
	}

	// 背景设置type:是否滚动,align:对齐方式,pic:图片路径,isuse:是否启用背景设置
	$.setUserBackGround=function(type,align,pic,isuse){
		if(isuse=="F" || !pic)
			return false;
		$("body").css("background-image","url('"+pic+"')");
		if(type==0){
			if(align==0)
				$("body").attr("class","back1 back0");
			else if(align==1)
				$("body").attr("class","back3 back0");
			else if(align==2)
				$("body").attr("class","back2 back0");
		}else if(type==1){
			if(align==0)
				$("body").attr("class","back1");
			else if(align==1)
				$("body").attr("class","back3");
			else if(align==2)
				$("body").attr("class","back2");
		}
	}
	$.setBackStyle=function(){
		if($("#imgBackgroundPic").size <= 0)
			return;
		var picSrc = $("#imgBackgroundPic").attr("src");
		if(picSrc == null || picSrc == '' || picSrc.indexOf("n.gif") != -1)
			return;
		var webServerName = "";
		if(picSrc.indexOf("/users/") != -1)
			webServerName = picSrc.split("/users/")[0];
		else if(picSrc.indexOf("/pics/") != -1)	
			webServerName = picSrc.split("/pics/")[0];
		picSrc = webServerName + $("#backgroundImgUrl").val();
		var image = new Image();
		$(image).one("load",function(){
			var type = $("input[name='backgroundType']:radio:checked").val();
			var align = $("input[name='backgroundAlign']:radio:checked").val();
			$.setUserBackGround(type,align,picSrc,'T');
		})
		image.src = picSrc;
	}

	$.citeVideo = {
		getSrc : function (code) {
			if (!code)
				return code;
			code = $.trim(code);
			var re;
			if (/http:\/\/(\.|\-|[^\/\W])+.(youku|tudou).com\//i.test(code.toLowerCase())) {
				if (/^http:\/\//i.test(code.toLowerCase()))
					return code
					
				re = $(code).attr('src')
			}
			return re
		},
		parse : function (videoURL) {
			videoURL = $.citeVideo.getSrc(videoURL);
			if (!videoURL) {
				return
			}
			var url = "/video|parse.action";
			var f;
			$.ajax({
				type : 'POST',
	     		async: false ,
				url : "/video|parse.action",
				data : { 'url' : videoURL, 'rnd' :  Math.random()},
				success : function(response) {
					f = eval("(" + response + ")");
				}
			})
			return f;
		}
	}

	//设置用户是否上传头像div 显示不显示 T：已上传 或忽略 不显示div F：未上传头像 显示div
	$.setIsUploadLogoDiv=function(key, id){
		var isUploadLogo = $.getCookie(key);
		if(isUploadLogo == "F"){
			$("#" + id).show();
			return;
		}else if(isUploadLogo == "T")
			return;
		
		$.ajax({
			url:"/mgrindex|findUploadLogoStatusAjax.action",
			type:"post",
			success:function(response){
				if(response == "F"){
					$("#" + id).show();
				}
			}
		});		
	}
	/**
	 * 取消上传头像提示层
	 */
	$.hideUploadDiv=function(){
		$.ajax({
			url:"/mgrindex|hideUploadLogoAjax.action",
			type:"post",
			success:function(response){
				$("#uploadLogoDiv").remove();
			}
		});
	}
	//给短链接加链接
	$.addShort2Url=function(elementId){
		var $objContainers = $("[id^=\""+elementId+"\"]");
		if($objContainers.size() == 0)
			return;
		$objContainers.each(function(i, element){
			element = $(element);
			var context = element.html();
			var stUrlList = $.getShortURLList(context);	//获取需要替换short url 链接的内容集合
			if(stUrlList != null && stUrlList.length > 0){	//替换 short url
				stUrlList = $.distinctEl(stUrlList);
				$.each(stUrlList, function(i, url){
					context = $.replaceAll(context, url, $.getShortUrl(url));
				});
			}
			element.html(context);
		});
	}
	
	/**
	 * 回车、点击提交统一走click事件
	 */
	$.enterBindClick = function(btnId){
		$("#"+btnId).click();
		return false;
	}
	
	/**
	 * 弹出FS级别限制提示层 fs没权限操作提示
	 */
	$.showFsAlertSuccess = function(){
		$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=5"});
	}
})(jQuery1);

//公告业务
(function($){
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.common == "undefined") {
		$.mk.common = {};
	}
	

	//艺人预约弹出层
	$.mk.common.openYryyDialog = function(userid){
		$.mokoDialog({id : 'yuyuePop', url : '/jsps/yuyue/YuyuePop.jsp?userid=' + userid, fixed : false});
	}
	
	//返回mymoko页
	$.mk.common.goBackStage = function(mokoDomain, wKey) {
		$.location(mokoDomain + "/" + wKey + "/index.html");
	}
	
	//关闭搜索弹出层
	$.mk.common.clearBlogSearchDiv = function (){
		if($("#blogContent_div").size() > 0){
			$("#blogContent_div").hide();
			$("#blogContent_ul").hide();
			$("#blogContent_ul").html("");
		}
	}
	
	//检测所在地是否正确
	$.mk.common.checkLocation = function (countryId,provinceId,cityId){
		if(countryId == "" || countryId == 0 || provinceId == "" || cityId == "")
			return false;
		if(countryId != 1 && provinceId == 0 && cityId == 0)//海外
			return true;
		if(countryId == 1 && provinceId != 0 && cityId == 0)//直辖市
			return true;
		if(countryId == 1 && provinceId != 0 && cityId != 0)//国家 省 市
			return true;
		return false;
	}
	
	//加载家乡所在地
	$.mk.common.setUserAddress = function (textName,country,province,city){
		if(city != null && city !="")
			$("#"+textName).val(city);
		else if(province != null && province !="")
			$("#"+textName).val(province);
		else if(country != null && country !="")
			$("#"+textName).val(country);
		else{
			if(textName == "jiaXiangAddress")
				$("#"+textName).val("所在地");
			else
				$("#"+textName).val("工作地");
		}
	}
	
	//判断是否显示展示或微博评论框还是显示此展示或微博进行评论限制
	$.mk.common.isShowComment = function () {
		var isShow = $("#hid_isShowComment").val();
		if (isShow == "none")
			$("#divnotShowComment").show();
		else
			$("#divShowComment").show();
	}
		
	//前台管理 打开管理用户信息页面
	$.mk.common.dispostUserMsg = function (wkey){
		var param = $.param({"wKey":wkey});
		$.mokoDialog({url:"/userManageAction|showUserManagePage.action?" + param});
	}
	
	//前台管理 选择推荐行业时 不允许同时推荐到重复的行业
	$.mk.common.checkSameVocation = function (v1, v2){
		var vocation1 = $("#"+ v1);
		var vocation2 = $("#"+ v2);
		var vocationVal1 = vocation1.children("option:selected").val();
		var vocationVal2 = vocation2.children("option:selected").val();
		if(vocationVal1 > 0 && vocationVal2 > 0 && vocationVal1 == vocationVal2){
			alert("不要重复选择行业!");
			var oldValue = vocation1.attr("oldVocation");
			oldValue = oldValue == "" ? 0 : oldValue;
			vocation1.children("[value=\""+oldValue+"\"]").attr("selected","selected");
			return false;
		}
		vocation1.attr("oldVocation",vocationVal1);
	}
	
	//前台管理 保存用户修改信息
	$.mk.common.saveUserMsg = function (chxID,newTypeID,chxCpID,newCpTypeID ){	
		var tag = $("#" + chxID).prop("checked");
		if(tag == true)
			$("#" + newTypeID).val("T");
		else
			$("#" + newTypeID).val("F");
		tag = $("#" + chxCpID).prop("checked");
		if(tag == true)
			$("#" + newCpTypeID).val("T");
		else
			$("#" + newCpTypeID).val("F");
		$.ajax({
			url:"/userManageAction|saveUserManage.action",
			type:"post",
			data:$("#userManageForm").serialize(),
			success:function(response){
				$.mokoDialog.close();
				$.reload();
			}
		});
	}
	
	// 检查文本模块的值
	$.mk.common.checkTextModualValue = function (){
		var isReturn = false;
		var modelItemObj = $("textarea[name='item_c1']");
		for(var i=0;i<modelItemObj.length;i++){
			if($.trim(modelItemObj[i].value)==""){
				isReturn = true;
				break;
			}
		}
		if(isReturn){
			alert("怎么也要写些东西哟～");
		}
		return isReturn;
	}
	
	//提交之前对模块元素进行统一命名
	$.mk.common.setValueBeforeSubmit = function (type){
		if((type == "jianjie" || type == "lianluo" || type == "zhaopin") && $.mk.common.checkTextModualValue())
			return false;
		$("div[name='item_content']").each(function(i){
			$.mk.common.setObjName($(this),"c1",i);
			$.mk.common.setObjName($(this),"c2",i);
			$.mk.common.setObjName($(this),"c3",i);
			$.mk.common.setObjName($(this),"itemType",i);
			$.mk.common.setObjName($(this),"itemId",i);
		});
		return true;
	}
	
	//设置元素名称 obj:元素; objName:元素名称; i:索引Id
	$.mk.common.setObjName = function (obj,objName,i){
		obj.find("*[name='item_" + objName + "']").attr("name", "itemBeanList[" + i + "]." + objName);
	}

	//渲染招募花絮展示
	$.mk.common.showZMPosts = function (zmId,otherDivId){
		$.ajax({
			url:"/zmPost.action",
			type:"post",
			data:{"zmId":zmId},
			success:function(response){
				if(response == "no date"){
					if(otherDivId == undefined)
						$("#zmPostDiv").hide();
					else{
						$("#"+otherDivId).hide();
					}
				}else{
					if(otherDivId == undefined){
						$("#zmPostDiv").show();
						$("#zmPostDiv").html($("#zmPostDiv").html()+response);
					}else{
						$("#"+otherDivId).show();
						$("#"+otherDivId).html($("#"+otherDivId).html()+response);
					}
				}
			}
		});
	}
	
	//检测密码强度
	$.mk.common.pwStrength = function (pwd){
		O_color="pswStrong"; 
	    L_color="pswStrong1"; 
	    M_color="pswStrong2"; 
	    H_color="pswStrong3"; 
	    S_level=checkStrong(pwd); 
	    switch(S_level) { 
	    	case 0: 
				Lcolor=Mcolor=Hcolor=O_color; 
			case 1: 
	    		Lcolor=L_color; 
	    		Mcolor=Hcolor=O_color; 
	    		break; 
			case 2: 
	        	Lcolor=Mcolor=M_color; 
	        	Hcolor=O_color; 
	       	 	break; 
	   	 	default: 
				Lcolor=Mcolor=Hcolor=H_color; 
	   	}
		$("#password_L").attr("class",Lcolor);
		return; 
	}
	//返回密码的强度级别 
	var checkStrong = function (sPW){ 
		if (sPW.length<6) 
			return 0; //密码太短  
	    Modes=0; 
	    for (i=0;i<sPW.length;i++){ 
	        //测试每一个字符的类别并统计一共有多少种模式. 
	        Modes|=CharMode(sPW.charCodeAt(i)); 
		} 
		return bitTotal(Modes); 
	},
	//测试某个字符是属于哪一类. 
	CharMode = function (iN){ 
	    if (iN>=48 && iN <=57) //数字 
	    	return 1; 
	    if (iN>=65 && iN <=90) //大写字母 
	    	return 2; 
	    if (iN>=97 && iN <=122) //小写 
	    	return 4; 
	    else 
	    	return 8; //特殊字符 
	}, 
	//计算出当前密码当中一共有多少种模式 
	bitTotal = function (num){
	    modes=0; 
	    for (i=0;i<4;i++){ 
	        if (num & 1) modes++; 
	        num>>>=1; 
	    } 
	    return modes; 
	}
	
	//头部发短信
	$.mk.common.levelCom = function (title,url,uid,names){
		var callBackFun=function(){
			_showgutsf(title,url,uid,names);
		}
		$.mk.common.checkMessageCount(callBackFun);
	}
	
	var _showgutsf = function (title,msgUrl,uid,name){
		var param = $.param({"uid":uid,"uname":name});
		$.mokoDialog({url:msgUrl+"?"+param,width:500,initFn:function(){
			$("#counts").characterLimit({numTarget:"#chLeft",maxlength:150});
		}});
	}
	
	//检测在当前1分钟内用户发短信条数
	$.mk.common.checkMessageCount = function (callBackFun){
		$.ajax({
			type:"get",
			url:"/mokoMessage|checkMessageCount.action",
			success:function(req){
				if(req=="message.over")
					alert("呃--已经超出每分钟发送的数量,稍后再发送。");
				else
					callBackFun();
			}
		});
	}
	
	//当input控件中类型不符时，将input控件值置空
	$.mk.common.setValue = function (element, id) {
		var value = $.mk.common.checkType(element) ? element.value : "";
		$("#"+id).val(value);
	}
	
	// 检查上传文件类型
	$.mk.common.checkType = function (obj) {
		var ALLOWED_TYPE = ".jpg|.bmp|.jpeg|.gif";
		var errUploadType = '目前只支持"JPG"或者"BMP"或者"JPEG"或者"GIF"格式';
		if(!(ALLOWED_TYPE.indexOf(obj.value.slice(obj.value.lastIndexOf(".")).toLowerCase())!=-1)){
			if(navigator.userAgent.toLowerCase().indexOf("firefox")>=0)
		 	 	obj.value = "";
		 	else{
			 	obj.select();
			 	obj.outerHTML += "";
		 	}	
		 	alert(errUploadType);
		 	return false;	
		}
		return true;
	}
	
})(jQuery1);


/**
 * 找回密码Forgot Your Password
 */
(function($){
	
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.fyp == "undefined") {
		$.mk.fyp = {};
	}
	
	// 找回密码检查Emai是否符合格式
	$.mk.fyp.checkEmailValue=function() {
		var emailReg = /\b(^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$)\b/;
		var emailNode = $("#email");
		var email = emailNode.val().trim();
		var resultNode = $("#emailText");
		if(email==""||email==null){
			resultNode.html("<p class='succeed mainColor mainDashedOn'>请输入email</p>");
			emailNode.focus();
			return false;
		}
		if(!emailReg.test(email)) {
			resultNode.html("<p class='succeed mainColor mainDashedOn'>Email格式不正确</p>");
			emailNode.focus();
			return false;
		}
		$("#replySending").attr("style", "display:inline");
		$("#btnStr").attr("disabled",true);
	}
	
	// 检查密码格式
	$.mk.fyp.checkPassword=function(){
		var password = $("#user_password").val();
		if(password == ""){
			$("#passwordText").html("<p class='succeed mainColor mainDashedOn'>请输入密码</p>");
			return false;
		}
		if(password.indexOf(" ") != -1){
			$("#passwordText").html("<p class='succeed mainColor mainDashedOn'>密码中不能有空格</p>");
			return false;
		}
		if(password.length<6 || password.length>24){
			$("#passwordText").html("<p class='succeed mainColor mainDashedOn'>密码长度应在6到24位之间</p>");
			return false;
		}
		var passwordConfirm = $("#passwordConfirm").val();
		if(passwordConfirm.indexOf(" ")!= -1 || passwordConfirm != password) {
			$("#passwordConfirmText").html("<p class='succeed mainColor mainDashedOn'>两次输入的密码不一致</p>");
			return false;
		}
		return true;
	}
	
	

})(jQuery1);

/**
 * 系统设置system settings
 */
(function($){
	
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.syset == "undefined") {
		$.mk.syset = {};
	}
	
	/**
	 * 通过监听location.hash进行跳转
	 */
	$.mk.syset.checkSystemSetFlag = function(){
		var sysetFlag = '#baseset';
		setInterval(function(){
			var localHash = location.hash;
			if(localHash == sysetFlag)
				return;
			if(localHash == '#baseset')
				_systemSetEdit('/privacySetting.action', 1);
			if(localHash == '#privacyset')
				_systemSetEdit('/privacySetting|getUserPrivacyInfo.action', 2);
			if(localHash == '#background')
				_systemSetEdit('/privacySetting|showUserBackgroundInfo.action', 3);
			if(localHash == '#partnerbind')
				_systemSetEdit('/privacySetting|partnerBind.action', 4);
			sysetFlag = localHash;
		}, 150);
	}
	
	/*
	 * BackstageUserSystemEdit.jsp
	 */
	_systemSetEdit=function(url,objId){
		$.ajax({
			url:url,
			type:"post",
			success:function(response){
				$("#divSystemSet").html(response);
				$("li[name='liTab']").attr("class","l");
				$("#liTab_"+objId).attr("class","l alive");
				if(objId == 4)
					$("#divTabClass").attr("class","main tab bgBox borderOn");
				else
					$("#divTabClass").attr("class","main tab borderOn");
			}
		});
	}
	
	// 更新用户名
	$.mk.syset.updateNickName=function(nickNameId, oldNameId) {
		var nickName =$.trim($("#"+nickNameId).val());
		if(nickName == "") {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=18"});
			$("#"+nickNameId).focus();
			return;
		}
		if(nickName.length < 2) {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=19"});
			$("#"+nickNameId).focus();
			return;
		}
		if(!$.mk.syset.checkNickNameFuHao(nickName)){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=20"});
			$("#"+nickNameId).focus();
			return ;
		}
		var oldName = $("#" + oldNameId).val();
		if(oldName != nickName){
			// 修改姓名时：检测是否含有违禁符号或汉字
			$.ajax({
				url:"/register|checkIsForbid.action",
				type:"get",
				data:{"nickName":nickName},
				success:function(response){
					if(response=="register.error.nickName"){
						$("#"+nickNameId).focus();
						$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=21"});
					}else if(response=="register.check.nickName"){
						$("#"+nickNameId).focus();
						$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=22"});
					}else
						$.mk.syset.updateName(nickName, oldName);
				}
			});
		}else{
			$("#"+nickNameId).focus();
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=23"});
		}           
	}
	
	// 修改姓名
	$.mk.syset.updateUserName=function(){
		$.ajax({
				url:"/privacySetting|updateNickName.action",
				type:"post",
				data:$("#EditNickName").serialize(),
				success:function(response){
					var newNickName = $("#nickName").val();
					$("#headerNickName").text(newNickName.length > 8 ? newNickName.substring(0,8) + "..." : newNickName);
					$("#workNickName").text(newNickName.length > 8 ? newNickName.substring(0,11) + "..." : newNickName);
					$("#strName").val(newNickName);
					$("#resultInfo").html("改名成功！");
					$("#resultInfo").show();
				}
			})
	}
	//修改姓名弹出层
	$.mk.syset.updateName=function(newName, oldName){
		var updateMsg = "";
		$.ajax({
			url:"/privacySetting|checkUpdateNickName.action",
			type:"post",
			success:function(response){
				if(response == "0"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=24"});
					return;
				}				
				if(response == "cp")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=25"});
				else{
					var params = $.param({"tip":26,"oldName":oldName,"newName":newName,"num":response});
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?" + params});
				}
			}
		})	
	}
	
	/** 验证用户昵称是否合法 */
	$.mk.syset.checkNickNameFuHao=function(nickName){
		return /^[-_a-zA-Z0-9\u4e00-\u9fa5]+$/.test(nickName);
	}
	
	// 检查密码是否符合格式
	$.mk.syset.checkPasswordValue=function(oldPwd,currentPwd,confirmPwd) {
		var passwordOri = $("#"+oldPwd).val().trim();
		if(passwordOri == "") {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=27"});
			return false;
		} else if(passwordOri.length<6 || passwordOri.length>24) {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=28"});
			return false;
		}
		var password = $("#"+currentPwd).val().trim();
		if(password == "") {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=29"});
			return false;
		} else if(password.length<6 || password.length>24) {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=30"});
			return false;
		}else if(password.indexOf(" ") != -1){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=31"});
			return false;
		}
		var passwordConfirm = $("#"+confirmPwd).val().trim();
		if(password!="" && passwordConfirm!=password) {
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=32"});
			return false;
		}
		return true;
	}
	
	// 更新密码，设置新密码
	$.mk.syset.updatePassword=function(oldPwd,currentPwd,confirmPwd) {
		var flag = $.mk.syset.checkPasswordValue(oldPwd,currentPwd,confirmPwd);
		if(flag){
			$.ajax({
				url:"/privacySetting|updatePwd.action",
				type:"post",
				data:$("#EditPassword").serialize(),
				success:function(response){
					$("#passwordOriginal").val("");
					$("#user_password").val("");
					$("#passwordConfirm").val("");
					$("#resultInfo").html(response);
					$("#resultInfo").show();
				}
			});
		}             
	}
	
	// 隐私设置
	$.mk.syset.setUserPrivacy=function(){
		$.ajax({
			url:"/privacySetting|updateUserPrivacy.action",
			type:"post",
			data:$("#fmPrivacySet").serialize(),
			success:function(response){
				$("#resultInfo").html("隐私设置成功");
				$("#resultInfo").show();
			}
		});
	}

	// 打开背景图片上传图片页面
	$.mk.syset.showBackgroundAddPicPage=function(){
		$.mk.syset.changeBackground("useBackGround_T");
		$.mokoDialog({url:"/jsps/backstage/BackstageSystemAddPicSmallList.jsp"});
	}
	
	// 选择“使用背景图片”，“不使用背景图片”时的js事件
	$.mk.syset.changeBackground=function(objId){
		if($("#"+objId).val()=="T"){
			$("input[name='backgroundType']").attr("disabled",false);
			$("input[name='backgroundAlign']").attr("disabled",false);
			$.setBackStyle();
		}else{
			$("input[name='backgroundType']").attr("disabled",true);
			$("input[name='backgroundAlign']").attr("disabled",true);
			$("body").removeClass();
			$("body").attr("style", "");
		}
		$("#"+objId).attr("checked",true);
	}
	
	// 切换使用、不使用背景图片
	$.mk.syset.changeRadioBtn=function(objId){
		if(objId == "useBackGround_T"){
			$("#useBackGround_T").attr("checked",true);
			$("#useBackGround_F").attr("checked",false);
			$.mk.syset.changeBackground("useBackGround_T");
		}else{
			$("#useBackGround_T").attr("checked",false);
			$("#useBackGround_F").attr("checked",true);
			$.mk.syset.changeBackground("useBackGround_F");
		}
	}
	
	$.mk.syset.saveUserBackground=function(){
		if($("input[name='useBackGround']:checked").val()=="T"){
			var hidImgUrl = $("#backgroundImgUrl").val();
			var imgUrl = $("#imgBackgroundPic").attr("src");		
			if(hidImgUrl == "" ||  imgUrl.indexOf("/n.gif") != -1){
				$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=33"});
				return false;
			}
		}
		$("#p0_uploadServer").val($("#uploadServerName").val());
		$.ajax({
			url:"/privacySetting|updateUserBackground.action",
			type:"post",
			data:$("#fmBackGround").serialize(),
			success:function(response){
				if(response == "success"){
					$("#resultInfo").html("背景设置成功");
					$("#resultInfo").show();
				}
			}
		});
	}
})(jQuery1);

/*-------------------系统消息  请求  评论评论回复标记已读-------------------------*/
(function($){
	// 选择系统消息全部
	var arryCheckbox=['chkEnjoy','chkMip','chkCard','chkMP','chkPost','chkBirthday','chkMoko','chkGift','chkSystem'];
	
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.message == "undefined") {
		$.mk.message = {};
	}
	
	// 关闭系统公告
	$.mk.message.systemBulletin=function(wKey){
		$.ajax({
			url:"/mgrindex|updateSystem.action",
			type:"get",
			data:{"wKey":wKey},
			success:function(response){
				document.getElementById("systemMsg").style.display="none";
			}
		});
	}
	
	$.mk.message.selectSystemAlls=function(obj) {
		if(obj.checked==true)
			$.mk.message.operateCheckbox(true);
		else
			$.mk.message.operateCheckbox(false);
	}
	
	$.mk.message.operateCheckbox=function(type){
		for(var i=0;i<arryCheckbox.length;i++){
			var allCheckbox=document.getElementsByName(arryCheckbox[i]);
			if(allCheckbox!=null&&allCheckbox.length>0){
				for(var j=0;j<allCheckbox.length;j++){
					allCheckbox[j].checked=type;
				}
			}
		}
	}
	
	// 删除所选系统消息
	$.mk.message.clear_sysmessage=function(formname,chkAll,actionUrl){
		var flag;
		var ids="";
		for(var i=0;i<arryCheckbox.length;i++){
			var allCheckbox=document.getElementsByName(arryCheckbox[i]);
			if(allCheckbox!=null&&allCheckbox.length>0){
				for(var j=0;j<allCheckbox.length;j++){
					if(allCheckbox[j].checked){
						flag="ok";
						ids+=$("#hid_"+allCheckbox[j].id+"_"+allCheckbox[j].value).val()+",";
					}
				}
			}
		}
		if(flag!="ok") {
			alert("你还没有选择项！！！");
			return;
		}
		if(!confirm('确定删除所选信息吗？')){
			return;
		}
		if(document.getElementById(chkAll).checked==true){
			document.getElementById(chkAll).checked=false;
		}
		var deleteMessage = document.getElementById(formname); 
		deleteMessage.action = actionUrl;
		
		$.ajax({
			url:actionUrl,
			type:"post",
			data:$("#"+deleteMessage.id).serialize(),
			success:function(response){
				$.mk.message.clear_sysmessageCallBack(ids);
			}
		});
	}
	
	//切换消息菜单（收件箱、发件箱、保险箱）
	$.mk.message.changeMessageTab=function(url, showDiv, index){
		if (index == 0)
			$("#messageSearch").show();
		else
			$("#messageSearch").hide();
		if (index != -1) {
			for (var i = 0; i <= 2; i++) {
				$("#li_tab_" + i).attr("class", "l")
			}
			$("#li_tab_" + index).attr("class", "l alive")
		}
		$.mk.message.changePageMessage(url, null, showDiv, 1)
	}
	
	//短信、评论、系统 消息分页
	$.mk.message.changePageMessage=function(url, param, showDiv, page) {
		if (!param)
			param = {}
		param.curPage = page;
		$("#" + showDiv).html("<p class='loading thirdColor'>读取中 Loading...</p>");
		$("#" + showDiv).load(url, param, function(){
			$(window).scrollTop(0)
		})
	}
	
	//发送消息
	$.mk.message.space_sendM=function(url){
		var counts = $("#counts").val();
		var types = $("#types").val();
		var methods = $("#methods").val();
		if(counts.trim()!=""){
			var strLength = $.stringUtil.getContentLength(counts, true);
			if (strLength > 150){
				alert("最多可输入" + 150 + "个字符!");
		    	$("#counts").focus();
		    	return;
			}
			$("#sends").show();
			$("#fasong").attr("disabled",true);
			$.ajax({
				url:url,
				type:"post",
				data:{"counts":counts,"types":types,"touserid":methods},
				success:function(response){
					$.mk.message.result_hand(response,"message");
				}
			});
		}
		else{
			alert("怎么也要写些东西呦～");
		}
	}
	
	//短信组里发送短信
	$.mk.message.messageLevel=function(uid,url,friendId,objContent,isSendMessage){
		var callBackFun=function(){
			$.mk.message.sendAnswer(url,friendId,objContent);
		}
		$.mk.common.checkMessageCount(callBackFun);		
	}
	
	$.mk.message.sendAnswer=function(url,friendId,objContent){
		var content=$("#"+objContent).val();
		if(content.trim()=="") {
			$("#"+objContent+1).attr("disabled", false);;
			alert("怎么也要写些东西呦～");
		}else {
			var strLength = $.stringUtil.getContentLength(content, true);
			if (strLength > 150){
				alert("最多可输入" + 150 + "个字符!");
		    	$("#"+objContent).focus();
		    	return ;
			}
			$("#"+objContent+"1").attr("disabled", true);
			$("#" + objContent + "2").show();
			$.ajax({
				url:url,
				type:"get",
				data:{"touserid":friendId,"counts":content},
				success:function(response){
					if(response != ""){
						var jsonM = eval("("+response+")");
						var messageId = jsonM.id;
						$("#"+objContent).val("");
						$("#"+objContent+"1").attr("disabled", false);
						document.getElementById(objContent+"2").style.display="none";
						var strHtml = '<div id="divAppMessage_'+messageId+'" class="msg clearfix right">'+
									'		<div class="r">'+
									'			<div class="borderOn lesserColor">'+
									'				<img class="arrow_2 bg" src="'+mokosimg+'/images/n.gif" />'+
									'				<pre id="pre_content_'+messageId+'">'+jsonM.content+'</pre>'+
									'				<p class="thirdColor font12">'+jsonM.time+'</p>'+
									'			</div>'+
									'			<p class="thirdColor font12 del"><a class="thirdWhite font12" href="javascript:void(0)" onclick="jQuery1.mk.message.delSingleSendMessage('+messageId+',\'divAppMessage_'+messageId+'\');return false;" hidefocus="true">删除</a></p>'+
									'		</div>'+
									'	</div>';
						$("#hfID").before(strHtml);
						$("#spsend").html(parseInt($("#spsend").html()) + 1);
						$.addShort2Url("pre_content_" + messageId);
						$.mk.face.formatImages("divFormatImages");  // 处理表情
						$.focusLastTextArea("txtContent_0");
					}
				}
			});
		}
	}
	
	//发消息，发请求，描述等处理结果
	$.mk.message.result_hand=function(s,type){
		if(s=="success"){
			$.addresults_(type);
		}else{
			$.addresult_(s);
		}
	}
	
	//发短信:同时按ctrl+enter键
	$.mk.message.checkCtrlEnter = function (obj, maxLength, event, sendButtonId){
		if(sendButtonId && event.ctrlKey && event.keyCode==13){
			var strLength = $.stringUtil.getContentLength(obj.value, true);
			if (strLength > parseInt(maxLength)){
				alert("最多可输入" + maxLength + "个字符!");
		    	obj.focus();
		    	return ;
			}
			$("#"+sendButtonId).click();
		}
	}
	/*------------------我的首页短信处理---------------------*/
	$.mk.message.clear_message=function(formname,chkAll,actionUrl,ChkName,objSpan){
	  var checkBoxList = document.getElementsByName(ChkName);
	  if(checkBoxList==null) {
	  	return;
	  }
	  var flag,chkIds="",chkLength=0,divObj="";
	  for(var i=0; i<checkBoxList.length; i++) {
	  	  divObj=document.getElementById("liMessage"+checkBoxList[i].value);
	  	  if(checkBoxList[i].checked&&divObj.style.display!="none") {
	  	  	  flag = "ok";
	  	  	  chkIds+=checkBoxList[i].value+",";
	  	  	  chkLength++;
	  	  }
	  }
	  if(flag!="ok") {
	  	alert("你还没有选择项！！！");
	  	return;
	  }
	  if(!confirm('确定删除所选信息吗？')){
			return;
		}
	  if(document.getElementById(chkAll).checked==true){
	  	document.getElementById(chkAll).checked=false;
	  }
	  var deleteMessage = document.getElementById(formname); 
	  
	  $.ajax({
			url:actionUrl,
			type:"post",
			data:$("#"+deleteMessage.id).serialize(),
			success:function(response){
				if(objSpan){
					var allcount=parseInt(document.getElementById(objSpan).innerHTML);
					document.getElementById(objSpan).innerHTML=allcount-chkLength;
				}
				$.mk.message.clear_sysmessageCallBack(chkIds);
			}
		});
	}
	$.mk.message.clear_sysmessageCallBack=function(ids){
		var arryIds=ids.split(",");
		for(var i=0;i<arryIds.length-1;i++){
			$("#liMessage"+arryIds[i]).remove();
		}
	}
	// 转到保险箱
	$.mk.message.setSafeMessage=function(messageid){
		$.ajax({
			url:"/mokoMessage|safeBoxMessage.action",
			type:"post",
			data:{"messageId":messageid},
			success:function(response){
				if(response=="success"){
					document.getElementById("spsafe").innerHTML=parseInt(document.getElementById("spsafe").innerHTML)+1;
					alert("短信复制成功！");
				}else if(response=="repeat"){
					alert("该条短信在保险箱中已存在！");
				}else{
					alert("该条短信不存在！");
				}
			}
		});
	}
	// 删除单条收件箱短信
	$.mk.message.delSingleReceiveMessage=function(messageid,touserid,objMessageId){
		if(confirm('确定删除该条信息吗？')){
			$.ajax({
				url:"/mokoMessage|delSingleReceiveMessage.action",
				type:"post",
				data:{"messageId":messageid,"touserid":touserid},
				success:function(response){
					document.getElementById("spreceive").innerHTML=parseInt(document.getElementById("spreceive").innerHTML)-1;
					$("#"+objMessageId).remove();
				}
			});
		}
	}
	// 删除单条发件箱短信
	$.mk.message.delSingleSendMessage=function(messageid,objMessageId){
		if(confirm('确定删除该条信息吗？')){
			$.ajax({
				url:"/mokoMessage|delSingleSendMessage.action",
				type:"post",
				data:{"messageId":messageid},
				success:function(response){
					document.getElementById("spsend").innerHTML=parseInt(document.getElementById("spsend").innerHTML)-1;
					$("#"+objMessageId).remove();
				}
			});
		}
	}
	// 删除一组短信：包括收件箱和发件箱
	$.mk.message.delGroupReceiveMessage=function(friendId){
		if(confirm('确定删除该组信息吗？')){
			$.ajax({
				url:"/mokoMessage|delGroupReceiveMessage.action",
				type:"post",
				data:{"touserid":friendId},
				success:function(response){
					$.location("/userMessageAction|receiveMessage.action");
				}
			});
		}
	}
	// 删除多组短信：包括收件箱和发件箱
	$.mk.message.delMultiGroupReceiveMessage=function(chkName){
		var checkBoxList = document.getElementsByName(chkName);
		if(checkBoxList==null)
			return;
		var chkIds="";
		for(var i=0; i<checkBoxList.length; i++) {
			if(checkBoxList[i].checked) {
				chkIds += checkBoxList[i].value+",";
			}
		}
		if(chkIds=="") {
			alert("你还没有选择项。");
			return;
		}
		if(confirm('确定删除所选用户组里收件箱和发件箱中的所有短信吗？')){
			$("#userDelete").show();
			$.ajax({
				url:"/mokoMessage|delMultiGroupReceiveMessage.action",
				type:"post",
				data:$("#userinfoform").serialize(),
				success:function(response){
					if(response!=""){
						$("#userDelete").hide();
						var arryCount = response.split(",");
						var allcount=parseInt($("#spreceive").html());
						$("#spreceive").html(allcount-arryCount[0].split(":")[1]);
						allcount=parseInt($("#spsend").html());
						$("#spsend").html(allcount-arryCount[1].split(":")[1]);
						var arryChkId = chkIds.split(",");
						for(var i=0;i<arryChkId.length;i++){
							$("#divReceiveMessage_"+arryChkId[i]).remove();
						}
						if($("#mokoinfosformcheckbox").attr('checked'))
							$("#mokoinfosformcheckbox").attr('checked',false);
					}
				}
			});
		}
	}
	// 清空收件箱
	$.mk.message.delAllGroupReceiveMessage=function(chkName){
		if(confirm('确定清空收件箱和发件箱里的所有短信吗？')){
			$("#userDelete").show();
			$.ajax({
				url:"/mokoMessage|delAllGroupReceiveMessage.action",
				type:"post",
				data:"",
				success:function(response){
					$("#userDelete").hide();
					$("#spreceive").html(0);
					$("#spsend").html(0);
					$("#divReceiveMessageContent").html("");
				}
			});
		}
	}
	// 删除全部
	$.mk.message.delectMessages=function(formname,chkAll,actionUrl,objId,objUl,objSpan,objPage){
		if(!confirm('确定删除全部信息吗？')){
			return false;
		}
		if(document.getElementById(chkAll).checked==true){
			document.getElementById(chkAll).checked=false;
		}
		document.getElementById(objId).style.display="block";
		var deleteMessage = document.getElementById(formname); 
		
		$.ajax({
			url:actionUrl,
			type:"post",
			data:$("#"+deleteMessage.id).serialize(),
			success:function(response){
				if(objSpan!='')
					document.getElementById(objSpan).innerHTML=0;
				if(objPage!='')
					document.getElementById(objPage).style.display="none";
				document.getElementById(objId).style.display="none";
				document.getElementById(objUl).style.display="none";
			}
		});
	}

	// 查看某条短信的详细信息
	$.mk.message.seeMessageDetail=function(friendId,isRead){
		if(isRead=="T"){
			$("#btnToSee_"+friendId).remove();
			$("#aSimple_"+friendId).hide();
			$("#aDetail_"+friendId).show();
		}else{
			$.ajax({
				url:"/userMessageAction|setMessageReadStatus.action",
					type:"post",
					data:"friendId="+friendId,
					success:function(response){
						$("#btnToSee_"+friendId).remove();
						$("#imgIcon_"+friendId).remove();
						$("#aSimple_"+friendId).hide();
						$("#aDetail_"+friendId).show();
					}
			});
		}
		$.addShort2Url("aDetail_"+friendId);
		$.mk.face.formatImages("divReceiveMessage_"+friendId);  // 处理表情
	}
	
	/**---------------------事件评论-----------------------------------*/
	/**
	 * 显示事件评论 0:普通评论 1:联想评论
	 */
	$.showEventComment=function(type){
		if($("#event_Id").size() == 0)
			return ;
		var eventID = $("#event_Id").val();
		if(eventID == "" || eventID == "0")
			return ;
		$.ajax({
			url:"/eventShow|showEventCommentAjax.action",
			type:"post",
			data:{eventID:eventID,type:type},
			success:function(response){
				if($("#eventComment-page-loading").size() > 0)
					$("#eventComment-page-loading").hide();
				if(response!="dataErr"){
					$("#showEventCommentDiv").html(response);
					$("#showEventCommentDiv").show();
					//事件评论字数限制
					$("#eventCommentContent").characterLimit({substring:true});
				}
			}
		});
	}
	

	// 美空事件评论ajax分页
	$.changeEventCommentPage=function(eventID,total,page){
		var param = {
			eventID : eventID,
			curPage : page,
			totalRecords : total
		};
		$("#showEventCommentDiv").load("/eventShow|showEventCommentAjax.action", param)
	}
	
	/**
	 * 举报事件评论
	 */
	$.jvBaoEventComment=function(pinglunid){
		if(pinglunid == null || pinglunid == ""){
			alert("数据错误，请刷新页面再举报!");
			return ;
		}
		if(!confirm("你确定要举报该评论吗?"))
			return ;
		$.ajax({
			url:"/eventUpdate|jvBaoEventCommentAjax.action",
			type:"post",
			data:{pinglunID:pinglunid},
			success:function(response){
				if(response == "dataErr")
					alert("数据错误，请刷新页面再举报!");
				else if(response == "checkjvbao")
					alert("此评论已被举报过了!");
				else
					alert("举报成功!");
			}
		});
	}
	
	/**
	 * 删除事件评论
	 */
	$.delEventComment=function(userid,pinglunid,commentDivId){
		if(!confirm("你确定要删除评论吗?"))
			return ;
		$.ajax({
			url:"/eventUpdate|delEventCommentAjax.action",
			type:"post",
			data:{userID:userid,pinglunID:pinglunid},
			success:function(response){
				if(response == "dataErr")
					alert("数据错误,请刷新后页面再删除!");
				else
					$("#"+commentDivId).remove();
			}
		});
	}
	
	/**
	 * 添加美空事件评论
	 */
	$.addEventComment=function(sendId,sendingId,fromId){
		$("#"+sendId).attr("disabled",false);
		var content = $("#eventCommentContent").val();
		if(content == null || $.trim(content) == ""){
			$("#"+sendId).remove("disabled");
			alert("怎么也得写点东西吧!");
			return ;
		}
		if($.stringUtil.getContentLength(content) > 140){
			$("#"+sendId).remove("disabled");
			alert("内容应限制在140个字节内~");
			return;
		}
		$("#"+sendingId).show();
		$.ajax({
			url:"/eventUpdate|addEventCommentAjax.action",
			type:"post",
			data:$("#"+fromId).serialize(),
			success:function(response){
				if(response=="dataErr")
					alert("数据错误,请刷新后页面再评论!");
				else if(response=="reqHourly")
					alert("呃---评论发送太频繁，请稍后再发。");
				else
					$("#comment").after(response);
				$("#eventCommentContent").val("");
				$("#"+sendId).remove("disabled");
				$("#"+sendingId).hide();
			}
		});
	}
	
	/**
	 * 点击回复显示回复框
	 */
	$.huiFuComment=function(contentId,nickName){
		$("#"+contentId).focus();
		$("#"+contentId).val("回复@"+nickName+":");
	}
	
	// 换一换MSP明星计划
	$.nextMsp=function(){
		$.ajax({
			url:"/mgrindex|showMSPAjax.action",
			type:"get",
			data:{"random":Math.random()},
			success:function(response){
				$("#mspAjax").html(response);
			}
		});
	}
	
	/**
	 * 分享到新浪微博
	 */
	$.getSinaShare = function(_w,_h,shareType){
		var title = $("#shareTitle").val();
    	var picUrl = "";
    	if($("#sharePhotoUrl").size() != 0)
    		picUrl = $("#sharePhotoUrl").val();
    	var param = $.param({
    			url:location.href,
    			type:shareType,
    			count:'0', /**是否显示分享数，1显示(可选)*/
    		    appkey:'3870602502', /**您申请的应用appkey,显示分享来源(可选)*/
    			title:title, /**分享的文字内容(可选，默认为所在页面的title)*/
    		    ralateUid:'1705284204', /**关联用户的UID，分享微博会@该用户(可选)*/
    			pic:picUrl, /**分享图片的路径(可选)*/
    			rnd:new Date().valueOf()
    		});
    	document.write('<iframe allowTransparency="true" frameborder="0" scrolling="no" src="http://hits.sinajs.cn/A1/weiboshare.html?' + param + '" width="'+ _w+'" height="'+_h+'"></iframe>')
    };
})(jQuery1);

/*------------登录操作-------------*/
(function($){
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.login == "undefined") {
		$.mk.login = {};
	}

	// 检测是否按下enter键
	$.mk.login.enter=function(event, formDialog) {
		var evt = event?event:window.event;
		if(13 == evt.keyCode) {
			if($("#login-pass").val()!=""&&$("#login-pass").val()!=null){
				if(formDialog)
					$.mk.login.dialogCheckLogin();
				else
					$.mk.login.checkLogin();
			}
		}
	}
	//登录页右侧随机图片
	_changeBg = function() {
		var picNo = Math.round(Math.random()*3);
		$("#login-mokoman").attr("src",mokosimg+"/images/mokoman_" +picNo+ ".jpg");
	}
	//检查登录数据
	_checkLoginData = function(){
		var emailReg = /\b(^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$)\b/;
		var usermingzi = $.trim($("#login-email").val());
		var userkey = $("#login-pass").val();
		if((usermingzi=="") || (!emailReg.test(usermingzi)) || (userkey=="") || (userkey.length<6) || (userkey.length>24)) {
			$("#login-tip").show();
			$("#login-tip-error-title").show();
			$("#login-tip-error-content").show();
			return false;
		}
		// 将用户登录类型记入cookie
		$.setCookie("LAST_LOGIN_EMAIL",usermingzi,15);
		$("#login-email").val(usermingzi);
		return true;
	}
	$.mk.checkCookie = function(cookieName){
		// cookie 验证 一天注册不超过2次
		var registerCookie = $.getCookie(cookieName);
		var cookieNum = 1;
		if(registerCookie=="")
			$.setCookie(cookieName,1,1);	//客户端取不到cookie表示第一次注册,设置1个一天超时的cookie
		else
			var cookieNum = parseInt(registerCookie);
		return cookieNum;
	}
	// 弹出层登录操作
	$.mk.login.dialogCheckLogin=function(){
		$("#login-tip").hide();
		if(!_checkLoginData())
			return false;
		$("#login-btnLogin").attr("disabled",true);
		$("#login-logining").show();
		$.ajax({
			url:"login|loginAjax.action",
			type:"post",
			data:$("#login-loginForm").serialize(),
			dataType:"json",
			success:function(response){
				$("#login-btnLogin").attr("disabled",false);
				$("#login-logining").hide();
				if(response == "" || response == "dataErr")
					return;
				if(response.code == "success"){
					$.reload();
					return;
				}
				_showLoginTip(response);
			}
		});
	}
	
	// 页面登录操作
	$.mk.login.checkLogin=function(){
		$("#login-tip").hide();
		if(!_checkLoginData())
			return false;
		var toUrl = $("#login-toUrl").val();
		var url = "login.action?tourl=" + escape(toUrl);
		var $login_loginForm = $("#login-loginForm");
		$login_loginForm.attr("action", url);
		$login_loginForm.submit();
		$("#login-btnLogin").attr("disabled", true);
		$("#login-logining").show();
	}
	
	// 根据cookie初始化登录信息
	_initLogin = function(){
		if($("#login-div").size()!=0){
			$("#login-tip").hide();
			_setDefaultEmail();
			_changeBg();
			var errMsg = {};
			errMsg.code = $("#login-errorInfo").val();
			_showLoginTip(errMsg);
		}
	}
	
	//显示登录错误提示
	_showLoginTip = function(errMsg){
		if(errMsg.code != ""){
			$("#login-tip-error-title").show();
			if(errMsg.code == "100"){
				$("#login-tip-error-title").text("");
				$("#login-tip-error-title").hide();
				$("#login-tip-error-content").text("很抱歉！由于您的账号受到过多用户投诉，因此该账号暂被冻结，七日后可恢复正常。如有疑问，请与support@moko.cn邮箱进行联系，我们会进行处理。");
				$("#login-tip-error-content").show();
			}else if(errMsg.code == "101"){
				$("#login-tip-error-title").text("");
				$("#login-tip-error-title").hide();
				$("#login-tip-error-content").text("很抱歉！由于您的账号受到过多用户投诉，因此该账号被限制登录。如有疑问，请与support@moko.cn邮箱进行联系，我们会进行处理。");
				$("#login-tip-error-content").show();
			}else if(errMsg.code == "err_count"){
				$("#login-tip-error-title").text("登录失败次数已经超过当日限定数！");
				$("#login-tip-error-title").show();
			}else if(errMsg.code == "zhuanyeUser"){
				$("#login-tip-error-title").text("认证审核资料未提交！ ");
				$("#login-tip-error-title").show();
				$("#login-tip-error-content").html("<li>你已申请注册成为专业会员，需提交认证审核资料，点击&gt;<a href=\"/user/registerApply.html\" title=\"提交认证审核资料\" hidefocus=\"true\">这里提交</a>。</li>");
				$("#login-tip-error-content").show();
			}else if(errMsg.code == "newUser"){
				$("#login-tip-error-title").text("登录邮箱未激活！  ");
				$("#login-tip-error-title").show();
				$("#login-tip-error-content").html("<li>点击&gt;<a href=\"/showActivate/" + errMsg.data + ".html\" title=\"激活\" hidefocus=\"true\">这里激活</a>。</li>");
				$("#login-tip-error-content").show();
			}else{
				$("#login-tip-error-content").show();
			}
			$("#login-tip").show();
		}
	}

	//打开登录弹出层
	$.mk.login.popNotLogin = function(url){
	    $.mokoDialog({
	    	url:url,
	    	initFn:function(){
	    		_loadEmailSuggest();
	    		_setDefaultEmail();
	    	}
	    });
	}
	
	//设置默认邮箱
	_setDefaultEmail = function(){
		var lastLoginEmail = $.getCookie("LAST_LOGIN_EMAIL");
		$("#login-email").val(lastLoginEmail);
	}
	
	//登录邮箱提示
	_loadEmailSuggest = function(){
		$('#login-email').emailSuggest();
		$('.login-content input:text').focus(function(){
			$(this).css('border-color','#f09');
		}).blur(function(){
			$(this).css('border-color','#bbb');
		});
		$('.login-content input:password').focus(function(){
			$(this).css('border-color','#f09');
		}).blur(function(){
			$(this).css('border-color','#bbb');
		});
	}
	
	$.mk.login.closeErrorAlert=function(){
		$("#login-errorInfo").val("");
		$("#login-tip").hide();
	}
	
	//登录
	$.mk.login.login=function(){
		var url = window.location.href;
		if(url.indexOf("/register/first.html") != -1)//如果注册链接改变，此判断也应改变。（作用：用户在注册页面点击登录后不能在回到注册页面）
			url = url.substring(0, url.indexOf("register/first.html"));
		$.location("/jsps/common/login.jsp?tourl=" + escape(url));
	}
	//登出
	$.mk.login.logout=function(){
		$.location('/logout.action');
	}

	$(function(){
		_initLogin();
		_loadEmailSuggest();
	});

})(jQuery1);

/**
 * 图片裁剪、缩放 相关
 */
(function($) {
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.crop == "undefined") {
		$.mk.crop = {};
	}
	//上传图片弹出框
	$.mk.crop.ajax_pop_photo=function (url,param,pich,picw,h,w){
		url = (param == "") ? url : url+"?"+$.param(param);
		$.mokoDialog({
			"url":url,
			fixed:false,
			id:"ajax_upload_dialog_parent",
			initFn:function(){
				if($("#ajax_upload_dialog .imgcutbox").size() > 0){
					$("#ajax_upload_dialog .imgcutbox").height(parseInt(pich)+2*h);
					$("#ajax_upload_dialog .imgcutbox").width(parseInt(picw)+2*w);
				}
				if($("#ajax_upload_dialog .logoCut .imageBox").size() > 0){
					$("#ajax_upload_dialog .logoCut .imageBox").height(parseInt(pich)+2*h);
					$("#ajax_upload_dialog .logoCut .imageBox").width(parseInt(picw)+2*w);
				}
				$("#ajax_upload_dialog .imgcutT,.imgcutB").height(h);
				$("#ajax_upload_dialog .imgcutT,.imgcutB").width(parseInt(picw));
				$("#ajax_upload_dialog .imgcutT,.imgcutB").css("left",w);
				$("#ajax_upload_dialog .imgcutR,.imgcutL").height(parseInt(pich)+2*h);
				$("#ajax_upload_dialog .imgcutR,.imgcutL").width(w);
				if($("#ajax_upload_dialog .imgsizer").size() > 0)
			    	$("#ajax_upload_dialog .imgsizer").slider({value:50});
			    if($("#ajax_upload_dialog .logoCut .bg").size() > 0)
			    	$("#ajax_upload_dialog .logoCut .bg").slider({value:50});
			   	$("#ajax_upload_dialog_parent").addClass("picPop");
			}
		});
	}
	
	//初始化展示图文，图片模块
	$.mk.crop.initPostCoverUpload = function(){
		coverId = "#picCover";
		$(".imgcutbox").height(452);
		$(".imgcutbox").width(468);
		$("#picCover .imgcutT").height(101);
		$("#picCover .imgcutB").height(101);
		$(".imgcutT,.imgcutB").width(234);
		$(".imgcutT,.imgcutB").css("left",117);
		$(".imgcutR,.imgcutL").height(452);
		$(".imgcutR,.imgcutL").width(117);
		$(".imgsizer").slider({value:50});
	}
	
	//初始化项目图文，图片模块
	$.mk.crop.initProjectCoverUpload = function(){
		$(".imgcutbox").height(452);
		$(".imgcutbox").width(468);
		$("#picTextCover .imgcutT").height(171);
		$("#picTextCover .imgcutB").height(171);
		$("#picCover .imgcutT").height(145);
		$("#picCover .imgcutB").height(145);
		$(".imgcutT,.imgcutB").width(152);
		$(".imgcutT,.imgcutB").css("left",158);
		$(".imgcutR,.imgcutL").height(452);
		$(".imgcutR,.imgcutL").width(158);
		$(".imgsizer").slider({value:50});
	}
	
	//载入上传的图片 头像和首页封面
	$.mk.crop.loadUploadPic=function (picUrl,pich,picw,h,w){
		picUrl = $("#webServerName").val() + picUrl;
		var dg = $("#ajax_upload_dialog");
		dg.find(".boximg").remove();
		$.mokoDialog({
			content:'<div style="text-align:center; font-size:12px; color:#F09;font-family: Verdana;">载入中...LOADING</div>',
			id:"loadUploadPicDialog",
			width:360,
			height:130
		});
		var image = new Image();
		$(image).one("load",function(){
			$(this).css({visibility:""});
	    	$.mokoDialog.close("loadUploadPicDialog");
			if(image.width<picw/3||image.height<pich/3){
	    		alert("上传图片尺寸过小!");    
	    		return;
	    	}
	    	if(dg.find(".imgcutbox").size()>0)
	    		dg.find(".imgcutbox").prepend('<img id = "newImage" src="'+picUrl+'" class="boximg" style=""/>');
	    	if(dg.find(".imageBox").size()>0)
	    		dg.find(".imageBox").append('<img id = "newImage" src="'+picUrl+'" class="boximg" style=""/>');
			$.mk.crop.init_photo_box(dg,pich,picw,h,w,image.width,image.height);
			$("#newImage").css("width",image.width);
			$("#newImage").css("top",(pich+h*2-image.height)/2);
			$("#newImage").css("left",(picw+w*2-image.width)/2);
			$.mk.crop.zoom('#ajax_upload_dialog',0.1);
		})
		image.src = picUrl;
		$("#status").hide();
	    $("#picUp").val("");
	}
	
	//加载上传封面图片(展示、项目)
	$.mk.crop.loadCoverPic=function(picName,picUrl,coverType){
		var _picUrl = $("#webServerName").val()+picUrl;
		var coverUploadType = $("#coverType").val();
		$("#postCoverPicName").val(picName);
		$(coverId).find("#newImage").remove();	
		$("#statuscover").hide();
		$("#picstatuscover").hide();
		$.mokoDialog({
			content:'<div style="text-align:center; font-size:12px; color:#F09;font-family: Verdana;">载入中...LOADING</div>',
			width:360,
			height:130,
			id:"coverLoading"
			});
		var dg = $(coverId);
		var minw;
		var minh;
		var boxh;
		var boxw;
		var top;
		var left;
		
		if (coverType == "project") {
			if (coverUploadType == "picText") {
				minw = 152 / 3, minh = 111 / 3, boxh = 111, boxw = 152, top = 171, left = 158;
			} else if (coverUploadType == "pic") {
				minw = 152 / 3, minh = 163 / 3, boxh = 163, boxw = 152, top = 145, left = 158;
			}
		} else if (coverType == "post") {
			if (coverUploadType == "picText") {
				minw = 234 / 3, minh = 170 / 3, boxh = 170, boxw = 234, top = 141, left = 117;
			} else if (coverUploadType == "pic") {
				minw = 234 / 3, minh = 250 / 3, boxh = 250, boxw = 234, top = 101, left = 117;
			}
		}
		var image = new Image();
		$(image).one("load",function(){
			$(this).css({visibility:""});
			$.mokoDialog.close("coverLoading");
			if(image.width<minw||image.height<minh){
	    		alert("上传图片尺寸过小!");    
	    		return;
	    	}
	    	dg.find(".imgcutbox").prepend('<img id="newImage" src="'+_picUrl+'" class="boximg" style=""/>');
			$.mk.crop.init_photo_box(dg,boxh,boxw,top,left,image.width,image.height);
			$("#newImage").css("width",image.width);
			$("#newImage").css("top",(boxh+top*2-image.height)/2);
			$("#newImage").css("left",(boxw+left*2-image.width)/2);
			$.mk.crop.zoom(coverId,0.1);
		});
		image.src = _picUrl;
	}
	
	/**
	 * 裁剪操作 拖动及缩放算法
	 * height:裁剪高度
	 * width:裁剪宽度
	 * top_from:上挡板的高
	 * left_from:左挡板的宽
	 * img_width:源图宽度
	 * img_height:源图高度
	 */
	$.mk.crop.init_photo_box=function(dg,height,width,top_from,left_from,img_width,img_height){
	    dg=$(dg)
	    var top_to=top_from+height,
	    left_to=width+left_from,
	    midt=top_to-height/2,midl=left_to-width/2,
	    boximg = dg.find('.boximg').draggable(),
		imgsizer=dg.find('.imgsizer').size()>0?dg.find('.imgsizer'):imgsizer=dg.find('.logoCut .bg'),
	    diff_height = img_height - height,diff_width=img_width-width;
	    diff_height = diff_height==0?1:diff_height;
	    diff_width = diff_width ==0?1:diff_width;
	    wh=img_width/img_height;
	    boximg[0].info=function(){
	        var pos = boximg.position(),t=pos.top,l=pos.left;
	        var time = boximg.height()/img_height;
	        return {
	            times:time,
	            x1:left_from-l,
	            y1:top_from-t,
	            x2:left_to-l,
	            y2:top_to-t
	        };
	    }
	    
	    var ihh = (img_height-height)*50/height;
	    var iww = (img_width-width)*50/width;
	    var sizerValue = ihh<=iww?ihh:iww;
	    if(sizerValue>50)
	    	sizerValue = 50;	
	   	if(sizerValue==0)
	   		sizerValue = 1;
	    imgsizer.slider("value",sizerValue);
	    imgsizer.slider('option','slide',
	    function(event, ui) {
	        imgsizer[0].resize(ui.value)
	    });
	    var pad = 2; //图片拖拽及缩放的边缘填充值
	    function dgc(w,h){
	        var off = boximg.offset(),pos=boximg.position(),dl=off.left-pos.left,dt=off.top-pos.top;
	        boximg.draggable('option','containment',[left_to-w+dl+pad,top_to-h+dt+pad,left_from+dl-pad,top_from+dt-pad])
	    }
	    dgc(img_width,img_height)
	    var use_height = (img_width/width)>(img_height/height)
	    imgsizer[0].resize = function (v){
        	//var v= v/50;
        	if(use_height){
        		//diff_height*v/sizerValue 	缩放的比例
        		//(height+pad*2)			图片缩放的底线高度
	            h=diff_height*v/sizerValue+(height+pad*2),
	            w=wh*h;
            }else{
            	w=diff_width*v/sizerValue+(width+pad*2);
            	h=w/wh;
            }
            
            now_h=boximg.height(),//now_h当前图片高
            now_w=boximg.width(),
            pos = boximg.position(),
            new_top=pos.top-(now_h-h)*(pos.top-midt)/now_h,
            new_left=pos.left-(now_w-w)*(pos.left-midl)/now_w,         
            css={
                height:h+"px",
                width:w+"px",
                top:new_top,
                left:new_left
            };
			if(new_top+pad>=top_from)css.top=top_from-pad;//+pad,-pad  是给图片缩放的边缘填充
	        if(new_top+h-pad<=+top_to)css.top=top_to-h+pad;
	        if(new_left+pad>=left_from)css.left=left_from-pad;
			if(new_left+w-pad<=left_to)css.left=left_to-w+pad;
	        css.top+="px";
	        css.left+="px";        
	        boximg.css(css);
	        dgc(w,h)
	   }
	}
	
	// 图片缩放
	$.mk.crop.zoom = function(css,dir){
	    var sr=$(css),v="value";
	    var s;
		if(sr.find(".imgsizer").size() > 0)
			s=sr.find(".imgsizer");
		if(sr.find(".logoCut .bg").size() > 0)
			s=sr.find(".logoCut .bg");
		var nv=s.slider(v),av=nv+5*dir,av=av>0?(av>100?100:av):0;
	    if(av==nv||!$(".boximg")[0])return;
	    s[0].resize(av);
	    s.slider(v,av);
	}
	
	/**
	 * 图片预览
	 * @param {} uploadType 上传类型
	 * @param {} picDivID 滤镜外层Div  Id
	 * @param {} zoom	预览图片对象<img> Id
	 * @param {} picNameID	图片名称Id
	 * @param {} progressId	预览中提示Id
	 * @param {} coverType 封面类型
	 * @param {} coverTitle	封面文字Id
	 */
	$.mk.crop.pre_pic = function(uploadType,picDivID, zoom,picNameID,progressId,coverType,coverTitle){
		var bimg = $(picDivID).find(".boximg")[0];
		var picName = $("#" + picNameID).val();
		if(!bimg || picName == ""){
			alert("请上传图片");
			return;
		}
		var picInfo = [];
	    var info = bimg.info();
	    for(var i in info){
	    	picInfo.push(info[i]);
	    };
	    _show_pre_pic(uploadType,zoom, picInfo,picName,progressId,coverType,coverTitle);
	}
	
	/**
	 * 上传预览
	 * @param {} uploadType 上传类型
	 * @param {} zoompic 预览图片对象<img> Id
	 * @param {} picInfo 滤镜坐标和缩放比例
	 * @param {} picName 图片名称
	 * @param {} progressId 预览中提示Id
	 * @param {} coverType 封面类型
	 * @param {} coverTitle 封面文字
	 */
	_show_pre_pic = function(uploadType,zoompic, picInfo,picName,progressId,coverType,coverTitle){
		if($("#zoompicstr").size()>0)
			$("#zoompicstr").css("visibility","visible");   //预览头像,显示“预览中...”
		var times = picInfo[0];
		var x1 = parseInt(picInfo[1]);
		var y1 = parseInt(picInfo[2]);
		var x2 = parseInt(picInfo[3]);
		var y2 = parseInt(picInfo[4]);
		var	ajaxParam = {"p[0].uploadType":uploadType,"p[0].uploadServer":$("#uploadServerName").val(),"p[0].coverType":coverType,"p[0].src":picName,"p[0].x1":x1,"p[0].y1":y1,"p[0].x2":x2,"p[0].y2":y2,"p[0].times":times};
		if(coverTitle)
			ajaxParam = {"p[0].uploadType":uploadType,"p[0].uploadServer":$("#uploadServerName").val(),"p[0].coverType":coverType,"p[0].src":picName,"p[0].x1":x1,"p[0].y1":y1,"p[0].x2":x2,"p[0].y2":y2,"p[0].times":times,"p[0].coverTitle":coverTitle};
		$("#" + progressId).show();
		if(uploadType == "face_dynamic_pre" || uploadType == "face_senior_dynamic")
			$.mk.face.pre_face_ajax(ajaxParam,uploadType);
		else if(uploadType == "user_header")
			$.mk.mymoko.pre_logo_ajax(ajaxParam, zoompic);
		else{
			$("#" + progressId).css("visibility","visible");
			_pre_cover_ajax(ajaxParam,zoompic,progressId,uploadType);
		}
	}
	
	/**
	 * ajax请求远程裁剪图片
	 * @param {} ajaxParam	请求参数 json格式
	 * @param {} zoompic 预览图片对象<img> Id
	 * @param {} progressId 预览中提示Id
	 */
	_pre_cover_ajax = function(ajaxParam, zoompic, progressId,uploadType){
		var url = "/uploadPre|postCover_pre.action";
		if(uploadType == "project_cover")
			url = "/uploadPre|projectCover_pre.action";
		$.ajax({
			url:url,
			type:"post",
			dataType:"json",
			data:ajaxParam,
			cache:false,
			success:function(response){
				$("#" + progressId).css("visibility","hidden");
				if(response.code != "1"){
					alert("封面预览出错!");
					return ;
				}
				var prePicName = $("#webServerName").val() + response.visitPath;
				$("#"+zoompic).attr("src", prePicName);
			}
		})	
	}
})(jQuery1);

/**
 * 定时消息
 */
(function($){
	
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.msg == "undefined") {
		$.mk.msg = {};
	}
	
	
	// 新消息提示定时器
	var newMessageTimer = null,
	// 声音消息提示 标记数
	oldMessageTotalCount = 0;
	
	/*
	 * messageCheckTime	消息请求间隔时间 
	 * musicDomain		flash播放器域名 
	 * wkey				用户weblogKey
	 */ 
	$.mk.msg.headerNewMessage = function(messageCheckTime, musicDomain, wkey){
		var time = $("#" + messageCheckTime).val();
		var domain = $("#" + musicDomain).val();
		setTimeout(function() { _strTime(domain,wkey); }, 500);
		newMessageTimer = setInterval(function(){
			//是活动状态下才请求
			if (isActive)
				_strTime(domain, wkey);
		}, time);
		_leaveListener(1000 * 60 * 3);
	}
	
	//离开监听
	var isActive = true;
	var _leaveListener = function(leaveTime, rouseCallback) {
		// 离开状态监听定时器（如果发现在活动，就重新计时）
		function leaveTimeout() {
			return setTimeout(function() {
						isActive = false;
					}, leaveTime);
		}
		$.each(["mousemove", "keydown", "scroll"], function(i, name) {
			$(document).bind(name + ".activeListen", function() {
				if (isActive == false && rouseCallback)
					rouseCallback();
				isActive = true;
				// 如果页面有动作，则重新计时
				clearTimeout(timer);
				timer = leaveTimeout();
			});
		});
		var timer = leaveTimeout();
	}
	
	/**
	 * 忽略全部新消息提示
	 * @param {} musicDomain flash播放器域名
	 * @param {} wkey 用户weblogKey
	 */
	$.mk.msg.cleanAllPromptMessage = function (musicDomain,wkey){
		$.ajax({
			url:"/userMessageAction|delAllPromptMessage.action",
			type:"post",
			success:function(response){
				_removeMsgUl();
				_strTime(musicDomain,wkey);
			}
		});
	}
	
	/*
	 * 消息提示 
	 * TmessageCounts:短信的数量 
	 * TnotReadCommentCount:评论的数量
	 * TmokoMessageCount:系统消息的数量 
	 * TnewfsCount:新增粉丝数量 
	 * TatmeCount:@提到我数量
	 */
	_hintAllInfo = function (TmessageCounts,TnotReadCommentCount,TmokoMessageCount,TnewfsCount,TatmeCount,TvoteCount,musicDomain,wkey,userId){
		var newMessageTotalCount = parseInt(TmessageCounts) + parseInt(TnotReadCommentCount) + parseInt(TmokoMessageCount) + parseInt(TnewfsCount) + parseInt(TatmeCount) + parseInt(TvoteCount);
		
		if(TmessageCounts>oldMessageTotalCount) {// 保证只有一次声音提示
			_voiceInfo(musicDomain);
			oldMessageTotalCount = TmessageCounts;
		}
		
		if(newMessageTotalCount>0){// 提示
			_labelInfo(TmessageCounts,TnotReadCommentCount,TmokoMessageCount,TnewfsCount,TatmeCount,TvoteCount,musicDomain,wkey,userId);
			_setUserMessage();
		}else// 还原
			_removeMsgUl();
	}
	
	/*
	 * 新消息提示
	 * musicDomain flash播放器域名
	 * wkey 用户weblogKey
	 */
	_strTime = function (musicDomain,wkey){
		$.ajax({
			url:"/mokoMessage|getUserMessageAjaxmessagemokocc.action",
			type:"post",
			data:{"random":Math.random()},
			success:function(response){
				var msg = eval("(" + response + ")");	
				// 返回状态标志符 0:错误的用户Id 1:请求成功,没有新消息 2:请求成功,有新消息并返回新消息数量
				if(msg.status == "1")
					_hintAllInfo(0,0,0,0,0,musicDomain,wkey,msg.userId);	// 没有新消息
				else if(msg.status=="2")
					_hintAllInfo(msg.duanxincount,msg.commentcount,msg.syscount,msg.newfscount,msg.atmecount,msg.votecount,musicDomain,wkey,msg.userId);
				else
					clearInterval(newMessageTimer);
			}
		})
	}
	
	/**
	 * 新消息moko声音提示
	 * musicDomain flash播放器域名
	 */
	_voiceInfo = function (musicDomain){
		var flashUrl = musicDomain + "/flash/mokovoice.swf";
		var voice = '<span id="messageVoice" style="visibility:hidden;">' +
						'<object id="wmsgsound"	classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="0" height="0">'+ 
							'<param name="movie" value="'+flashUrl+'" /><param name="quality" value="high" /><param name="loop" value="0" />'+ 
							'<embed name="wmsgsound" src="'+flashUrl+'" loop="0"	quality="high"	pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="0" height="0"></embed>' +
						'</object>' +
					'</span>';

		$("#messageVoice").remove();
		$(document.body).append(voice);
	}
	
	/**
	 * 新消息头部标签
	 * @param {} TmessageCounts 短信的数量
	 * @param {} TnotReadCommentCount 评论的数量
	 * @param {} TmokoMessageCount 系统消息的数量
	 * @param {} TnewfsCount 新增粉丝数量
	 * @param {} TatmeCount 提到我数量
	 * @param {} musicDomain flash播放器域名
	 * @param {} wkey 用户weblogKey
	 */
	_labelInfo = function (TmessageCounts,TnotReadCommentCount,TmokoMessageCount,TnewfsCount,TatmeCount,TvoteCount,musicDomain,wkey,userId) {
		var $msgMore = $('#msgMore');
		if($msgMore[0] == undefined){
			$msgMore = $('<ul id="msgMore" class="msg-tip">');
			$msgMore.appendTo(document.body);
			$msgMore.smartFloat("headerNickName");
		}
		var divHtml = '';
		if(TmessageCounts > 0) 
			divHtml += '<li><a hidefocus="true" href="/userMessageAction|receiveMessage.action"><span>(' + TmessageCounts + ')</span>短信</a></li>';
		if(TnotReadCommentCount > 0)
			divHtml += '<li><a hidefocus="true" href="/commentAction|showCommentsData.action"><span>(' + TnotReadCommentCount + ')</span>评论</a></li>';
		if(TatmeCount > 0)
			divHtml += '<li><a hidefocus="true" href="/mgrindex.action?showType=atblog"><span>(' + TatmeCount + ')</span>@提到我</a></li>';
		if(TnewfsCount > 0)
			divHtml += '<li><a hidefocus="true" href="/subscribeShowList|fansAll.action?curpage=1&wKey=' + wkey + '"><span>(' + TnewfsCount + ')</span>粉丝</a></li>';
		if(TmokoMessageCount > 0)
			divHtml += '<li><a hidefocus="true" href="/userMessageAction|systemMessages.action"><span>(' + TmokoMessageCount + ')</span>系统</a></li>';
		if(TvoteCount > 0)
			divHtml += '<li><a hidefocus="true" href="/mtg/'+userId+'/0/index.html"><span>(' + TvoteCount + ')</span>美空超级美女榜</a></li>';
		divHtml += '<h3 class="ctrl"><a href="javascript:void(0);" onclick="jQuery1.mk.msg.cleanAllPromptMessage(\'' + musicDomain + '\',\'' + wkey + '\');return false;" hidefocus="true">全部忽略</a></h3>';
		
		$msgMore.html(divHtml);
	}
	
	_removeMsgUl = function (){
		if($("#msgMore").size() > 0)
			$("#msgMore").remove();
	}
	
	// 处理短信页面的新短信显示
	_setUserMessage = function (){
		var receivePage = document.getElementById("divReceiveMessageContent");	// 是否在收件箱页面
		if(receivePage != null){
			_shouJianTime();
		}
		return;
	}
	// 请求新短信数据
	_shouJianTime = function (){
		var type = 1;
		if(document.getElementById("divReceiveAndSendMessageContent")==null)
			type = 0;
		$.ajax({
			url:"/mokoMessage|shouJianMessage.action",
			type:"get",
			data:{"type":type},
			cache:false,
			success:function(response){		
				_setMessagePage(response);
			}
		});
	}
	
	// 处理新短信显示
	_setMessagePage = function (jsonData){
		if(jsonData.length <= 0)
			return;
		var checkBoxList = document.getElementsByName("receive");
		var chkFriendIds = "";
		if(checkBoxList!=null){
			for(var i=0; i<checkBoxList.length; i++) {
				chkFriendIds += checkBoxList[i].value + ",";
			}
		}
		var jsonM = eval("("+jsonData+")");	
		var size = jsonM.count;
		if(size != null && size > 0){
			var messageHtml = "",mid = 0,wkey = "",logourl = "",sendtime = "",nickName = "",content = "",fromuserid = "",userLevelTag = "",messageTotal = "";
			var isPoliceStr = "",cardispassStr = "",lastPage = "";
			for(var i = 0; i < size; i++){
				mid = jsonM.mlist[i].id;
				wkey = jsonM.mlist[i].wkey;
				logourl = jsonM.mlist[i].LogoUrl;
				sendtime = jsonM.mlist[i].sendtime.substr(2);
				nickName = jsonM.mlist[i].nickName;
				fromuserid = jsonM.mlist[i].fromuserid;
				userLevelTag = jsonM.mlist[i].userLevelTag;
				content = jsonM.mlist[i].content;
				messageTotal = jsonM.mlist[i].messageTotal;
				if(jsonM.mlist[i].isPolice == "T")
					isPoliceStr= '<span class="mainColor weight700">巡警&nbsp;</span>';
				if(jsonM.mlist[i].cardispass == "T")
					cardispassStr = '<img class="sIdPhotoOn" src="'+mokosimg+'/images/n.gif" title="已提供身份证明" alt="已提供身份证明" />';
				if(document.getElementById("divReceiveAndSendMessageContent")==null){
					lastPage = jsonM.mlist[i].lastPage;
					messageHtml =  _getReceiveMessage(fromuserid,content,sendtime,wkey,nickName,userLevelTag,cardispassStr,isPoliceStr,logourl,messageTotal,lastPage);
					fromuserid = fromuserid+",";
					if(chkFriendIds != "" && chkFriendIds.indexOf(fromuserid)!=-1)
						$("#divReceiveMessage_"+fromuserid).remove();
					else
						chkFriendIds += fromuserid;
				}else{
					if($("#hidFriendId").val()==fromuserid){
						messageHtml =  _getReceiveDetailMessage(i,wkey,nickName,userLevelTag,cardispassStr,isPoliceStr,fromuserid,mid,content,sendtime,logourl);
					}
				}
				if(messageHtml != "")
					$("#hfID").before(messageHtml);
			}
			if(document.getElementById("divReceiveAndSendMessageContent")!=null){  // 处理短信聊天页面
				$.mk.face.formatImages("divFormatImages");  // 处理表情
				$("#textLength").html(150);
				$.focusLastTextArea("txtContent_0");
			}
			$("#spreceive").html(parseInt(jsonM.totalCount));  // 处理短信数量
		}
	}
	// 获取收件箱信息拼接html串
	_getReceiveMessage = function (fromuserid,content,sendtime,wkey,nickName,userLevelTag,cardispassStr,isPoliceStr,logourl,messageTotal,lastPage){
		var scontent = "";
		if(content.length>12)
			scontent=content.substring(0,12)+"...";
		else
			scontent=content;
		var messageHtml  =  '<div id="divReceiveMessage_'+fromuserid+'" class="msgList c bDashedOn">'+
							'	<div class="r">'+
							'		<p>'+
							'			<span class="font10 thirdColor r"><span class="font12">共'+messageTotal+'条短信&nbsp;&nbsp;</span>'+sendtime+'</span>'+
							'           <img class="online" src="'+mokosimg+'/images/n.gif"  alt="在线" title="在线"/>'+
							'			<a class="mainWhite" href="'+wkey+'" title="'+nickName+'" hidefocus="true">'+nickName+'</a>'+
							userLevelTag+'&nbsp;'+
							cardispassStr+
							isPoliceStr+
							'		</p>'+
							'		<div class="text">'+
							'           <span><a id="btnToSee_'+fromuserid+'" class="mainWhite under" href="javascript:void(0)" title="查看完整内容" hidefocus="ture" onclick="jQuery1.mk.message.seeMessageDetail('+fromuserid+',\'F\');return false;">&gt;查看</a><a class="mainWhite under" href="javascript:void(0)" title="回复" hidefocus="ture" onclick="jQuery1.mk.mymoko.seeMessageBox('+fromuserid+','+lastPage+');return false;">&gt;回复</a></span>'+
							'			<a id="aSimple_'+fromuserid+'" class="lesserMain weight700" href="javascript:void(0)" hidefocus="ture" onclick="jQuery1.mk.message.seeMessageDetail('+fromuserid+',\'F\');return false;">'+scontent+'</a>'+
							'			<pre id="aDetail_'+fromuserid+'" style="display:none;" class="lesserColor">'+content+'</pre>'+
							'		</div>'+
							'	</div>'+
							'	<img id="imgIcon_'+fromuserid+'" class="nMsg" alt="新短信" title="新短信" src="'+mokosimg+'/images/n.gif"/>'+
							'	<input name="receive" id="receive" type="checkbox" value="'+fromuserid+'" /><a class="imgBorder" href="'+wkey+'" target="_blank" hidefocus="ture"><img src="'+logourl+'" /></a>'+
							'</div>';
		return messageHtml;
	}
	// 获取短信聊天拼接html串
	_getReceiveDetailMessage = function (i,wkey,nickName,userLevelTag,cardispassStr,isPoliceStr,fromuserid,mid,content,sendtime,logourl){
		var messageHtml = '<div id="divAppMessage_'+i+'" class="msg clearfix">'+
					  	'	<div class="r">'+
						'		<p class="clearfix">'+
						'			<span class="lesserColor font12 weight400 r">'+
						'				<a class="thirdWhite font12 under" href="javascript:void(0)" onclick="jQuery1.black('+fromuserid+');return false;" hidefocus="true">拉黑</a>'+
						'				<a class="thirdWhite font12 under" href="javascript:void(0)" onclick="jQuery1.mk.message.setSafeMessage('+mid+'); return false;" hidefocus="true">复制到保险箱</a>'+
						'			</span>'+
						'	      		<img class="online" src="'+mokosimg+'/images/n.gif" alt="在线" title="在线"/>'+
						'				<a class="mainWhite" href="'+wkey+'" title="'+nickName+'" hidefocus="true">'+nickName+'</a>'+
										userLevelTag+'&nbsp;'+
										cardispassStr+
										isPoliceStr+
						'		</p>'+
						'		<div class="borderOn lesserColor">'+
						'			<img class="arrow_1 bg" src="'+mokosimg+'/images/n.gif" />'+
						'           <pre class="lesserColor lineheight15">'+content+'</pre>'+
						'			<p class="thirdColor font12">'+sendtime+'</p>'+
						'		</div>'+
						'		<p class="thirdColor font12 del"><a class="thirdWhite font12" href="javascript:void(0)" onclick="jQuery1.mk.message.delSingleReceiveMessage('+mid+','+fromuserid+',\'divAppMessage_'+i+'\');return false;" hidefocus="true">删除</a></p>'+
						'	</div>'+
						'	<div class="l textMiddle">'+
						'		<a class="imgBorder" href="'+wkey+'" target="_blank" hidefocus="true"><img class="icon" src="'+logourl+'" /></a><br />'+
						'	</div>'+
						'</div>';
		return messageHtml;
	}
})(jQuery1);

/**
 * 礼物相关
 */
(function($){
	if(typeof $.mk == "undefined"){//保证有$.mk
		$.mk = {};
	}
	
	if(typeof $.mk.gift == "undefined"){
		$.mk.gift = {};
	}
	
	//显示接收礼物页面
	$.mk.gift.showReceiveGiftSmallPage = function(liId,userId){
		$("#giftSmallPageDiv").html("<p class='loading thirdColor'>读取中 Loading...</p>");
		$("#tagDiv").removeClass("set");
		$("#ul_gift").find("li").removeClass("alive");
		$("#" + liId).addClass("alive");
		$("#giftSmallPageDiv").load("/gift|showGiftReceive.action?klischeeUserId="+userId,{random:Math.random()});
	}

	/**
	 * 显示礼物接收页面
	 */
	$.mk.gift.showGiftGive=function(liId){
		$("#giftSmallPageDiv").html("<p class='loading thirdColor'>读取中 Loading...</p>");
		$("#tagDiv").removeClass("set");
		$("#ul_gift").find("li").removeClass("alive");
		$("#" + liId).addClass("alive");
		$("#giftSmallPageDiv").load("/gift|showGiftGive.action",{random:Math.random()});
	}

	/**
	 * 显示送礼页面
	 */
	$.mk.gift.showGiveGift=function(liId){
		$("#giftSmallPageDiv").html("<p class='loading thirdColor'>读取中 Loading...</p>");
		$("#tagDiv").removeClass("set");
		$("#ul_gift").find("li").removeClass("alive");
		$("#" + liId).addClass("alive");
		$("#giftSmallPageDiv").load("/gift|showGiveGiftAjaxPage.action",{random:Math.random()});
	}

	/**
	 * 礼物翻页
	 * url 请求路径
	 * showDiv 显示内容Id
	 * page 当前页
	 */
	$.mk.gift.giftChangePage=function(url,showDiv,page){
		var param = { curPage : page };
		$("#"+showDiv).html("<p class='loading thirdColor'>读取中 Loading...</p>");
		$("#"+showDiv).load(url, param, function(){
			$(window).scrollTop(0);//到顶
		})
	}

	/**
	 * 删除接收礼物记录
	 * 
	 * @param {}
	 *            giftPayId 消费明细Id
	 * @param {}
	 *            curPage 当前页
	 */
	$.mk.gift.delReceiveGift=function(giftPayId,curPage){
		var param = $.param({title:"确定删除这份礼物吗？对方那是相当的伤心...",giftPayId:giftPayId,curPage:curPage,type:"receive"});
		$.mokoDialog({url:"/jsps/gift/GiftCommAlertView.jsp?"+param,width:600});
	}

	/**
	 * 删除发送礼物记录
	 * 
	 * @param {}
	 *            giftPayId 消费明细Id
	 * @param {}
	 *            curPage 当前页
	 */
	$.mk.gift.delGiveGift=function(giftPayId,curPage){
		var param = $.param({title:"确定要删除么?",giftPayId:giftPayId,curPage:curPage,type:"give"});
		$.mokoDialog({url:"/jsps/gift/GiftCommAlertView.jsp?"+param,width:600});
	}

	/**
	 * 送礼验证
	 */
	$.mk.gift.sendGift=function(){
		var sendCount = $(".moko-searchFriend").find("input[name='chooseGiftFriendList_0']:checkbox:checked").size();
		if(sendCount==0){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=15"});
			return;
		}
		if($("input[name='giftId']:radio:checked").size()==0){
			$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=14"});
			return;
		}
		var giftId = $("input[name='giftId']:radio:checked").val();
		var giftName = $("#img_" + giftId).attr("title");
		var giftDes = $("#giftDes_" + giftId).text();
		var giftMoney = $("#p_" + giftId).attr("title");
		var param = $.param({giftName:giftName,giftMoney:giftMoney,sendCount:sendCount,giftDes:giftDes});
		$.mokoDialog({url:"/jsps/gift/GiftGiveAlertView.jsp?"+param,width:600});
	}

	/**
	 * 确定送礼
	 */
	$.mk.gift.confirmGiveGift=function(){
		$.mokoDialog.close();
		$.ajax({
			url:"/gift|giftGive.action",
			type:"post",
			data:$("#giftFriendForm").serialize(),
			success:function(response){
				if(response=="success"){
					$.mokoDialog({url:"/jsps/gift/GiftGiveSuccessAlertView.jsp"});
				}else if(response == "fail"){
					$.mokoDialog({url:"/jsps/gift/GiftGiveNoMoneyAlertView.jsp",width:600});
				}
			}
		})
	}

	/**
	 * 选择送礼类型
	 * 
	 * @param {}
	 *            obj
	 */
	$.mk.gift.chooseSendType=function(obj){
		$("input[name='sendType']:checkbox").not(obj).removeAttr("checked");
	}

	$.mk.gift.confirmDel=function(giftPayId,curPage,type){
		if(type=="receive")
			$("#giftSmallPageDiv").load("/gift|delReceiveGift.action",{giftPayId:giftPayId,curPage:curPage,random:Math.random()},function(){$.mokoDialog.close();});
		else if(type=="give")
			$("#giftSmallPageDiv").load("/gift|delGiveGift.action",{giftPayId:giftPayId,curPage:curPage,random:Math.random()},function(){$.mokoDialog.close();});
	}
	
})(jQuery1);

(function($){
	if(typeof $.mk == "undefined"){
		$.mk = {};
	}
	if(typeof $.mk.msp == "undefined"){
		$.mk.msp = {};
	}
	// 打开 msp报名页面
	$.mk.msp.openMSPApply = function(elemId) {
		var topicId = $("#" + elemId).val();
		$.ajax({
			url : "/mspTopic|checkApply.action",
			type : "post",
			data : {"mspTopicItemBean.mspTopicId" : topicId},
			success : function(response) {
				if(response == null || response==""){
					return;
				}
				var mspInfo = eval("("+response+")");
				var mspStatus = mspInfo.mspstatus;
				var orderID = mspInfo.orderID;
				if (mspStatus == "success") {
					var param = $.param({topicId:topicId});
					$.mokoDialog({url:"/jsps/msp/mspApply.jsp?"+param});
					return;
				}
				if (mspStatus == "noLogin")
					$.popNotLogin();
				else if (mspStatus == "dataErr")
					alert("请正确操作！");
				else if (mspStatus == "fs")
					$.showFsAlertSuccess();
				else if (mspStatus == "end")
					alert("报名已结束!");
				else if (mspStatus == "exist")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=43&orderId="+orderID});
				else if (mspStatus == "payOK")
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=42&orderId="+orderID});
			}
		});
	}
	
	// 提交 msp报名数据
	$.mk.msp.submitMSPApply = function (elem,formId){
		if ($.trim($("#mspApplyForm_name").val()) == "") {
			alert("请输入您的真实姓名");
			$("#mspApplyForm_name").focus();
			return;
		} else if ($.trim($("#mspApplyForm_phone").val()) == "") {
			alert("请输入您的联系电话");
			$("#mspApplyForm_phone").focus();
			return;
		} else if ($.trim($("#mspApplyForm_address").val()) == "") {
			alert("请输入您的联系地址");
			$("#mspApplyForm_address").focus();
			return;
		} else if ($.trim($("#p_src").val()) == "") {
			alert("请上传个人照片");
			return;
		}
		$(elem).attr("disabled", true);
		$.ajax({
			url : "/mspTopic|saveTopicItem.action",
			type : "post",
			data : $("#"+formId).serialize(),
			success:function(response){
				if(response == null || response=="")
					return;
				var mspInfo = eval("("+response+")");
				var orderstatus = mspInfo.infos;
				var orderID = mspInfo.orderID;
				if(orderstatus=="dataerr"){
					alert("请正确操作！");
				}else if(orderstatus=="orderfail"){//订单创建失败
					$.mokoDialog.close();
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?ti=46"});
				}else if(orderstatus=="showweibo"){//weibo转发并付款
					$.mokoDialog.close();
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=6&orderId="+orderID});
					return;
				}else if(orderstatus=="success"){
					$.mokoDialog.close();
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=44&orderId="+orderID});
					return;
				}else if (response == "noLogin")
					$.popNotLogin();
				else if (response == "dataErr")
					alert("请正确操作！");
				else if (response == "fs")
					$.showFsAlertSuccess();
				else if (response == "end")
					alert("报名已结束!");
				else if (response == "exist")
					alert("你已经报过名了！");
			}
		});
	}
	
	//上传msp报名图片
	$.mk.msp.uploadPhoto = function(divId, type, fileListId, formid) {
		$("#mspApply_uploadSuccess").hide();
		$.mk.upload.getUploadStatus(divId, type, fileListId, formid);
	}
	
	//将上传完的图片设置到form中
	$.mk.msp.setPhoto = function (picsJson){
		$("#mspApply_uploadSuccess").show();
		$("#status").hide();
		$("#p_src").val(picsJson.pic[0].picName);
		$("#p_uploadServer").val($("#uploadServerName").val());
		
//		为NB拍摄计划报名添加 start
		if($("#p_src_nbps1").length>0){
			$("#p_src_nbps1").val(picsJson.pic[1].picName);
			$("#p_uploadServer_nbps1").val($("#uploadServerName").val());
		}
//		为NB拍摄计划报名添加 end
	}
	
	//msp报名后跳转到支付页面
	$.mk.msp.zhiFuMsp = function (orderId,flag){
		var weibotext = $("#sinaweibo").val();
		weibotext = escape(weibotext);
		var urlstr;
		var datastr;
		if(flag=="t"){
			urlstr = "/payManager|showYbPayIndexPageAndShareSina.action";
			datastr = {"toType":0,"isMsp":"t","weiboText":weibotext,"orderID":orderId};
		}
		if(flag=="n"){
			urlstr = "/payManager|showYbPayIndexPageOrder.action";
			datastr = {"toType":0,"isMsp":"t","orderID":orderId};
		}
		$.ajax({
			url:urlstr,
			type:"post",
			data:datastr,
			success:function(response){
				if(response == null || response == "")
					return;
				var userInfo = eval("(" + response + ")");
				var price = userInfo.price;
				var userMoney = userInfo.userMoney;
				var orderID = userInfo.orderID;
				$.mokoDialog.close();
				$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=52&price="+price+"&userMoney="+userMoney+"&order_id="+orderID});
				return;
			}
		});
	}
	//msp报名后-我要付款
	$.mk.msp.zhiFuMspBaoMing = function (orderId){
		$.ajax({
			url:"/payManager|showYbPayIndexPageOrder.action",
			type:"post",
			data:{"toType":0,"isMsp":"t","orderID":orderId},
			success:function(response){
				if(response == null || response == "")
					return;
				var userInfo = eval("(" + response + ")");
				var price = userInfo.price;
				var userMoney = userInfo.userMoney;
				var orderID = userInfo.orderID;
				$.mokoDialog.close();
				$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=52&price="+price+"&userMoney="+userMoney+"&order_id="+orderID});
				return;
			}
		});
	}
	//msp充值成功页面
	$.mk.msp.paySuccess = function (){
		$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=42"});	
	}
	//msp咨询qq
	$.mk.msp.ziXunMsp = function (){
		$.location("http://wpa.qq.com/msgrd?V=1&Uin=1936004808&Site=MOKOMsp在线咨询&Menu=no");
	}
	//检测还有多少个字可以输入
	$.mk.msp.sinaKeyPress = function (){
		var text = $("#sinaweibo").val();
		var len; 
		if(text.length>140){
			$("#sinaweibo").val(text.substr(0,140));
			len = 0;
		}else{
			len = 140 - text.length;
		}
		var show = "还可以输入"+len+"字";
		$("#zishu").html(show);
	}

	//订单明细支付订单
	$.mk.msp.payForMsp = function (price,order_id){
		$.ajax({
			url : "/orderManager|alterPay.action",
			type : "post",
			data : {"price":price,"orderID":order_id},
			success : function(response) {
				if(response == null || response == "")
					return;
				var userInfo = eval("(" + response + ")");
				var price = userInfo.price;
				var userMoney = userInfo.userMoney;
				var orderID = userInfo.orderID;
				var isMsp = userInfo.isMsp;
				$.mokoDialog.close();
				$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=45&price="+price+"&userMoney="+userMoney+"&orderID="+orderID+"&isMsp="+isMsp});
				return;
			}
		});
	}
	
	//支付订单提示框支付订单
	$.mk.msp.payMspOrder = function(price,usermoney,orderID){
		$("#userMoney").val(usermoney);
		$("#price").val(price);
		$("#orderID").val(orderID);
		if($("#overmoney").is(":checked")){//余额支付
			if(usermoney>=price){
				$.ajax({
					url : "/orderManager|payOrderWithBalance.action",
					type : "post",
					data : {"price":price,"orderID":orderID,"userMoney":usermoney},
					success : function(response) {
						if(response == null || response == "")
							return ;
						if(response == "success"){
							$.mokoDialog.close();
							$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=42"});
						}
						if(response == "fail"){
							$.mokoDialog.close();
							$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=51"});
						}
					}
				});
					
			}else{
				$("#useCount").val(1);
				$("#payMspfm").submit();
			}
			}
			else{
			$("#useCount").val(0);
			$("#payMspfm").submit();
		}
		
	}
	
	//取消订单
	$.mk.msp.cancelOrder = function(orderID){
		$.ajax({
			url:"/orderManager|cancelOrderByID.action",
			type:"post",
			data:{"orderID":orderID},
			success:function(response){
				if(response == null || response == "")
					return;
				if(response=="success")
					alert("订单取消成功!");
				else if(response=="fail")
					alert("订单取消失败!");
					window.location.reload()
			}
		});
	}
	//订单详情
	$.mk.msp.showDetail = function(orderID,orderType){
		$.ajax({
			url:"/orderManager|showOrderDetail.action",
			type:"post",
			data:{"orderID":orderID,"orderType":orderType},
			success:function(response){
				if(response == null || response == "")
					return;
				var order = eval("("+response+")");
				var orderid = order.id;
				var itemname = order.itemname;
				var tip;
				var ordertime;
				var orderstatus = order.order_status;
				var orderphone= order.phone;
				var name = order.name;
				var orderStatusContent;
				var orderTimeTitle;
				var cancelButton='';
				if(orderType==3||orderType==4){
					if(orderstatus=='1'){
						ordertime = order.register_time;
						orderStatusContent='等待付款';
						orderTimeTitle='订单时间';
						cancelButton='<div class=\"order-cancel-button\"><input class=\"btn\" type=\"button\" onclick=\"jQuery1.mk.msp.cancelOrder('+orderid+');\" value=\"取消订单\"></div>';
					}
					if(orderstatus=='2'){
						ordertime = order.pay_time;
						orderStatusContent='付款完成';
						orderTimeTitle='付款时间';
					}
					if(orderstatus=='3'){
						ordertime = order.finish_time;
						orderStatusContent='已完成';
						orderTimeTitle='完成时间';
					}
					if(orderstatus=='4'){
						ordertime = order.cancel_time;
						orderStatusContent='已取消';
						orderTimeTitle='取消时间';
					}
					tip=67;
				}else{
					if(orderstatus=='1'){
						ordertime = order.register_time;
						tip = 47;
					}
					if(orderstatus=='2'){
						ordertime = order.pay_time;
						tip = 48;
					}
					if(orderstatus=='3'){
						ordertime = order.finish_time;
						tip = 49;
					}
					if(orderstatus=='4'){
						ordertime = order.cancel_time;
					tip = 50;
				}
				}	
				var price = order.price;
				var content = order.description;
				var weburl = "/jsps/common/alertPop.jsp?tip="+tip+"&orderID="+orderid+"&orderName="+encodeURI(itemname)+"&orderTime="+ordertime+"&orderStatus="+orderstatus+"&price="+price+"&content="+encodeURI(content)+"&phone="+encodeURI(orderphone)+"&name="+encodeURI(name)+"&orderStatusContent="+encodeURI(orderStatusContent)+"&orderTimeTitle="+encodeURI(orderTimeTitle)+"&cancelButton="+cancelButton;
				$.mokoDialog({url:weburl});
			}
		});
	}
	$.mk.msp.checkOrderDetailType=function(orderid,formId){
		$.ajax({
			url : "/orderManager|checkOrderDetailType.action",
			type : "post",
			data : {
				"orderID" : orderid
			},
			success : function(response) {
				if (response == null || response == "") {
					return;
				}
				if(response=="nocomment"){
					alert("对不起，您不可以发表评论");
				}else if(response=="success"){
					$.mokoDialog({url:"/jsps/common/alertPop.jsp?tip=60&orderID="+orderid});
				}else if(response==""){
					alert("对不起，您操作出错了。");
				}
			}
		});
	}
	$.mk.msp.orderComment=function(orderId,formId){
		$.ajax({
			url : "/orderManager|insertOrderComment.action",
			type : "post",
			data : $("#" + formId).serialize(),
			success : function(response) {
				if (response == null || response == "")
					return;
				if(response=="success"){
					$.mokoDialog.close();
					alert("此次评论成功");
					$("#comment_"+orderId).html('追加评论');
				}else if (response == "dataErr") {
					alert("此次评论失败");
				}
			}
		});
	}
	
})(jQuery1);

document.createElement('header');
document.createElement('nav');
document.createElement('article');
document.createElement('section');
document.createElement('footer');
jQuery1(function(){
	//展示模块
	jQuery1('ul.post').each(function(){			
		var $this = jQuery1(this),$cover = $this.find('.cover'),$text = $cover.attr('cover-text'),$text_girl = $cover.attr('cover-girl-text'),$a = $cover.find('a');
		if(!$text){
			return ;
		}
		
		//用于首页推荐美女标识
		var $overlaygirl = jQuery1('<span></span>').css('color','#FF0099').html($text_girl);
		
		var $overlay = jQuery1('<div />',{'class':'overlay','text':$text}).append($overlaygirl).appendTo($a);
		

		$cover.hover(function(){
			$overlay.stop(true, true).slideDown(200);
		},function(){
			$overlay.stop(true, true).slideUp(200);
		});
	});

	//菜单
	jQuery1.setNavDropdownMenu();
	
	//绑定autoText 插件
	jQuery1('div.search .search-text').autoText();

	//搜索框
	jQuery1('div.search .search-type').click(function(){
		var $this = jQuery1(this),$type = $this.next('.search-text'),holder_user = "搜索会员...",holder_post = "搜索展示...";

		if($type.attr('placeholder') === holder_post){
			$this.animate({'margin-top':'-26'},function(){
				$type.unbind('.autoText').attr('placeholder', holder_user).autoText();
				if($type.val() === holder_post){
					$type.val(holder_user);
				}				
				jQuery1.checkRadio('findFormNav', 'findUser');
			});
		}
		else{
			$this.animate({'margin-top':'0'},function(){
				$type.unbind('.autoText').attr('placeholder', holder_post).autoText();
				if($type.val() === holder_user){
					$type.val(holder_post);
				}
				jQuery1.checkRadio('findFormNav', 'findPost');
			});
		}
	});
});