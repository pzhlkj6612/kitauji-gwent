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
    male: true,
    type: 2
  },
  "tsukamoto_shuichi": {
    name: "冢本秀一",
    power: 6,
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
    grade: 3,
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
    grade: 3,
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
    grade: 3,
    type: 1
  },
  "gotou_takuya": {
    name: "后藤卓也",
    power: 6,
    ability: "tight_bond",
    bondType: "tuba",
    img: "gotou_takuya",
    faction: "kitauji",
    grade: 3,
    male: true,
    type: 1
  },
  "tubakun": {
    name: "大号君",
    power: -1,
    ability: "decoy",
    img: "tubakun",
    faction: "neutral",
    type: 4
  },
  "taibu": {
    name: "退部申请书",
    power: -1,
    ability: "scorch_card",
    img: "taibu",
    faction: "neutral",
    type: 4
  },
  "hashimoto": {
    name: "桥本老师",
    power: -1,
    ability: "commanders_horn_card",
    img: "hashimoto",
    faction: "neutral",
    type: 4
  },
  "niiyama": {
    name: "新山老师",
    power: -1,
    ability: "commanders_horn_card",
    img: "niiyama",
    faction: "neutral",
    type: 4
  },
  "daisangakushou": {
    name: "第三乐章",
    power: -1,
    ability: "weather_fog",
    img: "daisangakushou",
    faction: "neutral",
    type: 5
  },
  "sunfes": {
    name: "Sunrise Festival",
    power: -1,
    ability: "weather_frost",
    img: "sunfes",
    faction: "neutral",
    type: 5
  },
  "wasure": {
    name: "忘带鼓槌",
    power: -1,
    ability: "weather_rain",
    img: "wasure",
    faction: "neutral",
    type: 5
  },
  "daikichiyama": {
    name: "大吉山",
    power: -1,
    ability: "weather_clear",
    img: "daikichiyama",
    faction: "neutral",
    type: 5
  },
  "pool": {
    name: "泳池",
    power: -1,
    ability: "weather_clear",
    img: "pool",
    faction: "neutral",
    type: 5
  },
  "kabe_tomoe": {
    name: "加部友惠",
    power: 2,
    ability: "commanders_horn",
    img: "kabe_tomoe",
    faction: "kitauji",
    grade: 3,
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
    power: 10,
    ability: ["hero", "attack"],
    attackPower: 4,
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
    power: 7,
    ability: ["hero", "morale_boost"],
    img: "yoshikawa_yuko",
    faction: "kitauji",
    grade: 3,
    type: 1
  },
  "nakagawa_natsuki": {
    name: "中川夏纪",
    power: 5,
    ability: null,
    img: "nakagawa_natsuki",
    faction: "kitauji",
    grade: 3,
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
    power: 9,
    ability: ["hero", "medic"],
    img: "oumae_kumiko",
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
    male: true,
    type: 2
  },
  "maeda_sosuke": {
    name: "前田飒介",
    power: 3,
    ability: "tight_bond",
    bondType: "perc2",
    img: "maeda_sosuke",
    faction: "kitauji",
    male: true,
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
    male: true,
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
    grade: 3,
    type: 0
  },
  "ono_miyoko": {
    name: "大野美代子",
    power: 7,
    ability: null,
    img: "ono_miyoko",
    faction: "kitauji",
    grade: 3,
    type: 2
  },
  "inoue_shirabe": {
    name: "井上调",
    power: 7,
    ability: null,
    img: "inoue_shirabe",
    faction: "kitauji",
    grade: 3,
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
  "morimoto_michio": {
    name: "森本美千代",
    power: 6,
    ability: null,
    img: "morimoto_michio",
    faction: "kitauji",
    type: 1
  },
  "shima_rie": {
    name: "岛理惠",
    power: 7,
    ability: "tunning",
    img: "shima_rie",
    faction: "kumiko1",
    grade: "3",
    type: 0
  },
  "taki_noboru": {
    name: "泷升",
    power: -1,
    ability: "foltest_leader4",
    img: "taki_noboru",
    faction: "neutral",
    type: 3
  },
  "taki_chihiro": {
    name: "泷千寻",
    power: -1,
    ability: "foltest_leader4",
    img: "taki_chihiro",
    faction: "neutral",
    type: 3
  },

  // kumiko I(S1)
  "souga_yoriko": {
    name: "杂贺赖子",
    power: 7,
    ability: null,
    img: "souga_yoriko",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "himegami_kotoko": {
    name: "姬神琴子",
    power: 6,
    ability: null,
    img: "himegami_kotoko",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "kitamura_raina": {
    name: "喜多村来南",
    power: 6,
    ability: "tight_bond",
    bondType: "kita_oka",
    img: "kitamura_raina",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "oka_mikino": {
    name: "冈美贵乃",
    power: 6,
    ability: "tight_bond",
    bondType: "kita_oka",
    img: "oka_mikino",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "kase_maina": {
    name: "加濑まいな",
    power: 5,
    ability: "tight_bond",
    bondType: "no_eye",
    img: "kase_maina",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "torizuka_hirone": {
    name: "鸟冢弘音",
    power: 7,
    ability: "tunning",
    img: "torizuka_hirone",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "suzuka_sakiko": {
    name: "铃鹿咲子",
    power: 4,
    ability: "spy",
    img: "suzuka_sakiko",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "okamoto_raimu": {
    name: "冈本来梦",
    power: 6,
    ability: "lips",
    img: "okamoto_raimu",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "miya_kiriko": {
    name: "宫キリコ",
    power: 4,
    ability: "muster",
    musterType: "idol",
    img: "miya_kiriko",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "wataru_horie": {
    name: "桥弘江",
    power: 4,
    ability: "muster",
    musterType: "idol",
    img: "wataru_horie",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "saitou_aoi": {
    name: "斋藤葵",
    power: 5,
    ability: "taibu",
    img: "saitou_aoi",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "watanabe_tsune": {
    name: "渡边つね",
    power: 5,
    ability: null,
    img: "watanabe_tsune",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "kahashi_hiro": {
    name: "加桥比吕",
    power: 5,
    ability: "attack",
    attackPower: 2,
    img: "kahashi_hiro",
    faction: "kumiko1",
    grade: 3,
    type: 1
  },
  "sawada_juri": {
    name: "泽田树理",
    power: 6,
    ability: "spy",
    img: "sawada_juri",
    faction: "kumiko1",
    grade: 3,
    type: 1
  },
  "taura_mei": {
    name: "田浦爱衣",
    power: 4,
    ability: "tight_bond",
    bondType: "tronbone_cp",
    img: "taura_mei",
    faction: "kumiko1",
    grade: 3,
    type: 1
  },
  "noguchi_hideri": {
    name: "野口ヒデリ",
    power: 4,
    ability: "tight_bond",
    bondType: "tronbone_cp",
    img: "noguchi_hideri",
    faction: "kumiko1",
    grade: 3,
    male: true,
    type: 1
  },
  "tanabe_narai": {
    name: "田边名来",
    power: 7,
    ability: "morale_boost",
    img: "tanabe_narai",
    faction: "kumiko1",
    grade: 3,
    male: true,
    type: 2
  },
  "kayama_saki": {
    name: "加山沙希",
    power: 6,
    ability: null,
    img: "kayama_saki",
    faction: "kumiko1",
    grade: 3,
    type: 2
  },
  "tanaka_asuka": {
    name: "田中明日香",
    power: 10,
    ability: ["hero", "morale_boost"],
    img: "tanaka_asuka",
    faction: "kumiko1",
    grade: 3,
    type: 1
  },
  "ogasawara_haruka": {
    name: "小笠原晴香",
    power: 7,
    ability: ["hero", "morale_boost"],
    img: "ogasawara_haruka",
    faction: "kumiko1",
    grade: 3,
    type: 0
  },
  "nakaseko_kaori": {
    name: "中世古香织",
    power: 7,
    ability: ["hero", "medic"],
    img: "nakaseko_kaori",
    faction: "kumiko1",
    grade: 3,
    type: 1
  },
  "hitomi_lala_1": {
    name: '瞳拉拉',
    power: 2,
    ability: "spy",
    img: "hitomi_lala",
    faction: "kumiko1",
    type: 1
  },
  "oda_meiko_1": {
    name: "小田芽衣子",
    power: 3,
    ability: "tight_bond",
    bondType: "flute_k1",
    img: "oda_meiko",
    faction: "kumiko1",
    type: 0
  },
  "takahashi_sari_1": {
    name: "高桥沙里",
    power: 3,
    ability: "tight_bond",
    bondType: "flute_k1",
    img: "takahashi_sari",
    faction: "kumiko1",
    type: 0
  },
  "katou_hazuki_1": {
    name: "加藤叶月",
    power: 2,
    ability: "commanders_horn",
    img: "katou_hazuki",
    faction: "kumiko1",
    type: 1
  },
  "oumae_kumiko_1": {
    name: "黄前久美子",
    power: 5,
    ability: null,
    img: "oumae_kumiko",
    faction: "kumiko1",
    type: 1
  },
  "inoue_junna_1": {
    name: "井上顺菜",
    power: 4,
    ability: "tight_bond",
    bondType: "perc",
    img: "inoue_junna",
    faction: "kumiko1",
    type: 2
  },
  "sakai_masako_1": {
    name: "堺万纱子",
    power: 4,
    ability: "tight_bond",
    bondType: "perc",
    img: "sakai_masako",
    faction: "kumiko1",
    type: 2
  },
  "takigawa_chikao_1": {
    name: "泷川近夫",
    power: 4,
    ability: "muster",
    musterType: "boys",
    img: "takigawa_chikao",
    faction: "kumiko1",
    male: true,
    type: 0
  },
  "takahisa_chieri_1": {
    name: "高久智惠理",
    power: 5,
    ability: "tight_bond",
    bondType: "no_eye",
    img: "takahisa_chieri",
    faction: "kumiko1",
    type: 0
  },
  "tsukamoto_shuichi_1": {
    name: "冢本秀一",
    power: 4,
    ability: "muster",
    musterType: "boys",
    img: "tsukamoto_shuichi",
    faction: "kumiko1",
    male: true,
    type: 1
  },
  "maki_chikai_1": {
    name: "牧誓",
    power: 3,
    ability: null,
    img: "maki_chikai",
    faction: "kumiko1",
    type: 0
  },
  "morimoto_michio_1": {
    name: "森本美千代",
    power: 4,
    ability: null,
    img: "morimoto_michio",
    faction: "kumiko1",
    type: 1
  },
  "kamaya_tsubame_1": {
    name: "釜屋燕",
    power: 2,
    ability: null,
    img: "kamaya_tsubame",
    faction: "kumiko1",
    type: 2
  },
  "kousaka_reina_1": {
    name: "高坂丽奈",
    power: 10,
    ability: "hero",
    img: "kousaka_reina",
    faction: "kumiko1",
    type: 1
  },
  "kawashima_sapphire_1": {
    name: "川岛绿辉",
    power: 10,
    ability: "hero",
    img: "kawashima_sapphire",
    faction: "kumiko1",
    type: 2
  },
  "nagase_riko_1": {
    name: "长濑梨子",
    power: 5,
    ability: "tight_bond",
    bondType: "tuba",
    img: "nagase_riko",
    faction: "kumiko1",
    type: 1
  },
  "gotou_takuya_1": {
    name: "后藤卓也",
    power: 5,
    ability: "tight_bond",
    bondType: "tuba",
    img: "gotou_takuya",
    faction: "kumiko1",
    male: true,
    type: 1
  },
  "yoshikawa_yuko_1": {
    name: "吉川优子",
    power: 4,
    ability: "guard",
    img: "yoshikawa_yuko",
    faction: "kumiko1",
    type: 1
  },
  "nakagawa_natsuki_1": {
    name: "中川夏纪",
    power: 2,
    ability: "monaka",
    img: "nakagawa_natsuki",
    faction: "kumiko1",
    type: 1
  },
  "kabe_tomoe_1": {
    name: "加部友惠",
    power: 2,
    ability: "monaka",
    img: "kabe_tomoe",
    faction: "kumiko1",
    type: 1
  },
  "morita_shinobu_1": {
    name: "森田忍",
    power: 2,
    ability: "monaka",
    img: "morita_shinobu",
    faction: "kumiko1",
    type: 0
  },
  "shima_rie_1": {
    name: "岛理惠",
    power: 5,
    ability: null,
    img: "shima_rie",
    faction: "kumiko1",
    type: 0
  },
  "ono_miyoko_1": {
    name: "大野美代子",
    power: 5,
    ability: null,
    img: "ono_miyoko",
    faction: "kumiko1",
    type: 2
  },
  "hirao_sumiko_1": {
    name: "平尾澄子",
    power: 4,
    ability: "muster",
    musterType: "idol",
    img: "hirao_sumiko",
    faction: "kumiko1",
    type: 0
  },
  "kishibe_miru_1": {
    name: "岸部海松",
    power: 4,
    ability: null,
    img: "kishibe_miru",
    faction: "kumiko1",
    type: 1
  },
  "yoroizuka_mizore_1": {
    name: "铠冢霙",
    power: 8,
    ability: null,
    img: "yoroizuka_mizore",
    faction: "kumiko1",
    type: 0
  },

  // kumiko I(S2)
  "souga_yoriko_2": {
    name: "杂贺赖子",
    power: 7,
    ability: null,
    img: "souga_yoriko",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "himegami_kotoko_2": {
    name: "姬神琴子",
    power: 6,
    ability: null,
    img: "himegami_kotoko",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "kitamura_raina_2": {
    name: "喜多村来南",
    power: 6,
    ability: "tight_bond",
    bondType: "kita_oka",
    img: "kitamura_raina",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "oka_mikino_2": {
    name: "冈美贵乃",
    power: 6,
    ability: "tight_bond",
    bondType: "kita_oka",
    img: "oka_mikino",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "kase_maina_2": {
    name: "加濑まいな",
    power: 5,
    ability: "tight_bond",
    bondType: "no_eye",
    img: "kase_maina",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "torizuka_hirone_2": {
    name: "鸟冢弘音",
    power: 7,
    ability: "tunning",
    img: "torizuka_hirone",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "suzuka_sakiko_2": {
    name: "铃鹿咲子",
    power: 4,
    ability: "spy",
    img: "suzuka_sakiko",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "okamoto_raimu_2": {
    name: "冈本来梦",
    power: 7,
    ability: null,
    img: "okamoto_raimu",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "miya_kiriko_2": {
    name: "宫キリコ",
    power: 4,
    ability: "muster",
    musterType: "idol",
    img: "miya_kiriko",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "wataru_horie_2": {
    name: "桥弘江",
    power: 4,
    ability: "muster",
    musterType: "idol",
    img: "wataru_horie",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "watanabe_tsune_2": {
    name: "渡边つね",
    power: 5,
    ability: null,
    img: "watanabe_tsune",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "kahashi_hiro_2": {
    name: "加桥比吕",
    power: 5,
    ability: null,
    img: "kahashi_hiro",
    faction: "kumiko1S2",
    grade: 3,
    type: 1
  },
  "sawada_juri_2": {
    name: "泽田树理",
    power: 6,
    ability: "spy",
    img: "sawada_juri",
    faction: "kumiko1S2",
    grade: 3,
    type: 1
  },
  "taura_mei_2": {
    name: "田浦爱衣",
    power: 4,
    ability: "tight_bond",
    bondType: "tronbone_cp",
    img: "taura_mei",
    faction: "kumiko1S2",
    grade: 3,
    type: 1
  },
  "noguchi_hideri_2": {
    name: "野口ヒデリ",
    power: 4,
    ability: "tight_bond",
    bondType: "tronbone_cp",
    img: "noguchi_hideri",
    faction: "kumiko1S2",
    grade: 3,
    male: true,
    type: 1
  },
  "tanabe_narai_2": {
    name: "田边名来",
    power: 7,
    ability: "morale_boost",
    img: "tanabe_narai",
    faction: "kumiko1S2",
    grade: 3,
    male: true,
    type: 2
  },
  "kayama_saki_2": {
    name: "加山沙希",
    power: 6,
    ability: null,
    img: "kayama_saki",
    faction: "kumiko1S2",
    grade: 3,
    type: 2
  },
  "tanaka_asuka_2": {
    name: "田中明日香",
    power: 10,
    ability: ["hero", "morale_boost"],
    img: "tanaka_asuka",
    faction: "kumiko1S2",
    grade: 3,
    type: 1
  },
  "ogasawara_haruka_2": {
    name: "小笠原晴香",
    power: 7,
    ability: ["hero", "morale_boost"],
    img: "ogasawara_haruka",
    faction: "kumiko1S2",
    grade: 3,
    type: 0
  },
  "nakaseko_kaori_2": {
    name: "中世古香织",
    power: 7,
    ability: ["hero", "medic"],
    img: "nakaseko_kaori",
    faction: "kumiko1S2",
    grade: 3,
    type: 1
  },
  "hitomi_lala_2": {
    name: '瞳拉拉',
    power: 2,
    ability: "spy",
    img: "hitomi_lala",
    faction: "kumiko1S2",
    type: 1
  },
  "oda_meiko_2": {
    name: "小田芽衣子",
    power: 3,
    ability: "tight_bond",
    bondType: "flute_k1",
    img: "oda_meiko",
    faction: "kumiko1S2",
    type: 0
  },
  "takahashi_sari_2": {
    name: "高桥沙里",
    power: 3,
    ability: "tight_bond",
    bondType: "flute_k1",
    img: "takahashi_sari",
    faction: "kumiko1S2",
    type: 0
  },
  "katou_hazuki_2": {
    name: "加藤叶月",
    power: 2,
    ability: "commanders_horn",
    img: "katou_hazuki",
    faction: "kumiko1S2",
    type: 1
  },
  "oumae_kumiko_2": {
    name: "黄前久美子",
    power: 7,
    ability: ["hero", "medic"],
    img: "oumae_kumiko",
    faction: "kumiko1S2",
    type: 1
  },
  "inoue_junna_2": {
    name: "井上顺菜",
    power: 4,
    ability: "tight_bond",
    bondType: "perc",
    img: "inoue_junna",
    faction: "kumiko1S2",
    type: 2
  },
  "sakai_masako_2": {
    name: "堺万纱子",
    power: 4,
    ability: "tight_bond",
    bondType: "perc",
    img: "sakai_masako",
    faction: "kumiko1S2",
    type: 2
  },
  "takigawa_chikao_2": {
    name: "泷川近夫",
    power: 4,
    ability: "muster",
    musterType: "boys",
    img: "takigawa_chikao",
    faction: "kumiko1S2",
    male: true,
    type: 0
  },
  "takahisa_chieri_2": {
    name: "高久智惠理",
    power: 5,
    ability: "tight_bond",
    bondType: "no_eye",
    img: "takahisa_chieri",
    faction: "kumiko1S2",
    type: 0
  },
  "tsukamoto_shuichi_2": {
    name: "冢本秀一",
    power: 4,
    ability: "muster",
    musterType: "boys",
    img: "tsukamoto_shuichi",
    faction: "kumiko1S2",
    male: true,
    type: 1
  },
  "maki_chikai_2": {
    name: "牧誓",
    power: 3,
    ability: null,
    img: "maki_chikai",
    faction: "kumiko1S2",
    type: 0
  },
  "morimoto_michio_2": {
    name: "森本美千代",
    power: 4,
    ability: null,
    img: "morimoto_michio",
    faction: "kumiko1S2",
    type: 1
  },
  "kamaya_tsubame_2": {
    name: "釜屋燕",
    power: 2,
    ability: null,
    img: "kamaya_tsubame",
    faction: "kumiko1S2",
    type: 2
  },
  "kousaka_reina_2": {
    name: "高坂丽奈",
    power: 10,
    ability: "hero",
    img: "kousaka_reina",
    faction: "kumiko1S2",
    type: 1
  },
  "kawashima_sapphire_2": {
    name: "川岛绿辉",
    power: 10,
    ability: "hero",
    img: "kawashima_sapphire",
    faction: "kumiko1S2",
    type: 2
  },
  "nagase_riko_2": {
    name: "长濑梨子",
    power: 5,
    ability: "tight_bond",
    bondType: "tuba",
    img: "nagase_riko",
    faction: "kumiko1S2",
    type: 1
  },
  "gotou_takuya_2": {
    name: "后藤卓也",
    power: 5,
    ability: "tight_bond",
    bondType: "tuba",
    img: "gotou_takuya",
    faction: "kumiko1S2",
    male: true,
    type: 1
  },
  "yoshikawa_yuko_2": {
    name: "吉川优子",
    power: 4,
    ability: "tight_bond",
    bondType: "nakayoshi",
    img: "yoshikawa_yuko",
    faction: "kumiko1S2",
    type: 1
  },
  "nakagawa_natsuki_2": {
    name: "中川夏纪",
    power: 4,
    ability: "tight_bond",
    bondType: "nakayoshi",
    img: "nakagawa_natsuki",
    faction: "kumiko1S2",
    type: 1
  },
  "kabe_tomoe_2": {
    name: "加部友惠",
    power: 2,
    ability: null,
    img: "kabe_tomoe",
    faction: "kumiko1S2",
    type: 1
  },
  "shima_rie_2": {
    name: "岛理惠",
    power: 5,
    ability: null,
    img: "shima_rie",
    faction: "kumiko1S2",
    type: 0
  },
  "ono_miyoko_2": {
    name: "大野美代子",
    power: 5,
    ability: null,
    img: "ono_miyoko",
    faction: "kumiko1S2",
    type: 2
  },
  "hirao_sumiko_2": {
    name: "平尾澄子",
    power: 4,
    ability: "muster",
    musterType: "idol",
    img: "hirao_sumiko",
    faction: "kumiko1S2",
    type: 0
  },
  "kishibe_miru_2": {
    name: "岸部海松",
    power: 4,
    ability: null,
    img: "kishibe_miru",
    faction: "kumiko1S2",
    type: 1
  },
  "yoroizuka_mizore_2": {
    name: "铠冢霙",
    power: 10,
    ability: null,
    img: "yoroizuka_mizore",
    faction: "kumiko1S2",
    type: 0
  },
}
