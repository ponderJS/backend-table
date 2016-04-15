(function (window, undefined) {
    var BackendTable = function (selector, obj) {
        return new BackendTable.prototype.init(selector, obj);
    }
    // 暂时引用
    var _difference = _.difference;
    // 行号必须有，管理项可选
    BackendTable.prototype = {
        consotructor: BackendTable,
        init: function (selector, obj) {
            if (!selector || Object.prototype.toString.call(selector) !== "[object HTMLTableElement]") {
                console.error('Table element is required!');
            } else {
                this.target = selector;
            }
            //   列名
            if (Array.isArray(obj.columns)) {
                this.cols = obj.columns;
            }
            if (Array.isArray(obj.data)) {
                //  array data
                this.setData(obj);
                return;
            }

            if (typeof obj.url == "string") {
                //  object data
            }
        },
        setData: function (obj) {
            var trs = this.target.tBodies[0].children;
            var trsLen = trs.length; // 每页行数
            var cols = this.cols || null;   // 字段参数：[key...]
            var data = obj.data;   //  标准数据格式：[{key:value,...}...]
            var page = obj.page || 1; // 当前页码
            var i, j, k, l, len, tds, rowData, tdData, hideArr, invalidArr;
            var manage = obj.edit || obj['delete'] || obj.lock || false;
            if (Object.prototype.toString.call(data[0]) == "[object Object]") {
                if (cols) {
                    hideArr = _difference(Object.keys(data[0]), cols);// 不显示在表格里的字段
                    invalidArr = _difference(cols, Object.keys(data[0]));// 无效的字段
                    for (i = 0; i < trsLen; i++) {
                        tds = trs[i].children;
                        len = tds.length;
                        rowData = data[i];
                        if (!rowData) {
                            trs[i].className = 'empty';
                        } else {
                            trs[i].className = '';
                        }
                        /** 表格结构的列数小于数据的列数时会忽略多余的数据项 可以考虑按数据量循环**/
                        for (j = 0; j < len; j++) {
                            if (j) {
                                if (manage) {
                                    if (j != len - 1) {
                                        tdData = rowData ? cols[j - 1] ? rowData[cols[j - 1]] ? rowData[cols[j - 1]] : '-' : '' : '';
                                        tds[j].innerHTML = tdData;
                                        tds[j].title = tdData;
                                    } else {
                                        rowData ? tds[j].className = '' : tds[j].className = 'hide';
                                    }
                                } else {
                                    tdData = rowData ? cols[j - 1] ? rowData[cols[j - 1]] ? rowData[cols[j - 1]] : '-' : '' : '';
                                    tds[j].innerHTML = tdData;
                                    tds[j].title = tdData;
                                }
                                // 最后一个td放隐藏字段
                                if (j == len - 1 && hideArr.length && rowData) {

                                    for (k = 0; k < hideArr.length; k++) {
                                        // 约定数据行唯一标识为 id    
                                        tds[j].setAttribute(hideArr[k] == 'id' ? 'data-id' : hideArr[k], rowData[hideArr[k]]);
                                    }
                                }
                            } else {
                                // 行号必须显示
                                tds[j].innerHTML = rowData ? (page - 1) * trsLen + i + 1 : '-';
                            }
                        }
                    }
                } else {
                    console.error('Parameter "columns" is required!');
                }
                // 找不到的字段
                if (invalidArr.length) {
                    console.warn('\u9519\u8bef\u6216\u591a\u4f59\u5b57\u6bb5', invalidArr.join(','));
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
                            if(manage){
                                if(j==tds.length-1){
                                    rowData.length?tds[j].className = '' : tds[j].className = 'hide';
                                }
                                if(j<tds.length-1 && tds[j]){
                                    tds[j].innerHTML=rowData[j] ? rowData[j] : '';
                                    tds[j].title = rowData[j] ? rowData[j] : '';
                                }
                            }else{
                               if(tds[j]){
                                   tds[j].innerHTML=rowData[j] ? rowData[j] : '';
                                   tds[j].title = rowData[j] ? rowData[j] : '';
                               } 
                            }
                            
                            if(j==tds.length-1){
                                hideArr = rowData.slice(tds.length);
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