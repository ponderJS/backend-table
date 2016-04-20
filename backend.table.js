(function (window, undefined) {
    var BackendTable = function (selector, obj) {
        return new BackendTable.prototype.init(selector, obj);
    }
    var _difference=function(arr,values){
        var length=arr.length;
        var valueLength=values.length;
        var index=-1,result=[];
        outer:while(++index<length){
            var value=arr[index];
            var valueIndex=valueLength;
            while(valueIndex--){
                if(values[valueIndex]==value){
                    continue outer;
                }
            }
            result.push(value);
        }
        return result;
    }
    var _extend=function(obj,source){
        for(var key in source){
            obj[key]=source[key];
        }
        return obj;
    }
    var _ajax=function(json){
        var json=json || {};
        var Type=json.type || 'GET';
        var params=json.params || {};
        var xhr=new XMLHttpRequest();
        xhr.timeout=5000;
        if(typeof json.url=='string'){
            switch(Type.toUpperCase()){
                case 'GET':
                    xhr.open('GET',json.url+'?'+_serialize(params),true);
                    xhr.send();
                    break;
                case　'POST':
                    xhr.open('POST',json.url,true);
                    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
                    xhr.send(_serialize(params));
                    break;
            }
        }else return;
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4){
                if(xhr.status>=200 && xhr.status<300){
                    json.success && json.success(xhr.responseText,xhr);
                }else{
                    json.error && json.error(xhr);
                }
            }
        }
        xhr.ontimeout=function(){
            console.error('timeout!');
            xhr.abort();
        }
    }
    var _serialize=function(json){
        var i,res=[];
        for(i in json){
            res.push(i+'='+json[i])
        }
        return res.join('&');
    }
    BackendTable.prototype = {
        consotructor: BackendTable,
        init: function (selector, obj) {
            var _this=this;
            //  管理
            this.manage= obj.edit || obj['delete'] || false;
            if (!selector || Object.prototype.toString.call(selector) !== "[object HTMLTableElement]") {
                console.error('Table element is required!');
            } else {
                this.target = selector;
            }
            if (obj.data) {
                //  local data
                this.setData(obj);
                return;
            }
            if (typeof obj.url == "string" && obj.columns) {
                //  ajax data
                this.cols=obj.columns;
                this.url=obj.url;
                this.params=obj.params;
                obj.success=function(res){
                    var res=JSON.parse(res);
                    _this.setData(res);
                }
                obj.error=function(res){
                    console.error(res);
                }
                _ajax(obj);
            }
            
        },
        query:function(obj){
            var _this=this;
            var settings={}
            var params=this.params;
            params=_extend(params,obj?obj:{});
            settings.url=this.url;
            settings.params=params;
            settings.success=function(res){
                var res=JSON.parse(res);
                _this.setData(res);
            }
            settings.error=function(res){
                console.error(res);
            }
            _ajax(settings);
        },
        setData: function (obj) {
            var trs = this.target.tBodies[0].children;
            var trsLen = trs.length; // 每页行数
            var cols = this.cols || null;   // 字段参数：[key...]
            var data = obj.data;   //  标准数据格式：[{key:value,...}...]
            var page = obj.page || 1; // 当前页码
            var i, j, k, l, len, tds, rowData, tdData, hideArr, invalidArr;
            if (Object.prototype.toString.call(data[0]) == "[object Object]") {
                if (cols) {
                    hideArr = _difference(Object.keys(data[0]), cols);// 不显示在表格里的字段
                    invalidArr = _difference(cols, Object.keys(data[0]));// 无效的字段
                    for (i = 0; i < trsLen; i++) {
                        tds = trs[i].children;
                        rowData = data[i] || {};
                        len = Object.keys(data[0]).length || tds.length;
                        if (!Object.keys(rowData).length) {
                            trs[i].className = 'empty';
                        } else {
                            trs[i].className = '';
                        }
                        for (j = 0; j < len; j++) {
                            // 大于0
                            if (j) {
                                // 带管理
                                if (this.manage) {
                                    // 行号与管理项之间的数据
                                    if (j < tds.length - 1 && tds[j]) {
                                        tdData = rowData ? cols[j - 1] ? rowData[cols[j - 1]] ? rowData[cols[j - 1]] : '' : '' : '';
                                        tds[j].innerHTML = tdData;
                                        tds[j].title = tdData;
                                    }
                                    if (j == tds.length - 1 && tds[j]) {
                                        Object.keys(rowData).length ? tds[j].className = '' : tds[j].className = 'hide';
                                    }
                                // 纯数据行
                                } else {
                                    if (tds[j]) {
                                        tdData = rowData ? cols[j - 1] ? rowData[cols[j - 1]] ? rowData[cols[j - 1]] : '' : '' : '';
                                        tds[j].innerHTML = tdData;
                                        tds[j].title = tdData;
                                    }
                                }
                                // 最后一个td放隐藏字段
                                if (j == tds.length - 1 && hideArr.length && rowData) {

                                    for (k = 0; k < hideArr.length; k++) {
                                        // 约定数据行唯一标识为 id    
                                        tds[j].setAttribute(hideArr[k] == 'id' ? 'data-id' : hideArr[k], rowData[hideArr[k]]);
                                    }
                                }
                            } else {
                                // 行号必须显示
                                tds[j].innerHTML = Object.keys(rowData).length ? (page - 1) * trsLen + i + 1 : '-';
                            }
                        }
                    }
                } else {
                    console.error('Parameter "columns" is required!');
                }
                // 找不到的字段
                if (invalidArr.length) {
                    console.warn('\u4e0d\u5339\u914d\u5b57\u6bb5', invalidArr.join(','));
                }
            }
            if (Array.isArray(data[0]) && !cols) {
                // 第一个值作为数据id,多余的值放到最后一个td
                for (i = 0; i < trsLen; i++) {
                    tds = trs[i].children;
                    rowData = data[i] || [];
                    len = rowData.length || tds.length;
                    if (!rowData.length) {
                        trs[i].className = 'empty';
                    } else {
                        trs[i].className = '';
                    }
                    // 按数据循环
                    for (j = 0; j < len; j++) {
                        if (j) {
                            // 存在管理项
                            if (this.manage) {
                                if (j == tds.length - 1) {
                                    rowData.length ? tds[j].className = '' : tds[j].className = 'hide';
                                }
                                if (j < tds.length - 1 && tds[j]) {
                                    tds[j].innerHTML = rowData[j] ? rowData[j] : '';
                                    tds[j].title = rowData[j] ? rowData[j] : '';
                                }
                            } else {
                                if (tds[j]) {
                                    tds[j].innerHTML = rowData[j] ? rowData[j] : '';
                                    tds[j].title = rowData[j] ? rowData[j] : '';
                                }
                            }

                            if (j == tds.length - 1) {
                                hideArr = rowData.slice(this.manage?tds.length-1:tds.length);
                                tds[tds.length - 1].setAttribute('data-string', hideArr.join());
                            }
                        } else {
                            // 行号必须显示
                            tds[j].innerHTML = rowData.length ? (page - 1) * trsLen + i + 1 : '-';
                            // 把数据id放到最后一个td
                            tds[tds.length - 1].setAttribute('data-id', rowData[j] ? rowData[j] : '');
                        }
                    }
                }
            }
        }
    }
    // 原型链
    BackendTable.prototype.init.prototype = BackendTable.prototype;
    window.BackendTable = BackendTable;
})(window)