// 上传图片回调函数
var flexUploadCallBack = "";
// 当前选择的模块id
var cur_id,
// 模块id， 模块的唯一标识
module_id,
// 模块上限数
maxModualCount = 40,
// 业务类型(jianjie、lianluo、post、project)
business_type,
// 可添加模块的html，初始化方法赋值
itemHtml;
(function ($) {
	
    $(function () {
		if ($("#jianjieMoudle").size() > 0) {// 简介
			business_type = "jianjie";
			itemHtml = _itemHTML(1, 2);
			flexUploadCallBack = "jQuery1.mk.mymoko.callBackCpJianjie";
		} else if ($("#lianluoMoudle").size() > 0) {// 联络
			business_type = "lianluo";
			itemHtml = _itemHTML(1, 2);
			flexUploadCallBack = "jQuery1.mk.mymoko.callBackCpLianluo";
		} else if ($("#zhaopinMoudle").size() > 0) {// 招聘
			business_type = "zhaopin";
			itemHtml = _itemHTML(1, 2);
			flexUploadCallBack = "jQuery1.mk.mymoko.callBackCpZhaopin";
		} else if ($("#projectAll,#editProjectContentAll").size() > 0) {// 工作机会
			business_type = "project";
			itemHtml = _itemHTML(1, 2, 4);
			flexUploadCallBack = "jQuery1.mk.project.callBackProjectItem";
			if ($("#projectAll").size() > 0) {
				jQuery1.mk.crop.initProjectCoverUpload();
			}
		} else if ($("#contentAll,#editContentAll").size() > 0) {// 展示
			business_type = "post";
			itemHtml = _itemHTML(1, 2, 3, 4);
			flexUploadCallBack = "jQuery1.mk.post.callBackPostItem";
			if($("#contentAll").size() > 0){
				jQuery1.mk.crop.initPostCoverUpload();
			}
		} else if ($("#editPostCoverDiv").size() > 0) {//展示封面编辑
			jQuery1.mk.crop.initPostCoverUpload();
		} else if ($("#editProjectMokoShowDiv").size() > 0) {//工作机会封面编辑
			jQuery1.mk.crop.initProjectCoverUpload();
		}else if($("#addMtgPic").size() > 0){//mtg5
			var itemCount = $("li[name='item_content']").size();
			cur_id = itemCount == 0 ? 0 : $("li[name='item_content']").last().attr("id").split("_")[1];
			business_type = "mtg5";
			flexUploadCallBack = "jQuery1.mk.mtg5.callBackMtgItem";
		}
        
        // 获取当前模块最大id
        var ids = [0];
        var objContent = $("div[id^='content_']");
        if(business_type == "mtg5")
        	objContent = $("li[id^='content_']");
        objContent.each(function () {
            ids.push(this.id.split('_')[1]);
        });
        module_id = Math.max.apply({}, ids);
        //排序现有模块
        _adjustModuleOrder();
    })

    if (typeof $.mk == "undefined") {
        $.mk = {};
    }
    if (typeof $.mk.module == "undefined") {
        $.mk.module = {};
    }
    // 文本相关
    (function () {
        // 添加文本
        $.mk.module.addText = function () {
        	if (jQuery1.mk.module.checkCount()) return;
            jQuery1.mk.module.loadModule("/jsps/item/ItemSmallTextView.jsp", null, function (response) {
                $("#content_" + cur_id).after(response);
            })
        }
        
        // 设置文本内容
		$.mk.module.setTextAreaContent = function (textId,contentId,titleId){
			$("#textInfo_"+textId).text($("#"+contentId).text());
		}
		
		// 设置文本高度
		$.mk.module.setHeight = function (objId){
			var butText = $("#heightDiv_"+objId);
			if(butText.val()=="＋增加高度"){
				$("#textInfo_"+objId).addClass("larger");	//添加文本样式类 larger以增加文本高度
				butText.val("- 减小高度");
			}else if(butText.val()=="- 减小高度"){
				$("#textInfo_"+objId).removeClass("larger");
				butText.val("＋增加高度");
			}
		}

        // 字体大小设置
        $.mk.module.changeTextSize = function (objId){
			$("#textInfo_" + objId).css("font-size",$("#textSizeSel_" + objId).val());
		}

    })();

    // 图片相关
    (function () {
    	// 单独添加图片(flash)
        $.mk.addImage = function (imageCount, callback) {
        	maxModualCount = imageCount;
        	flexUploadCallBack = callback;
            $.mk.module.addImageView();
        }
//       编辑展示新增图片视频标记 
        $.mk.module.setcheckvideopic = function () {

	        if($("#weblogpost_pic_status").val()==0){
	        	$("#weblogpost_pic_status").val(1);
	        }
        }
        // 模块下添加图片
        $.mk.module.addImage = function () {
            if (jQuery1.mk.module.checkCount()) return;
            //编辑展示新增图片视频标记
            $.mk.module.setcheckvideopic();
            
            if($("#waterColor").size() > 0)
				$("#waterColor").val("gray");
            var param = {
				showCommonUpload : business_type == "post"
			}
       		$.mk.module.addImageView(param);
        }
        
        // 载入上传图片
        $.mk.module.loadImage = function (param,url) {
        	var loadImgUrl = url != undefined ? url : "/jsps/item/ItemSmallImageView.jsp";
            jQuery1.mk.module.loadModule(loadImgUrl, null, function(response, moduleId){
				$("#content_" + cur_id).after(response);
				//设置页面值
				$("#imageInfo_" + moduleId).val(param.yuantu);
				var $ele = '<input type="hidden" name="p[0].src" value="' + param.yuantu + '" />';
				if($("#waterColor").size() > 0)
					$ele += '<input type="hidden" name="p[0].waterColorList" value="' + $("#waterColor").val() + '" />';
				var imgPath = $("#webServerName").val() + param.visitPath;
				$("#thumbImg_" + moduleId).attr("src", imgPath).after($ele);
				//请求下一张图片
				jQuery1.mk.upload.loadNextPic();
			});
        }
        
        //加载添加图片的页面
        $.mk.module.addImageView = function(param){
			var setting = {
            	 objId: cur_id
            };
            $.extend(setting, param);
            var _param = $.param(setting);
			jQuery1.mokoDialog({
				url : "/jsps/item/ItemImageDialogAdd.jsp?" + _param,
				initFn : function() {
					jQuery1.mk.upload.batchUpload();
				}
			});
        }
        
        // 载入Flex返回的图片数据
        $.mk.module.loadFiles = function (jsonStr) {
			var pics = eval("(" + jsonStr + ")"),
			// 载入的图片数量
			picsNum = parseInt(pics.count),
			// 图片信息 html
			tableInner = "",
			// 总大小
			countSize = 0,
			// 单个文件大小
			fileSize = 0,
			// 已载入的图片数量
			picCount = parseInt($("tr[name='picTr']").size());
			if (picCount + picsNum + _getModuleTotal() > parseInt(maxModualCount)) {
				alert("抱歉!最多可以添加" + maxModualCount + "组!");
				return;
			}
			document.getElementById("FileUpload").addFileToItem();
			for (var i = 0; i < picsNum; i++) {
				fileSize = parseInt(pics.pic[i].size);
				countSize += fileSize;
			    tableInner += '<tr name="picTr" id="tr_' + picCount + '">' +
								'<td class="bDashedOn">' +
									'<p class="name">' + pics.pic[i].name + '</p>' +
								'</td>' +
								'<td class="bDashedOn">' +
									'<div class="uping">' +
										'<div class="borderOn">' +
											'<div class="bg" style="width:0%" name="progressDiv" id="progress_' + picCount + '"></div>' +
										'</div>' +
										'<span class="font12" name = "progress_span" id="span_pro_' + picCount + '"></span>' +
									'</div>' +
								'</td>' +
								'<td class="count bDashedOn">' + fileSize + '</td>' +
								'<td class="del bDashedOn">' +
									'<img id="a_' + picCount + '" class="sDel_2" src="'+mokosimg+'/images/n.gif" alt="删除" title="删除" ' +
											'onclick="jQuery1.mk.upload.delFile(this,'+ fileSize + ');return false"/>' +
								'</td>' +
							  '</tr>';
				picCount++;
			}
			$("#fileInfo").append(tableInner);
			$("#fileCount").text(picsNum + parseInt($("#fileCount").text()));
			$("#sizeCount").text(countSize + parseInt($("#sizeCount").text()));
		}

    })();

    // 视频相关
    (function () {
        // 添加视频
        $.mk.module.addVideo = function () {
            if (jQuery1.mk.module.checkCount()) return;
          //编辑展示新增图片视频标记
            $.mk.module.setcheckvideopic();
            _videoEditor(business_type);
        }
        
    	// 微博添加视频
        $.mk.module.addBolgVideo = function () {
        	var param = {
        		// 不可编辑视频尺寸、不可上传
	            sizeEditable: false,
	            videoUpload: false
            };
            _videoEditor("blog",param);
        }

        // 编辑视频(展示)
        $.mk.module.editVideo = function (eleid, videoURL, videoSize) {
            var param = {
                objId: eleid,
                videoURL: videoURL,
                videoSize: videoSize
            };
            _videoEditor("post", param);
        }

        // 打开视屏编辑页
        var _videoEditor = function (type, option) {
            var param = {
                type: type,
                // 展示 视频大小可编辑
                sizeEditable: type == "post",
                // 展示、项目 可上传视频
                videoUpload: type == "post" || type == "project"
            };
            $.extend(param, option);
            var _param = $.param(param);
            jQuery1.mokoDialog({ url : "/jsps/item/ItemVideoDialogAdd.jsp?"+_param });
        }

        // 视频引用确认 citeType:1=输入引用 2=上传引用
        $.mk.module.citeVideo = function (citeType, type, eleid) {
        	var videoURL = "";
        	if (citeType == 1) {
				// 视频地址、代码 解析
				var re = $.citeVideo.parse($("#citeCode").val());
				if (!re || re.code == "A404") {
					$('#invalidLinkError').show();
					return
				}
				if (re.code == "A408") {
					alert("系统繁忙，请稍后再试。");
					return
				}
				videoURL = re.videoURL;
			} else if (citeType == 2) {
				// 上传的视频直接引用
				videoURL = $("#videoURL").val();
			}
            _videoShow(videoURL, type, eleid);
        }

        // 显示添加的视频
        var _videoShow = function (videoURL, type, eleid) {
            if (type == "blog") {
                $.mk.blog.chooseBlogVideo(videoURL);
                return;
            }
            var videoSize = $(":radio[name='videoSize']:checked").val();
            var param = {
                showVideoEdit: type == "post",
                videoSize: videoSize || 1,
                src: videoURL
            };
            $.mk.module.loadModule("/jsps/item/ItemSmallVideoView.jsp", param, function (response) {
                if (eleid) {// 如果是修改视频, 则替换原来的视频
					$("#" + eleid).replaceWith(response);
				} else {// 添加则加在当前元素后
					$("#content_" + cur_id).after(response);
				}
                $.mokoDialog.close();
            });

        }

    })();

    // 插入模块
    $.mk.module.choose = function (index, event) {
    	//记录当前模块id
        cur_id = index;
        $('#contentType_' + index).html(itemHtml).show();
        event.cancelBubble = true; // 防止事件冒泡
        $(document).bind("click.chooseModule", function () {
            $('#contentType_' + index).hide();
            $(document).unbind("click.chooseModule");
        })
    }
    
	// 检查 模块数量 是否超出限制
    $.mk.module.checkCount = function (existNum) {
    	var count = _getModuleTotal();
    	if (existNum && existNum > 0)
    		count += existNum;
        if (count >= maxModualCount) {
            alert("抱歉!最多可以添加" + maxModualCount + "组!");
            return true;
        }
    }
	
    //获取剩余的模块数
    $.mk.module.remainCount = function () {
    	return maxModualCount - _getModuleTotal(); 
    }
    
    // 移除模块
    $.mk.module.remove = function (objId){
		if(!confirm('确实要删除吗?')){
			return false;
		}
		$("#content_"+objId).remove();
		_adjustModuleOrder();
	}
	
	// 向上移动模块
	$.mk.module.moveUp = function (objId){
		if(business_type != "mtg5")
			$("#content_"+objId).prevAll("div[name='item_content']:first").before($("#content_"+objId));
		else
			$("#content_"+objId).prevAll("li[name='item_content']:first").before($("#content_"+objId));
		_adjustModuleOrder();
	}
	
	// 向下移动模块
	$.mk.module.moveDown = function (objId){
		if(business_type != "mtg5")
			$("#content_"+objId).nextAll("div[name='item_content']:first").after($("#content_"+objId));
 		else
 			$("#content_"+objId).nextAll("li[name='item_content']:first").after($("#content_"+objId));	
		_adjustModuleOrder();
	}

    // 模块html  1:文本 2：图片 4：视频
    var _itemHTML = function (o1, o2, o3, o4) {
    	function choose(t) { 
	    	switch (t) {
				case 1 :
					return '<p class="weight700"><a href="javascript:void(0)" class="gmC u" onclick="jQuery1.mk.module.addText()">文 本</a></p>'
					break;
				case 2 :
					return '<p class="weight700"><a href="javascript:void(0)" class="gmC u" onclick="jQuery1.mk.module.addImage()">图 片</a></p>'
					break;
				case 4 :
					return '<p class="weight700"><a href="javascript:void(0)" class="gmC u" onclick="jQuery1.mk.module.addVideo()">视 频</a></p>'
					break;
				default :
					return "";
					break;
			}
    	}
    	var html = "";
		if (o1)
			html += choose(o1);
		if (o2)
			html += choose(o2);
		if (o3)
			html += choose(o3);
		if (o4)
			html += choose(o4);
    		 
    	return html;
    }

	// 获取模块总数
    var _getModuleTotal = function () {
        return $("div[name='item_content']").size();
    }


    // 加载模块 公共方法
    $.mk.module.loadModule = function (url, setting, callback) {
        var param = {
            // 模块唯一id，每添加一个自动增长
            id: ++module_id
        };
        $.extend(param, setting);
        $.get(url, param, function (response) {
            callback(response, param.id);
            _adjustModuleOrder();
        });
    }

    // 调整排序小箭头
    var _adjustModuleOrder = function () {
        if ($("#content_0").length != 0) {
            // 隐藏第一个和最后一个模块的排序按钮
            var $orders = $("div.addButton").find("img.order");
            if(business_type == "mtg5")
            	$orders = $("ul.apply-rows").find("a.order");
            $orders.show();
            $orders.first().hide();
            $orders.last().hide();
        }
    }

})(jQuery1);

