//顶部人群钻取的选择
var panelSelect = (function () {
	var exports = {};
	var __root,__data,__bd;
	var	itemHTML = '<div class="drill-item  form-group form-item">'+
                        '<div class="form-control-wrap form-control-wrap-select">'+
                        '</div>'+
                        '<span class="drill-item-text">等于</span>'+
                        '<div class="form-control-wrap">'+
                            '<div class="form-item-inputcheckbox">'+ 
                            '</div>'+
                        '</div>'+
                        '<button type="button" class="btn btn-sub btn-default">-</button>'+
	                    '<button type="button" class="btn btn-add btn-default">且</button>'+
                    '</div>';
    var __optionObj = {};
	exports.init = function (option) {
		__root = option.root;
		data.__data = data.initData(option.data);

		__bd = __root.find('#j-drill-wrap');
        view.render();
		contrlInit();
	}
    
	var data = {
        initData:function(data){
            $.each(data.optionList, function(index, val) {
                $.each(val.attrs, function(index, val) {
                    __optionObj[val.attrCode]=val;
                });
            });
            return data;
        },
        getOptionData:function (attrCode) {
            return __optionObj[attrCode];
        }  
	}
	var view = {
        render:function () {
            $.each(data.__data.checkList, function(index, val) {
                 view.renderItem(index,val.attrCode);
            });
            view.renderItem();
        },
        renderItem:function (index,attrCode) {
           __bd.append(itemHTML);
           view.renderSelect(__bd.find('.form-control-wrap-select').last(),index,attrCode);
        },
		renderSelect:function (selectWrap,attrCodeIndex,attrCode) {
            var select = $('<select class="form-control form-item-select"></select>');
			$.each(data.__data.optionList, function(index, val) {
                var optgroup = '<optgroup label='+val.catName+' data-type="'+val.catCode+'"></optgroup>';
                    $optgroup = $(optgroup);
                var option = '';
                $.each(val.attrs, function(i, v) {
                    //简单初始化option
                    if(attrCodeIndex == undefined && i==0 && index ==0){
                          view.renderOption(-1,v.values);
                    }
                    //简单初始化option，需要判断是否要选中
                    if(v.attrCode==attrCode){
                        option += ('<option value="'+v.attrCode+'" selected>'+v.attrName+'</option>');
                        view.renderOption(-1,v.values,attrCodeIndex);
                    }else{
                         option += ('<option value="'+v.attrCode+'">'+v.attrName+'</option>');
                    }
                   
                });
                $optgroup.append(option);
                select.append($optgroup);
            });
            selectWrap.append(select);
		},
		renderOption:function (ele,datas,index) {
            var values = datas,inputcheckboxWrap;
            //需要初始化选中的选项
            if(arguments.length ==3){
               $.each(values, function(i, v) {
                     v.checked = data.__data.checkList[index].attrValues.indexOf(v.value) >=0
                });
            }else{
                $.each(values, function(i, v) {
                     v.checked =false;
                });
            }
            inputcheckboxWrap = ele == -1?$('.form-item-inputcheckbox').last():ele
			
            inputcheckboxWrap.selectCheckbox({data:values});
		}
	}

	function contrlInit() {
		var hand = __root.find('.btn-panelOpenCtrl');
		hand.click(function() {
			__root.toggleClass('panel-select-down').toggleClass('panel-select-up');
		});
		__root.on('click', '.btn-add', function(event) {
			view.renderItem();
			view.renderSelect();
			data.pushSelectData();
		});
		__root.on('click', '.btn-sub', function(event) {
			$(this).parent('.drill-item').remove();
			//data.popSelectData();
		});

		__root.on('change', '.form-item-select', function(event) {
            var attrCode = $(this).val(),
			 optData = data.getOptionData(attrCode),
             inputcheckboxWrap = $(this).parents('.drill-item').find('.form-item-inputcheckbox');
            
			view.renderOption(inputcheckboxWrap,optData.values);
		});
	}
    exports.getFilterConditions = function(){
        var filterConditions = [];
        $('.drill-item').each(function(index, el) {
            var attrValues = $(this).find('.form-item-inputcheckbox .form-item-input').data('value');
            if(attrValues.length >0){
                filterConditions.push({
                    attrCode:$(this).find('.form-item-select').val(),
                    attrValues:attrValues
                })
            }
        });
        return filterConditions;
    }
	return exports;
})();
//侧边钻取结构图选择指标
var checkPanel = (function () {
    var exports = {}
    var __root,__wrap_parent,__wrap_children,__data,
        hasSelectCount = 0;
        __defaultOptions = {
            maxSelect:5,
            root:$('body'),
            parentLiTpl:'<li class="level-contruct-list ${select}" data-catCode=${catCode}>${catName}(<span class="count">${selectCount}</span>/<span class="totalCount">${totalCount}</span>)</li>',
            childLiTpl:'<li class="level-contruct-list">\
                                <label class="form-checkbox-label">\
                                    <input type="checkbox" value="${attrCode}" ${checked} text="${attrName}" data-parentindex="${parentindex}">${attrName}\
                                </label>\
                            </li>',
            checkedFun:function (data) {
                console.log('选择了',data);
            },
            unCheckedFun:function (data) {
                console.log('取消选择了',data);
            },
            overSelectFun:function () {
                console.log('超过了最大选取数')
            }
        }
    function initData(primaryData) {
        var datas = [],singleData = {};
        if(primaryData.checkList.length>0){
            $.each(primaryData.optionList, function(index, val) {
                $.each(val.attrs, function(i, v) {
                     if(primaryData.checkList.indexOf(v.attrCode)>=0){
                        v.checked = true;
                     }
                });
                datas.push(val);
            });
        }
    
        return datas;
    }
    exports.init = function (opt) {
        $.extend(true,__defaultOptions,opt);
        __root = __defaultOptions.root;
        __data = initData(__defaultOptions.data);
        __wrap_parent = __root.find('.level-contruct-ctrl-bd').eq(0);
        __wrap_children = __root.find('.level-contruct-ctrl-bd').eq(1);
        render(__data);
        ctrl();
    }
    function render(data) {
        var parentLiData,selectCount,parentHtml = '';
        $.each(data, function(index, val) {
            selectCount = 0,parentLiData ={};
            $.each(val.attrs, function(index, val) {
                if(val.checked){
                    selectCount ++;
                    hasSelectCount++;
                }
            });
            parentLiData  ={
                    select:index==0 ? 'level-contruct-list-select':'',
                    catName:val.catName,
                    catCode:val.catCode,
                    selectCount:selectCount,
                    totalCount:val.attrs.length
                }
            parentHtml += CommonTools.CoreTools.template(__defaultOptions.parentLiTpl,parentLiData)  
        });
        __wrap_parent.html(parentHtml);
        __root.find('.max').html(__defaultOptions.maxSelect);
        var selectIndex = getSelectIndex(__wrap_parent.find('.level-contruct-list-select'));
        renderChild(selectIndex);
    }
    function getSelectIndex($ele) {
        var index = __wrap_parent.find('.level-contruct-list').index($ele[0]);
        return index;
    }
    function renderChild(index) {
        var childData = __data[index].attrs,
            childHtml = '';
        $.each(childData, function(i, v) {
            var obj = {
                checked:v.checked ? 'checked':'',
                parentindex:index
            }
            $.extend(true,v,obj);
            childHtml += CommonTools.CoreTools.template(__defaultOptions.childLiTpl,v);
        });
        __wrap_children.html(childHtml);
    }
    function ctrl() {
        __wrap_parent.find('.level-contruct-list').click(function() {
            __wrap_parent.find('li').removeClass('level-contruct-list-select'); 
             $(this).addClass('level-contruct-list-select');
            var selectIndex = getSelectIndex($(this));
            renderChild(selectIndex);            
        });
        __wrap_children.on('click', 'input', function(event) {
            var countWrap = __wrap_parent.find('.level-contruct-list-select .count'),
                checked;
            if($(this)[0].checked){
                checked = checkedFun.call(this,countWrap); 
                        
            }else{
                unCheckedFun.call(this,countWrap);
                checked = false;
            }
            var parentIndex = $(this).data('parentindex'),childIndex = __wrap_children.find('input').index(this);
            __data[parentIndex].attrs[childIndex].checked = checked;
        });
        function checkedFun(countWrap) {
            if(hasSelectCount ==__defaultOptions.maxSelect){
                __defaultOptions.overSelectFun();
                $(this).attr('checked', false);
                return false;
            }
            hasSelectCount++;
            countWrap.html(parseInt(countWrap.html())+1);
            var data = {attrCode:$(this).val(),attrName:$(this).attr('text')};
            __defaultOptions.checkedFun(data);
            return true;
        }
        function unCheckedFun(countWrap) {
            hasSelectCount--;
            countWrap.html(parseInt(countWrap.html())-1);
            var data = {attrCode:$(this).val(),attrName:$(this).attr('text')};
            __defaultOptions.unCheckedFun(data);
        }
    }
    return exports;
})()
//侧边钻取结构图指标拖动排序
var dragPanel = (function () {
    var exports = {};
    var __wrap,__itemHeight,__dialogWrap,
        minOffset,maxOffset;
        __itemTemplate = '<li class="level-contruct-list ">\
                        <span class="level-contruct-drag-item" data-val="${attrCode}">${attrName}</span>\
                    </li>',
       cacheData = [];
    exports.init = function (opt) {
        __wrap = opt.wrap;
        __itemHeight = opt.itemHeight; 
        __dialogWrap = __wrap.parents('.side-panel-box');
        cacheData = initData(opt.data);
        render();
        dragCtrl();
    }
    function initData(primaryData) {
        var datas = [];
        if(checkPanelData.checkList.length){
            $.each(primaryData.optionList, function(index, val) {
                $.each(val.attrs, function(i, v) {
                     var index = checkPanelData.checkList.indexOf(v.attrCode);
                     if(index>=0){
                        v.checked = true;
                        datas[index] = v;
                    }
                });
            });
        }
    
        return datas;
    }
    function render(data) {
        var html = '',data=data||cacheData;
        $.each(cacheData, function(index, val) {
           html += CommonTools.CoreTools.template(__itemTemplate,val);
        });
        __wrap.html(html).height(__itemHeight*cacheData.length);
        painItem();
    }
    function painItem() {
        __wrap.find('li').each(function(index, el) {
            $(el).css('top', index*__itemHeight);
        });
    }
    function dragCtrl() {
        var dragOffset; //记录偏移量
        __wrap.on('mousedown', 'li', function(e) {
            minOffset = -__itemHeight,
            maxOffset = __itemHeight * cacheData.length;
            __wrap.addClass('active');
            $(this).addClass('active');
            dragOffset = 0;
            bindMove($(this));
        }).on('mouseup', 'li', function(event) {
            unbindMove();
             __wrap.removeClass('active');
            $(this).removeClass('active');
            resetData(this,dragOffset,function () {
                render();
            });
        });
        function bindMove(ele) {
           __dialogWrap.bind('mousemove', function(e) {
                throttle(function () {
                    dragOffset = getOffset(e)
                    ele[0].style.top = dragOffset+'px';
                },50)()
            });
        }
        function unbindMove() {
           __dialogWrap.unbind('mousemove');
        }
    }
    function resetData(ele,offset,cb) {
         var preIndex = __wrap.find('li').index(ele),
             curIndex = Math.floor(offset/__itemHeight);
        if(preIndex != curIndex){
            var eleData = cacheData[preIndex];
            cacheData.splice(preIndex,1);
            cacheData.splice(curIndex,0,eleData);
        }
        cb&&cb(cacheData);
    }

    function getOffset(e) {
        var offset = e.clientY+__dialogWrap[0].scrollTop-__wrap[0].offsetTop;
        if(offset < minOffset){
            offset = minOffset;
        }
        if(offset >maxOffset){
            offset = maxOffset;
        }
        return parseInt(offset);
    }
    var throttle = function (fn, delay) {
        var timer = null;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn();
            }, delay);
        }
    };
    exports.add = function (data) {
        cacheData.push(data);
        render();
    }
    exports.sub = function (data) {
        var i =-1 ;
        $.each(cacheData, function(index, val) {
            if(val.attrCode == data.attrCode){
                i = index;
                return;
            }
        });
        if(i!=-1){
            cacheData.splice(i,1);
            render();
        }
    
    }
    exports.getAttrCodes = function () {
        var attrCodes = []
        $.each(cacheData, function(index, val) {
            attrCodes.push(val.attrCode)
        });
        return attrCodes;
    }
    return exports;
})();
/*渲染树*/
var levelTree = (function () {
    var exports = {},
        defaultOptions = {
            template : '<div class="level ${level} ${select}">\
                        <i class="level-icon"></i>\
                        <span class="level-item level-name">${name}</span>\
                        <span class="level-item level-item-count"><span class="num">${count}</span></span>\
                        <span class="level-item level-item-rate">整体占比：<span class="num">${rate1}</span></span>\
                        <span class="level-item level-item-rate">上级占比：<span class="num">${rate2}</span></span>',
            sideTemplate:'<div class="level-side-item" title="${type}">${type}</div>',
            handler : {
                clickLevel:function (data) {
                    console.log(data);
                }
            }
        },
        level = 0,
        __root;
    exports.init = function (obj,wrap,opts) {
        __root = wrap;
        $.extend(true,defaultOptions,opts);
        buildNode(obj,wrap,defaultOptions);
        bindNode(wrap,defaultOptions.handler);
        setTimeout(function() {
            wrap.find('.level-select').each(function(index, el) {
                defaultOptions.handler.clickLevel($(el).data(),0,'change');
            });
        },100);
    }
    var __nodeDeep = -1;
   
    function buildNode(obj,wrap,opts,index) {
        var $levelWrap = $('<div class="level-wrap leve-down"></div>');
        var index = index ||0;
        var datatObj = getDataType(wrap,obj,index);
        
        $levelWrap.data('datas',datatObj.datas).attr('codes', datatObj.codes.join(','));
        var parentIndex = obj.parentIndex||0;

        var parentLevel = obj.parentLevel == undefined ? -1:obj.parentLevel;

        var level = parentLevel+1; 
        if(__nodeDeep == parentLevel){
            __nodeDeep = level;
            renderSidebar(obj.attrText);
        }
       
        var name = obj.valText[index];
        var child = obj.child;

        var levelData = getLevelData(obj,parentIndex,index,level);
        var node = $(CommonTools.CoreTools.template(opts.template,levelData));
        node.data('levelData', levelData).data('datas',datatObj.datas).attr('codes', datatObj.codes.join(','));;
        $levelWrap.append(node).addClass('level-wrap'+level);


        if(obj.child){
            $.each(child.valText, function(i, v) {
                child.parentIndex =parentIndex*obj.valText.length+index;
                child.parentLevel = level ;
                buildNode(child,$levelWrap,defaultOptions,i);
            });
        }
        wrap.append($levelWrap);    
    }
    function getDataType(wrap,obj,index){
        var dataObj = {
            type:obj.attrText,
            value:obj.valText[index],
            attrCode:obj.attrCode,
            valCode:obj.valCode[index]
        }

        if(wrap.data('datas') == undefined){
           var codes =  [obj.valCode[index]]
           
           var datas = JSON.stringify([dataObj]);
        }else{
            var codes = wrap.attr('codes').split(',')
            codes.push(obj.valCode[index]);
            var datasArr =  JSON.parse(wrap.data('datas'));
            
            datasArr.push(dataObj);
            datas = JSON.stringify(datasArr);
        }
        return {datas:datas,codes:codes};
    }
    function renderSidebar(type) {
        var sideRoot = defaultOptions.sideRoot;
        var sideNode = defaultOptions.sideTemplate.replace(/\$\{type\}/g,type);
        sideRoot.append(sideNode);
    }
    //获取节点的数据
    function getLevelData(obj,index1,index2,level) {
        var d = obj.data[index1];
        var data = {
            name:obj.valText[index2],
            level:'level'+level+' level-'+obj.attrCode,
            select:d.select&&d.select[index2] ?'level-select':'',
            count:d.count[index2],
            rate1:d.parentRatio[index2],
            rate2:d.totalRatio[index2],
            attrText:obj.attrText,
            attrCode:obj.attrCode,
            valCode:obj.valCode[index2]
        }
        return data;
    }
    //绑定节点事件
    function bindNode(wrap,handler) {
        //展开、合并 树
        wrap.on('click', '.level-icon', function(event) {
            var levelWrap = $(this).parent('.level').parent('.level-wrap');
            levelWrap.toggleClass('level-down');
            levelWrap.toggleClass('level-up');
            return false;
        });
        wrap.on('click', '.level', function(event) {
            var levelWrap = $(this).parent('.level-wrap');
            if(!checkParentOrChidlHasSelect($(this))){
                //没选中点击为1，选中点击为0
               var flag = $(this).hasClass('level-select') ? 1:0;
               defaultOptions.handler.clickLevel($(this).data(),flag,'add');               
               $(this).toggleClass('level-select');
            }
        });
        if(defaultOptions.renderSide){
            var sideRoot = defaultOptions.sideRoot;
            sideRoot.on('click', '.level-side-item', function(event) {
                var i = $('.level-side-item').index(this);
                var $levelWrap = $('.level-wrap'+i);
                var className = checkAllSameClass($levelWrap,'level-down','level-up');
                //没全展开
                if(!className){
                    $levelWrap.removeClass('level-down').addClass('level-up');
                }else{
                    $levelWrap.removeClass(className[0]).addClass(className[1]);
                }
                $(this).toggleClass('level-side-item-gray');
            })
        }
    }

    //将level变成没点击状态
    exports.defaultLevel = function (type) {
        $('.level[codes="'+type+'"]').removeClass('level-select');
    }
    //将level变成点击状态
    exports.selectLevel = function (type) {
        $('.level[codes="'+type+'"]').addClass('level-select');
    }
    //判断level节点的父节点或者子节点是否选择
    function checkParentOrChidlHasSelect($level) {
         var levelWrap = $level.parent('.level-wrap');
         var childLevel = levelWrap.find('.level-wrap').find('.level');
         var parentLevel = levelWrap.parents('.level-wrap').children('.level');
         if(childLevel.hasClass('level-select') || parentLevel.hasClass('level-select')){
            return true;
         }
         return false
    }
    //判断是否全为展开或者合并
    function checkAllSameClass($ele,className1,className2) {
        var flag = 0 ;
         $ele.each(function(index, el) {
            var addNum = 0,num = flag;
            if($(el).hasClass(className1)){
                addNum = -1;
            }
            if($(el).hasClass(className2)){
                addNum = 1;
            }
            if(flag > Math.abs(num +addNum)){
                return false
            }else{
                flag = num+addNum;
            }
        });
         console.log(flag);
        //全展开或者全合并
        if(Math.abs(flag) == $ele.length){
            flag = flag <0 ? [className1,className2]:[className2,className1];
        }else{
            flag = false
        }
        return flag;
    }
    exports.add = function (data) {
        var wrap = __root.find('.level-wrap'+__nodeDeep);
        var nodeDeep  = __nodeDeep
        wrap.each(function(index, el) {
            data.parentIndex = index;
            data.parentLevel = nodeDeep;
            $.each(data.value, function(index, val) {
               buildNode(data,$(el),defaultOptions,index);
            });
            
        });
    }
    return exports;
})()



