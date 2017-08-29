/*渲染树*/
var levelTree = (function () {
    var exports = {},
        defaultOptions = {
            template : '<div class="level ${level} ${select}">\
                        <i class="level-icon"></i>\
                        <span class="level-item level-name" title="${name}">${name}</span>\
                        <span class="level-item level-item-count" title="${count}"><span class="num">${count}</span></span>\
                        <span class="level-item level-item-rate" title="整体占比：${rate2}">整体占比：<span class="num">${rate2}</span></span>\
                        <span class="level-item level-item-rate" title="上级占比：${rate1}">上级占比：<span class="num">${rate1}</span></span>',
            sideTemplate:'<div class="level-side-item" title="${type}">${type}</div>',
            handler : {
                clickLevel:function (data) {
                    //console.log(data);
                }
            },
            falseEventLevel:-1/*不需要相应事件的楼层*/
        },
        /*level = 0,*/
        __nodeDeep,
        __root;
    exports.init = function (obj,wrap,opts) {
        __root = wrap;
        $.extend(true,defaultOptions,opts);
        __root.empty();
        __nodeDeep = -1;
        if(defaultOptions.renderSide){
            defaultOptions.sideRoot.empty();
        }
        buildNode(obj,wrap,defaultOptions);
        if(selectNodesAttr.length>0){
            renderSelectNode(selectNodesAttr);
        }
        bindNode(wrap.children('.level-wrap'),defaultOptions.handler);        
        setTimeout(function() {
            wrap.find('.level-select').each(function(index, el) {
                defaultOptions.handler.clickLevel($(el).data(),0,'change');
            });
        },100);
    }
   
    function buildNode(obj,wrap,opts,index) {
        var $levelWrap = $('<div class="level-wrap leve-down"></div>');
        var index = index ||0;
        var datatObj = getDataType(wrap,obj,index);
        
        $levelWrap.data('datas',datatObj.datas).attr('codes', datatObj.codes.join(','));
        var parentIndex = obj.parentIndex||0;

        var parentLevel = obj.parentLevel == undefined ? -1:obj.parentLevel;

        var level = parentLevel+1; 
        if(__nodeDeep == parentLevel && defaultOptions.renderSide){
            __nodeDeep = level;
            renderSidebar(obj.attrText);
        }
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

    //初始化点击状态
    function renderSelectNode(arrs) {
        var prefix = __root.find('.level0').attr('codes'),
            attr = '';
        $.each(arrs, function(index, val) {
            attr =  prefix + val;
            __root.find('.level[codes="'+attr+'"]').addClass('level-select');
        });
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
            if(defaultOptions.falseEventLevel!=-1){
                var falseEventLevelClass = 'level'+defaultOptions.falseEventLevel;
                if($(this).hasClass(falseEventLevelClass)){
                    return false;
                }
            }
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
            var length = sideRoot.find('.level-side-item').length;
            sideRoot.find('.level-side-item').on('click', function(event) {
                var i = $('.level-side-item').index(this);
                if(i==length-1){
                    return;
                }
                var $levelWrap = $('.level-wrap'+i);
                if($(this).hasClass('level-side-item-gray')){
                    $levelWrap.addClass('level-down').removeClass('level-up');                     
                 }else{
                    $levelWrap.removeClass('level-down').addClass('level-up');
                 }
                // var className = checkAllSameClass($levelWrap,'level-down','level-up');
                // //没全展开
                // if(!className){
                //     $levelWrap.removeClass('level-down').addClass('level-up');
                // }else{
                //     $levelWrap.removeClass(className[0]).addClass(className[1]);
                // }
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
