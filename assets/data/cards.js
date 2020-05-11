/**
 * types
 * 0 close combat
 * 1 ranged
 * 2 siege
 * 3 leader
 * 4 special (decoy)
 * 5 weather
 */


module.exports = {
  "none": {
    name: "none",
    power: 0,
    ability: null,
    img: "foot_soldier1",
    faction: "northern",
    type: 0
  },
  "kenzaki_ririka": {
    name: "剑崎梨梨花",
    power: 4,
    ability: "tight_bond",
    bondType: "doubleReed",
    img: "kenzaki_ririka",
    faction: "kitauji",
    type: 0
  },
  "kabutodani_eru": {
    name: "兜谷爱瑠",
    power: 4,
    ability: "tight_bond",
    bondType: "doubleReed",
    img: "kabutodani_eru",
    faction: "kitauji",
    type: 0
  },
  "koteyama_suruga": {
    name: "笼手山骏河",
    power: 4,
    ability: "tight_bond",
    bondType: "doubleReed",
    img: "koteyama_suruga",
    faction: "kitauji",
    type: 0
  },
  "maki_chikai": {
    name: "牧誓",
    power: 5,
    ability: null,
    img: "maki_chikai",
    faction: "kitauji",
    type: 0
  },
  "suzuki_mirei": {
    name: "铃木美玲",
    power: 5,
    ability: null,
    img: "suzuki_mirei",
    faction: "kitauji",
    type: 1
  },
  "yoroizuka_mizore": {
    name: "铠冢霙",
    power: 15,
    ability: "hero",
    img: "yoroizuka_mizore",
    faction: "kitauji",
    type: 0
  },
  "kamaya_tsubame": {
    name: "釜屋燕",
    power: 4,
    ability: null,
    img: "kamaya_tsubame",
    faction: "kitauji",
    type: 2
  },
  "inoue_junna": {
    name: "井上顺菜",
    power: 5,
    ability: "tight_bond",
    bondType: "perc",
    img: "inoue_junna",
    faction: "kitauji",
    type: 2
  },
  "sakai_masako": {
    name: "堺万纱子",
    power: 5,
    ability: "tight_bond",
    bondType: "perc",
    img: "sakai_masako",
    faction: "kitauji",
    type: 2
  },
  "tsukinaga_motomu": {
    name: "月永求",
    power: 5,
    ability: null,
    img: "tsukinaga_motomu",
    faction: "kitauji",
    type: 2
  },
  "tsukamoto_shuichi": {
    name: "冢本秀一",
    power: 5,
    ability: null,
    img: "tsukamoto_shuichi",
    faction: "kitauji",
    type: 1
  },
  "kishibe_miru": {
    name: "岸部海松",
    power: 5,
    ability: null,
    img: "kishibe_miru",
    faction: "kitauji",
    type: 1
  },
  "katou_hazuki": {
    name: "加藤叶月",
    power: 2,
    ability: "commanders_horn",
    img: "katou_hazuki",
    faction: "kitauji",
    type: 1
  },
  "iwata_keina": {
    name: "岩田慧菜",
    power: 5,
    ability: "medic",
    img: "iwata_keina",
    faction: "kitauji",
    type: 1
  },
  "higashiura_motoko": {
    name: "东浦心子",
    power: 6,
    ability: null,
    img: "higashiura_motoko",
    faction: "kitauji",
    type: 2
  },
  "nagase_riko": {
    name: "长濑梨子",
    power: 6,
    ability: "tight_bond",
    bondType: "tuba",
    img: "nagase_riko",
    faction: "kitauji",
    type: 1
  },
  "gotou_takuya": {
    name: "后藤卓也",
    power: 6,
    ability: "tight_bond",
    bondType: "tuba",
    img: "gotou_takuya",
    faction: "kitauji",
    type: 1
  },
  "tubakun": {
    name: "大号君",
    power: -1,
    ability: "decoy",
    img: "tubakun",
    faction: "kitauji",
    type: 4
  },
  "taibu": {
    name: "退部申请书",
    power: -1,
    ability: "scorch_card",
    img: "taibu",
    faction: "kitauji",
    type: 4
  },
  "hashimoto": {
    name: "桥本老师",
    power: -1,
    ability: "commanders_horn_card",
    img: "hashimoto",
    faction: "kitauji",
    type: 4
  },
  "niiyama": {
    name: "新山老师",
    power: -1,
    ability: "commanders_horn_card",
    img: "niiyama",
    faction: "kitauji",
    type: 4
  },
  "daisangakushou": {
    name: "第三乐章",
    power: -1,
    ability: "weather_fog",
    img: "daisangakushou",
    faction: "kitauji",
    type: 5
  },
  "sunfes": {
    name: "Sunrise Festival",
    power: -1,
    ability: "weather_frost",
    img: "sunfes",
    faction: "kitauji",
    type: 5
  },
  "wasure": {
    name: "忘带鼓槌",
    power: -1,
    ability: "weather_rain",
    img: "wasure",
    faction: "kitauji",
    type: 5
  },
  "daikichiyama": {
    name: "大吉山",
    power: -1,
    ability: "weather_clear",
    img: "daikichiyama",
    faction: "kitauji",
    type: 5
  },
  "pool": {
    name: "泳池",
    power: -1,
    ability: "weather_clear",
    img: "pool",
    faction: "kitauji",
    type: 5
  },
  "kabe_tomoe": {
    name: "加部友惠",
    power: 2,
    ability: "commanders_horn",
    img: "kabe_tomoe",
    faction: "kitauji",
    type: 1
  },
  "hisaishi_kanade": {
    name: "久石奏",
    power: 0,
    ability: ["hero", "spy"],
    img: "hisaishi_kanade",
    faction: "kitauji",
    type: 1
  },
  "kasaki_nozomi": {
    name: "伞木希美",
    power: 7,
    ability: ["hero", "scorch"],
    img: "kasaki_nozomi",
    faction: "kitauji",
    type: 0
  },
  "kousaka_reina": {
    name: "高坂丽奈",
    power: 15,
    ability: "hero",
    img: "kousaka_reina",
    faction: "kitauji",
    type: 1
  },
  "kawashima_sapphire": {
    name: "川岛绿辉",
    power: 10,
    ability: "hero",
    img: "kawashima_sapphire",
    faction: "kitauji",
    type: 2
  },
  "tanaka_asuka": {
    name: "田中明日香",
    power: 10,
    ability: ["hero", "morale_boost"],
    img: "tanaka_asuka",
    faction: "kitauji",
    type: 1
  },
  "suzuki_satsuki": {
    name: "铃木五月",
    power: 2,
    ability: null,
    img: "suzuki_satsuki",
    faction: "kitauji",
    type: 1
  },
  "oda_meiko": {
    name: "小田芽衣子",
    power: 4,
    ability: "muster",
    musterType: "flute2",
    img: "oda_meiko",
    faction: "kitauji",
    type: 0
  },
  "takahashi_sari": {
    name: "高桥沙里",
    power: 4,
    ability: "muster",
    musterType: "flute2",
    img: "takahashi_sari",
    faction: "kitauji",
    type: 0
  },
  "nakano_tsubomi": {
    name: "中野蕾实",
    power: 4,
    ability: "muster",
    musterType: "flute2",
    img: "nakano_tsubomi",
    faction: "kitauji",
    type: 0
  },
  "yoshikawa_yuko": {
    name: "吉川优子",
    power: 5,
    ability: "tight_bond",
    bondType: "nakayoshi",
    img: "yoshikawa_yuko",
    faction: "kitauji",
    type: 1
  },
  "nakagawa_natsuki": {
    name: "中川夏纪",
    power: 5,
    ability: "tight_bond",
    bondType: "nakayoshi",
    img: "nakagawa_natsuki",
    faction: "kitauji",
    type: 1
  },
  "kohinata_yume": {
    name: "小日向梦",
    power: 6,
    ability: null,
    img: "kohinata_yume",
    faction: "kitauji",
    type: 1
  },
  "etou_kana": {
    name: "江藤香奈",
    power: 2,
    ability: "muster",
    musterType: "flute1",
    img: "etou_kana",
    faction: "kitauji",
    type: 0
  },
  "hiraishi_narumi": {
    name: "平石成美",
    power: 2,
    ability: "muster",
    musterType: "flute1",
    img: "hiraishi_narumi",
    faction: "kitauji",
    type: 0
  },
  "yamane_tsumiki": {
    name: "山根都美贵",
    power: 2,
    ability: "muster",
    musterType: "flute1",
    img: "yamane_tsumiki",
    faction: "kitauji",
    type: 0
  },
  "oumae_kumiko": {
    name: "黄前久美子",
    power: 7,
    ability: ["hero", "medic"],
    img: "oumae_kumiko",
    faction: "kitauji",
    type: 1
  },
  "nakaseko_kaori": {
    name: "中世古香织",
    power: 7,
    ability: "medic",
    img: "nakaseko_kaori",
    faction: "kitauji",
    type: 1
  },
  "maeda_aota": {
    name: "前田苍太",
    power: 3,
    ability: "tight_bond",
    bondType: "perc2",
    img: "maeda_aota",
    faction: "kitauji",
    type: 2
  },
  "maeda_sosuke": {
    name: "前田飒介",
    power: 3,
    ability: "tight_bond",
    bondType: "perc2",
    img: "maeda_sosuke",
    faction: "kitauji",
    type: 2
  },
  "hakase_michiru": {
    name: "叶加濑满",
    power: 4,
    ability: "spy",
    img: "hakase_michiru",
    faction: "kitauji",
    type: 1
  },
  "takigawa_chikao": {
    name: "泷川近夫",
    power: 5,
    ability: "tight_bond",
    bondType: "bg",
    img: "takigawa_chikao",
    faction: "kitauji",
    type: 0
  },
  "takahisa_chieri": {
    name: "高久智惠理",
    power: 5,
    ability: "tight_bond",
    bondType: "bg",
    img: "takahisa_chieri",
    faction: "kitauji",
    type: 0
  },
  "kitayama_tairu": {
    name: "北山泰瑠",
    power: 5,
    ability: null,
    img: "kitayama_tairu",
    faction: "kitauji",
    type: 0
  },
  "hirao_sumiko": {
    name: "平尾澄子",
    power: 6,
    ability: null,
    img: "hirao_sumiko",
    faction: "kitauji",
    type: 0
  },
  "ono_miyoko": {
    name: "大野美代子",
    power: 7,
    ability: null,
    img: "ono_miyoko",
    faction: "kitauji",
    type: 2
  },
  "ogasawara_haruka": {
    name: "小笠原晴香",
    power: 7,
    ability: "morale_boost",
    img: "ogasawara_haruka",
    faction: "kitauji",
    type: 0
  },
  "inoue_shirabe": {
    name: "井上调",
    power: 7,
    ability: null,
    img: "inoue_shirabe",
    faction: "kitauji",
    type: 0
  },
  "hitomi_lala": {
    name: '瞳拉拉',
    power: 4,
    ability: "spy",
    img: "hitomi_lala",
    faction: "kitauji",
    type: 1
  },
  "taki_noboru": {
    name: "泷升",
    power: -1,
    ability: "foltest_leader4",
    img: "taki_noboru",
    faction: "kitauji",
    type: 3
  },
  "taki_chihiro": {
    name: "泷千寻",
    power: -1,
    ability: "foltest_leader4",
    img: "taki_chihiro",
    faction: "kitauji",
    type: 3
  },
  "redanian_foot_soldier": {
    name: "Redanian Foot Soldier",
    power: 1,
    ability: null,
    img: "foot_soldier1",
    faction: "northern",
    type: 0
  },
  "poor_fucking_infantry": {
    name: "Poor Fucking Infantry",
    power: 1,
    ability: "tight_bond",
    img: "infantry",
    faction: "northern",
    type: 0
  },
  "yarpen_zigrin": {
    name: "Yarpen Zigrin",
    power: 2,
    ability: null,
    img: "yarpen",
    faction: "northern",
    type: 0
  },
  "blue_stripes_commando": {
    name: "Blue Stripes Commando",
    power: 4,
    ability: "tight_bond",
    img: "commando",
    faction: "northern",
    type: 0
  },
  "sigismund_dijkstra": {
    name: "Sigismund Dijkstra",
    power: 4,
    ability: "spy",
    img: "dijkstra",
    faction: "northern",
    type: 0
  },
  "prince_stennis": {
    name: "Prince Stennis",
    power: 5,
    ability: "spy",
    img: "stennis",
    faction: "northern",
    type: 0
  },
  "siegfried_of_denesle": {
    name: "Siegfried of Denesle",
    power: 5,
    ability: null,
    img: "siegfried",
    faction: "northern",
    type: 0
  },
  "ves": {
    name: "Ves",
    power: 5,
    ability: null,
    img: "ves",
    faction: "northern",
    type: 0
  },
  "vernon_roche": {
    name: "Vernon Roche",
    power: 10,
    ability: "hero",
    img: "roche",
    faction: "northern",
    type: 0
  },
  "john_natalis": {
    name: "John Natalis",
    power: 10,
    ability: "hero",
    img: "natalis",
    faction: "northern",
    type: 0
  },
  "sheldon_skaggs": {
    name: "Sheldon Skaggs",
    power: 4,
    ability: null,
    img: "skaggs",
    faction: "northern",
    type: 1
  },
  "sabrina_glevissig": {
    name: "Sabrina Glevissig",
    power: 4,
    ability: null,
    img: "sabrina",
    faction: "northern",
    type: 1
  },
  "crinfrid_reavers_dragon_hunter": {
    name: "Crinfrid Reaver's Dragon Hunter",
    power: 5,
    ability: "tight_bond",
    img: "crinfrid",
    faction: "northern",
    type: 1
  },
  "sile_de_tansarville": {
    name: "Síle de Tansarville",
    power: 5,
    ability: null,
    img: "sile",
    faction: "northern",
    type: 1
  },
  "keira_metz": {
    name: "Keira Metz",
    power: 5,
    ability: null,
    img: "keira",
    faction: "northern",
    type: 1
  },
  "dethmold": {
    name: "Dethmold",
    power: 6,
    ability: null,
    img: "dethmold",
    faction: "northern",
    type: 1
  },
  "kaedweni_siege_expert": {
    name: "Kaedweni Siege Expert",
    power: 1,
    ability: "morale_boost",
    img: "siege_expert1",
    faction: "northern",
    type: 2
  },
  "dun_banner_medic": {
    name: "Dun Banner Medic",
    power: 5,
    ability: "medic",
    img: "medic",
    faction: "northern",
    type: 2
  },
  "ballista": {
    name: "Ballista",
    power: 6,
    ability: null,
    img: "ballista1",
    faction: "northern",
    type: 2
  },
  "trebuchet": {
    name: "Trebuchet",
    power: 6,
    ability: null,
    img: "trebuchet1",
    faction: "northern",
    type: 2
  },
  "thaler": {
    name: "Thaler",
    power: 1,
    ability: "spy",
    img: "thaler",
    faction: "northern",
    type: 2
  },
  "foltest_king_of_temeria": {
    name: "Foltest: King of Temeria",
    power: -1,
    ability: "foltest_leader1",
    img: "foltest_king",
    faction: "northern",
    type: 3
  },
  "foltest_lord_commander": {
    name: "Foltest: Lord Commander",
    power: -1,
    ability: "foltest_leader2",
    img: "foltest_commander",
    faction: "northern",
    type: 3
  },
  "foltest_siegemaster": {
    name: "Foltest: The Siegemaster",
    power: -1,
    ability: "foltest_leader3",
    img: "foltest_siege",
    faction: "northern",
    type: 3
  },
  "foltest_forged": {
    name: "Foltest: The Steel-Forged",
    power: -1,
    ability: "foltest_leader4",
    img: "foltest_forged",
    faction: "northern",
    type: 3
  },
  "philippa_eilhart": {
    name: "Philippa Eilhart",
    power: 10,
    ability: "hero",
    img: "eilhart",
    faction: "northern",
    type: 1
  },
  "esterad_thyssen": {
    name: "Esterad Thyssen",
    power: 10,
    ability: "hero",
    img: "thyssen",
    faction: "northern",
    type: 0
  },
  "siege_tower": {
    name: "Siege Tower",
    power: 6,
    ability: null,
    img: "siege_tower",
    faction: "northern",
    type: 2
  },
  "catapult": {
    name: "Catapult",
    power: 8,
    ability: "tight_bond",
    img: "catapult",
    faction: "northern",
    type: 2
  },


  "decoy": {
    name: "Decoy",
    power: -1,
    ability: "decoy",
    img: "decoy",
    faction: "neutral",
    type: 4
  },
  "scorch": {
    name: "Scorch",
    power: -1,
    ability: "scorch_card",
    img: "scorch",
    faction: "neutral",
    type: 4
  },
  "commanders_horn": {
    name: "Commander's Horn",
    power: -1,
    ability: "commanders_horn_card",
    img: "horn",
    faction: "neutral",
    type: 4
  },


  "impenetrable_fog": {
    name: "Impenetrable Fog",
    power: -1,
    ability: "weather_fog",
    img: "fog",
    faction: "neutral",
    type: 5
  },
  "biting_frost": {
    name: "Biting Frost",
    power: -1,
    ability: "weather_frost",
    img: "frost",
    faction: "neutral",
    type: 5
  },
  "torrential_rain": {
    name: "Torrential Rain",
    power: -1,
    ability: "weather_rain",
    img: "rain",
    faction: "neutral",
    type: 5
  },
  "clear_weather": {
    name: "Clear Weather",
    power: -1,
    ability: "weather_clear",
    img: "clear",
    faction: "neutral",
    type: 5
  },

  "dandelion": {
    name: "Dandelion",
    power: 2,
    ability: "commanders_horn",
    img: "dandelion",
    faction: "neutral",
    type: 0
  },
  "avallach": {
    name: "Avallac'h",
    power: 0,
    ability: ["hero", "spy"],
    img: "avallach",
    faction: "neutral",
    type: 0
  },
  "villentretenmerth": {
    name: "Villentretenmerth ",
    power: 7,
    ability: "scorch",
    img: "villentretenmerth",
    faction: "neutral",
    type: 0
  },

  "francesca_pureblood_elf": {
    name: "Francesca, Pureblood Elf",
    power: -1,
    ability: "francesca_leader1",
    img: "francesca_pureblood",
    faction: "scoiatael",
    type: 3
  },
  "francesca_the_beautiful": {
    name: "Francesca The Beautiful",
    power: -1,
    ability: "francesca_leader2",
    img: "francesca_beautiful",
    faction: "scoiatael",
    type: 3
  },
  "francesca_daisy_of_the_valley": {
    name: "Francesca, Daisy of The Valley",
    power: -1,
    ability: "francesca_leader3",
    img: "francesca_daisy",
    faction: "scoiatael",
    type: 3
  },
  "francesca_queen_of_dol_blathanna": {
    name: "Francesca, Queen of Dol Blathanna",
    power: -1,
    ability: "francesca_leader4",
    img: "francesca_queen",
    faction: "scoiatael",
    type: 3
  },
  "saesenthessis": {
    name: "Saesenthessis",
    power: 10,
    ability: "hero",
    img: "saesenthessis",
    faction: "scoiatael",
    type: 1
  },
  "iorveth": {
    name: "Iorveth",
    power: 10,
    ability: "hero",
    img: "iorveth",
    faction: "scoiatael",
    type: 1
  },
  "isengrim_faoiltiarnah": {
    name: "Isengrim Faoiltiarnah",
    power: 10,
    ability: ["hero", "morale_boost"],
    img: "isengrim",
    faction: "scoiatael",
    type: 0
  },
  "eithne": {
    name: "Eithne",
    power: 10,
    ability: "hero",
    img: "eithne",
    faction: "scoiatael",
    type: 1
  },
  "havekar_healer": {
    name: "Havekar Healer",
    power: 0,
    ability: "medic",
    img: "healer",
    faction: "scoiatael",
    type: 1
  },
  "riordain": {
    name: "Riordain",
    power: 1,
    ability: null,
    img: "riordain",
    faction: "scoiatael",
    type: 1
  },
  "toruviel": {
    name: "Toruviel",
    power: 2,
    ability: null,
    img: "toruviel",
    faction: "scoiatael",
    type: 1
  },
  "elven_skirmisher": {
    name: "Elven Skirmisher",
    power: 2,
    ability: "muster",
    musterType: "skirmisher",
    img: "elven_skirmisher2",
    faction: "scoiatael",
    type: 1
  },
  "dwarven_skirmisher": {
    name: "Dwarven Skirmisher",
    power: 3,
    ability: "muster",
    musterType: "skirmisher",
    img: "skirmisher2",
    faction: "scoiatael",
    type: 0
  },
  "ciaran_aep_easnillien": {
    name: "Ciaran aep Easnillien",
    power: 3,
    ability: "agile",
    img: "easnillien",
    faction: "scoiatael",
    type: 1
  },
  "vrihedd_brigade_recruit": {
    name: "Vrihedd Brigade Recruit",
    power: 4,
    ability: null,
    img: "recruit",
    faction: "scoiatael",
    type: 1
  },
  "dol_blathanna_archer": {
    name: "Dol Blathanna Archer",
    power: 4,
    ability: null,
    img: "archer",
    faction: "scoiatael",
    type: 1
  }, /*
  "hav_caaren_medic": {
    name: "Hav’caaren Medic",
    power: 5,
    ability: null,
    img: "", //missing image
    faction: "scoiatael",
    type: 0
  },*/
  "havekar_smuggler": {
    name: "Havekar Smuggler",
    power: 5,
    ability: "muster",
    musterType: "smuggler",
    img: "smuggler1",
    faction: "scoiatael",
    type: 0
  },
  "mahakaman_defender": {
    name: "Mahakaman Defender",
    power: 5,
    ability: null,
    img: "defender2",
    faction: "scoiatael",
    type: 0
  },
  "vrihedd_brigade_veteran": {
    name: "Vrihedd Brigade Veteran",
    power: 5,
    ability: "agile",
    img: "veteran1",
    faction: "scoiatael",
    type: 0
  },
  "dennis_cranmer": {
    name: "Dennis Cranmer",
    power: 6,
    ability: null,
    img: "cranmer",
    faction: "scoiatael",
    type: 0
  },
  "filavandrel_aen_fidhail": {
    name: "Filavandrel aén Fidháil",
    power: 6,
    ability: "agile",
    img: "fidhail",
    faction: "scoiatael",
    type: 1
  },
  "ida_emean_aep_sivney": {
    name: "Ida Emean aep Sivney",
    power: 6,
    ability: null,
    img: "sivney",
    faction: "scoiatael",
    type: 1
  },
  "yaevinn": {
    name: "Yaevinn",
    power: 6,
    ability: "agile",
    img: "yaevinn",
    faction: "scoiatael",
    type: 0
  },
  "barclay_els": {
    name: "Barclay Els",
    power: 6,
    ability: "agile",
    img: "barclay",
    faction: "scoiatael",
    type: 0
  },
  "dol_blathanna_scout": {
    name: "Dol Blathanna Scout",
    power: 6,
    ability: "agile",
    img: "scout2",
    faction: "scoiatael",
    type: 0
  },
  "milva": {
    name: "Milva",
    power: 10,
    ability: "morale_boost",
    img: "milva",
    faction: "scoiatael",
    type: 1
  },


  "eredin_commander_of_the_red_riders": {
    name: "Eredin, Commander of the Red Riders",
    power: -1,
    ability: "eredin_leader1",
    img: "eredin_commander",
    faction: "monster",
    type: 3
  },
  "eredin_bringer_of_death": {
    name: "Eredin, Bringer of Death",
    power: -1,
    ability: "eredin_leader2",
    img: "eredin_bringer",
    faction: "monster",
    type: 3
  },
  "eredin_destroyer_of_worlds": {
    name: "Eredin, Destroyer of Worlds",
    power: -1,
    ability: "eredin_leader3",
    img: "eredin_destroyer",
    faction: "monster",
    type: 3
  },
  "eredin_king_of_the_wild_hunt": {
    name: "Eredin, King of The Wild Hunt",
    power: -1,
    ability: "eredin_leader4",
    img: "eredin_king",
    faction: "monster",
    type: 3
  },
  "kayran": {
    name: "Kayran",
    power: 8,
    ability: ["hero", "morale_boost", "agile"],
    img: "kayran",
    faction: "monster",
    type: 1
  },
  "leshen": {
    name: "Leshen",
    power: 10,
    ability: "hero",
    img: "leshen",
    faction: "monster",
    type: 1
  },
  "imlerith": {
    name: "Imlerith",
    power: 10,
    ability: "hero",
    img: "imlerith",
    faction: "monster",
    type: 0
  },
  "draug": {
    name: "Draug",
    power: 10,
    ability: "hero",
    img: "draug",
    faction: "monster",
    type: 0
  },
  "ghoul": {
    name: "Ghoul",
    power: 1,
    ability: "muster",
    musterType: "ghoul",
    img: "ghoul1",
    faction: "monster",
    type: 0
  },
  "nekker": {
    name: "Nekker",
    power: 2,
    ability: "muster",
    musterType: "nekker",
    img: "nekker1",
    faction: "monster",
    type: 0
  },
  "wyvern": {
    name: "Wyvern",
    power: 2,
    ability: null,
    img: "wyvern",
    faction: "monster",
    type: 1
  },
  "foglet": {
    name: "Foglet",
    power: 2,
    ability: null,
    img: "foglet",
    faction: "monster",
    type: 0
  },
  "celaeno_harpy": {
    name: "Celaeno Harpy",
    power: 2,
    ability: "agile",
    img: "celaeno_harpy",
    faction: "monster",
    type: 1
  },
  "gargoyle": {
    name: "Gargoyle",
    power: 2,
    ability: null,
    img: "gargoyle",
    faction: "monster",
    type: 1
  },
  "cockatrice": {
    name: "Cockatrice",
    power: 2,
    ability: null,
    img: "cockatrice",
    faction: "monster",
    type: 1
  },
  "harpy": {
    name: "Harpy",
    power: 2,
    ability: "agile",
    img: "harpy",
    faction: "monster",
    type: 1
  },
  "endrega": {
    name: "Endrega",
    power: 2,
    ability: null,
    img: "endrega",
    faction: "monster",
    type: 1
  },
  "vampire_bruxa": {
    name: "Vampire: Bruxa",
    power: 4,
    ability: "muster",
    musterType: "vampire",
    img: "vampire_bruxa",
    faction: "monster",
    type: 0
  },
  "vampire_fleder": {
    name: "Vampire: Fleder",
    power: 4,
    ability: "muster",
    musterType: "vampire",
    img: "vampire_fleder",
    faction: "monster",
    type: 0
  },
  "vampire_garkain": {
    name: "Vampire: Garkain",
    power: 4,
    ability: "muster",
    musterType: "vampire",
    img: "vampire_garkain",
    faction: "monster",
    type: 0
  },
  "vampire_ekimmara": {
    name: "Vampire: Ekimmara",
    power: 4,
    ability: "muster",
    musterType: "vampire",
    img: "vampire_ekimmara",
    faction: "monster",
    type: 0
  },
  "arachas": {
    name: "Arachas",
    power: 4,
    ability: "muster",
    musterType: "arachas",
    img: "arachas1",
    faction: "monster",
    type: 0
  },
  "botchling": {
    name: "Botchling",
    power: 4,
    ability: null,
    img: "botchling",
    faction: "monster",
    type: 0
  },
  "forktail": {
    name: "Forktail",
    power: 5,
    ability: null,
    img: "forktail",
    faction: "monster",
    type: 0
  },
  "plague_maiden": {
    name: "Plague Maiden",
    power: 5,
    ability: null,
    img: "forktail",
    faction: "monster",
    type: 0
  },
  "griffin": {
    name: "Griffin",
    power: 5,
    ability: null,
    img: "griffin",
    faction: "monster",
    type: 0
  },
  "werewolf": {
    name: "Werewolf",
    power: 5,
    ability: null,
    img: "werewolf",
    faction: "monster",
    type: 0
  },
  "frightener": {
    name: "Frightener",
    power: 5,
    ability: null,
    img: "frightener",
    faction: "monster",
    type: 0
  },
  "ice_giant": {
    name: "Ice Giant",
    power: 5,
    ability: null,
    img: "ice_giant",
    faction: "monster",
    type: 2
  },
  "grave_hag": {
    name: "Grave Hag",
    power: 5,
    ability: null,
    img: "grave_hag",
    faction: "monster",
    type: 1
  },
  /*"vampire_katakan": {
    name: "Vampire: Katakan",
    power: 5,
    ability: "muster",
 musterType: "vampire",
    img: "vampire_katakan",
    faction: "monster",
    type: 0
  },*/
  "crone_whispess": {
    name: "Crone: Whispess",
    power: 6,
    ability: "muster",
    musterType: "crone",
    img: "crone_whispess",
    faction: "monster",
    type: 0
  },
  "crone_brewess": {
    name: "Crone: Brewess",
    power: 6,
    ability: "muster",
    musterType: "crone",
    img: "crone_brewess",
    faction: "monster",
    type: 0
  },
  "crone_weavess": {
    name: "Crone: Weavess",
    power: 6,
    ability: "muster",
    musterType: "crone",
    img: "crone_weavess",
    faction: "monster",
    type: 0
  },
  "arachas_behemoth": {
    name: "Arachas Behemoth",
    power: 6,
    ability: "muster",
    musterType: "arachas",
    img: "arachas_behemoth",
    faction: "monster",
    type: 2
  },
  "fire_elemental": {
    name: "Fire Elemental",
    power: 6,
    ability: null,
    img: "fire_elemental",
    faction: "monster",
    type: 2
  },
  "fiend": {
    name: "Fiend",
    power: 6,
    ability: null,
    img: "fiend",
    faction: "monster",
    type: 0
  },
  "earth_elemental": {
    name: "Earth Elemental",
    power: 6,
    ability: null,
    img: "earth_elemental",
    faction: "monster",
    type: 2
  },


  //nilfgaardian
  "emreis_relentless": {
    name: "Emhyr vas Emreis the Relentless",
    power: -1,
    ability: "emreis_leader4",
    img: "emhyr_relentless",
    faction: "nilfgaardian",
    type: 3
  },
  "tibor_eggebracht": {
    name: "test",
    power: 10,
    ability: "hero",
    img: "eggebracht",
    faction: "nilfgaardian",
    type: 1
  },
  "letho_of_gulet": {
    name: "Letho of Gulet",
    power: 10,
    ability: "hero",
    img: "letho",
    faction: "nilfgaardian",
    type: 0
  },
  "morvran_voorhis": {
    name: "Morvran Voorhis",
    power: 10,
    ability: "hero",
    img: "voorhis",
    faction: "nilfgaardian",
    type: 2
  },
  "menno_coehoorn": {
    name: "Menno Coehoorn",
    power: 10,
    ability: ["hero", "medic"],
    img: "menno",
    faction: "nilfgaardian",
    type: 0
  },
  "siege_technician": {
    name: "Siege Technician",
    power: 0,
    ability: "medic",
    img: "siege_tech",
    faction: "nilfgaardian",
    type: 2
  },
  "etolian_auxiliary_archers": {
    name: "Etolian Auxiliary Archers",
    power: 1,
    ability: "medic",
    img: "aux_archers1",
    faction: "nilfgaardian",
    type: 1
  },
  "albrich": {
    name: "Albrich",
    power: 2,
    ability: null,
    img: "albrich",
    faction: "nilfgaardian",
    type: 1
  },
  "sweers": {
    name: "Sweers",
    power: 2,
    ability: null,
    img: "sweers",
    faction: "nilfgaardian",
    type: 2
  },
  "nausicaa_cavalry_rider": {
    name: "Nausicaa Cavalry Rider",
    power: 2,
    ability: "tight_bond",
    img: "nausicaa_cavalry_rider",
    faction: "nilfgaardian",
    type: 0
  },
  "vreemde": {
    name: "Vreemde",
    power: 2,
    ability: null,
    img: "vreemde",
    faction: "nilfgaardian",
    type: 0
  },
  "rotten_mangonel": {
    name: "Rotten Mangonel",
    power: 3,
    ability: null,
    img: "rotten_mangonel",
    faction: "nilfgaardian",
    type: 2
  },
  "morteisen": {
    name: "Morteisen",
    power: 3,
    ability: null,
    img: "morteisen",
    faction: "nilfgaardian",
    type: 0
  },
  "puttkammer": {
    name: "Puttkammer",
    power: 3,
    ability: null,
    img: "puttkammer",
    faction: "nilfgaardian",
    type: 1
  },
  "impera_brigade_guard": {
    name: "Impera Brigade Guard",
    power: 3,
    ability: "tight_bond",
    img: "impera_brigade_guard",
    faction: "nilfgaardian",
    type: 0
  },
  "vanhemar": {
    name: "Vanhemar",
    power: 4,
    ability: null,
    img: "vanhemar",
    faction: "nilfgaardian",
    type: 1
  },
  "vattier_de_rideaux": {
    name: "Vattier de Rideaux",
    power: 4,
    ability: "spy",
    img: "vattier",
    faction: "nilfgaardian",
    type: 0
  },
  "rainfarn": {
    name: "Rainfarn",
    power: 4,
    ability: null,
    img: "rainfarn",
    faction: "nilfgaardian",
    type: 0
  },
  "cynthia": {
    name: "Cynthia",
    power: 4,
    ability: null,
    img: "cynthia",
    faction: "nilfgaardian",
    type: 1
  },
  "zerrikanian_fire_scorpion": {
    name: "Zerrikanian Fire Scorpion",
    power: 5,
    ability: null,
    img: "fire_scorpion",
    faction: "nilfgaardian",
    type: 2
  },
  "young_emmisary": {
    name: "Young Emissary",
    power: 5,
    ability: "tight_bond",
    img: "young_emissary1",
    faction: "nilfgaardian",
    type: 0
  },
  "renuald_aep_matsen": {
    name: "Renuald aep Matsen",
    power: 5,
    ability: null,
    img: "renauld",
    faction: "nilfgaardian",
    type: 1
  },
  "siege_engineer": {
    name: "Siege Engineer",
    power: 6,
    ability: null,
    img: "siege_engineer",
    faction: "nilfgaardian",
    type: 2
  },
  "cahir_mawr_dyffryn_aep_ceallach": {
    name: "Cahir Mawr Dyffryn aep Ceallach",
    power: 6,
    ability: null,
    img: "ceallach",
    faction: "nilfgaardian",
    type: 0
  },
  "fringilla_vigo": {
    name: "Fringilla Vigo",
    power: 6,
    ability: null,
    img: "vigo",
    faction: "nilfgaardian",
    type: 1
  },
  "assire_var_anahid": {
    name: "Assire var Anahid",
    power: 6,
    ability: null,
    img: "assire_var_anahid",
    faction: "nilfgaardian",
    type: 1
  },
  "shilard_fitz_oesterlen": {
    name: "Shilard Fitz-Oesterlen",
    power: 7,
    ability: "spy",
    img: "shilard",
    faction: "nilfgaardian",
    type: 0
  },
  "stefan_skellen": {
    name: "Stefan Skellen",
    power: 9,
    ability: "spy",
    img: "stefan_skellen",
    faction: "nilfgaardian",
    type: 0
  },
  "heavy_zerrikanian_fire_scorpion": {
    name: "Heavy Zerrikanian Fire Scorpion",
    power: 10,
    ability: null,
    img: "heavy_fire_scorpion",
    faction: "nilfgaardian",
    type: 2
  },
  "black_infantry_archer": {
    name: "Black Infantry Archer",
    power: 10,
    ability: null,
    img: "black_infantry_archer1",
    faction: "nilfgaardian",
    type: 1
  }


}