/*提交钻取结构图数据*/
$('#j-side-panel').on('click', '.btn-success', function(event) {
     CommonTools.SidePanel.hide('#j-side-panel')
});

var bottomPanel = (function () {    
    var exports = {},
        templates = {
            penel : '<div class="level-bottom-wrap">\
                    <p class="level-bottom-hd">已选人数预估：<span class="num"></span></p>\
                        <div class="level-bottom-bd">\
                            <div class="level-bottom-itemWrap"></div>\
                            <div class="level-bottom-handle">\
                                <button type="button" class="level-bottom-ctrl level-bottom-ctrl1">生成营销人群</button>\
                                <button type="button" class="level-bottom-ctrl level-bottom-ctrl2">加入群组</button>\
                                <button type="button" class="level-bottom-ctrl level-bottom-ctrl3">保存</button>\
                                <button type="button" class="level-bottom-ctrl level-bottom-ctrl4">取消</button>\
                            </div>\
                        </div>\
                    </div>',
                item : '<div class="level-bottom-item ${level-bottom-itemClass}" codes="${codes}">${itemTypes}</div>',
                itemType :'<div class="level-bottom-item-type">${type}：${value}</div>'
        },
        defaultEvent = {
            creat:function (data) {
                console.log('生成营销人群',data);
            },
            join:function (data) {
                console.log('加入群组',data);
            },
            clickItemCb :function (type) {
                console.log('点击'+type);
            },
            addItemCb:function (type) {
                console.log('添加了'+type);
            },
            reset:function () {
                __totalCount=0;
                __itemWrap.empty();
                var cacheData = [];
                $.each(__datas, function(index, val) {
                     defaultEvent.clickItemCb(val.codes);
                });
                $.each(__initialData, function(index, val) {
                    renderItem(val);
                    cacheData.push(val);
                    defaultEvent.addItemCb(val.codes);
                });
                __datas = cacheData;
            }
         },
         /* 
            __panelType: add 添加  点击tree生成  change 由初始化数据生成（默认tree已经点击）
            __initialData： 存储默认点击tree的数据
         */
        __root,__totalCount,__datas,__itemWrap,
        __panelType,
        __initialData = [];  
    function init($root,events) {
        __root = $root;
        $root.html(templates.penel).show();
        __totalCount = 0;
        __datas = [];
        __itemWrap = $root.find('.level-bottom-itemWrap');
        console.log(__panelType);
        if(__panelType == 'change'){
            $('.level-bottom-wrap').addClass('level-bottom-change');
        }else{
            $('.level-bottom-wrap').addClass('level-bottom-create');
        }
        $.extend(true, defaultEvent, events);
        $('body').addClass('panel-botttom-on');
        bindEvent();
    }
    function bindEvent() {
        //生成营销人群
        __root.find(".level-bottom-ctrl1").click(function () {
            defaultEvent.creat(__datas);
        })
        //加入群组
        __root.find(".level-bottom-ctrl2").click(function () {
            defaultEvent.join(__datas);
        })
        //修改群组人群情况 重置
        __root.find(".level-bottom-ctrl4").click(function () {
            defaultEvent.reset();
        })
        //取消已选择人群
        __itemWrap.on('click', '.level-bottom-item', function(event) {
           var codes = $(this).attr('codes');
           exports.removeItem({codes:codes});
           defaultEvent.clickItemCb(codes);
        });
    }
    //添加选择
    exports.addItem = function (data,$root,events,type) {
        if(!__panelType){
            __panelType = type;
        }
        if($root.find('.level-bottom-item').length == 0){
            init($root,events);
        }

        if(type =='change'){
            __initialData.push(data);
        }
        __datas.push(data);
        renderItem(data);
    }

    function renderItem(data) {
        __totalCount += data.count;
        var itemTypes = '',codes = '';
        var datasArr = data.typeDataArr; 
        $.each(datasArr, function(index, val) {
            itemTypes += CommonTools.CoreTools.template(templates.itemType,val);
            console.log(val.valCode);
            codes +=  val.valCode;
        });
        var obj = {
            'level-bottom-itemClass':'level-bottom-item'+data.typeDataArr.length,
            codes:data.codes,
            itemTypes:itemTypes
        }
        var $item = $(CommonTools.CoreTools.template(templates.item,obj));
        $item.data('typeDataArr',data.typeDataArr)
        __itemWrap.append($item);
        __root.find('.num').html(__totalCount);
    }
     //减少选择
    exports.removeItem = function (data) {
        if($(".level-bottom-item").length == 1){
            exports.destroy();
            $('body').removeClass('panel-botttom-on');
            return;
        }
        removeData(data.codes);
       __root.find('.level-bottom-item[codes="'+data.codes+'"]').remove();
    }
    function removeData(type) {
        var i;
        $.each(__datas, function(index, val) {
             if(val.codes == type){
                i =index;
                return ;
             }
        });
        __datas.splice(i,1);
    }
    exports.destroy = function (data) {
       __root.html('').hide();
       __datas = [];
    }
    return exports;
})();


