var CommonTools = (function() {

    //右侧弹窗模块
    var SidePanel = {
        show: function(target) {
            target = $(target);
            target.show();

            setTimeout(function() {
                target.find(".side-panel-box").addClass("side-panel-open");
                $("body").css("overflow", "hidden");
            }, 200);

            target.unbind("click").on("click", function(event) {
                if (event.target.id == target.attr("id")) { 
                    SidePanel.hide(target);
                }
            })

            $("body").on("keydown", function(e) {
                if (e.keyCode == 27) {
                    SidePanel.hide(target);
                }
            });

            target.find('.btn[data-toggle="dialog-close"]').unbind("click").on("click", function() {
                SidePanel.hide(target);
            });
        },
        hide: function(target) {
            target = $(target);
            target.find(".side-panel-box").removeClass("side-panel-open");
            setTimeout(function() {
                target.hide();
                $("body").unbind("keydown");
                $("body").css("overflow", "auto");
            }, 200);
        },
        resetForm: function(target) {
            if (target.find(".form-group").length) {
                if (target.find("form").length)
                    target.find("form").get(0).reset();
                if (target.find(".form-select2-item").length) {
                    target.find(".form-select2-item").select2("val", "");
                }
                target.find("input[type='hidden']").val("");
            }
        },
        dropdown: function() {
            $(function() {
                $('.dropdown').each(function(index, ele) {
                    var _this = $(ele);
                    _this.on("click", "li", function() {
                        _this.removeClass("open");
                        _this.find("a[data-toggle=dropdown]").html($(this).find("a").text() + ' <b class="caret"></b>');
                        return false;
                    })
                });
            });
        }()
    };

    //核心底层操作
    var CoreTools = {
        /**
         * 文本内容长度校验
         * @param content
         * @param max 最大长度，-1表示不限制
         * @param msg_pre 提示前缀
         * @param allowEmpty 是否允许为空
         */
        checkTextLength: function(content, max, msg_pre, allowEmpty) {
            var res = {
                "success": true,
                "msg": "sucess"
            };
            if (typeof(content) == "undefined") {
                res.success = false;
                res.msg = "参数获取不正确";
                return res;
            }
            if (!allowEmpty) {
                if (!content) { //不能为空
                    res.success = false;
                    res.msg = msg_pre + "不能为空";
                    return res;
                }
            }
            if (max < 0) {
                return res; //不用限制长度
            }
            if (content.length > max) {
                res.success = false;
                res.msg = msg_pre + "长度不能超过" + max + "个字符";
                return res;
            }
            return res;
        },
        /**
         * 判断文本程度
         * @param length
         * @param max
         * @param msg_pre
         * @returns {{success: boolean, msg: string}}
         */
        assertTextLength: function(length, max, msg_pre) {
            var res = {
                "success": true,
                "msg": "sucess"
            };
            if (length == 0) {
                res.success = false;
                res.msg = msg_pre + "不能为空";
                return res;
            }
            if (length > max) {
                res.success = false;
                res.msg = msg_pre + "长度不能超过" + max + "个字符";
                return res;
            }
            return res;
        },
        /**
         * 从文本内容中提取模板参数
         * @param content
         */
        fetchTemplateParamsFromContent: function(content) {
            if (!content) {
                return [];
            }
            //校验模板参数是否在定义的范围内
            var re = /\$\{.*?\}/ig;
            var arr = [];
            var r = [];
            while (r = re.exec(content)) {
                arr.push(r[0]);
            }
            return arr;
        },
        //去重函数
        ArrUnique: function(arr) {
            arr.sort();
            var re = [arr[0]];
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] !== re[re.length - 1]) {
                    re.push(arr[i]);
                }
            }
            return re;
        },
        /**
         * 时间对比方法
         * @param  {[type]} startDate [开始时间]
         * @param  {[type]} endDate   [结束时间]
         * @param  {[type]} type      [1：开始是否大于结束  2：开始是否小于结束 3：开始是否等于结束]
         * @return {[type]}           [description]
         */
        dateCompareFlag: function(startDate, endDate, type) {
            var flag = false;
            var startTime, endTime;
            var startArr = [];
            var endArr = [];

            if (startDate.split(" ").length < 2) {
                startDate = startDate + " " + "00:00:00";
            }

            if (endDate.split(" ").length < 2) {
                endDate = endDate + " " + "00:00:00";
            }

            startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
            endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();

            if (type == 1) {
                if (startTime > endTime) {
                    flag = true;
                } else {
                    flag = false;
                }
            } else if (type == 2) {
                if (startTime < endTime) {
                    flag = true;
                } else {
                    flag = false;
                }
            } else if (type == 3) {
                if (startTime == endTime) {
                    flag = true;
                } else {
                    flag = false;
                }
            }

            return flag;
        },
        //日期格式化
        dateFormat: function(date, format){
            date = new Date(date);
            var map = {
                "M": date.getMonth() + 1, //月份 
                "d": date.getDate(), //日 
                "h": date.getHours(), //小时 
                "m": date.getMinutes(), //分 
                "s": date.getSeconds(), //秒 
                "q": Math.floor((date.getMonth() + 3) / 3), //季度 
                "S": date.getMilliseconds() //毫秒 
            };
            format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
                var v = map[t];
                if (v !== undefined) {
                    if (all.length > 1) {
                        v = '0' + v;
                        v = v.substr(v.length - 2);
                    }
                    return v;
                } else if (t === 'y') {
                    return (date.getFullYear() + '').substr(4 - all.length);
                }
                return all;
            });
            return format;
        },
        //模板预约日期格式化
        artDateFormat: function(){ 
            template.helper('dateFormat', function(date, format) {
                return CoreTools.dateFormat(date, format);
            });
        }(),
        //模板替换
        template: function(str, data, regexp) {
            return str.replace(regexp || /\${([^{}]*)}/g, function(str, p1) {
                return (data[p1] !== undefined && data[p1] !== null && data[p1].toString()) || "";
            });
        },
        //获取url参数
        getQueryString: function(name) {
            var re = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', "i");
            var m = location.search.slice(1).match(re);
            var v = m ? m[2] : '';
            return (v == '' || isNaN(v)) ? decodeURIComponent(v) : v - 0;
        },
        //转换切分位
        toThousands: function(text) {
            if (!isNaN(text)) {
                text = Number(text);
                text = (text || 0).toString(), result = '', ponitText = '';
                if (text.indexOf(".") != -1) {
                    ponitText = "." + text.split(".")[1];
                    text = text.split(".")[0];
                }
                while (text.length > 3) {
                    result = ',' + text.slice(-3) + result;
                    text = text.slice(0, text.length - 3);
                }
                if (text) {
                    result = text + result + ponitText;
                }
                return result;
            } else {
                return text;
            }
        },
        //模板语言转换千分位
        artThousands: function(){
            template.helper('toThousands', function(text) {
                return CoreTools.toThousands(text);
            });  
        }(),
        //异步加载loading状态
        ajaxLoading: function() {
            $(document).ajaxError(function() {
                //bootbox.alert("请求出错，如果您在使用本系统，多次出现此错误，请与管理员联系!");
            }).ajaxStart(function() {
                if (!$("#loading").length) {
                    $("body").append('<div id="loading"><i class="icon-spinner icon-spin"></i></div>');
                }
            }).ajaxStop(function() {
                $("#loading").remove();
            });
        }
    };

    //cookie操作
    var OperationRecord = (function() {
        var cookieKey = "operationRecord";

        /**
         * 设置操作记录
         * @param operName
         * @param val
         * @param exdays 过期时间 默认1周
         */
        var setOperationRecord = function(operName, val, exdays) {
            operName = $.trim(operName);
            //已有的值
            var isValExit = false;
            var allPairs = getOperationCookieVals();
            for (var i = 0; i < allPairs.length; i++) {
                var pair = allPairs[i];
                if (pair.key == operName) {
                    pair.val = val;
                    isValExit = true;
                    break;
                }
            }
            if (!isValExit) { //如果值不存在
                var oper = {};
                oper.key = operName;
                oper.val = val;
                allPairs.push(oper);
            }
            //构造cookie val值
            setCookies(allPairs, exdays);
        }

        var setCookies = function(allPairs, exdays) {
                if (!exdays) {
                    exdays = 7;
                }
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();

                //构造cookie val值
                var pairStrs = [];
                for (var i = 0; i < allPairs.length; i++) {
                    var pair = allPairs[i];
                    pairStrs.push(pair.key + ":" + pair.val);
                }
                var cookieVal = pairStrs.join(",");
                document.cookie = cookieKey + "=" + cookieVal + "; " + expires;
            }
            /**
             * 获取操作记录
             * @param operName
             */
        var getOperationRecord = function(operName) {
            operName = operName.trim();
            var pairs = getOperationCookieVals();
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (pair.key == operName) {
                    return pair.val;
                }
            }
            return "";
        }

        /**
         * 清除操作记录
         * @param operName
         * @param exdays
         */
        var delOperationRecord = function(operName, exdays) {
            var allPairs = getOperationCookieVals();
            var newAllPairs = [];
            for (var i = 0; i < allPairs.length; i++) {
                var pair = allPairs[i];
                if (pair.key == operName) {
                    continue;
                }
                newAllPairs.push(pair);
            }
            //构造cookie val值
            setCookies(newAllPairs, exdays);
        }

        /**
         * 获取操作行为记录的cookie值
         * @returns {*}
         */
        var getOperationCookieVals = function() {
            var cookiePairs = document.cookie.split(';');
            var pairs = [];
            for (var i = 0; i < cookiePairs.length; i++) {
                var pair = cookiePairs[i].split("=");
                if (pair.length == 2 && cookieKey == $.trim(pair[0])) {
                    var operationVals = $.trim(pair[1]).split(",");
                    for (var i = 0; i < operationVals.length; i++) {
                        var pair = operationVals[i].split(":");
                        if (pair.length == 2) {
                            if ($.trim(pair[0]) == '') {
                                continue;
                            }
                            var item = {};
                            item.key = $.trim(pair[0]);
                            item.val = $.trim(pair[1]);
                            pairs.push(item);
                        }
                    }
                }
            }
            return pairs;
        }

        //对外开放的接口
        return {
            setOperationRecord: setOperationRecord,
            getOperationRecord: getOperationRecord,
            delOperationRecord: delOperationRecord
        };
    })();

    //正则表达式
    var Regular = (function() {
        //数字
        var testNumber = function(num) {
            var regular = /^[0-9]*$/;
            return new RegExp(regular).test(num);
        }

        //Url
        var testUrl = function(url) { 
            var regular = /(https|http|):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\W#!:.?+=&%@!\-\/]))?/;
            return new RegExp(regular).test(url);
        }

        //日期
        var testDate = function(date) {
            var regular = /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/;
            return new RegExp(regular).test(date);
        }


        //英文、数字、下划线
        var testEngOrNumOrLine = function(str) {
            var regular = /^[A-Za-z0-9_]*$/g;
            return new RegExp(regular).test(str);
        }
        //中文
        var testChinese = function(str) {
            var regular = /^[^x00-xff]*$/g;
            return new RegExp(regular).test(str);
        }  
        return {
            testNumber: testNumber,
            testUrl: testUrl,
            testDate: testDate,
            testEngOrNumOrLine: testEngOrNumOrLine,
            testChinese: testChinese
        }
    })();

    //表格插件操作
    var JqGridOper = {
        resetResize: function() {
            $(window).resize(function() {
                $(".ui-jqgrid").setGridHeight(JqGridOper.resetHeight());
                $(".ui-jqgrid").setGridWidth(JqGridOper.resetWidth());
            });
        },
        resetHeight: function() {
            return $(window).height() - $(".g-wrap .g-hd").outerHeight(true) - 88 - 40;
        },
        resetWidth: function() {
            return $(".ui-jqgrid").outerWidth(true);
        },
        setJqGridSessionStorage: function (gridObj) {
            //判断url是否相等 否则清空记录的数据 
            if (sessionStorage["gridUrl"] != location.href) {
                sessionStorage.removeItem("gridParams");
                sessionStorage.removeItem("gridUrl");
            }
            var postData = JSON.stringify(gridObj.getGridParam("postData"));
            if (postData) { 
                sessionStorage["gridParams"] = postData;
                sessionStorage["gridUrl"] = location.href;
            }
        },
        getJqGridSessionStorage: function () {
            if (sessionStorage["gridUrl"] != location.href) {
                sessionStorage.removeItem("gridParams");
            }
            var gridParams = sessionStorage["gridParams"] ? JSON.parse(sessionStorage["gridParams"]) : null;
            return gridParams;
        },
        setFromParamsValue: function(formObj){
            var data = JqGridOper.getJqGridSessionStorage() || {};
            formObj.find('input,select').each(function(index, el) {
                var name = $(this).attr('name');
                for (var key in data) {
                    if (name == key) {
                        //select2插件下select设置
                        if ($(this).hasClass('form-select2-item')) {
                            if ($(this).find('option').length > 0) {
                                $(this).select2("val", data[key]);
                            }
                        }else{
                            $(this).val(data[key]);
                        } 
                    }
                }
            });
        }
    };

    /*  弹窗
        @ 初始化弹窗 boostrapDialog.init(obj)
        @ obj.close 闭按钮显示文字
        @ obj.submit 确认按钮显示文字
        @ obj.submitCb 点击确认按钮响应的函数
        @ 显示/隐藏 弹窗 boostrapDialog.show()/boostrapDialog.hide();
        @ 移除弹窗 boostrapDialog.distroy();
        @ 显示内容设置 boostrapDialog.show(param)
        @ param.title: 头部标题部分显示的html
        @ param.body : 内容部分显示的html
    */
    var dialog = (function() {
        var exports = {};
        var templates = '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
              <div class="modal-dialog">\
                <div class="modal-content">\
                  <div class="modal-header">\
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only"></span></button>\
                    <div class="modal-title" id="myModalLabel">${title}</div>\
                  </div>\
                  <div class="modal-body">\
                    ${body}\
                  </div>\
                  <div class="modal-footer">\
                    <button type="button" class="btn btn-primary btn-submit">${submit}</button>\
                    <button type="button" class="btn btn-default" data-dismiss="modal">${close}</button>\
                  </div>\
                </div>\
              </div>\
            </div>';
        var defalutObj = {
            close: '关闭',
            submit: '确定',
            submitCb: function() {
                console.log('click submit');
                exports.hide();
            }
        }
        var __root;
        var defaultEvent = {
            creat: function(data) {
                console.log('生成营销人群', data);
            },
            join: function(data) {
                console.log('加入群组', data);
            }
        }

        exports.init = function(obj) {
            $.extend(true, defalutObj, obj);
            var html = CommonTools.CoreTools.template(templates, defalutObj);

            if ($("#myModal").length != 0) {
                $("#myModal").remove();
            }
            $("body").append(html);


            __root = $("#myModal");
            __root.find('.btn-submit').click(function(event) {
                defalutObj.submitCb();
            });
        }
        exports.show = function(obj) {
            if (arguments.length > 0) {
                obj.title && __root.find('.modal-title').html(obj.title);
                obj.body && __root.find('.modal-body').html(obj.body);
                if (obj.submitCb) {
                    defalutObj.submitCb = obj.submitCb;
                }
            }
            __root.modal('show');
        }
        exports.hide = function() {
            __root.modal('hide');
        }
        exports.distroy = function() {
            $('#myModal').modal('hide');
        }

        function template(str, data, regexp) {
            return str.replace(regexp || /\${([^{}]*)}/g, function(str, p1) {
                return (data[p1] !== undefined && data[p1] !== null && data[p1].toString()) || "";
            });
        }
        return exports;
    })();

    //消息提示模块
    var messageFactory = (function() {
        var Message = {};
        var timer;
        var messageTypes = [{
            type: "success",
            icon: "icon-ok"
        }, {
            type: "error",
            icon: "icon-exclamation-sign"
        }, {
            type: "loading",
            icon: "icon-refresh icon-spin"
        }, {
            type: "warning",
            icon: "icon-warning-sign"
        }];
        var messageId;
        Message.removeMessage = function() {
            $('#ui-message-mask-' + messageId).remove();
            $('#ui-message-' + messageId).remove();
        }
        Message.slideUpMessage = function() {
            var _this = this;
            var $message = $('#ui-message-' + messageId);
            $message.animate({
                top: -$message.outerHeight()
            }, 200, 'swing', function() {
                _this.removeMessage();
            });
        }
        Message.popMessage = function(options) {
            var _this = this;
            this.removeMessage();
            messageId = new Date().getTime();
            if (options.mask) {
                var maskTemplate = $("<div class='ui-message-mask' id='ui-message-mask-" + messageId + "'></div>");
                maskTemplate.css('z-index', messageId);
                $(document.body).append(maskTemplate);
            }
            var iconTemplate =
                '<span class="icon ' + messageTypes[options.type || 0].icon + '"></span>';
            var tipsTemplate = $("<div class='ui-message' id='ui-message-" + messageId + "'>" + iconTemplate + options.message + '</div>');
            $(document.body).append(tipsTemplate);
            $(tipsTemplate).css({
                'z-index': new Date().getTime(),
                'marginLeft': -$(tipsTemplate).outerWidth() / 2
            }).addClass(messageTypes[options.type || 0].type);
            if (options.time) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    if ($.isFunction(options.callback)) {
                        options.callback();
                    }
                    _this.slideUpMessage();
                    clearTimeout(timer);
                }, options.time);
            }
        };
        Message.success = function(text) {
            Message.popMessage({
                message: text || '成功',
                time: 2000
            })
        };
        Message.error = function(text) {
            Message.popMessage({
                message: text || "错误",
                time: 2000,
                type: 1
            })
        };
        Message.loading = function(text) {
            Message.popMessage({
                message: text || '加载中',
                time: 2000,
                type: 2
            })
        };
        Message.warning = function(text) {
            Message.popMessage({
                message: text || '警告',
                time: 2000,
                type: 3
            })
        }
        return Message;
    })();

    //自定义时间操作
    var UserGroupDateTimeOpr = {
        //人群时间设置
        autoChangeExpriteDate: function($ele, timestmap, days){
            var timestmap = timestmap || Date.parse(new Date()),
                days = days || 7;
            var defaultExpriteTime = new Date(timestmap + days * 24 * 3600 * 1000 - 8 * 3600 * 100);
            day = defaultExpriteTime.getDate() < 10 ? '0' + defaultExpriteTime.getDate() : defaultExpriteTime.getDate();
            defaultExpriteDate = defaultExpriteTime.getFullYear() + '-' + (defaultExpriteTime.getMonth() + 1) + '-' + day;
            $ele.parents('form').find('input[name="expireTime"]')[0].value = defaultExpriteDate;
        },
        //时间事件改变
        dateEventChange: function(){
            $(".custom-datetime").datetimepicker({
                minView: '0',
                minuteStep: 1,
                startDate: new Date(),
                endDate: new Date((new Date).getTime() + 30 * 24 * 3600 * 1000),
                format: "yyyy-mm-dd hh:ii"
            }).on('changeDate', function(ev) {
                UserGroupDateTimeOpr.autoChangeExpriteDate($(this), ev.date.valueOf());
            });
            $(".validity-datetime").datetimepicker({
                minView: '2',
                minuteStep: 1,
                startDate: new Date(),
                format: "yyyy-mm-dd"
            });
        },
        //自定义时间 选项改变
        actionTimeChange: function() {
            $(".form-item-datetimepicker .form-radio-label").on('change', function(event) {
                var value = $(this).find("input:checked").val();
                if (value == 1) {
                    $(this).parent().find('.form-label-datetimepicker').hide();
                    $(this).parent().find('.form-label-datetimepicker input').val("");
                    if (!$(this).parents('form').find('input[name="expireTime"]')[0].value) {
                        UserGroupDateTimeOpr.autoChangeExpriteDate($(this));
                    }
                }
                if (value == 0) {
                    $(this).parent().find('.form-label-datetimepicker').css("display", "inline-block");
                }
            });
        },
        //设置有效期时间
        setValidityDatetimeValue: function(){
            $(".validity-datetime").each(function(index, el) {
                UserGroupDateTimeOpr.autoChangeExpriteDate($(el));
            });
        }
    };

    return {
        SidePanel: SidePanel,
        CoreTools: CoreTools,
        OperationRecord: OperationRecord,
        Regular: Regular,
        JqGridOper: JqGridOper,
        dialog: dialog,
        messageFactory: messageFactory,
        UserGroupDateTimeOpr: UserGroupDateTimeOpr
    }

})();

