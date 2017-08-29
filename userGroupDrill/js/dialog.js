//弹窗 人群/人群组 信息 
function dialogComonCtrl() {
    //使用场景是跨系统营销时候显示应用场景
    $('select[name="actType"]').change(function(event) {
        var activitySceneWrap = $(this).parents('form').find('.form-item-activitySceneWrap');
        if (this.value == 2) {
            activitySceneWrap.show();
        } else {
            activitySceneWrap.hide();
        }
    });
    
    //时间事件改变
    CommonTools.UserGroupDateTimeOpr.dateEventChange();
    //设置有效期时间
    CommonTools.UserGroupDateTimeOpr.setValidityDatetimeValue();
    //自定义时间 选项改变
    CommonTools.UserGroupDateTimeOpr.actionTimeChange(); 
}


//生成人群
var creatGroupDialog = (function() {
    var exports = {};
    var defaultOptions = {
            title: '生成人群',
            body: '<div class="dialog-drill-wrap"></div>',
            close: '返回',
            submit: '提交',
            submitCb: postData
        },
        optionsTemplate = '<option class="form-item-option" value="@{code}">@{desc}</option>',
        checkedTemplate = '<label class="form-checkbox-label"><input type="checkbox" name="@{name}" value="@{code}" @{disabled} @{checked}>@{desc}</label>',
        __data, __itemWrap, __bizScenesOptions, __useScenesOptions;

    exports.init = function(opt) {
        $.extend(true, defaultOptions, opt);
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
        __bizScenesOptions = __useScenesOptions = __applyScenesCheckeds = "";
        var datas = [],
            conditions = [];
        $.each(data, function(index, val) {
            var text = '',
                condition = [];
            $.each(val.typeDataArr, function(i, v) {
                text += (v.type + ':' + v.value + '&nbsp;&nbsp;&nbsp;&nbsp;');
                condition.push({
                    attrCode: v.attrCode,
                    attrValues: [v.valCode]
                });
            });
            datas.push($.extend(true, val, {
                selectType: text
            }));
            conditions.push(condition);
        });
        return {
            datas: datas,
            conditions: conditions
        };
    }

    function optionsInit(formData) {
        $.each(formData.bizScenes, function(index, val) {
            __bizScenesOptions += CommonTools.CoreTools.template(optionsTemplate, val, /\@{([^{}]*)}/g);
        });

        $.each(formData.useScenes, function(index, val) {
            __useScenesOptions += CommonTools.CoreTools.template(optionsTemplate, val, /\@{([^{}]*)}/g);
        });
        $.each(staticFormData.applyScenes, function(index, val) {
            __applyScenesCheckeds += CommonTools.CoreTools.template(checkedTemplate, val, /\@{([^{}]*)}/g);
        });
    }
    var renderView = {
        single: function() {
            // console.log(__data);
            var html = '';
            $.each(__data.datas, function(index, val) {
                $.extend(true, val, {
                    bizScenesOptions: __bizScenesOptions,
                    useScenesOptions: __useScenesOptions,
                    applyScenesCheckeds: __applyScenesCheckeds,
                    conditions: JSON.stringify(__data.conditions[index])
                });
                html += CommonTools.CoreTools.template(defaultOptions.itemTemplate, val, /\@{([^{}]*)}/g);
            });
            __itemWrap.html(html);
        },
        combine: function() {
            var item = $(defaultOptions.itemTemplate),
                template = item.find('.dialog-drill-item-type').html(),
                selectType = '',
                html = '';
            $.each(__data.datas, function(index, val) {
                $.extend(true, val, {
                    bizScenesOptions: __bizScenesOptions,
                    useScenesOptions: __useScenesOptions,
                    applyScenesCheckeds: __applyScenesCheckeds
                });
                selectType += CommonTools.CoreTools.template(template, val, /\@{([^{}]*)}/g);
                // console.log(selectType);
            });
            var optionObj = {
                selectType: selectType,
                bizScenesOptions: __bizScenesOptions,
                useScenesOptions: __useScenesOptions,
                applyScenesCheckeds: __applyScenesCheckeds,
                conditions: JSON.stringify(__data.conditions)
            }
            html += CommonTools.CoreTools.template(defaultOptions.itemTemplate, optionObj, /\@{([^{}]*)}/g);

            __itemWrap.html(html).find('.dialog-drill-item-type p').eq(0).remove();
        }
    }

    function ctrl() {
        $('.j-selectCreateType').change(function(event) {
            $('.datetimepicker').remove();
            var val = $('.j-selectCreateType:checked').val();
            renderView[val]();
            activeCtrl();
        });

    }

    function activeCtrl() {
        $(".form-item-autoRun .form-radio-label").on('change', function(event) {
            var value = $(this).find("input:checked").val();
            if (value == 2) {
                $(this).parents('.form-item-autoRun').siblings('.form-item-datetimepicker').hide();
                $(this).parents('.form-item-autoRun').find('.form-label-datetimepicker input').val("");
            } else {
                $(this).parents('.form-item-autoRun').siblings('.form-item-datetimepicker').show();

            }
        });
        dialogComonCtrl();
    }

    function postData() {
        validForm();
        var data = getPostData();
        // console.log(data);
        if (getValid()) {
            $.ajax({
                type: "POST",
                url: "/userCenter/drill/createDrillGroup",
                data: JSON.stringify(data), //将对.象序列化成JSON字符串
                dataType: "json",
                contentType: 'application/json;charset=utf-8', //设置请求头信息
                success: function(data) {
                    if (data.code == 1) {
                        CommonTools.messageFactory.success('提交成功');
                        CommonTools.dialog.distroy();
                    } else {
                        bootbox.alert(data.message);
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
                    immediateTime: {
                        required: true
                    },
                    expireTime: {
                        required: true
                    },
                    runType: {
                        required: true
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
                        required: '请选择营销类型'
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
    //前端暂时不做日期校验 ~
    function validDate() {
        $(".dialog-drill-item").each(function(index, el) {
            var $form = $(el),
                $runType = $form.find('input[name="runType"]'),
                $immediateTime = $form.find('input[name="immediateTime"]'),
                $expireTime = $form.find('input[name="expireTime"]');
            //expireTime
            $expireTime.change(function() {
                validSingleDate($expireTime, $immediateTime, $runType);
            });
            //immediateTime
            $immediateTime.change(function() {
                validSingleDate($expireTime, $immediateTime, $runType);
            });
        });

        function validSingleDate($expireTime, $immediateTime, $runType) {
            var expireTime = (new Date($expireTime.val() + ' 00:00:00')).getTime();
            //自动更新
            if ($runType.val() == 2) {
                if (expireTime - (new Date).getTime() < 24 * 3600000) {
                    addErrorMsg($expireTime, '过期时间要比当前时间晚一天');
                    $form.data('expireTimeTimeVaild', false);
                } else if (expireTime - (new Date).getTime() < 15 * 24 * 3600000) {
                    addErrorMsg($expireTime, '过期时间不能超过当前时间15天');
                    $form.data('expireTimeTimeVaild', false);
                } else {
                    $form.data('expireTimeTimeVaild', true);
                    removeErrorMsg($expireTime);
                }
            } else {
                if ($immediateTime.val() == "") {
                    return false;
                }
                immediateTime = (new Date($immediateTime.val() + ' 00:00:00')).getTime();
                if (expireTime - immediateTime < 24 * 3600000) {
                    addErrorMsg($expireTime, '过期时间要比执行时间晚一天');
                    addErrorMsg($immediateTime, '执行时间要比过期时间早一天');
                    $form.data('expireTimeTimeVaild', false);
                } else if (expireTime - immediateTime < 15 * 24 * 3600000) {
                    addErrorMsg($expireTime, '过期时间不能超过当前时间15天');
                    addErrorMsg($immediateTime, '执行时间要比过期时间早一天');
                    $form.data('expireTimeTimeVaild', false);
                } else {
                    $form.data('expireTimeTimeVaild', true);
                    removeErrorMsg($expireTime);
                    removeErrorMsg($immediateTime);
                }
            }
        }

        function addErrorMsg($ele, text) {
            var errorHtml = '<label class="error">' + text + '</label>';
            $ele.parents('.form-control-wrap').append(errorHtml);
        }

        function removeErrorMsg($ele) {
            $ele.parents('.form-control-wrap').depend('label.error');
        }
    }

    function getValid() {
        var valid = true;
        $(".dialog-drill-item").each(function(index, el) {
            valid = $(el).valid();
            if (!valid) {
                return;
            }
        });
        return valid;
    }

    function getPostData() {
        var data = {
            drillCreateVos: [],
            filterConditions: cacheFilterConditions
        };
        $(".dialog-drill-item").each(function(index, el) {
            var d = $(el).serializeJsonParams();
            d.srcGroupCode = window.srcGroupCode || null;
            d.conditions = getConditions($(el).data('conditions'));
            d.expireTime = d.expireTime + ' 23:59:59';
            d.immediateTime = d.immediating == 1 ? '' : d.immediateTime + ":00";
            if (d.sceneCodes) {
                d.sceneCodes = d.sceneCodes.split(',').concat(staticFormData.defaultApplyScenes);
            } else {
                d.sceneCodes = staticFormData.defaultApplyScenes;
            }
            if(!d.isImmediateDist){
                d.isImmediateDist = 0;
            }
            data.drillCreateVos.push(d)
        });
        return data;
    }

    function getConditions(condition) {
        var conditions;
        if (Object.prototype.toString.call(condition[0]) == "[object Array]") {
            conditions = condition;
        } else {
            conditions = [condition];
        }
        return conditions;
    }
    return exports;
})();
//生成人群
var joinGroupDialog = (function() {
    var exports = {};
    var defaultOptions = {
            title: '加入群组',
            body: '<div class="div">group-bd</div>',
            close: '返回',
            submit: '提交',
            submitCb: function() {
                dataUtil.postData();
            }
        },
        optionsTemplate = '<option class="form-item-option" value="@{code}">@{desc}</option>',
        checkedTemplate = '<label class="form-checkbox-label"><input type="checkbox" name="@{name}" value="@{code}" @{disabled} @{checked}>@{desc}</label>',
        __data, __itemWrap, __root, __bizScenesOptions, __useScenesOptions, __applyScenesCheckeds;
    exports.init = function(opt) {
        $.extend(true, defaultOptions, opt);
        __data = dataUtil.generateData(opt.data);

        view.optionsInit(staticFormData);
        CommonTools.dialog.init(defaultOptions);
        __root = $('#myModal')
        __itemWrap = __root.find('.dialog-drill-wrap');
        __groupWrap = __root.find('.group-bd');
        //视图渲染
        view[__root.find('.j-selectCreateType:checked').val()]();
        var groupType = __root.find('.group-hd .btn-success').data('view');

        GroupPanel.init({
            root: __root.find('.group-panel'),
            data: [],
            deleteItem: false,
            disable: false
        });
        GroupPanel.clear();
        view.renderGroup();
        view.showGrop(groupType);
        ctrl();
        CommonTools.dialog.show();
    }
    var dataUtil = {
        generateData: function(data) {
            __bizScenesOptions = __useScenesOptions = __applyScenesCheckeds = "";
            var datas = [],
                conditions = [];
            $.each(data, function(index, val) {
                var text = '',
                    condition = [];
                $.each(val.typeDataArr, function(i, v) {
                    text += (v.type + ':' + v.value + '&nbsp;&nbsp;&nbsp;&nbsp;');
                    condition.push({
                        attrCode: v.attrCode,
                        attrValues: [v.valCode]
                    });
                });
                datas.push($.extend(true, val, {
                    selectType: text
                }));
                conditions.push(condition);
            });

            return {
                datas: datas,
                conditions: conditions
            };
        },
        postData: function() {
            dataUtil.validForm();
            var type = __root.data('type');
            if (dataUtil.getValid(type)) {
                dataUtil.post[type](function() {
                    CommonTools.messageFactory.success('提交成功');
                    CommonTools.dialog.distroy();
                });
            }
        },
        validForm: function() {
            __root.find(".dialog-drill-item").each(function(index, el) {
                $(el).validate({
                    rules: {
                        groupName: {
                            required: true,
                            minlength: 2,
                            maxlength: 20
                        }
                    },
                    messages: {
                        groupName: {
                            required: '请输入人群组名称',
                            minlength: '人群组名称不能小于2个字符',
                            maxlength: '人群组名称不能超过20个字符'
                        }
                    }
                });

            });
            __root.find('.createViewForm').validate({
                rules: {
                    organizeName: {
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
                    immediateTime: {
                        required: true
                    },
                    expireTime: {
                        required: true
                    },
                    runType: {
                        required: true
                    }
                },
                messages: {
                    organizeName: {
                        required: '请输入人群组名称',
                        minlength: '人群组名称不能小于2个字符',
                        maxlength: '人群组名称不能超过20个字符'
                    },
                    bizSceneCode: {
                        required: '请选择业务场景'
                    },
                    actType: {
                        required: '请选择营销类型'
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
            })
        },
        getValid: function(type) {
            var validTop = true,
                validBottom = true;
            __root.find(".dialog-drill-item").each(function(index, el) {
                validTop = $(el).valid();
                if (!validTop) {
                    return;
                }
            });
            if (type == 'createView') {
                validBottom = __root.find('.createViewForm').valid();
            } else {
                validBottom = __root.find('.group-panel').data('organizeId') != undefined;
                if (!validBottom) {
                    CommonTools.messageFactory.error('你还没选择人群组');
                }
            }
            return validTop && validBottom;
        },
        post: {
            createView: function(cb) {
                var data = dataUtil.getPostData('creatView');
                // console.log(data);
                $.ajax({
                    type: "POST",
                    url: "/userCenter/drill/createDrillGroupsAndOrganize",
                    data: JSON.stringify(data), //将对象序列化成JSON字符串
                    dataType: "json",
                    contentType: 'application/json;charset=utf-8', //设置请求头信息
                    success: function(data) {
                        if (data.code == 1) {
                            cb && cb();
                        } else {
                            bootbox.alert(data.message);
                        }
                    }
                });
            },
            joinView: function(cb) {
                var data = dataUtil.getPostData('joinView');
                // console.log(data);
                $.ajax({
                    type: "POST",
                    url: "/userCenter/drill/addDrillGroupsToOrganize",
                    data: JSON.stringify(data), //将对象序列化成JSON字符串
                    dataType: "json",
                    contentType: 'application/json;charset=utf-8', //设置请求头信息
                    success: function(data) {
                        if (data.code == 1) {
                            cb && cb();
                        } else {
                            bootbox.alert(data.message);
                        }
                    }
                });
            }
        },
        getPostData: function(type) {
            var data = {},
                groupData = GroupPanel.getData();
            data.groupDrillVoList = [];
            data.filterConditions = cacheFilterConditions;
            var isImmediateDistObj = {};
            $('.dialog-drill-item').each(function(index, el) {
                var conditions = JSON.stringify($(this).data('conditions'));
                var isImmediateDist = $(this).find('[name="isImmediateDist"]').prop('checked')?1:0;
                isImmediateDistObj[conditions] = isImmediateDist;
            });
            if (type == 'creatView') {
                data.orgCreateVo = $(".createViewForm").serializeJsonParams();
                data.orgCreateVo.expireTime = data.orgCreateVo.expireTime + ' 23:59:59'; 
                data.orgCreateVo.immediateTime = data.orgCreateVo.immediating == 1 ? '' : data.orgCreateVo.immediateTime + ":00";
                
                if (data.orgCreateVo.sceneCodes != undefined) {
                    data.orgCreateVo.sceneCodes = data.orgCreateVo.sceneCodes.split(',').concat(staticFormData.defaultApplyScenes);
                } else {
                    data.orgCreateVo.sceneCodes = staticFormData.defaultApplyScenes;
                }
                $.each(groupData, function(index, val) {
                    var obj;
                    if (val.conditions) {
                        //钻取的数据
                        obj = {
                            groupName: val.text,
                            conditions: getConditions(val.conditions),
                            orderNum: val.index,
                            srcGroupCode: srcGroupCode
                        }
                        obj.isImmediateDist = isImmediateDistObj[val.conditions];
                    } else {
                        //搜索出来的数据
                        obj = {
                            groupName: val.text,
                            orderNum: val.index,
                            groupCode: val.groupCode
                        }

                    }
                    data.groupDrillVoList.push(obj);
                });
            } else {
                data.organizeId = __root.find('.group-panel').data('organizeId');
                $.each(groupData, function(index, val) {
                    var obj;
                    if (val.conditions) {
                        obj = {
                            groupName: val.text,
                            conditions: getConditions(val.conditions),
                            orderNum: val.index,
                            srcGroupCode: srcGroupCode
                        }
                        obj.isImmediateDist = isImmediateDistObj[val.conditions];
                    } else {
                        obj = {
                            groupName: val.text,
                            orderNum: val.index,
                            groupCode: val.groupCode
                        }
                    }
                    data.groupDrillVoList.push(obj)
                });

            }

            function getConditions(conditionJSON) {
                var conditions;
                var condition;

                condition = JSON.parse(conditionJSON);
                if (Object.prototype.toString.call(condition[0]) == "[object Array]") {
                    conditions = condition;
                } else {
                    conditions = [condition];
                }
                return conditions;
            }
            
            return data;
        },
        queryGroupInfor: function(organizeId, cb) {
            $.ajax({
                type: "POST",
                url: "/userCenter/organize/getGroupList",
                data: {
                    organizeId: organizeId
                }, //将对象序列化成JSON字符串
                dataType: "json",
                //contentType : 'application/json;charset=utf-8', //设置请求头信息
                success: function(data) {
                    if (data.code == 1) {
                        cb && cb(data.data);
                    } else {
                        bootbox.alert(data.message);
                    }
                }
            });
        },
        unshiftGroupData: function(dataLsit) {
            var unshiftData = [];
            $.each(dataLsit, function(index, val) {
                unshiftData.push({
                    text: val.groupName,
                    groupCode: val.groupCode,
                    orderNum: val.orderNum,
                    link: '/userCenter/group/toView?groupCode=' + val.groupCode
                })
            });
            unshiftData.sort(function(a, b) {
                return a.orderNum > b.orderNum
            })

            GroupPanel.unshift(unshiftData);
        }
    }
    var view = {
        optionsInit: function(formData) {
            $.each(formData.bizScenes, function(index, val) {
                __bizScenesOptions += CommonTools.CoreTools.template(optionsTemplate, val, /\@{([^{}]*)}/g);
            });

            $.each(formData.useScenes, function(index, val) {
                __useScenesOptions += CommonTools.CoreTools.template(optionsTemplate, val, /\@{([^{}]*)}/g);
            });

            $.each(formData.applyScenes, function(index, val) {
                __applyScenesCheckeds += CommonTools.CoreTools.template(checkedTemplate, val, /\@{([^{}]*)}/g);
            });
        },
        single: function() {
            var html = '';
            $.each(__data.datas, function(index, val) {
                $.extend(true, val, {
                    conditions: JSON.stringify(__data.conditions[index])
                });
                html += CommonTools.CoreTools.template(defaultOptions.itemTemplate, val, /\@{([^{}]*)}/g);
            });
            __itemWrap.html(html);
        },
        combine: function() {
            var item = $(defaultOptions.itemTemplate),
                template = item.find('.dialog-drill-item-type').html();
            selectType = '', html = '';
            conditions = [],
                codes = [];
            $.each(__data.datas, function(index, val) {
                conditions.push(JSON.parse(val.conditions));
                codes.push(val.codes)
                selectType += CommonTools.CoreTools.template(template, val, /\@{([^{}]*)}/g);
            });

            var optionObj = {
                selectType: selectType,
                bizScenesOptions: __bizScenesOptions,
                useScenesOptions: __useScenesOptions,
                applyScenesCheckeds: __applyScenesCheckeds,
                codes: codes.join(';'),
                conditions: JSON.stringify(__data.conditions)
            }
            html += CommonTools.CoreTools.template(defaultOptions.itemTemplate, optionObj, /\@{([^{}]*)}/g);

            __itemWrap.html(html).find('.dialog-drill-item-type p').eq(0).remove();
            //__itemWrap.find('.dialog-drill-item').data('conditions', conditions).data('codes', codes.join(';'));
        },
        renderGroup: function(type) {
            var creatViewData = {
                bizScenesOptions: __bizScenesOptions,
                useScenesOptions: __useScenesOptions,
                applyScenesCheckeds: __applyScenesCheckeds
            }
            var createViewHtml = CommonTools.CoreTools.template(defaultOptions['createView'], creatViewData, /\@{([^{}]*)}/g),
                html = defaultOptions['joinView'] + createViewHtml;
            __groupWrap.html(html);
        },
        showGrop: function(type) {
            __root.data('type', type);
            $('.joinGroup-childView').hide();
            $('.' + type).show();

            // 如果是创建组，清除对应的选择组数据 update by chenqiyuan
            if (type == "createView") {
                __root.find('input[name="group"]').select2("val", "");
                __root.find('.group-panel').removeData('organizeId');
                GroupPanel.clearCache();
            }
        }
    }

    function ctrl() {
        dialogComonCtrl();
        //切换独立、合并加入人群组
        $('.j-selectCreateType').change(function(event) {
            var val = $('.j-selectCreateType:checked').val();
            view[val]();
            __root.find('input[name="group"]').select2("val", "");
            __root.find('.group-panel').removeData('organizeId');
            GroupPanel.clear();
        });
        //选择人群组使用select2插件
        __root.find('input[name="group"]').select2({
            placeholder: "输入人群组名称搜索",
            minimumInputLength: 1,
            multiple: false,
            //maximumSelectionSize: staticFormData.maxOrgIncludeGroupNum,
            ajax: {
                url: "/userCenter/organize/getByName",
                datatype: "json",
                cache: true,
                quietMillis: 200,
                data: function(term, page) {
                    return {
                        name: term
                    };
                },
                results: function(data, page) {
                    var arr = [];
                    $.each(data.data, function(key, value) {
                        arr.push({
                            id: key,
                            text: value
                        });
                    });
                    return {
                        results: arr
                    };
                },
                formatResult: function(item) {
                    return '<div>' + item.id + ":" + item.text + '</div>';
                },
                escapeMarkup: function(markup) {
                    return markup;
                }
            }
        }).on('change', function(event) {
            //根据组名查组信息
            var organizeId = $(this).val();
            dataUtil.queryGroupInfor(organizeId, function(dataList) {
                if(dataList.length > staticFormData.maxOrgIncludeGroupNum - $('.form-item-input[name=groupName]')){
                    bootbox.alert({message:'这个人群组的人群数和已选人群数相加已经超过'+staticFormData.maxOrgIncludeGroupNum+'个了，请从新选取群组或人群'});
                }
                __root.find('.group-infor').show();
                dataUtil.unshiftGroupData(dataList);
                __root.find('.group-panel').data('organizeId', organizeId);
            });
        });


        //确定命名，然后放入已添加人群
        $('#myModal').on('blur', '.form-item-input[name="groupName"]', function(event) {
            var value = $.trim(this.value);
            var conditions = $(this).parents('.dialog-drill-item').data('conditions');
            var codes = $(this).parents('.dialog-drill-item').data('codes');
            if (value.length > 0) {
                GroupPanel.add([{
                    text: value,
                    conditions: JSON.stringify(conditions),
                    codes: codes
                }])
            } else {
                CommonTools.messageFactory.error('需要输入人群名称')
            }
            event.preventDefault();
        });


        var groupTypeBtn = $('#myModal .group-hd').find('.btn');
        //切换选择组，创建组
        groupTypeBtn.click(function(event) {
            if (!$(this).hasClass('btn-success')) {
                groupTypeBtn.toggleClass('btn-success');
                var groupType = $(this).data('view');
                view.showGrop(groupType);
            }
        });


    }
    return exports;
})()