//生成人群
var creatGroupDialog = (function () {
    var exports = {};
    var defaultOptions = {
        title:'生成人群',
        body:'<div class="dialog-drill-wrap"></div>',
        close:'返回',
        submit:'提交',
        submitCb:postData
    },
    optionsTemplate = '<option class="form-item-option" value="${code}">${desc}</option>',
    __data,__itemWrap,__bizScenesOptions = '',__useScenesOptions = '';

    exports.init = function (opt) {
        $.extend(true,defaultOptions,opt);
        __data = generateData(opt.data);
        CommonTools.dialog.init(defaultOptions);
        __itemWrap = $('#myModal').find('.dialog-drill-wrap');
        //渲染视图
        optionsInit(staticFormData);
        renderView[$('#myModal .j-selectCreateType:checked').val()]();
        ctrl();
        activeCtrl();
        CommonTools.dialog.show();
    }
    function generateData(data) {
        var datas = [],conditions=[];
        $.each(data, function(index, val) {
            var text = '',condition=[];
            $.each(val.typeDataArr, function(i, v) {
                text+=(v.type+':'+v.value+'&nbsp;&nbsp;&nbsp;&nbsp;');
                condition.push({attrCode:v.attrCode,attrValues:v.valCode});
            });
            datas.push($.extend(true,val,{selectType:text}));
            conditions.push(condition);
        });
        return {datas:datas,conditions:conditions};
    }
    function optionsInit(formData){
        $.each(formData.bizScenes, function(index, val) {
             __bizScenesOptions += CommonTools.CoreTools.template(optionsTemplate,val);
        });

        $.each(formData.useScenes, function(index, val) {
             __useScenesOptions += CommonTools.CoreTools.template(optionsTemplate,val);
        });
    }
    var renderView = {
        single : function () {
            console.log(__data);
           var html = '';
            $.each(__data.datas, function(index, val) {
                $.extend(true,val, {bizScenesOptions:__bizScenesOptions,useScenesOptions:__useScenesOptions,conditions:JSON.stringify(__data.conditions[index])});
                html += CommonTools.CoreTools.template(defaultOptions.itemTemplate,val);
            });
            __itemWrap.html(html);
        },
        combine :function () {
            var item = $(defaultOptions.itemTemplate),
                template = item.find('.dialog-drill-item-type').html();
                html='';
            $.each(__data.datas, function(index, val) {
                $.extend(true,val, {bizScenesOptions:__bizScenesOptions,useScenesOptions:__useScenesOptions});
                html += CommonTools.CoreTools.template(template,val);
            });
           item.find('.dialog-drill-item-type').html(html);
           item.data('conditions',JSON.stringify(__data.conditions));
           __itemWrap.html('').append(item);
        }
    }
    function ctrl() {
        $('.j-selectCreateType').change(function(event) {
            var val = $('.j-selectCreateType:checked').val();
            renderView[val]();
            activeCtrl();
        });
    }
    function activeCtrl(){
        $(".form-item-datetimepicker .form-radio-label").on('change', function(event) {
            var value = $(this).find("input:checked").val();
            if (value == 1) {
                $(this).parent().find('.form-label-datetimepicker').hide();
                $(this).parent().find('.form-label-datetimepicker input').val("");
            }else{
                $(this).parent().find('.form-label-datetimepicker').css("display", "inline-block");

            }
        });
        $(".form-item-autoRun .form-radio-label").on('change', function(event) {
            var value = $(this).find("input:checked").val();
            if (value == 2) {
                $(this).parents('.form-item-autoRun').siblings('.form-item-datetimepicker').hide();
                $(this).parents('.form-item-autoRun').find('.form-label-datetimepicker input').val("");
            }else{
                $(this).parents('.form-item-autoRun').siblings('.form-item-datetimepicker').show();

            }
        });
        $(".custom-datetime").datetimepicker({
            minView: '0',
            minuteStep: 1,
            startDate: new Date(),
            format: "yyyy-mm-dd hh:ii:ss"
        });
        $(".validity-datetime").datetimepicker({
            minView: '0',
            minuteStep: 1,
            startDate: new Date(),
            format: "yyyy-mm-dd hh:ii:ss"
        });
    }

    function postData(){
         validForm();
         if(getValid()){
             $.ajax({
              type: "POST",
              url: "/userCenter/group/createDrillGroup",
              data: JSON.stringify(getPostData()),//将对象序列化成JSON字符串
              dataType:"json",
              contentType : 'application/json;charset=utf-8', //设置请求头信息
              success: function(data){
                    if(data.code==1){
                         cb&&cb(data.data);
                    }else{
                        CommonTools.messageFactory.error(data.msg);
                    }
                  }
              });
         }
    }

    //数据校验
    function validForm() {
        $(".dialog-drill-item").each(function(index, el) {
           $(el).validate({
                rules: {
                    groupName: {
                        required: true,
                        minlength: 2,
                        maxlength: 20
                    },
                    bizSceneCode: {
                        required: true
                    },
                    actType: {
                        required: true
                    },
                    immediateTime:{
                        required:true
                    },
                    expireTime:{
                        required:true
                    },
                    runType:{
                        required:true
                    }
                },
                messages: {
                    groupName: {
                        required: '请输入人群组名称',
                        minlength: '人群组名称不能小于2个字符',
                        maxlength: '人群组名称不能超过20个字符'
                    },
                    bizSceneCode: {
                        required: '请选择业务场景'
                    },
                    actType: {
                        required: '请选择使用场景'
                    },
                    immediateTime: {
                        required: '请选择执行时间'
                    },
                    expireTime: {
                        required: '请选择有效期时间'
                    },
                    runType: {
                        required: '请选择是否自动更新'
                    }
                }
            });
           
        });
    }
    function validDate() {
        $(".dialog-drill-item").each(function(index, el) {
            //expireTime
            $(el).find(".validity-datetime").change(function() {
                var immediateTime;
                var expireTime = (new Date($(this).val())).getTime();
                $(el).data('expireTime',expireTime);
               //自动更新
                if($(el).data('runtype') == 2){
                    if(expireTime-(new Date).getTime() < 24* 3600000){
                        addErrorMsg($(this),'过期时间要比当前时间晚一天');
                    }else{
                        removeErrorMsg($(this));
                    }
                }else{
                    immediateTime  = $(this).data('immediateTime');
                    if(expireTime - immediateTime < 24* 3600000){
                        addErrorMsg($(this),'过期时间要比当前时间晚一天');
                    }
                }

           });
            //immediateTime
            $(el).find(".custom-datetime").change(function() {
                //非自动更新
                if($(el).data('runtype') == 1){
                    var immediateTime = new Date($(this).val());
                    $(el).data('immediateTime',immediateTime.getTime());

                }
               
           });
        });
        function addErrorMsg($ele,text) {
            var errorHtml  =  '<label class="error">'+text+'</label>';

            $ele.parent('.form-control-wrap').append(errorHtml);
        }
        function removeErrorMsg($ele,text) {
            $ele.parent('.form-control-wrap').depend('label.error');
        }
    }
    function getValid(){
        var valid ;
        $(".dialog-drill-item").each(function(index, el) {
            valid = $(el).valid();
            if(!valid){
                return ;
            }
        });
        return valid;
    }
    function getPostData(){
        var data  =[];
        $(".dialog-drill-item").each(function(index, el) {
            var d = $(el).serializeJsonParams();
            d.srcGroupCode = window.srcGroupCode;
            d.conditions = $(el).data('conditions');
            data.push(d)
        });
        console.log(data);
        return data;
    }
    return exports;
})();

