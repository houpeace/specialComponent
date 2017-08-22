function ScrollNum(config) {
    this.root = config.root||$('body');
    this.isDubg = config.isDubg || false;
    this.numLength = config.numLength||6;
    this.prevNumLength = 0;
    this.splitCount = config.splitCount ||3;
    this.numHtml = config.numHtml||`<div class="i-scrollNum">
                        <div class="i-scrollNum-scroll">
                            <span class="i-scrollNum-num">0</span>
                            <span class="i-scrollNum-num">1</span>
                            <span class="i-scrollNum-num">2</span>
                            <span class="i-scrollNum-num">3</span>
                            <span class="i-scrollNum-num">4</span>
                            <span class="i-scrollNum-num">5</span>
                            <span class="i-scrollNum-num">6</span>
                            <span class="i-scrollNum-num">7</span>
                            <span class="i-scrollNum-num">8</span>
                            <span class="i-scrollNum-num">9</span>
                        </div>
                    </div>` ;
    this.spiltHtml = config.spiltHtml||'<div class="i-scrollNum-split">,</div>';
    this.init();
}
ScrollNum.prototype.init = function () {
    this.initView();

    if(this.isDubg){
        var self = this;
        setInterval(function () {
          self.dubgView();
        },1000);
    }
}
ScrollNum.prototype.initView = function () {
    var html = [];
    if(this.prevNumLength > this.numLength){
        var subLength = this.prevNumLength - this.numLength;
        this.removeNode(subLength);
    }else{
        for(var i=this.prevNumLength;i<this.numLength;){
            html.push(this.numHtml);
            if((i+1)%this.splitCount==0){
                html.push(this.spiltHtml);
            }
            i++;
        }
        html.reverse();
        if(html[0] ==this.spiltHtml){
            html.shift();
        }
        html.join('$%^').replace('$%^','');
        this.root.prepend(html);
    }
    
}
ScrollNum.prototype.removeNode = function (subLength) {
    var subLength = subLength,node;
    while(subLength!=0){
        node = this.root.find('.i-scrollNum').eq(0);
        if(node.prev().length){
            node.prev().remove();
        }
        node.remove();
        subLength--;
    }
    
}
ScrollNum.prototype.initData = function (data) {
  this.data = data+'';
  if(this.data.length!=this.numLength){
    this.prevNumLength = this.numLength;
    this.numLength = this.data.length;
    this.initView();
  }
};
ScrollNum.prototype.initTestNum = function (data) {
  this.data =  Math.floor(Math.random()*Math.pow(10,this.numLength))+'';
};
ScrollNum.prototype.initTimeNum = function (date) {
    var day = date||new Date;
   this.data =  getFixTwoStr(day.getHours())+getFixTwoStr(day.getMinutes())+getFixTwoStr(day.getSeconds());
   function getFixTwoStr(num) {
       var num = num +'';
       num =  num.length==1?0+num:num;
       return num
   }
}

ScrollNum.prototype.renderView = function() {
    var prefixClass = 'i-scrollNum-scroll scroll',
        scrollEle = this.root.find('.i-scrollNum-scroll');
    var data = this.data;
    scrollEle.each(function(index, el) {
        var num = data.substring(0, 1);
        data = data.substr(1);
        el.className = prefixClass + num;
    });
}
ScrollNum.prototype.dubgView = function () {
    this.initTestNum();
    this.renderView();
}
var scroll1 = new ScrollNum({
    root:$('#j-scroll1'),
    numLength:7,
    isDubg:true
})
var scroll2 = new ScrollNum({
    root:$('#j-scroll2'),
    numLength:5,
    isDubg:false
})
var scroll3 = new ScrollNum({
    root:$('#j-scroll3'),
    numLength:6,
    spiltHtml:'<div class="i-scrollNum-split">:</div>',
    splitCount:2,
    isDubg:false
})
setInterval(function () {
    scroll3.initTimeNum();
    scroll3.renderView();
},1000);
setTimeout(function () {
    scroll2.initData(2222000);
    scroll2.renderView()
},1000);
setTimeout(function () {
    scroll2.initData(2000);
    scroll2.renderView()
},3000)