### User

Event|Data|Note
----|----|----
user:init|`{connId: string, token: string}`|
request:matchmaking:bot||
request:matchmaking|`{roomName?: string}`|
request:gameLoaded|`{_roomID: string}`|set room ready
set:deck|`{deck: string}`|set deck by deck name, deprecated
set:customDeck|`{deck: string, leader: string, cardInDeck: object}`|cardInDeck: map card name to count

### Room

Event|Data|Note
----|----|----
request:quitGame||quit current game
response:joinRoom|`number`|roomID
room:rejoin|`{side: string, foeSide: string, roomID: string}`|user rejoin, send necessary info
init:battle|`{side: string, foeSide: string}`|
foe:connecting||foe temporarily offline, wait for reconnect
foe:reconnect||foe reconnect
foe:left||foe disconnect
redraw:cards||
redraw:reDrawCard|`{cardID: number}`|sent by client
redraw:close||
redraw:close_client||

### Battle

Event|Data|Note
----|----|----
new:round||start new round
gameover|`{winner: string, p1Scores: number[], p2Scores: number[]}`|
update:info|`{info, leader, cards, close, ranged, siege, weather}`|
play:cardFromHand|`{id: number}`|
decoy:replaceWith|`{cardID: number}`|
cancel:decoy||
played:medic|`{cards: object[]}`|send discard to user
medic:chooseCardFromDiscard|`{cardID: number}`|
horn:field|`{field: number}`|
cancel:horn||
played:horn|`{cardID: number}`|
played:heal|`{healPower: number, highlight: object[]}`|
heal:chooseHeal|`{cardID: number}`|
played:attack|`{attackPower: number, highlight: object[]}`|
attack:chooseAttack|`{cardID: number}`|
set:passing|`{passing: boolean}`|
set:waiting|`{waiting: boolean}`|

### Other

Event|Data|Note
----|----|----
update:playerOnline|`{online: number, idle: number}`|
notification|`{message: string}`|