//加入群组
var joinGroupDialog = (function () {
    var exports = {};
    var defaultOptions = {
        title:'加入群组',
        body:'<div class="div">group-bd</div>',
        close:'返回',
        submit:'提交'
    },
    __data,__itemWrap;

    exports.init = function (opt) {
        $.extend(true,defaultOptions,opt);
        __data = generateData(opt.data);
        CommonTools.dialog.init(defaultOptions);
        __itemWrap = $('#myModal').find('.dialog-drill-wrap');
        __groupWrap = $('#myModal').find('.group-bd');
        renderView[$('#myModal .j-selectCreateType:checked').val()]();
        var groupType = $('#myModal .group-hd').find('.btn-success').data('view');
        renderView.renderGroup(groupType);
        ctrl();
        CommonTools.dialog.show();
    }
    function generateData(data) {
        var arr = [];
        $.each(data, function(index, val) {
            var text = '';
            $.each(val.typeDataArr, function(i, v) {
                text+=(v.type+':'+v.value+'&nbsp;&nbsp;&nbsp;&nbsp;');
            });
            arr.push({selectType:text});
        });
        return arr;
    }
    var renderView = {
        single : function () {
           var html = '';
            $.each(__data, function(index, val) {
                html += CommonTools.CoreTools.template(defaultOptions.itemTemplate,val);
            });
            __itemWrap.html(html);
        },
        combine :function () {
            var item = $(defaultOptions.itemTemplate),
                template = item.find('.dialog-drill-item-type').html();
                html='';
            $.each(__data, function(index, val) {
                html += CommonTools.CoreTools.template(template,val);
            });
           item.find('.dialog-drill-item-type').html(html);
           __itemWrap.html('').append(item);
        },
        renderGroup:function (type) {
            var html = defaultOptions[type];
            __groupWrap.html(html);
            if(type=='createView'){
                createViewCtrl();
            }
        }
    }
    function ctrl() {
        $('.j-selectCreateType').change(function(event) {
            var val = $('.j-selectCreateType:checked').val();
            renderView[val]();
        });
        var groupTypeBtn = $('#myModal .group-hd').find('.btn');
        groupTypeBtn.click(function(event) {
            if(!$(this).hasClass('btn-success')){
                groupTypeBtn.toggleClass('btn-success');
                var groupType = $(this).data('view');
                renderView.renderGroup(groupType);
            }
         });
        __groupWrap.on('change', '.form-item-datetimepicker .form-radio-label', function(event) {
            var value = $(this).find("input:checked").val();
            if (value == 1) {
                $(this).parent().find('.form-label-datetimepicker').hide();
                $(this).parent().find('.form-label-datetimepicker input').val("");
            }
            if (value == 2) {
                $(this).parent().find('.form-label-datetimepicker').css("display", "inline-block");
            }
        });
    }
    function createViewCtrl() {
        $(".custom-datetime").datetimepicker({
            minView: '0',
            minuteStep: 1,
            startDate: new Date(),
            format: "yyyy-mm-dd hh:ii:ss"
        });
        $(".validity-datetime").datetimepicker({
            minView: '2',
            startDate: new Date(),
            format: "yyyy-mm-dd"
        });
    }
    return exports;
})();


function getTreeParam() {
    var param = {};
    param.srcGroupCode = srcGroupCode;
    param.filterConditions =panelSelect.getFilterConditions();
    param.drillAttrs = dragPanel.getAttrCodes();
    return param;
}
function getTreeData(param,cb) {

    $.ajax({
      type: "POST",
      url: "/userCenter/drill/doDrill",
      data: JSON.stringify(param),//将对象序列化成JSON字符串
      dataType:"json",
      contentType : 'application/json;charset=utf-8', //设置请求头信息
      success: function(data){
            if(data.code==1){
                 cb&&cb(data.data);
            }else{
                CommonTools.messageFactory.error(data.msg);
            }
          }
      });
     
}
