//侧边信息

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
        minOffset,maxOffset,
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