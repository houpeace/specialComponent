 

/*提交钻取结构图数据*/
$('#j-side-panel').on('click', '.btn-success', function(event) {
     CommonTools.SidePanel.hide('#j-side-panel')
});



function getTreeParam() {
    var param = {};
    param.srcGroupCode = srcGroupCode;
    param.filterConditions =panelSelect.getFilterConditions();
    param.drillAttrs = dragPanel.getAttrCodes();
    //cacheFilterConditions = param.filterConditions;
    return param;
}
function getTreeData(param,cb) {
    if(param.drillAttrs.length ==0){
        CommonTools.messageFactory.error('必须要选择一个钻取指标');
        return false;
    }
    $.ajax({
      type: "POST",
      url: "/userCenter/drill/doDrill",
      data: JSON.stringify(param),//将对象序列化成JSON字符串
      dataType:"json",
      contentType : 'application/json;charset=utf-8', //设置请求头信息
      success: function(data){
            if(data.code==1){
                cacheFilterConditions = param.filterConditions;
                cb&&cb(data.data);
            }else{
                CommonTools.messageFactory.error(data.message);
            }
          }
      });
     
}
    
var pennelEvent = {
    creat:function(d){ 
        var creatGroupDialogOpt = {
            itemTemplate : $('#tlp-createGroup-item').html(),
            body : $('#tlp-createGroup').html(),
            data:d
        }
        creatGroupDialog.init(creatGroupDialogOpt); 
    },
    join:function(d){
        if(d.length >staticFormData.maxOrgIncludeGroupNum){
            bootbox.alert('加入人群组的人群数量最多不能超过'+staticFormData.maxOrgIncludeGroupNum+'个')
            return false;
        }
        var joinGroupDialogOpt = {
            data:d,
            body:$('#tlp-joinGroup').html(),
            itemTemplate:$('#tlp-joinGroup-item').html(),
            joinView:$('#tlp-joinGroup-join').html(),
            createView:$('#tlp-joinGroup-create').html()
        }
        joinGroupDialog.init(joinGroupDialogOpt);
    },
    clickItemCb:function(type){
       levelTree.defaultLevel(type);
    },
    addItemCb:function (type) {
        levelTree.selectLevel(type);
    },
    save:function (data) {
        var drillConditions = [];
        $.each(data, function(index, val) {
            var drillCondition = [];
            $.each(val.typeDataArr, function(i,v) {
                drillCondition.push({
                    "attrCode":v.attrCode,
                    "attrValues":[v.valCode]
                })
            });
            drillConditions.push(drillCondition);
        });
        value = {
            filterConditions:cacheFilterConditions,
            drillConditions:drillConditions
        },
        key = CommonTools.CoreTools.getQueryString('pageId');
        localStorage.setItem(key,JSON.stringify(value));
        bootbox.alert({
            message: '修改成功~',
            callback: function() {
                window.close();
            }
        })
    }
}

var handler = {
    clickLevel:function (data,flag,type) {
        var obj = {}; 
        obj.typeDataArr = JSON.parse(data.datas);
        obj.count = data.levelData.count;
        obj.attrCode = data.levelData.attrCode;
        obj.valCode = data.levelData.valCode;
        var codes =[];
        $.each(obj.typeDataArr, function(index, val) {
            codes.push(val.valCode);
        });
        obj.codes =codes.join(',');
        if(obj.typeDataArr.length !=1){
           obj.typeDataArr.shift(); 
        }

        //obj.datatype = obj.datatype.replace(/\,|\:/g,'');

        var events = ['addItem','removeItem'];
        bottomPanel[events[flag]](obj,$("#j-levelBottom"),pennelEvent,type);
    }
}

function renderTree(treeData) {
    var treeOpt = {
        sideRoot: $("#j-levelSide"),
        renderSide: true,
        handler: handler,
        falseEventLevel:0
    }
    levelTree.init(treeData,$('#j-levelTree'),treeOpt);
}
var cacheFilterConditions = panelSelectData.checkList; //用于提交人群人群人群组的filterConditions之用
~(function(){
    if(panelSelectData.optionList == undefined){
        panelSelectData.optionList = []
    }
    if(panelSelectData.checkList == undefined){
        panelSelectData.checkList = []
    }
    var panelSelectOption = {
        root:$('#j-panel-select'),
        data:panelSelectData
    }


    panelSelect.init(panelSelectOption)

    var checkPanelOption = {
        data:checkPanelData,
        maxSelect:staticFormData.maxDrillLayerNum,
        root:$('.level-contruct-floor1'),
        checkedFun:dragPanel.add,
        unCheckedFun:dragPanel.sub,
        overSelectFun:function () {
            CommonTools.messageFactory.error('最多只能选5个哦~')
        }
    }
    checkPanel.init(checkPanelOption);

    /*拖动*/
    var dragOpt = {
        wrap:$('.level-contruct-drag'),
        data:checkPanelData,
        itemHeight:36
    }


    dragPanel.init(dragOpt); 
    if(checkPanelData.checkList.length >0){
        if(window.isDebug){
            renderTree(treeData);
        }else{
            var param =getTreeParam();
            getTreeData(param,function (data) {
               renderTree(data);
            })
        }
    }
    
   //查询条件，获取数据   
    $('#j-panel-select').on('click', '#j-select-btn', function(event) {
       var param =getTreeParam();
       selectNodesAttr = [];
       bottomPanel.destroy();
       getTreeData(param,function (data) {
           renderTree(data);
       })
    });


    $('#j-drag-btn').click(function(event) {
        var param =getTreeParam();
        selectNodesAttr = [];
        bottomPanel.destroy();
        getTreeData(param,function (data) {
           renderTree(data);
           CommonTools.SidePanel.hide('#j-side-panel')
       })
    });
})()