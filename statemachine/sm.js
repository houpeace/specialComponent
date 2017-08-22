
var sm = (function () {
	function _StateMachine(config) {
		this.state = config.initial||'unknow';
		this.events = config.events;
		this.callbacks = config.callbacks||{};
		this.error = config.error || function(name, from, to, args, error, msg, e) { throw e || msg; }; 
		this._hashEvent = {}
		this.init();
	}
	var __PREFIX = ['onbefore','onleave','onenter','onafter'];
	_StateMachine.prototype.SYNC = 'sync';
	_StateMachine.prototype.init = function () {
		this._initHashEvent();
		this._buildEvent();
	}
	_StateMachine.prototype._initHashEvent = function () {
		for (var i = this.events.length - 1; i >= 0; i--) {
			var e = this.events[i];
			if (!this._hashEvent[e.name]) {
				this._hashEvent[e.name] = []
			} 
			this._hashEvent[e.name].push({
				from:e.from,
				to:e.to,
				name:e.name
			})
		}
	}
	_StateMachine.prototype._buildEvent = function () {
		for(var i in this._hashEvent){
			this[i] = (function (i) {
				return function (arg) {
					var event = this._getEvent(this._hashEvent[i]);
					if (JSON.stringify(event) == '{}') {
						return false;
					}
					this.cacheEvent = event; //用于异步调用
					var fn = event.name;


					this.callbacks['onbefore'+fn]&&this.callbacks['onbefore'+fn](this,event.name,this.state,event.state,arg);

					if(this.callbacks['onbefore'+fn]){
						var beforeValue = this.callbacks['onbefore'+fn](this,event.name,this.state,event.state,arg);
					}
					if(beforeValue == false){
						return false;
					}
					if(this.callbacks['onleave'+this.state]){
						var leaveValue = this.callbacks['onleave'+this.state](this,event.name,this.state,event.state,arg);
					}
					if(leaveValue == false){
						console.log('not transform')
						return false;
					}
					
					if(leaveValue == this.SYNC){
						return false;
					}

					this._transition(arg);
				}

			})(i);
		}
	}
	_StateMachine.prototype._getEvent = function(hash){
		var event={};
		for (var i = hash.length - 1; i >= 0; i--) {
			var formType = Object.prototype.toString.call(hash[i].from);
			if(formType == '[object Array]'){
				if(hash[i].from.indexOf(this.state)>=0){
					event = hash[i];
					break;
				}
			}else{
				if(hash[i].from == this.state){
					event = hash[i];
					break;
				}
			}
		}
		return event;
	}
	_StateMachine.prototype._transition = function (args) {
		var event = this.cacheEvent;
		var fn = event.name;
		this.prevState = this.state;
		this.state = event.to;
		this.callbacks['on'+event.name]&&this.callbacks['on'+event.name](this,this.prevState,this.state,args);
		this.callbacks['on'+this.state]&&this.callbacks['on'+this.state](this,this.prevState,this.state,args);
		this.callbacks['onenter'+this.state]&&this.callbacks['onenter'+this.state](this,event.name,this.prevState,event.state,args);
		this.callbacks['onafter'+fn]&&this.callbacks['onafter'+fn](this,event.name,this.prevState,event.state,args);
		console.log('sm state transform '+ this.prevState+ ' to '+ this.state);

	}
	_StateMachine.prototype.is = function (state) {
		return this.state == state;
	}
	_StateMachine.prototype.can = function (eventName) {
		var event =  this._getEvent(this._hashEvent[eventName]);
		return JSON.stringify(event) != '{}';
	}
	_StateMachine.prototype.cannot = function (eventName) {
		var event =  this._getEvent(this._hashEvent[eventName]);
		return JSON.stringify(event) == '{}';
	}
	//以数组的形式返回实例当前状态下能够被触发的行为列表
	_StateMachine.prototype.transitions = function () {
		var events = [];
		for (var e in this._hashEvent) {
			if(this.can(e)){
				events.push(e);
			}
		}
		return events;
	}
	return {
		create:function (config) {
			return new _StateMachine(config)
		}
	}
})();


var fsm2 = sm.create({
  initial: 'hungry',
  events: [
    { name: 'eat',  from: 'hungry', to: 'satisfied' },
    { name: 'eat',  from: 'satisfied',to: 'full'      },
    { name: 'eat',  from: 'full',to: 'sick'      },
    { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
]
});


var fsm = sm.create({
  initial: 'green',
  events: [
    { name: 'warn',  from: 'green',  to: 'yellow' },
    { name: 'panic', from: 'yellow', to: 'red'    },
    { name: 'calm',  from: 'red',    to: 'yellow' },
    { name: 'clear', from: 'yellow', to: 'green'  }
  ],
  callbacks: {
    onpanic:  function(event, from, to, msg) { alert('panic! ' + msg);               },
    onwarn:  function(event, from, to, msg) { alert('warn! ' + msg);               },
    onclear:  function(event, from, to, msg) { alert('thanks to ' + msg);            },
    ongreen:  function(event, from, to)      { document.body.className = 'green';    },
    onyellow: function(event, from, to)      { document.body.className = 'yellow';   },
    onred:    function(event, from, to)      { document.body.className = 'red';      },
  }
});