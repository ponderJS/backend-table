(function(window,undefined){
   var BackendTable=function(selector,obj){
        return new BackendTable.prototype.init(selector,obj);
    }
    // 暂时引用
    var _difference=_.difference;
    BackendTable.prototype={
        consotructor:BackendTable,
        init:function(selector,obj){
           if(!selector || Object.prototype.toString.call(selector)!=="[object HTMLTableElement]"){
               console.error('Table element is required!');
           }else{
               this.target=selector;
           }
           //   列名
           if(Array.isArray(obj.columns)){
               this.cols=obj.columns;
           }
           if(Array.isArray(obj.data)){
                //  local data
                this.setData(obj);
                return;
           }
           
           if(typeof obj.url=="string"){
                //  ajax data
           }
        },
        setData:function(obj){
            var trs=this.target.tBodies[0].children;
            var cols=this.cols || null;   // 字段参数：[key...]
            var data=obj.data;   //  标准数据格式：[{key:value,...}...]
            var i,j,len,tds,rowData,tdData;
            if(cols && Object.prototype.toString.call(data[0])=="[object Object]"){
               for(i=0;i<trs.length;i++){
                    tds=trs[i].children;
                    len=tds.length;
                    rowData=data[i];
                    for(j=0;j<len;j++){
                        if(j>0 && j<len-1){
                            tdData=rowData?cols[j-1]?rowData[cols[j-1]]?rowData[cols[j-1]]:'-':'-':'-';
                            tds[j].innerHTML=tdData; 
                            tds[j].title=tdData;
                            continue;
                        }
                        if(j==0){
                            tds[j].innerHTML=rowData?i+1:'-';
                            continue;
                        }
                        if(j==len-1){
                            rowData?tds[j].className='':tds[j].className='hide';
                            continue;
                        }
                    }
                }
                // 多余的字段
                return; 
            }
            if(Array.isArray(data[0]) && !cols){
                for(i=0;i<trs.length;i++){
                    tds=trs[i].children;
                    len=tds.length;
                    rowData=data[i];
                    for(j=0;j<len;j++){
                        if(j>0){
                            tdData=rowData?rowData[j-1]?rowData[j-1]:'-':'-';
                            tds[j].innerHTML=tdData; 
                            tds[j].title=tdData;
                            continue;
                        }
                        if(j==0){
                            tds[j].innerHTML=rowData?i+1:'-';
                            continue;
                        }
                        if(j==len-1){
                            // 默认最后一个是数据id
                            rowData?tds[j].className='':tds[j].className='hide';
                            rowData?rowData[j]?tds[j].setAttribute('data-id',rowData[j]):tds[j].removeAttribute('data-id'):tds[j].removeAttribute('data-id');
                            continue;
                        }
                    }
                }
                // 多余的字段
                                
                return;
            }
        }
    }
    // 原型链
    BackendTable.prototype.init.prototype=BackendTable.prototype;
    window.BackendTable=BackendTable;
})(window)