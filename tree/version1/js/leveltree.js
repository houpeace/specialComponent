var levelTree = (function () {
    var exports = {};
    var level = 0;
    var defaultOptions = {
        template : '<div class="level ${level}">\
                    <i class="level_icon"></i>\
                    <span class="level_item level_name">${name}</span>\
                    <span class="level_item level_item_count">${count}</span>\
                    <span class="level_item level_item_rate">整体占比:${rate1}</span>\
                    <span class="level_item level_item_rate">上级占比:${rate2}</span>',
        sideTemplate:'<div class="levelSide_item">${type}</div>',
        handler : {
            clickLevel:function (data) {
                console.log(data);
            }
        }
    }
    exports.init = function (obj,wrap,opts) {
        exports.__root = wrap;
        $.extend(true,defaultOptions,opts);
        buildNode(obj,wrap,defaultOptions);
        bindNode(wrap,defaultOptions.handler);
    }
    function template(str, data, regexp) {
        return str.replace(regexp || /\${([^{}]*)}/g, function (str, p1) {
            return (data[p1]!==undefined&&data[p1]!==null&&data[p1].toString())||"";
        });
    }
    exports.__nodeDeep = -1;


    function renderSidebar(type) {
        var sideRoot = defaultOptions.sideRoot;
        var sideNode = defaultOptions.sideTemplate.replace('${type}',type);
        sideRoot.append(sideNode);
    }
    function buildNode(obj,wrap,opts,index) {
        var $levelWrap = $('<div class="levelWrap level_down"></div>');
        var index = index ||0;
        var datatype = wrap.data('datatype') == undefined ?obj.value[index]:wrap.data('datatype')+','+obj.value[index];
       

        $levelWrap.data('datatype',datatype);
        var parentIndex = obj.parentIndex||0;

        var parentLevel = obj.parentLevel == undefined ? -1:obj.parentLevel;

        var level = parentLevel+1; 
        if(exports.__nodeDeep == parentLevel){
            exports.__nodeDeep = level;
            renderSidebar(obj.type);
        }
       
        var name = obj.value[index];
        var children = obj.children;

        var levelData = getLevelData(obj,parentIndex,index,level);
        var node = $(template(opts.template,levelData));
        node.data('levelData', levelData).data('datatype',datatype);
        $levelWrap.append(node).addClass('levelWrap'+level);


        if(obj.children){
            $.each(children.value, function(i, v) {
                children.parentIndex =parentIndex*obj.value.length+index;
                children.parentLevel = level ;
                buildNode(children,$levelWrap,defaultOptions,i);
            });
        }
        wrap.append($levelWrap);    
    }
    //获取节点的数据
    function getLevelData(obj,index1,index2,level) {
        var data = {
            name:obj.value[index2],
            level:'level'+level,
            count:obj.data[index1].count[index2],
            rate1:obj.data[index1].rate1[index2],
            rate2:obj.data[index1].rate2[index2]
        }
        return data;
    }
    function bindNode(wrap,handler) {
        wrap.on('click', '.level_icon', function(event) {
            var levelWrap = $(this).parent('.level').parent('.levelWrap');
            levelWrap.toggleClass('level_down');
            levelWrap.toggleClass('level_up');
            return false;
            /* Act on the event */
        });
        wrap.on('click', '.level', function(event) {
            var levelWrap = $(this).parent('.levelWrap');
            
            if(!checkParentOrChidlHasSelect($(this))){
               $(this).toggleClass('level_select');
               defaultOptions.handler.clickLevel($(this).data());
            }
            console.log($(this).data());
            event.preventDefault();
            /* Act on the event */
        });
        if(defaultOptions.renderSide){
            var sideRoot = defaultOptions.sideRoot;
            sideRoot.on('click', '.levelSide_item', function(event) {
                var i = $('.levelSide_item').index(this);
                var $levelWrap = $('.levelWrap'+i);
                var className = checkAllSameClass($levelWrap,'level_down','level_up');
                //没全展开
                if(!className){
                    $levelWrap.removeClass('level_down').addClass('level_up');
                }else{
                    $levelWrap.removeClass(className[0]).addClass(className[1]);
                }
                $(this).toggleClass('levelSide_item_gray');
            })
        }
    }
    //判断level节点的父节点或者子节点是否选择
    function checkParentOrChidlHasSelect($level) {
         var levelWrap = $level.parent('.levelWrap');
         var childLevel = levelWrap.find('.levelWrap').find('.level');
         var parentLevel = levelWrap.parents('.levelWrap').children('.level');
         if(childLevel.hasClass('level_select') || parentLevel.hasClass('level_select')){
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
        var wrap = exports.__root.find('.levelWrap'+exports.__nodeDeep);
        var nodeDeep  = exports.__nodeDeep
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