! function() {
    //异步加载loading 
    CommonTools.CoreTools.ajaxLoading();

    //右侧弹出窗事件
    $(document).on("click", '[data-toggle="dialog-open"]', function(e) {
        CommonTools.SidePanel.show($(this).data("target"));
    });
}();

/*
    init(opt)：初始化控件
        opt.root,存放控件html的父元素（由于会合并到base.js文件,需要手动传root）
        opt.data,渲染html使用的数据
        opt.deleteItem，true/false，是否显示删除
        opt.template 用户群的显示模板
        opt.disable 控件是否能修改
    add(data):添加用户群
    getData():获取群组数据
    GroupPanel.init({deleteItem:true,root:$('.group-panel')});
*/

var GroupPanel = (function () {
    var exports = {};
    var __root,__data;
        defaultOptions = {
            root:$('.group-panel'),
            data:[],
            deleteItem:false,
            disable:false,
            template:'<div class="group-item ${aSpan}" conditions="${conditions}" groupCode="${groupCode}">\
                        <input type="text" class="group-item-index" data-index="${index}" value="${index}" ${disabled}>\
                        <a href="${link}" target="_blank" class="group-item-text group-item-link">${text}</a>\
                        <span class="group-item-text  group-item-default">${text}</span>\
                        <span class="group-item-ctrl group-item-delete ${delete}">x</span>\
                    </div>'
        }
    exports.init = function (opt) {
        $.extend(true,defaultOptions,opt||{});
        __root = defaultOptions.root;
        __data = defaultOptions.data;
        render();
        ctrl();
    }
    function render() {
        var itemHtml = '',
            deleteItem='',
            disabled  = '';
        if(defaultOptions.disable){
            disabled ='disabled';
            deleteItem = 'hide';
        }else{
            deleteItem = defaultOptions.deleteItem?'':'hide';
        }
        var aSpan = '';
        $.each(__data, function(index, val) {
            if(!val.link){
                aSpan = 'group-item-span';
            }else{
                aSpan = 'group-item-link';
            }
            $.extend(true, val, {index:index+1},{delete:deleteItem},{disabled:disabled},{aSpan:aSpan});
            itemHtml += CommonTools.CoreTools.template(defaultOptions.template,val)
        });
        __root.html(itemHtml);
    }
    function ctrl() {
        if(defaultOptions.disable){
            return ;
        }
        //删除
        if(defaultOptions.deleteItem){
            __root.on('click', '.group-item-delete', function(event) {
                var index = parseInt($(this).siblings('.group-item-index').val())-1;
                $(this).parent('.group-item').remove();
                __data.splice(index,1);
                render();
            });
        }
        //调整顺序
        __root.on('change', '.group-item-index', function(event) {
            var newIndex = $(this).val() >=__data.length?__data.length-1:$(this).val()-1,
            oldIndex = $(this).data('index')-1;
            if(newIndex <0){
                newIndex =0;
            }
            var data =  __data[oldIndex];
            if(newIndex >oldIndex){
                __data.splice(newIndex+1,0,data);
                __data.splice(oldIndex,1);
            }else{
                __data.splice(oldIndex,1);
                __data.splice(newIndex,0,data);
            }
            render();
            /* Act on the event */
        });
    }
    //添加数据
    exports.add  = function (arr) {
        var cacheObj = {};
        $.each(__data, function(index, val) {
            cacheObj[val.codes] = {
                value :val,
                index :index
            };
        });
        var index;
        $.each(arr, function(i, v) {
            if(cacheObj[v.codes] != undefined){
                index = cacheObj[v.codes].index;
                __data[index] = v;
            }else{
               __data.push(v); 
            }
        })
        render();
    }
    //头部添加新数据
    //需要检测 groupCode 是否重复
    //cacheData unshift插进的数据，每次unshift都需要更新一次
    var cacheData = []
    exports.unshift  = function (unshiftData) {
        clearCacheData();
        
            
        if(__data.length == 0){
            $.extend(true,__data, unshiftData);
        }else{  
            var dataArr = unshiftData.reverse();      
            $.each(dataArr, function(index, val) {
                __data.unshift(val);
            }); 
        }
        cacheData = unshiftData; 
        render();
    }

    function clearCacheData(argument) {
        var cacheObj  ={};
        $.each(cacheData, function(index, val) {
            cacheObj[val.groupCode] = true;
        });
        var spliceIndexArr = [];
        $.each(__data, function(index, val) {
            if(cacheObj[val.groupCode]){
                spliceIndexArr.unshift(index);
            }
        });
        $.each(spliceIndexArr, function(index, val) {
            __data.splice(val,1);
        });
    }
    //清除搜索的数据
    exports.clearCache = function () {
         clearCacheData();
        render();
    }
    //清除数据
    exports.clear = function () {
        __data = [];
        render();
    }
    exports.getData = function () {
        return __data;
    }
    return exports; 
})();

