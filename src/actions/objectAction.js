var alt= require('./alt');
var dataObject=require('./dataObject');
var dataStock=require('./dataStock');
var util=require('./util');
var {
  objectLocal
}=require('./dataLocal');
class ObjectActions {  
	loadMyObjects(){
		var me=this;
	  	var action=me.actions;
	  	//action.setLoading(true);
	    objectLocal.get((error,objects)=>{ 
	    	//action.setLoading(false);
	    	if(!error){
		    	me.dispatch(objects);
		    	//callback&&callback(stocks);
		    }else{
		    	action.loadFailed(error);
		    	//callback&&callback(stocks);
		    }
	    });    
	}
	updatePrice(state,callback){
	  	var me=this;

	  	if(state==undefined||state.list==undefined||state.list.length==0)
	  		return;

	  	if(!state.list.map)
	  		return;

	  	//me.actions.setLoading(true);
	  	
	  	var idArray=state.list.map((item)=>item.code);
	  	var ids=idArray.join(',');

	  	dataObject.getPrice(ids,function (result) {
	  		var items=state.list;
	  		for (var i = 0; i < items.length; i++) {
				if(!result[items[i].code])
					continue;
				var item=items[i];
				item.date=result[item.code].date;
				item.price=result[item.code].price;
				item.yestclose=result[item.code].yestclose;
				if(item.price>0&&item.yestclose>0)
					item.percent=Number(item.price - item.yestclose)/item.price;
				else
					item.percent=0;
			};
	  		me.dispatch(items);
	  		callback&&callback();
	  	}); 
	}
	updateState(state,techCode,callback){
	  	var me=this;
	  	if(state.list==undefined||state.list.length==0)
	  		return;
	  	if(!state.list.map)
	  		return;
	  	//me.actions.setLoading(true);
	  	var idArray=state.list.map((item)=>'1_'+item.code+'_'+techCode);
	  	var ids=idArray.join(',');
	  	dataObject.getState(ids,techCode,function (result) {
	  		var items=state.list;
			for (var i = 0; i < items.length; i++) {
				if(!result[items[i].code])
					continue;
				items[i].day=result[items[i].code].day;
				items[i].week=result[items[i].code].week;
				items[i].month=result[items[i].code].month;
				items[i].last_day=result[items[i].code].last_day;
				items[i].last_week=result[items[i].code].last_week;
				items[i].last_month=result[items[i].code].last_month;
			};
	  		me.dispatch(items);
	  		callback&&callback();
	  	}); 	
	}
	loadPriceData(code,cycle){
	  	var me=this;
	  	var data={};
	 	  dataObject.getKData(code,cycle,"1",function (data) {
		    var current = data.current;
		    if (data.current != undefined && data.current != '') {
		        data.history.push([current.date, current.open, current.price, current.high,
		            current.low, current.volume, current.updown, current.percent, current.yestclose])
		    }
		    var kdata = [];
		    var c1 = 5,c2=10,c3=20,c4=60;

		    data.history.forEach(function (e,i) {
		    	 kdata.push([
		            e[0],
		            e[1],//开盘 
		            e[2],//收盘
		            e[3],//最高
		            e[4],//最低   
		            e[5],//成交量
		            (e[6]||0),//涨跌额
		            (e[7]||0),//涨跌幅
		            util.getAvg(c1, data.history, i),//移动平均线1
		            util.getAvg(c2, data.history, i),//移动平均线2
		            util.getAvg(c3, data.history, i),//移动平均线3
		            util.getAvg(c4, data.history, i)//移动平均线4
		        ]);
		    });
		    me.dispatch({
		    	cycle:cycle,
		    	price:kdata
		    });
	    });
	}
	loadRecoCateCount(state){
		var me=this;
		var codeList=state.list.map((item)=>item.code);
		var codeStr=codeList.join(',');
		debugger;
		dataStock.getRecoCateCount(codeStr,function (results) {
			me.dispatch(results);
		});
	}
	loadObjectList(category){
		var me=this;
		dataObject.getObjectList(category,function (results) {
			objectLocal.get(function (error,list) {
				if(error!=null)
					return;
				var kv={};
				list.forEach((item)=>{
					kv[item.code]=true;
				});
				results.forEach((item)=>{
					item['selected']=kv[item.code]||false;
				});
				me.dispatch({
					cate:category,
					data:results
				});
			});
		});
	}
	add(item){
		var obj={
			code:item.code,
			name:item.name,
			type:item.type,
			symbol:item.symbol,
			date:'',
			price:item.price,
			yestclose:item.yestclose,
			sort:0,
			inhand:false,
			day:0,
			week:0,
			month:0,
			last_day:0,
			last_week:0,
			last_month:0
		};
		this.dispatch(obj);
	}
	remove(code){
		this.dispatch(code);
	}
	setTop(code){
	 	this.dispatch(code);
	}
	sort(direction){
  		this.dispatch(direction);
  	}
	downLoad(){
		var me=this;
		dataObject.downLoad('guest',function (result) {
			me.dispatch(result);
		});
	}
	upLoad(){
		dataObject.upLoad(function (argument) {
			
		})
	}
}
module.exports = alt.createActions(ObjectActions); ;  