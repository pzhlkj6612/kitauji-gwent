### 每局结束后socket重连

前端状态管理比较混乱，重连可以保证回到最初状态。否则会导致重复注册事件等情况。。（旧的view和新的view监听同一个socket等等）。后端现有的逻辑也是基于每局结束重连的。以后碰到瓶颈再优化。

### Switch turn 逻辑

`Battleside`收到`play:cardFromHand`事件，
`playCard()`->`endTurn()`->`runEvent("NextTurn", null, [this.foe])`触发对方的turn。

`Battle`接收`NextTurn`事件调用`switchTurn()`。如果传进来的一方pass，则调用另一方。
如果都pass，`startNewRound()`进下一轮。
`__flag`表示是第二次调用。作用是知道双方都pass后进下一轮。
如果某一方没有pass，则`this.runEvent("Turn" + side.getID())`通知`Battleside`改变双方waiting状态。

client收到waiting状态改变的消息后，可以发送`play:cardFromHand`事件，`Battleside`收到，以此类推。