(function ($) {
    /**
     * form 参数转换成json对象
     * @param $form
     * @returns {{}}
     */
    $.fn.serializeJson = function () {
        var serializeObj = {};
        var array = this.serializeArray();
        $(array).each(function () {
            if (serializeObj[this.name] == '' || serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        return serializeObj;
    };

    /**
     * 处理json中含有数组的参数的传参。
     * eg：{'Id':'100','tags':['Age_70','Age_80']}
     * 转换后为：
     * {'Id':'100','tags':'Age_70,Age_80'}
     * 后端接收参数时，就可以用String[]来接收
     * @param json
     */
    $.fn.serializeJsonParams = function () {
        var serializeObj = {};
        var array = this.serializeArray();
        $(array).each(function () {
            if (serializeObj[this.name] == '' || serializeObj[this.name]) {
                serializeObj[this.name] = serializeObj[this.name] + "," + this.value;
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        return serializeObj;
    };

})(jQuery);

~(function ($) {
    var __root;
    var checkItemTpl = '<label class="form-checkbox-label">'+
            "<input type='checkbox' value='${value}' text='${text}' ${check}>${text}"+
          '</label>';

    function template(str, data, regexp) {
        return str.replace(regexp || /\${([^{}]*)}/g, function (str, p1) {
            return (data[p1]!==undefined&&data[p1]!==null&&data[p1].toString())||"";
        });
    }
    function rander() {
        __root.html('<div class="form-control form-item-input"></div><div class="form-item-checkboxwrap checkbox"></div>');
        var texts = '',valHtmls = [],datas = [];
        $.each(__data, function(index, val) {
            val.check= val.checked ?'checked':'';
            texts += template(checkItemTpl,val);
            if(val.checked){
                valHtmls.push(val.text);
                datas.push(val.value);
            }
        });
        __root.find('.form-item-checkboxwrap').html(texts);
        renderInput(__root.find('.form-item-input'),valHtmls,datas);
    }
    function renderInput(input,texts,datas) {
        input.html(texts.join(';')).attr('title',texts.join(';'))
        .val(datas.join(';')).data('value', datas).data('text', texts);
    }
    function ctrl() {
        var $selectWrap = __root.find('.form-item-checkboxwrap');
        __root.click(function(e) {
            $(this).find('.form-item-checkboxwrap').show();
            e.stopPropagation();
        });
        __root.find('input').click(function () {
            var __input = $(this).parents('.form-item-checkboxwrap').siblings('.form-item-input');
            var val = $(this).val(),
                text = $(this).attr('text'),
                datas = __input.data('value'),
                texts = __input.data('text');
            if($(this)[0].checked){
                datas.push(val);
                texts.push(text);
                
            }else{
                var i = datas.indexOf(val);
                datas.splice(i,1);
                texts.splice(i,1);
            }
            renderInput(__input,texts,datas);
        });
        $('body').click(function() {
            $selectWrap.hide();
        });
    }
    $.fn.selectCheckbox = function(option){
        __root = $(this);
        __data = option.data;
        rander();
        ctrl();
    }
})(jQuery)