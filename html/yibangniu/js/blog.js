/**
	关于微博功能的js  
*/
(function($) {
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	
	if (typeof $.mk.blog == "undefined") {
		$.mk.blog = {};
	}
	
	//发布微博
	$.mk.blog.blogAdd = function(formId, actionUrl, blogContentId, blogPicId, blogVideoId, maxSize, blogAddType){
		$.mk.common.clearBlogSearchDiv();
		var $blogContent = $("#" + blogContentId);
		var blogContent = $blogContent.val();
		if($.trim(blogContent) == ""){
			alert("怎么也要写些东西哟～");
			$blogContent.focus();
			return false;
		}
		var strLength = $.stringUtil.getContentLength(blogContent, true);
		if (strLength > parseInt(maxSize)){
			alert("最多可输入" + maxSize + "个字符!");
	    	$blogContent.focus();
	    	return ;
		}
		$("#p0_uploadServer").val($("#uploadServerName").val());
		var $blogAddBtn = $("#blogAddBtn"); 
		$blogAddBtn.attr("disabled",true);
		$blogContent.val(blogContent);
		$.ajax({
			url:actionUrl,
			type:"post",
			data:$("#"+formId).serialize(),
			success:function(response){
				$blogAddBtn.attr("disabled", false);
				if(blogAddType == "@AT"){
					$.mk.message.result_hand("success","message"); //微博发布成功提示
					return;
				}
				$blogContent.val("");
				$("#" + blogPicId).val("");
				$("#" + blogVideoId).val("");
				_hideBlogTempThumb();
				$("#blogVideoNo").show();
				$("#blogVideoYes").hide();
				$("#textlefts").text(maxSize);	
				var $userBlogCount = $("#userBlogCount"); 
				if($userBlogCount.size() != 0)	
					$userBlogCount.text(parseInt($userBlogCount.text()) + 1);
				$.mk.message.result_hand("success","message"); //微博发布成功提示
				var $nMb_2 = $(".nMb_2"); 
				if($nMb_2.size() > 0)
					$nMb_2.remove();
				$("#hid_before").after(response);
				$.mk.blog.storage.del(_blogContentKey());
				//用户资料浮动层
				$(".userFloatLayer").aero();
			}
		});
	}
	
	//设置微博视频url
	$.mk.blog.chooseBlogVideo = function(videoURL){
		$("#blogVideo").val(videoURL);
		$("#blogVideoNo").attr("style","display:none");	
		$("#blogVideoYes").attr("style","display:inline");	
		$.mokoDialog.close();
	}
	//打开微博上传图片页面
	$.mk.blog.showBlogAddPicPage = function(){
		$.mk.common.clearBlogSearchDiv();
		$.mokoDialog({url:"/jsps/blog/BlogAddPicSmallList.jsp",id:"BlogAddPicSmallList",width:610});
	}
	//删除已上传的微博图片
	$.mk.blog.delBlogPic = function(){
		$("#p_src").val("");
		_hideBlogTempThumb();
	}
	//删除已上传的微博视频
	$.mk.blog.delBlogVideo = function(){
		$("#blogVideo").val("");
		$("#blogVideoNo").show();
		$("#blogVideoYes").hide();
	}
	//删除微博
	$.mk.blog.delBlogData = function(blogID,divID,type,wKey,mokoDomain){
		$.mk.common.clearBlogSearchDiv();
		if(!confirm("确定要删除吗？"))
			return;
		_delBlogDataAjax(blogID,divID,type,wKey,mokoDomain);
	}
	//删除展示微博
	$.mk.blog.delBlogPostData = function(){
		$.mk.common.clearBlogSearchDiv();
		$.mokoDialog({url:"/jsps/blog/BlogPostDelPage.jsp"});
	}
	
	var blogItemHeightCache = new Array();//缓存每条微博DIV的初始高度
	//打开图片thumb 层
	$.mk.blog.openPicDiv = function(openDivID, closeDivID,openMidDivID,blogID){
		var blogItemDivPos = $("#blogItem"+blogID).offset();
		var top = blogItemDivPos.top + blogItemHeightCache[blogID];
		$win = $(window);
		var scrollTop = $win.scrollTop();
		$("#" + openDivID).show();
		$("#" + closeDivID).hide();
		$("#picMidMsg" + blogID).hide();
		$("#" + openMidDivID).show();
		if(top < scrollTop)
			$win.scrollTop(blogItemDivPos.top);
	}
	//打开图片MID 层
	$.mk.blog.openPicMidDiv = function(openDivID, closeDivID,videoMidDivID, blogID){
		if(!blogItemHeightCache[blogID])
			blogItemHeightCache[blogID] = parseInt($("#blogItem"+blogID).css("height"));
		$("#" + closeDivID).hide();
		$("#" + videoMidDivID).hide();
		var image = new Image();	
		image.onload = function(){		
			$("#picMidWidth_" + blogID).val(image.width);
			$("#picMidHeight_" + blogID).val(image.height);
			$("#hidPicTag" + blogID).val("0");
		}
		image.src = $("#picMidImg" + blogID).attr("src");
	
		$("#" + openDivID).show();
		$("#picMidMsg" + blogID).show();
		$("#picMidTag_" + blogID).show();
	}
	//打开转发页面
	$.mk.blog.openZhuanFaBlogPage = function(blogID,nickName,zf_nickName,contentID,zf_contentID,zfCountID,blogType,delStatus,zfUserId,ycUserId,currentUserId){
		if($("#user_level").val()==5){//5=fs级别
			$.mk.blog.applyMPView(1);
			return;
		}
		$.mk.common.clearBlogSearchDiv();
		if($.mk.blog.checkIsBlack(zfUserId))
			return ;
		if(delStatus == "T"){
			alert("此微博已删除，无法转发。");
			return;
		}
		var param = $.param({"blogType":blogType,"zfCountID":zfCountID,"zfUserId":zfUserId,"ycUserId":ycUserId,"currentUserId":currentUserId});
		var url = "/jsps/blog/BlogZhuanFaSmallList.jsp?"+param;
		$.mokoDialog({
			url:url,
			fixed:false,
			initFn:function(){
				var $zf_content = $("#zf_content"); 
				$zf_content.focus();
				var blogTitle = "";
				if(blogType == 'F')//转发发布微博
					blogTitle = $("#" + contentID).html();
				else{//转发微博转发
					blogTitle = $("#" + contentID).html();
					$zf_content.text(" //@"+zf_nickName+":"+jQuery1.replaceAtUrl($.mk.face.replaceFace($("#" + zf_contentID).html())));
					jQuery1.setTextAreaCursor($zf_content[0], 0, 0);
				}
				$("#zf_blogContent").html(blogTitle);
				$("#nickName").text(nickName);
				$("#zfBlogID").val(blogID);
				$("#zf_nickName").text(zf_nickName);
				
				//微博限制字数
				$zf_content.characterLimit({numTarget:'#zf_textlefts'});
				//At 提到谁
				$zf_content.atWho();
			}
		});
	}
	//转发微博 保存
	$.mk.blog.blogZhuanFaAdd = function(formId, url, maxSize, zfCountID){
		$.mk.common.clearBlogSearchDiv();
		var $zfContent = $("#zf_content");
		var zfContent = $.trim($zfContent.val());
		if($("input[name='zfComment']:checkbox:checked").size()>0 && zfContent == ""){
			alert("怎么也要写些东西哟～");
			$zfContent.focus();
			return;
		}
		var strLength = $.stringUtil.getContentLength(zfContent, true);
		if(strLength > maxSize){
			alert("最多可输入" + maxSize + "个字符!");
			$zfContent.focus();
			return;
		}
		$("#zfBlogAddBtn").attr("disabled", true);
		$zfContent.val(zfContent);
		$.ajax({
			url:url,
			type:"post",
			data:$("#"+formId).serialize(),
			success:function(response){
				if(response == 'blogDel'){
					alert("此微博已删除，无法转发。");
					$.mokoDialog.close();
					return;
				}
				if(response == 'dataErr'){
					alert("数据错误,请刷新页面重新操作！");
					$.mokoDialog.close();
					return;
				}
				$.mokoDialog.close();
				$.mokoDialog({url:"/jsps/blog/BlogZhuanFaSuccessView.jsp",time:1,esc:false});
				var $zfCount = $("#" + zfCountID); 
				$zfCount.text(parseInt($zfCount.text())+1);
				var $userBlogCount = $("#userBlogCount");
				$userBlogCount.text(parseInt($userBlogCount.text()) + 1);
				$("#hid_before").after(response);
				//用户资料浮动层
				$(".userFloatLayer").aero();
			}
		});
	}
	
	//其他人首先 显示@at 页面信息
	$.mk.blog.atUserMsg = function(nameID, userID){
		var userId = $("#"+userID).val();
		if($.mk.blog.checkIsBlack(userId))
			return ;
		$.mokoDialog({
			url:"/jsps/blog/BlogAtAddSmallList.jsp",
			fixed:false,
			initFn:function(){
				var nickName = $("#"+nameID).val();
				var $blogContent = $("#blogContent");
				$blogContent.focus();
				$blogContent.val("对@"+nickName+" 说:");
				$("#atUserID").val(userId);
				var $blogContent = $('#blogContent');
				//微博限制字数
				$blogContent.characterLimit({numTarget:'#textlefts'});
				//At 提到谁
				$blogContent.atWho();
			}
		});
	}
	
	// 检测当前用户是否在被访问用户的黑名单内
	$.mk.blog.checkIsBlack = function(userId){
		var isOk = false;
		$.ajax({
			url:"/subscribeUpdate|checkIsBlackAjax.action",
			type:"post",
			async: false,      //ajax同步
			data:{"subscribeId":userId},
			success:function(response){
				if(response == "black"){
					isOk = true;
					$.mokoDialog({url:"/jsps/blog/BlackTiShiPage.jsp"});
				}
			}
		});
		return isOk;
	}
	 
	 //显示微博最新10条评论
	 $.mk.blog.showCommentTop = function(divId,blogId,userID,commentCount,ycUserId,nickName,blogType){
		if($("#user_level").val()==5){//5=fs级别
			$.mk.blog.applyMPView(2);
			return;
		}
		var $divIdElem = $("#"+divId);
		$divIdElem.toggle();
	 	if($("#"+divId+":visible").length <= 0)
	 		return;
	 	$.ajax({
			url:"/blogShow|showCommentListAjax.action",
			type:"post",
			data:{"blogID":blogId,"userID":userID,"ycNickName":nickName,"blogType":blogType,"ycUserId":ycUserId},
			success:function(response){
				if(response == "dataErr"){
					alert("数据错误,请刷新页面重新操作！");
					return;
				}
				$divIdElem.html(response);
				var $textarea = $("#"+blogId+"replyComments");
				$textarea.focus();
				if(parseInt(commentCount) > 10){
					$("#otherCommentDiv"+blogId).show();
					$("#otherComment"+blogId).html(parseInt(commentCount)-10);
				}
				//文本框自动撑开
				$textarea.autoResize();
				//限制文本框字数
				$textarea.characterLimit({substring:true});
				//At 提到谁
				$textarea.atWho();
				//用户资料浮动层
				$(".userFloatLayer").aero();
			}
		});
	 }
	 
	 //点回复时的操作
	 $.mk.blog.huifuComment = function(nickName,blogId,commentID){
	 	$blogReplyComments = $("#"+blogId+"replyComments");
	 	$blogReplyComments.focus();
	 	$blogReplyComments.val("回复@"+nickName+":");
	 	$("#commentID"+blogId).val(commentID);
	 }
	 
	 //微博列表评论
	 $.mk.blog.addCommentOrReComment = function(blogId,user,objCommentPrivacyId,type){
	 	if(user == null || user == ""){
	 		alert("请先登录~");
	 		return false;
	 	}
	 	if($("#"+objCommentPrivacyId).val() == "none"){
	 		alert("由于用户设置，你无法进行评论~");
	 		return false;
	 	}
	 	$blogReplyComments = $("#"+blogId+"replyComments");
		var content = $.trim($blogReplyComments.val());
		if(content==""){
			alert("怎么也要写些东西哟~");
			return false;
		}
		if($.stringUtil.getContentLength(content)>140){
			alert("内容应限制在140个字节内~");
			return false;
		}
		$blogReplyComments.val(content);
		var $sendBlogElem = $("#Send" + blogId);
		$sendBlogElem.hide();
		$("#replySending" + blogId).show();
		var url = "/blogUpdate|addBlogCommentAjax.action";
		var $commentElem = $("#commentID"+blogId);
		if($commentElem.val() != 0)
			url = "/blogUpdate|addBlogReCommentAjax.action";
		$.ajax({
			url:url,
			type:"post",
			data:$("#SendComment"+blogId).serialize(),
			success:function(response){
				if(response == "dataErr"){
					alert("数据错误,请刷新页面重新操作！");
					return;
				}
				var $commentCountElem = $("#commentCount_"+blogId);
				$commentCountElem.text(parseInt($commentCountElem.text())+1);
				$("#com_ment"+blogId).after(response);
				var $inputChkAddType = $("input[name='chkAddType']");
				if($inputChkAddType.size() != 0){
					$inputChkAddType.attr("checked",false);
					$inputChkAddType.val("F");
				}
				var $inputchkYcAddType = $("input[name='chkYcAddType']");
				if($inputchkYcAddType.size() != 0){
					$inputchkYcAddType.attr("checked",false);
					$inputchkYcAddType.val("F");
				}
				$("#addReply"+blogId).hide();
				$blogReplyComments.val("");
				if(type == "blogComment")
					$blogReplyComments.css({'height':'20px'});	
				$commentElem.val("0");
				$sendBlogElem.show();
				$("#replySending" + blogId).hide();
				//用户资料浮动层
				$(".userFloatLayer").aero();
			}
		});
	}
	//微博评论ajax分页
	$.mk.blog.changeBlogCommentPage = function(blogID,total,page){
		var param = {
			blogID : blogID,
			curPage : page,
			totalRecords : total
		};
		_loadBlogPage("/blogShow|showBlogCommentAjax.action", param)
	}
	//微博ajax分页
	$.mk.blog.changeBlogPage = function(type,total,page){
		var param = {
			showType : type,
			curPage : page,
			totalRecords : total
		};
		_loadBlogPage("/mgrindex|showBlogListAjax.action", param)
	}
	//在“我的MOKO！”切换“全部微博”及“我的微博”导航
	$.mk.blog.changeBlogType = function(type,total){
		if(type == "allblog"){
			$("#li_all").attr("class","alive");
			$("#li_all_blog").attr("class","mC bd");
			$("#li_my").attr("class","");
			$("#li_my_blog").attr("class","gC1 b");
		}else{
			$("#li_all").attr("class","");
			$("#li_all_blog").attr("class","gC1 b");
			$("#li_my").attr("class","alive");
			$("#li_my_blog").attr("class","mC bd");
		}
		$.mk.blog.changeBlogPage(type, total, 1);
	}
	
	//提示fs用户申请MP showType 1=转发  2=评论
	$.mk.blog.applyMPView = function(showType){
		var param = $.param({"showType":showType});
		$.mokoDialog({url:"/jsps/blog/BlogApplyMPView.jsp?"+param});
	}
	
	//调用浏览器本地存储保存微博内容
	$.mk.blog.saveBlogContent = function(val){
		if(val == "分享图片") return false;
		$.mk.blog.storage.set(_blogContentKey(), val);
	}
	
	//微博上传图片
	$.mk.blog.showBlogPic = function(picsJson){
		var picName = picsJson.pic[0].picName;
		$("#p_src").val(picName);
		var picNames = new Array();
		picNames.push(picName);
		_blogPicPrepare(picNames);
	}

	/**
	 * 微博图片预览
	 */
	_blogPicPrepare = function(src){
		var $param = $.param({'p[0].uploadType': "blog_pic",'p[0].src': src,'p[0].uploadServer':$("#uploadServerName").val()}, true);
		$.ajax({
		   type: "POST",
		   url: "/uploadPre|blogPic_prepare.action",
		   data: $param,
		   dataType:"json",
		   success: function(data){
		   		if(data.code != "1"){
		   			alert("图片上传出错!");
		   			return;
		   		}
		   		_showBlogTempThumb(data);
			}
		});
	}
	
	/**
	 * 设置围脖图片预览层相关信息并显示
	 */
	_showBlogTempThumb = function(picsJson){
		var $blogContent = $("#blogContent");
		if($blogContent.val() == ""){
			$blogContent.val("分享图片");
			textArea = $blogContent[0];
			end = textArea.value.length;
			textArea.focus();
			if (textArea.createTextRange) {
				var range = textArea.createTextRange();
				range.move("character", end);
				range.select();
			} else
				textArea.setSelectionRange(end, end);
		}
		var imgName = $("#picUp1").val().split("\\").pop();
		var n = imgName.lastIndexOf(".");
		var imgNamePre = imgName.substring(0, n);
		var imgNameSuf = imgName.substring(n, imgName.length);
		if(imgNamePre.length > 20) imgNamePre = imgNamePre.substring(0, 20) + "…";
		$("#blog_temp_thumb_name").text(imgNamePre + imgNameSuf);
		$("#blog_temp_thumb_img").prop("src", $("#webServerName").val() + picsJson.thumb);
		$("#blogPicNo").hide();
		$("#blogPicYes").show();
		var pos = $("#blogPicYes").position();
		$("#blog_temp_thumb").css({left : pos.left + "px", top : (pos.top + 15) + "px"}).show();
		$.mk.upload.cancelUpload("BlogAddPicSmallList");
	}
	
	/**
	 * 清除围脖图片预览层相关信息并隐藏
	 */
	_hideBlogTempThumb = function(){
		$("#blogPicYes").hide();
		var $blogContent = $("#blogContent");
		if($blogContent.val() == "分享图片"){
			$blogContent.val("");
			$blogContent.focus();
		}
		$("#blog_temp_thumb_name").empty();
		$("#blog_temp_thumb_img").prop("src", "");
		$("#blog_temp_thumb").hide();
		$("#blogPicNo").show();
	}
	// 浏览器本地存储
	$.mk.blog.storage = function(win, doc){
		var hasSupport = true,
			store = win.localStorage,
			STORE_NAME = 'localstorage',
			obj,
			support = function (){ return hasSupport },
			error = function(){ throw new Error("don't support localStorage") };		
		if (jQuery1.isIE){

			/*
				IE的 UserData
				最少也能支持640k，IE8后已经支持DOM Storage；缺点：IE only。
			*/
			store = doc.documentElement;
			try{
				store.addBehavior('#default#userdata');
				store.save(STORE_NAME);
			}catch(e){
				hasSupport = false;
			}
			if (hasSupport){
				obj = {
					set : function(key, value){
						store.setAttribute(key, value);
						store.save(STORE_NAME);
					},
					get : function(key){
						store.load(STORE_NAME);
						return store.getAttribute(key);
					},
					del : function(key){
						store.removeAttribute(key);
						store.save(STORE_NAME);
					}
				};
				
			}
		}else{
			/*
			DOM Storage
			默认支持5M存储量；缺点：IE7，IE6不支持。
			*/
			obj = {
				set : function(key, value){
					return store.setItem(key, value);
				},
				get : function(key){
					return store.getItem(key);
				},
				del : function(key){
					return store.removeItem(key);
				}
			};
		}
		if (!obj){
			obj = {
				set:error,
				get:error,
				del:error
			};
		}
		obj.support = support;
		return obj;
	}(window, document);	
	
	//加载微博ajax分页数据 
	var _loadBlogPage = function(url, param){
		var $loading = $("#loading");
		$loading.show();
		$("#ajaxMessage").load(url, param, function(){
			//用户资料浮动层
			$(".userFloatLayer").aero();
			$(window).scrollTop(0);//到顶
			$loading.hide();
		});
	},
	//删除微博方法  
	_delBlogDataAjax = function(blogID,divID,type,wKey,mokoDomain){
		$.ajax({
			url:"/blogUpdate|delBlog.action",
			type:"post",
			data:"blogID="+blogID,
			success:function(response){
				if(response == 'dataErr'){
					alert("操作错误！");
					return;
				}
				if(type=="blogDetail"){
					$.location(mokoDomain+"/"+wKey+"/index.html");
				}else{
					$("#"+divID).remove();
					$("#"+blogID+"CommentTop6").remove();
					var $userBlogCountElem = $("#userBlogCount");
					$userBlogCountElem.text(parseInt($userBlogCountElem.text()) - 1);
				}
			}
		});	
	},
	//生成存储微博内容的key
	_blogContentKey = function(){
		return "blogContent_" + $("#userId").val();
	};
	
	
	// 图片翻转插件
	jQuery1.fn.rotate = function(tag, angle, whence) {
		var p = this.get(0);	
		// we store the angle inside the image tag for persistence
		if (!whence) {
			p.angle = ((p.angle==undefined?0:p.angle) + angle) % 360;
		} else {
			p.angle = angle;
		}
	
		if (p.angle >= 0) {
			var rotation = Math.PI * p.angle / 180;
		} else {
			var rotation = Math.PI * (360+p.angle) / 180;
		}
		var costheta = Math.cos(rotation);
		var sintheta = Math.sin(rotation);
		if (document.all && !window.opera) {
			var canvas = document.createElement('img');
	
			canvas.src = p.src;
			canvas.height = p.height ;
			canvas.width = p.width;
	
			var resizefactor = 1;
			if(tag > 1){
				canvas.height = jQuery1("#picMidHeight_" + tag).val();
				canvas.width = jQuery1("#picMidWidth_" + tag).val();
				resizefactor = 420/canvas.width;
			}else{
				if(p.height > 420)
					resizefactor = 420/p.height;
			}
			canvas.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+(costheta * resizefactor)+",M12="+(-sintheta * resizefactor)+",M21="+(sintheta*resizefactor)+",M22="+(costheta*resizefactor)+",SizingMethod='auto expand')";
		} else {
			var canvas = document.createElement('canvas');
			if (!p.oImage) {
				canvas.oImage = new Image();
				canvas.oImage.src = p.src;
			} else {
				canvas.oImage = p.oImage;
			}
			
			canvas.style.width = canvas.width = Math.abs(costheta*canvas.oImage.width) + Math.abs(sintheta*canvas.oImage.height);
			canvas.style.height = canvas.height = Math.abs(costheta*canvas.oImage.height) + Math.abs(sintheta*canvas.oImage.width);
			
			if(p.height >= 440)
				canvas.style.width = "420px";
			
			var context = canvas.getContext('2d');
			context.save();
			if (rotation <= Math.PI/2) {
				context.translate(sintheta*canvas.oImage.height,0);
			} else if (rotation <= Math.PI) {
				context.translate(canvas.width,-costheta*canvas.oImage.height);
			} else if (rotation <= 1.5*Math.PI) {
				context.translate(-costheta*canvas.oImage.width,canvas.height);
			} else {
				context.translate(0,-sintheta*canvas.oImage.width);
			}
			context.rotate(rotation);		
			context.drawImage(canvas.oImage, 0, 0, canvas.oImage.width, canvas.oImage.height);
			context.restore();
		}
		canvas.id = p.id;
		canvas.angle = p.angle;
		p.parentNode.replaceChild(canvas, p);
	}
	
	jQuery1.fn.rotateRight = function(tag, angle) {
		this.rotate(tag==undefined?0:tag, angle==undefined?90:angle);  
	}
	
	jQuery1.fn.rotateLeft = function(tag, angle) {
		this.rotate(tag==undefined?0:tag, angle==undefined?-90:-angle);  
	}
	
	//图片翻转
	$.mk.blog.picMove = function (imgID, type) {
		if (document.all && !window.opera) {
			var picHeight = $("#picMidHeight_" + imgID).val();
			var tag = parseInt($("#hidPicTag" + imgID).val());
			if (type == "left") {
				tag = tag - 90;
				if (picHeight > 420 && (tag == 0 || tag == -180 || tag == -360))
					$("#picMidImg" + imgID).rotateLeft(imgID);
				else
					$("#picMidImg" + imgID).rotateLeft(0);
				if (tag == -360)
					tag = 0;
			} else {
				tag = tag + 90;
				if (picHeight > 420 && (tag == 0 || tag == 180 || tag == 360))
					$("#picMidImg" + imgID).rotateRight(imgID);
				else
					$("#picMidImg" + imgID).rotateRight(0);

				if (tag == 360)
					tag = 0;
			}
			$("#hidPicTag" + imgID).val(tag);
		} else {
			if (type == "left")
				$("#picMidImg" + imgID).rotateLeft(0);
			else
				$("#picMidImg" + imgID).rotateRight(0);
		}

	}
	
})(jQuery1);

jQuery1(function(){
	var $blogContent = jQuery1('#blogContent');
	//微博限制字数
	$blogContent.characterLimit({numTarget:'#textlefts'});
	//At 提到谁
	$blogContent.atWho();
	//微博本地存储
	
	var blogContentKey = "blogContent_" + jQuery1("#userId").val();
	var value = jQuery1.mk.blog.storage.get(blogContentKey);
	if(value)
		$blogContent.val(value).focus();
	
	//微博评论页面
	var $blogCommentContent = jQuery1('#blogCommentContent');
	$blogCommentContent.characterLimit({substring:true});
	$blogCommentContent.atWho();
	
	var $replyCommentsTextarea = jQuery1('textarea[id$=replyComments]');
	//微博评论限制字数
	$replyCommentsTextarea.characterLimit({substring:true});
	//微博评论文本框自动撑开
	$replyCommentsTextarea.autoResize();
	//At 提到谁
	$replyCommentsTextarea.atWho();
	
	//用户资料浮动层
	jQuery1(".userFloatLayer").aero();
});