
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
                item : '<div class="level-bottom-item ${level-bottom-itemClass}" codes="${codes}" count="${count}">${itemTypes}</div>',
                itemType :'<div class="level-bottom-item-type" title="${type}：${value}">${type}：${value}</div>'
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
            save:function (data) {
                console.log('保存数据',data);
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
                if(__datas.length==0){
                    __root.find('.num').html(0);
                }
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
        bottomPanel.clear();
        $root.html(templates.penel).show();
        __totalCount = 0;
        __datas = [];
        __itemWrap = $root.find('.level-bottom-itemWrap');
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
        //修改群组人群情况 保存
        __root.find(".level-bottom-ctrl3").click(function () {
            defaultEvent.save(__datas);
        })
        //修改群组人群情况 重置
        __root.find(".level-bottom-ctrl4").click(function () {
            defaultEvent.reset();
        })
        //取消已选择人群
        __itemWrap.on('click', '.level-bottom-item', function(event) {
           var codes = $(this).attr('codes'),count = $(this).attr('count');
           exports.removeItem({codes:codes,count:count});
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
            codes +=  val.valCode;
        });
        var obj = {
            'level-bottom-itemClass':'level-bottom-item'+data.typeDataArr.length,
            codes:data.codes,
            count:data.count,
            itemTypes:itemTypes
        }
        var $item = $(CommonTools.CoreTools.template(templates.item,obj));
        $item.data('typeDataArr',data.typeDataArr)
        __itemWrap.append($item);
        __root.find('.num').html(__totalCount);
    }
     //减少选择
    exports.removeItem = function (data) {
        __totalCount -= data.count;
        if($(".level-bottom-item").length == 1){
            exports.destroy();
            $('body').removeClass('panel-botttom-on');
            return;
        }
        removeData(data.codes);
       __root.find('.level-bottom-item[codes="'+data.codes+'"]').remove();
       __root.find('.num').html(__totalCount);
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
    exports.clear = function () {
        __datas = [];
        __root.html('');
    }
    exports.destroy = function (data) {
        if(__datas){
           __root.html('').hide();
           __datas = [];
           __initialData = []; 
        }

    }
    return exports;
})();
