/**
 * @name:表情js
 * @example: 生成表情选择DIV jQuery1.mk.face.popSmiles("调用此方法的元素ID", "目标文本框ID");
 *           转发微博时替换上文的表情<img > jQuery1.mk.face.replaceFace("文本内容");
 *           将表情字符用正则替换成表情图片 jQuery1.mk.face.formatImages("包含表情字符的元素Id");
 *           将表情字符用正则替换成图片提示文字 jQuery1.mk.face.formatImagesAlt("包含表情字符的元素Id");
 */
(function($) {
	if (typeof $.mk == "undefined") {
		$.mk = {};
	}

	if (typeof $.mk.face == "undefined") {
		$.mk.face = {};
	}

	var faceType = [
			{
				"type" : "hin-pop",
				"name" : "HIN-POP",
				"data" : [ "HIN-POP表情提示", "鼓掌", "yeah", "ok", "握手", "有木有", "五道杠", "围观",
						"伤不起", "神马", "浮云", "喷血", "睡觉", "鄙视一下", "v5", "nb",
						"偷笑", "鬼脸熊猫", "衰", "猪头啊", "懒得理你" ],
				"imgsuffix" : ".jpg",
				"imgpath" : "/images/hin-pop/"
			},
			{
				"type" : "dynamicFace",
				"name" : "动 态",
				"data" : [ "动态表情提示", "花痴", "爆哭", "爆雷", "飘过", "怒", "疑问", "汗",
						"无语", "呲牙", "爆眼", "晕", "吐", "假笑", "委屈", "郁闷", "砸扁",
						"显摆", "害羞", "口水", "惊讶" ],
				"imgsuffix" : ".gif",
				"imgpath" : "/images/dynamicFace/"
			},
			{
				"type" : "xiaerFace",
				"name" : "XIAER",
				"data" : [ "xiaer表情提示 xiaer版", "惊了", "猪得意", "MIXI", "太得意",
						"三只眼", "弱魔", "暴吐", "ji贼", "中怒", "真小气", "邪恶", "坏",
						"小无语", "惊怒", "财迷", "惨", "长舌", "不正经", "闷", "完了" ],
				"imgsuffix" : ".jpg",
				"imgpath" : "/images/xiaerFace/"
			},
			{
				"type" : "waver_h",
				"name" : "WAVER_H",
				"data" : [ "waver_h表情提示", "暴怒", "鄙视", "烟酷", "黑涩会", "怪唇", "变态",
						"怀疑", "啊", "囧", "小口水", "骷髅", "鼻血", "猫脸", "媒婆", "可怜",
						"挖鼻", "我晕", "熊猫", "周扒皮", "猪头" ],
				"imgsuffix" : ".jpg",
				"imgpath" : "/images/waver_h/"
			},
			{
				"type" : "rourou",
				"name" : "肉 肉",
				"data" : [ "人肉表情提示", "小飘", "怪得意", "冷汗", "飞吻", "空", "鼻涕", "阿童木",
						"各种拽", "超人", "不鸟", "潜", "歪嘴", "烧香", "扮鬼脸", "香肠嘴",
						"小恶魔", "羞", "飘泪", "orz", "打盹" ],
				"imgsuffix" : ".jpg",
				"imgpath" : "/images/rourou/"
			} ], // 表情类型
	isSmilesShow = false, 
	faceTextAreaId = "", // 目标文本框 id
	popSmilesId = "smiles", // 表情Div id
	selection = "", 
	_getFaceText = function(type, faceId) {// 获取表情文字
		var faceText = "";
		$.each(faceType, function(i, ele) {
			if (type == ele.type)
				faceText = "[" + ele.data[faceId] + "]";
		});
		return faceText;
	}, 
	_getFaceImgStr = function(insertImageId) {// 生成表情选择div具体内容
		var $insertImage = $("#" + insertImageId);
		var pos = jQuery1.getElementPos($insertImage[0]);
		var x = pos.x + parseInt($insertImage.width());
		var y = pos.y + parseInt($insertImage.height());
		var pop_smiles_css = {
			"position" : "absolute",
			"z-index" : "1000000",
			"left" : x + "px",
			"top" : y + "px",
			"width" : "400px",
			"background-color" : "#fff",
			"padding" : "12px",
			"border" : "1px solid #bfbfbf",
			"display" : "block"
		};
		var pop_smiles_p_css = {
			"height" : "20px",
			"line-height" : "20px",
			"margin-bottom" : "10px"
		};
		var pop_smiles_p_span_css = {
			"border" : "1px solid #fff",
			"cursor" : "pointer",
			"color" : "#F09",
			"text-decoration" : "underline",
			"margin-right" : "20px"
		};
		var $pop_smiles = $("<div />",{id: popSmilesId, css: pop_smiles_css});
		var $pop_smiles_p = $("<p />", {css: pop_smiles_p_css});
		$.each(faceType, function(i, ele) {
			$pop_smiles_p.append(
				$("<span />", {
					"css": pop_smiles_p_span_css,
					"text": ele.name,
					"mouseover" : function() {
						$(this).css({"border" : "1px solid #f09"});
					},
					"mouseout" : function() {
						$(this).css({"border" : "1px solid #fff"});
					},
					"click" : function() {
						_showFaceDiv(ele.type);
					}
				})
			);
			var $pop_smiles_div = $("<div />", {"id": ele.type});
			if (i == 0)
				$pop_smiles_div.css("display", "block");
			else
				$pop_smiles_div.css("display", "none");
			$.each(ele.data, function(i, data) {
				if (i > 0){
					$span = $("<span />", {
						"css" : {
									"display" : "inline-block",
									"width" : "78px",
									"height" : "50px",
									"text-align" : "center",
									"border" : "1px solid #fff",
									"cursor" : "pointer"
								},
						"mouseover" : function() {
							$(this).css({"border" : "1px solid #f09"});
						},
						"mouseout" : function() {
							$(this).css({"border" : "1px solid #fff"});
						}
					});
					$img = $("<img />", {
						"src" : mokosimg + ele.imgpath + i + ele.imgsuffix,
						"alt" : data,
						"title" : data,
						"click" : function() {
							_AddText(ele.type, i);
						}
					});
					$span.append($img);
					$pop_smiles_div.append($span);
				}
			});
			$pop_smiles.append($pop_smiles_div);
		});
		$pop_smiles.prepend($pop_smiles_p);
		$pop_smiles.appendTo(document.body);
	}, _showFaceDiv = function(divId) {// 表情类型切换
		isSmilesShow = false;
		$("#" + popSmilesId + " > div").hide();
		$("#" + divId).show();
	}, _popSmiles_hide = function(event) {// 关闭表情层
		if (isSmilesShow) {
			var $pop_smiles = $("#" + popSmilesId);
			if ($pop_smiles.size() > 0)
				$pop_smiles.remove();
			if ($("#" + faceTextAreaId).size() != 0)
				$("#" + faceTextAreaId).focus();
			$(document).unbind("click.chooseFace");
		}
		isSmilesShow = true;
	}, _AddText = function(type, faceId) {// 向文本框插入表情
		var ubb = $("#" + faceTextAreaId)[0];
		var ubbLength = ubb.value.length;
		var str = _getFaceText(type, faceId);
		ubb.value = ubb.value.substring(0, selection.start) + str
				+ ubb.value.substring(selection.end, ubbLength);
		_setCursor(ubb, selection.start + str.length);
	}, _replaceFace2Text = function(e) {// 将表情代码替换为文字
		return e.replace(/[[^\]^]*/g, "");
	}, _getSelection = function(textArea) {// 获取光标在文本框中的位置
		var s, e, range, stored_range;
		if (jQuery1.isIE) {
			var selection = document.selection;
			textArea.focus();
			range = selection.createRange();
			stored_range = range.duplicate();
			stored_range.moveToElementText(textArea);
			stored_range.setEndPoint('EndToEnd', range);
			s = stored_range.text.length - range.text.length;
			e = s + range.text.length;
			textArea.blur();
		} else {
			s = textArea.selectionStart;
			e = textArea.selectionEnd;
		}
		return {
			start : s,
			end : e
		}
	}, _setCursor = function(textArea, end) {// 设置文本框焦点位置
		end = end == null ? textArea.value.length : end;
		textArea.focus();
		if (textArea.createTextRange) {
			var range = textArea.createTextRange();
			range.move("character", end);
			range.select();
		} else
			textArea.setSelectionRange(end, end);
	};

	/** 生成表情选择DIV */
	$.mk.face.popSmiles = function(insertImageId, areaTextId) {
		$.mk.common.clearBlogSearchDiv();
		faceTextAreaId = areaTextId;
		var $pop_smiles = $("#" + popSmilesId);
		if ($pop_smiles.size() > 0) {
			$pop_smiles.remove();
			return false;
		}
		selection = _getSelection($("#" + faceTextAreaId)[0]);
		_getFaceImgStr(insertImageId);
		isSmilesShow = false;
		$(document).bind("click.chooseFace", _popSmiles_hide);
	}

	/** 转发微博时替换上文的表情<img > */
	$.mk.face.replaceFace = function(str) {
		if (str == null || str == ""
				|| (str.indexOf("<img ") == -1 && str.indexOf("<IMG ") == -1)
				|| str.indexOf(">") == -1)
			return str;
		if (str.indexOf("src=\"") == -1)
			return str;
		var str1 = str.substring(str.indexOf("src=\"") + 5);
		var src = str1.substring(0, str1.indexOf("\""));
		if (src.indexOf("images/") == -1)
			return str;
		var name = src.substring(src.indexOf("images/") + 7, src
				.lastIndexOf("/"));
		var id = src.substring(src.lastIndexOf("/") + 1, src.lastIndexOf("."));
		var strNew = str.toLowerCase();
		var state = strNew.indexOf("<img ");
		var end = strNew.substring(state).indexOf(">");
		var imgStr = str.substring(state, state + end + 1);
		if (imgStr.indexOf("<") != imgStr.lastIndexOf("<"))
			imgStr = imgStr.substring(imgStr.lastIndexOf("<"));
		str = str.replace(imgStr, _getFaceText(name, id));
		return $.mk.face.replaceFace(str);
	}
	
	//表情 文字与图片 的键值对
	var faceMap;
	//初始化 表情 map
	_initFaceMap = function () {
		faceMap = {};
		$.each(faceType, function(i, face) {
			$.each(face.data, function(y, text){
				faceMap[text] = mokosimg + face.imgpath	+ y + face.imgsuffix;
			});
		});
	}
	/** 将表情字符用正则替换成表情图片 */
	$.mk.face.formatImages = function(elementId) {
		var $objContainers = $("[id^=\"" + elementId + "\"]");
		if ($objContainers.size() == 0)
			return;
		
		if(!faceMap)
			_initFaceMap();
		
		$objContainers.each(function(i, element) {
			element = $(element);
			element.html(element.html().replace(/\[([\u4e00-\u9fa5\s\w]*)\]/g, function(m){
				var faceText = _replaceFace2Text(m);
				if(!faceMap[faceText])
					return m;
				return "<img src='" + faceMap[faceText] + "' class='mokoface' title='" + faceText + "' alt='" + faceText + "' />";
			}));
		});
	}

	/**将表情字符用正则替换成图片提示文字*/
	$.mk.face.formatImagesAlt = function(elementId) {
		var $objContainers = $("[id^=\"" + elementId + "\"]");
		if ($objContainers.size() == 0)
			return;
		$objContainers.each(function(i, element) {
			element = $(element);
			element.attr("title", _replaceFace2Text(element.attr("title")));
		});
	}
})(jQuery1);