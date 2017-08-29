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
    	// 	view.renderSelect();
    	//		data.pushSelectData();
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