// 防抖函数
let debounceapi = function(way,time=500){
	let timer = null;
	return function() {
	    clearTimeout(timer);
	    timer = setTimeout(()=> {
	      way.apply(this, arguments);
	    }, time);
	};
}
export {debounceapi}