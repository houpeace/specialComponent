# StateMachine 

个人对于状态机的理解和实现

实现思路

1、单个页面会有多个UI，每个UI可拥有独立的一个状态机，因此用工厂模式的思路实现

2、状态切换间应该有多个时机传回调函数：onbefore->onleave->on[Event]->on[state]->onenter[State]->onafter[event]

3、留个外部调用的一些方法接口is(判断当前状态是不是此state);can(判断状态十分能转换)；cannot;transitions(能转换的状态)；