//土豆视频 相关
(function($) {
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}
	if (typeof $.mk.tudou == "undefined") {
		$.mk.tudou = {};
	}
	
	// 切换显示土豆上传视频
	$.mk.tudou.showDiv = function (){
		$("#citeHref").attr("class", "gC b");
		$("#uploadHref").attr("class", "gC b");
		$("#uploadHref_tudou").attr("class", "gC mBd");
		$("#citeVideo").hide();
		$("#uploadVideo").hide();
		
		$("#picUp1").val("");
		$("#tudouTitle").val("");
		$("#tudouTags").val("");
		$("#err_file").css("visibility","hidden");
		$("#err_title").css("visibility","hidden");
		$("#err_tags").css("visibility","hidden");
		$("#status_table").css("visibility","hidden");
		$("#tudouTitle").attr("disabled", false);
		$("#tudouTags").attr("disabled", false);
		$("#up_file").attr("disabled", false);
		_setTuDouBtn(false);
		$("#status_td").html("");
		clearTimeout(timeUpload_tudou);		//清理定时请求
		$("#UploadVideo_tudou").show();
	}
	
	//土豆视频上传进度条入口 显示进度条
	var checkTag = 0, timeUpload_tudou = null;
	$.mk.tudou.showUploadStatus = function (url, divId){
		$.getJSON(url + "&callback=?",
	            function(response) {
					try{
						if(response != null && response != "" && response != "null"){
							var status = response.status;
							//进度条
							if(status == "uploading"){
								var percent = parseInt(response.percent);
								var fileSize = parseInt(response.fileSize);
								var fileLength = parseFloat((fileSize / 1024 / 1024)).toFixed(2) + "MB";
								var bytes = parseInt(response.bytes);
								var upLength = parseFloat((bytes / 1024 / 1024)).toFixed(2) + "MB";
								var msgHtml = '<span class="upload-num" id="status_num">' + percent + '%</span><div class="uping"><div class="bd"><div class="bg mBC" style="width:' + percent + '%;" id="status_div"></div></div></div><span class="upload-size"><span class="gC1">已上传：</span><span class="gC1" id="status_size">' + upLength + ' / ' + fileLength + '</span></span>';
								$("#"+divId).html("");
								$("#"+divId).html(msgHtml);
								
								timeUpload_tudou = setTimeout(function(){
									$.mk.tudou.showUploadStatus(url, divId);
								},1000);		
								return ;
							}else if(status == "finish"){//上传完成
								// 清理定时请求
								clearTimeout(timeUpload_tudou);
								// 设置页面
								_setVideoUrl();
								// 上传完 引用视频
								$.mk.module.citeVideo(tmp_citeType, tmp_type, tmp_objId);
							}
						}else{
							checkTag++;
							if(checkTag >= 15){
								clearTimeout(timeUpload);
								$("#"+divId).html("");	
								alert("上传出错！");
								_setTuDouBtn(false);	//设置上传按钮可用
								$("#tudouTitle").attr("disabled", false);
								$("#tudouTags").attr("disabled", false);
								$("#up_file").attr("disabled", false);
							}
						}
					}catch(e){
						clearTimeout(timeUpload);//上传后清理timeUpload
						alert("上传出错！");
						_setTuDouBtn(false);	//设置上传按钮可用
					}
				}
	       );
	}
	
	//设置页面值
	var _setVideoUrl = function (){
		var key = $("#tudou_itemCode").val();
		var url = "http://www.tudou.com/v/" + key + "/v.swf";
		$("#videoURL").val(url);
		$("#confirmCiteVideo2_tudou").removeAttr("disabled");
	}
	
	$.mk.tudou.setTudouValue = function(obj, id) {
		$("#" + id).val(obj.value);
	}
	
	var tmp_citeType = "", tmp_type = "", tmp_objId = "";
	$.mk.tudou.videoShow = function (citeType, type, eleid){
		$("#err_file").css("visibility","hidden");
		$("#err_title").css("visibility","hidden");
		$("#err_tags").css("visibility","hidden");
		var videoPath = $("#picUp1").val();
		if(videoPath == null || videoPath == ""){
			alert("请选择上传视频文件");
			return;
		}
		if(!_checkTuDouVideoType(videoPath)){
			$("#err_file").css("visibility","visible");
			return;
		}
		var title = $("#tudouTitle").val();
		if(title == null || title == ""){
			$("#err_title").css("visibility","visible");
			return;
		}
		var tags = $("#tudouTags").val();
		if(tags == null || tags == ""){
			$("#err_tags").css("visibility","visible");
			return;
		}
		$("#fm_title").val(title);
		$("#fm_tags").val(tags);
		_setTuDouBtn(true);
		$.ajax({
			url:"/video|getTuDouUploadUrlAjax.action",
			type:"post",
			data:$("#form_tudou_param").serialize(),
			success:function(response){
				if (response == "dataErr"){
					alert("数据错误,请刷新页面重新操作！");
					$("#tudou_video_btn").attr("disabled",false);
					return;
				}else{
					var tudouJson = eval("(" + response + ")");
					$("#tudou_itemCode").val(tudouJson.itemUploadInfo.itemCode);
					$("#form_tudou").attr("action", tudouJson.itemUploadInfo.uploadUrl);
					$("#form_tudou").submit();
					
					$("#tudouTitle").attr("disabled", true);
					$("#tudouTags").attr("disabled", true);
					$("#up_file").attr("disabled", true);
					$("#status_table").css("visibility","visible");
					setTimeout(function(){
						jQuery1.mk.tudou.showUploadStatus(tudouJson.itemUploadInfo.uploadUrl, 'status_td');
					},1000);	
					tmp_citeType = citeType;
					tmp_objId = eleid;
					tmp_type = type;
				}
			}
		})
	}
	
	var _setTuDouBtn = function (disabled){
		$("#tudou_video_btn").attr("disabled", disabled);
	}
	
	//检查上传视频类型是否正确
	var _checkTuDouVideoType = function (videoPath){
		var fileType = videoPath.substring(videoPath.lastIndexOf("."), videoPath.length);																			
		var tudouVideoTypes = [".wmv", ".asf", ".asx", ".rm", ".rmvb", ".mpg", ".mpeg", ".mpe", ".3gp", ".mp4", ".mov", ".m4v", ".mp3", ".wma", ".m4a", ".avi", ".dat", ".mkv", ".flv", ".hlv", ".vob", ".f4v", ".ogg", ".dv", ".dif", ".ts"];
		for(var i = 0; i < tudouVideoTypes.length; i++){
			if(fileType.toLowerCase() == tudouVideoTypes[i])
				return true;
		}
		return false;
	}
	
})(jQuery1);