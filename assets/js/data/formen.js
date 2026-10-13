/* ============================================================
   词形变化数据 · Formenlehre（2026-10-13）
   ① FORMEN_VERBEN —— 动词变位（现在时六人称 / 过去时 / 第二分词 / 助动词 / 类型）
   ② FORMEN_ADJ    —— 形容词比较级与最高级
   ③ FORMEN_DEKL   —— 冠词、人称代词、物主冠词的格变化

   动词 art 字段：
     reg  规则（词干 + e/st/t/en/t/en）
     t    词干以 -t/-d 结尾（插 -e-：arbeitest / arbeitet）
     s    词干以 -s/-ß/-z 结尾（du/er 只加 -t）
     er   词干以 -er/-el 结尾（wir/sie 只加 -n：wandern）
     stark 强变化 / 不规则（六人称显式给出）
   hilf 字段：完成时助动词 hat / ist
   ============================================================ */

/* ---------- ① 动词 ---------- */
const FORMEN_VERBEN = [
  /* —— 基础动词（不规则） —— */
  { de: "sein", zh: "是", art: "stark", hilf: "ist", praet: "war", part: "gewesen", formen: ["bin", "bist", "ist", "sind", "seid", "sind"], note: "最重要的动词，全不规则" },
  { de: "haben", zh: "有", art: "stark", hilf: "hat", praet: "hatte", part: "gehabt", formen: ["habe", "hast", "hat", "haben", "habt", "haben"], note: "du/er 去 -b-" },
  { de: "werden", zh: "成为；将要", art: "stark", hilf: "ist", praet: "wurde", part: "geworden", formen: ["werde", "wirst", "wird", "werden", "werdet", "werden"], note: "du/er 换音 e→i" },
  /* —— 情态动词 —— */
  { de: "können", zh: "能；会", art: "stark", hilf: "hat", praet: "konnte", part: "gekonnt", formen: ["kann", "kannst", "kann", "können", "könnt", "können"], note: "ich/er 无词尾" },
  { de: "müssen", zh: "必须", art: "stark", hilf: "hat", praet: "musste", part: "gemusst", formen: ["muss", "musst", "muss", "müssen", "müsst", "müssen"], note: "ich/er 无词尾" },
  { de: "wollen", zh: "想要", art: "stark", hilf: "hat", praet: "wollte", part: "gewollt", formen: ["will", "willst", "will", "wollen", "wollt", "wollen"], note: "ich/er 无词尾" },
  { de: "sollen", zh: "应该", art: "stark", hilf: "hat", praet: "sollte", part: "gesollt", formen: ["soll", "sollst", "soll", "sollen", "sollt", "sollen"], note: "ich/er 无词尾" },
  { de: "dürfen", zh: "可以；允许", art: "stark", hilf: "hat", praet: "durfte", part: "gedurft", formen: ["darf", "darfst", "darf", "dürfen", "dürft", "dürfen"], note: "ich/er 无词尾" },
  { de: "mögen", zh: "喜欢", art: "stark", hilf: "hat", praet: "mochte", part: "gemocht", formen: ["mag", "magst", "mag", "mögen", "mögt", "mögen"], note: "ich/er 无词尾" },
  { de: "möchten", zh: "想要（客气）", art: "stark", hilf: "hat", praet: "—", part: "—", formen: ["möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"], note: "mögen 的虚拟式 II，日常最常用" },
  /* —— 强变化动词 —— */
  { de: "kommen", zh: "来；来自", art: "stark", hilf: "ist", praet: "kam", part: "gekommen", formen: ["komme", "kommst", "kommt", "kommen", "kommt", "kommen"] },
  { de: "essen", zh: "吃", art: "stark", hilf: "hat", praet: "aß", part: "gegessen", formen: ["esse", "isst", "isst", "essen", "esst", "essen"], note: "du/er 换音 e→i" },
  { de: "trinken", zh: "喝", art: "stark", hilf: "hat", praet: "trank", part: "getrunken", formen: ["trinke", "trinkst", "trinkt", "trinken", "trinkt", "trinken"], note: "现在时规则，过去时换元音" },
  { de: "nehmen", zh: "拿；点（餐）", art: "stark", hilf: "hat", praet: "nahm", part: "genommen", formen: ["nehme", "nimmst", "nimmt", "nehmen", "nehmt", "nehmen"], note: "du/er 换音 e→i" },
  { de: "lesen", zh: "阅读", art: "stark", hilf: "hat", praet: "las", part: "gelesen", formen: ["lese", "liest", "liest", "lesen", "lest", "lesen"], note: "du/er 换音 e→ie" },
  { de: "schwimmen", zh: "游泳", art: "stark", hilf: "ist", praet: "schwamm", part: "geschwommen", formen: ["schwimme", "schwimmst", "schwimmt", "schwimmen", "schwimmt", "schwimmen"] },
  { de: "singen", zh: "唱歌", art: "stark", hilf: "hat", praet: "sang", part: "gesungen", formen: ["singe", "singst", "singt", "singen", "singt", "singen"] },
  { de: "schlafen", zh: "睡觉", art: "stark", hilf: "hat", praet: "schlief", part: "geschlafen", formen: ["schlafe", "schläfst", "schläft", "schlafen", "schlaft", "schlafen"], note: "du/er 变音 a→ä" },
  { de: "tragen", zh: "穿；戴", art: "stark", hilf: "hat", praet: "trug", part: "getragen", formen: ["trage", "trägst", "trägt", "tragen", "tragt", "tragen"], note: "du/er 变音 a→ä" },
  { de: "fahren", zh: "乘车；驾驶", art: "stark", hilf: "ist", praet: "fuhr", part: "gefahren", formen: ["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"], note: "du/er 变音 a→ä" },
  { de: "gehen", zh: "走；去", art: "stark", hilf: "ist", praet: "ging", part: "gegangen", formen: ["gehe", "gehst", "geht", "gehen", "geht", "gehen"] },
  { de: "stehen", zh: "站；位于", art: "stark", hilf: "hat", praet: "stand", part: "gestanden", formen: ["stehe", "stehst", "steht", "stehen", "steht", "stehen"] },
  { de: "bleiben", zh: "停留；留下", art: "stark", hilf: "ist", praet: "blieb", part: "geblieben", formen: ["bleibe", "bleibst", "bleibt", "bleiben", "bleibt", "bleiben"] },
  { de: "sehen", zh: "看；看见", art: "stark", hilf: "hat", praet: "sah", part: "gesehen", formen: ["sehe", "siehst", "sieht", "sehen", "seht", "sehen"], note: "du/er 换音 e→ie" },
  { de: "sprechen", zh: "说；讲", art: "stark", hilf: "hat", praet: "sprach", part: "gesprochen", formen: ["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"], note: "du/er 换音 e→i" },
  { de: "helfen", zh: "帮助", art: "stark", hilf: "hat", praet: "half", part: "geholfen", formen: ["helfe", "hilfst", "hilft", "helfen", "helft", "helfen"], note: "du/er 换音 e→i" },
  { de: "treffen", zh: "遇见；会面", art: "stark", hilf: "hat", praet: "traf", part: "getroffen", formen: ["treffe", "triffst", "trifft", "treffen", "trefft", "treffen"], note: "du/er 换音 e→i" },
  { de: "heißen", zh: "叫做", art: "stark", hilf: "hat", praet: "hieß", part: "geheißen", formen: ["heiße", "heißt", "heißt", "heißen", "heißt", "heißen"], note: "du/er/wir/sie 同形 heißt" },
  { de: "finden", zh: "找到；认为", art: "stark", hilf: "hat", praet: "fand", part: "gefunden", formen: ["finde", "findest", "findet", "finden", "findet", "finden"] },
  { de: "geben", zh: "给", art: "stark", hilf: "hat", praet: "gab", part: "gegeben", formen: ["gebe", "gibst", "gibt", "geben", "gebt", "geben"], note: "du/er 换音 e→i" },
  { de: "schreiben", zh: "写", art: "stark", hilf: "hat", praet: "schrieb", part: "geschrieben", formen: ["schreibe", "schreibst", "schreibt", "schreiben", "schreibt", "schreiben"] },
  { de: "ziehen", zh: "拉；拖", art: "stark", hilf: "hat", praet: "zog", part: "gezogen", formen: ["ziehe", "ziehst", "zieht", "ziehen", "zieht", "ziehen"] },
  { de: "entscheiden", zh: "决定", art: "stark", hilf: "hat", praet: "entschied", part: "entschieden", formen: ["entscheide", "entscheidest", "entscheidet", "entscheiden", "entscheidet", "entscheiden"], note: "不可分前缀 ent-（无 ge-）" },
  { de: "beginnen", zh: "开始", art: "stark", hilf: "hat", praet: "begann", part: "begonnen", formen: ["beginne", "beginnst", "beginnt", "beginnen", "beginnt", "beginnen"], note: "不可分前缀 be-" },
  { de: "lassen", zh: "让；留下", art: "stark", hilf: "hat", praet: "ließ", part: "gelassen", formen: ["lasse", "lässt", "lässt", "lassen", "lasst", "lassen"], note: "du/er 变音 a→ä" },
  { de: "laufen", zh: "跑；走", art: "stark", hilf: "ist", praet: "lief", part: "gelaufen", formen: ["laufe", "läufst", "läuft", "laufen", "lauft", "laufen"], note: "du/er 变音 au→äu" },
  { de: "fliegen", zh: "飞", art: "stark", hilf: "ist", praet: "flog", part: "geflogen", formen: ["fliege", "fliegst", "fliegt", "fliegen", "fliegt", "fliegen"] },
  { de: "steigen", zh: "上升；登", art: "stark", hilf: "ist", praet: "stieg", part: "gestiegen", formen: ["steige", "steigst", "steigt", "steigen", "steigt", "steigen"] },
  { de: "scheinen", zh: "照耀；似乎", art: "stark", hilf: "hat", praet: "schien", part: "geschienen", formen: ["scheine", "scheinst", "scheint", "scheinen", "scheint", "scheinen"] },
  { de: "waschen", zh: "洗", art: "stark", hilf: "hat", praet: "wusch", part: "gewaschen", formen: ["wasche", "wäschst", "wäscht", "waschen", "wascht", "waschen"], note: "du/er 变音 a→ä" },
  /* —— 规则动词 —— */
  { de: "wohnen", zh: "居住", art: "reg", stamm: "wohn", hilf: "hat", praet: "wohnte", part: "gewohnt" },
  { de: "lernen", zh: "学习", art: "reg", stamm: "lern", hilf: "hat", praet: "lernte", part: "gelernt" },
  { de: "arbeiten", zh: "工作", art: "t", stamm: "arbeit", hilf: "hat", praet: "arbeitete", part: "gearbeitet", note: "词干以 -t 结尾 → 插 -e-" },
  { de: "kosten", zh: "价格为", art: "t", stamm: "kost", hilf: "hat", praet: "kostete", part: "gekostet", note: "词干以 -t 结尾" },
  { de: "beobachten", zh: "观察", art: "t", stamm: "beobacht", hilf: "hat", praet: "beobachtete", part: "beobachtet", note: "不可分前缀 be-" },
  { de: "schalten", zh: "切换；打开", art: "t", stamm: "schalt", hilf: "hat", praet: "schaltete", part: "geschaltet" },
  { de: "bereiten", zh: "准备", art: "t", stamm: "bereit", hilf: "hat", praet: "bereitete", part: "bereitet", note: "不可分前缀 be-" },
  { de: "tanzen", zh: "跳舞", art: "s", stamm: "tanz", hilf: "hat", praet: "tanzte", part: "getanzt", note: "词干以 -z 结尾 → du/er 只加 -t" },
  { de: "reisen", zh: "旅行", art: "s", stamm: "reis", hilf: "ist", praet: "reiste", part: "gereist", note: "词干以 -s 结尾" },
  { de: "passen", zh: "合身；合适", art: "s", stamm: "pass", hilf: "hat", praet: "passte", part: "gepasst", note: "词干以 -s 结尾" },
  { de: "speisen", zh: "用餐", art: "s", stamm: "speis", hilf: "hat", praet: "speiste", part: "gespeist" },
  { de: "wandern", zh: "徒步", art: "er", stamm: "wander", hilf: "ist", praet: "wanderte", part: "gewandert", note: "词干以 -er 结尾 → wir/sie 只加 -n" },
  { de: "studieren", zh: "攻读；学习", art: "reg", stamm: "studier", hilf: "hat", praet: "studierte", part: "studiert", note: "-ieren 动词不带 ge-" },
  { de: "buchstabieren", zh: "拼读", art: "reg", stamm: "buchstabier", hilf: "hat", praet: "buchstabierte", part: "buchstabiert", note: "-ieren 动词不带 ge-" },
  { de: "fotografieren", zh: "拍照", art: "reg", stamm: "fotografier", hilf: "hat", praet: "fotografierte", part: "fotografiert", note: "-ieren 动词不带 ge-" },
  { de: "telefonieren", zh: "打电话", art: "reg", stamm: "telefonier", hilf: "hat", praet: "telefonierte", part: "telefoniert", note: "-ieren 动词不带 ge-" },
  { de: "präsentieren", zh: "展示；汇报", art: "reg", stamm: "präsentier", hilf: "hat", praet: "präsentierte", part: "präsentiert", note: "-ieren 动词不带 ge-" },
  { de: "funktionieren", zh: "运转", art: "reg", stamm: "funktionier", hilf: "hat", praet: "funktionierte", part: "funktioniert", note: "-ieren 动词不带 ge-" },
  { de: "kontrollieren", zh: "检查", art: "reg", stamm: "kontrollier", hilf: "hat", praet: "kontrollierte", part: "kontrolliert", note: "-ieren 动词不带 ge-" },
  { de: "untersuchen", zh: "检测；研究", art: "reg", stamm: "untersuch", hilf: "hat", praet: "untersuchte", part: "untersucht", note: "不可分前缀 un-（无 ge-）" },
  { de: "entdecken", zh: "发现", art: "reg", stamm: "entdeck", hilf: "hat", praet: "entdeckte", part: "entdeckt", note: "不可分前缀 ent-（无 ge-）" },
  { de: "wiederholen", zh: "重复", art: "reg", stamm: "wiederhol", hilf: "hat", praet: "wiederholte", part: "wiederholt", note: "不可分前缀 wieder-（此处不拆分）" },
  { de: "erzählen", zh: "讲述", art: "reg", stamm: "erzähl", hilf: "hat", praet: "erzählte", part: "erzählt", note: "不可分前缀 er-（无 ge-）" },
  { de: "reinigen", zh: "清洁", art: "reg", stamm: "reinig", hilf: "hat", praet: "reinigte", part: "gereinigt" },
  { de: "kochen", zh: "做饭；烹饪", art: "reg", stamm: "koch", hilf: "hat", praet: "kochte", part: "gekocht" },
  { de: "blühen", zh: "开花", art: "reg", stamm: "blüh", hilf: "hat", praet: "blühte", part: "geblüht" },
  { de: "suchen", zh: "寻找", art: "reg", stamm: "such", hilf: "hat", praet: "suchte", part: "gesucht" },
  { de: "brauchen", zh: "需要", art: "reg", stamm: "brauch", hilf: "hat", praet: "brauchte", part: "gebraucht" },
  { de: "frühstücken", zh: "吃早饭", art: "reg", stamm: "frühstück", hilf: "hat", praet: "frühstückte", part: "gefrühstückt" },
  { de: "kaufen", zh: "买", art: "reg", stamm: "kauf", hilf: "hat", praet: "kaufte", part: "gekauft" },
  { de: "räumen", zh: "整理；搬", art: "reg", stamm: "räum", hilf: "hat", praet: "räumte", part: "geräumt" },
  { de: "regnen", zh: "下雨", art: "reg", stamm: "regn", hilf: "hat", praet: "regnete", part: "geregnet", note: "多用于无人称 es regnet" },
  { de: "schneien", zh: "下雪", art: "reg", stamm: "schnei", hilf: "hat", praet: "schneite", part: "geschneit", note: "多用于无人称 es schneit" },
  { de: "machen", zh: "做；干", art: "reg", stamm: "mach", hilf: "hat", praet: "machte", part: "gemacht" },
  { de: "spielen", zh: "玩；演奏", art: "reg", stamm: "spiel", hilf: "hat", praet: "spielte", part: "gespielt" },
  { de: "hören", zh: "听", art: "reg", stamm: "hör", hilf: "hat", praet: "hörte", part: "gehört" },
  { de: "fragen", zh: "提问", art: "reg", stamm: "frag", hilf: "hat", praet: "fragte", part: "gefragt" },
  { de: "bauen", zh: "建造", art: "reg", stamm: "bau", hilf: "hat", praet: "baute", part: "gebaut" },
  { de: "zahlen", zh: "付款", art: "reg", stamm: "zahl", hilf: "hat", praet: "zahlte", part: "gezahlt" },
  { de: "joggen", zh: "慢跑", art: "reg", stamm: "jogg", hilf: "hat", praet: "joggte", part: "gejoggt" },
  { de: "spazieren", zh: "散步", art: "reg", stamm: "spazier", hilf: "ist", praet: "spazierte", part: "spaziert", note: "-ieren 动词不带 ge-" },
  { de: "notieren", zh: "记录", art: "reg", stamm: "notier", hilf: "hat", praet: "notierte", part: "notiert", note: "-ieren 动词不带 ge-" },
  { de: "passieren", zh: "发生", art: "reg", stamm: "passier", hilf: "ist", praet: "passierte", part: "passiert", note: "-ieren 动词不带 ge-" },
  { de: "analysieren", zh: "分析", art: "reg", stamm: "analysier", hilf: "hat", praet: "analysierte", part: "analysiert", note: "-ieren 动词不带 ge-" },
  { de: "benutzen", zh: "使用", art: "s", stamm: "benutz", hilf: "hat", praet: "benutzte", part: "benutzt", note: "词干以 -z 结尾 → du/er 只加 -t" },
  { de: "verpassen", zh: "错过", art: "s", stamm: "verpass", hilf: "hat", praet: "verpasste", part: "verpasst", note: "不可分前缀 ver-" },
  { de: "baden", zh: "洗澡；游泳", art: "t", stamm: "bad", hilf: "hat", praet: "badete", part: "gebadet", note: "词干以 -d 结尾 → 插 -e-" },
  { de: "bedeuten", zh: "意味着", art: "t", stamm: "bedeut", hilf: "hat", praet: "bedeutete", part: "bedeutet", note: "不可分前缀 be-" },
  { de: "enden", zh: "结束", art: "t", stamm: "end", hilf: "hat", praet: "endete", part: "geendet", note: "词干以 -d 结尾" },
  { de: "bestellen", zh: "预订；点（菜）", art: "reg", stamm: "bestell", hilf: "hat", praet: "bestellte", part: "bestellt", note: "不可分前缀 be-" },
  { de: "gehören", zh: "属于", art: "reg", stamm: "gehör", hilf: "hat", praet: "gehörte", part: "gehört", note: "不可分前缀 ge-（第二分词不另加 ge-）" },
  { de: "sammeln", zh: "收集", art: "er", stamm: "sammel", hilf: "hat", praet: "sammelte", part: "gesammelt", note: "词干以 -el 结尾 → wir/sie 只加 -n" },
  { de: "dauern", zh: "持续", art: "er", stamm: "dauer", hilf: "hat", praet: "dauerte", part: "gedauert", note: "词干以 -er 结尾 → wir/sie 只加 -n" },
  { de: "gruseln", zh: "感到害怕", art: "er", stamm: "grusel", hilf: "hat", praet: "gruselte", part: "gegruselt", note: "词干以 -el 结尾" },
  /* —— 可分动词（前缀甩句尾） —— */
  { de: "fernsehen", zh: "看电视", art: "stark", trenn: "fern", hilf: "hat", praet: "sah fern", part: "ferngesehen", formen: ["sehe fern", "siehst fern", "sieht fern", "sehen fern", "seht fern", "sehen fern"], note: "可分 + 强变化" },
  { de: "aufstehen", zh: "起床", art: "stark", trenn: "auf", hilf: "ist", praet: "stand auf", part: "aufgestanden", formen: ["stehe auf", "stehst auf", "steht auf", "stehen auf", "steht auf", "stehen auf"], note: "可分 + 强变化" },
  { de: "anziehen", zh: "穿上", art: "stark", trenn: "an", hilf: "hat", praet: "zog an", part: "angezogen", formen: ["ziehe an", "ziehst an", "zieht an", "ziehen an", "zieht an", "ziehen an"], note: "可分 + 强变化" },
  { de: "aufschreiben", zh: "记录；写下", art: "stark", trenn: "auf", hilf: "hat", praet: "schrieb auf", part: "aufgeschrieben", formen: ["schreibe auf", "schreibst auf", "schreibt auf", "schreiben auf", "schreibt auf", "schreiben auf"], note: "可分 + 强变化" },
  { de: "eintragen", zh: "录入；登记", art: "stark", trenn: "ein", hilf: "hat", praet: "trug ein", part: "eingetragen", formen: ["trage ein", "trägst ein", "trägt ein", "tragen ein", "tragt ein", "tragen ein"], note: "可分 + 变音 + 强变化" },
  { de: "einkaufen", zh: "购物", art: "reg", trenn: "ein", stamm: "kauf", hilf: "hat", praet: "kaufte ein", part: "eingekauft", note: "可分" },
  { de: "aufräumen", zh: "整理", art: "reg", trenn: "auf", stamm: "räum", hilf: "hat", praet: "räumte auf", part: "aufgeräumt", note: "可分" },
  { de: "wegräumen", zh: "收走；归位", art: "reg", trenn: "weg", stamm: "räum", hilf: "hat", praet: "räumte weg", part: "weggeräumt", note: "可分" },
  { de: "einschalten", zh: "打开（设备）", art: "t", trenn: "ein", stamm: "schalt", hilf: "hat", praet: "schaltete ein", part: "eingeschaltet", note: "可分 + 词干以 -t 结尾" },
  { de: "vorbereiten", zh: "准备", art: "t", trenn: "vor", stamm: "bereit", hilf: "hat", praet: "bereitete vor", part: "vorbereitet", note: "可分 + 词干以 -t 结尾" },
  { de: "vorstellen", zh: "介绍；想象", art: "t", trenn: "vor", stamm: "stell", hilf: "hat", praet: "stellte vor", part: "vorgestellt", note: "可分" },
  { de: "anprobieren", zh: "试穿", art: "reg", trenn: "an", stamm: "probier", hilf: "hat", praet: "probierte an", part: "anprobiert", note: "可分 + -ieren" },
  { de: "ausruhen", zh: "休息", art: "reg", trenn: "aus", stamm: "ruh", hilf: "hat", praet: "ruhte aus", part: "ausgeruht", note: "可分" },
  { de: "ansehen", zh: "观看；注视", art: "stark", trenn: "an", hilf: "hat", praet: "sah an", part: "angesehen", formen: ["sehe an", "siehst an", "sieht an", "sehen an", "seht an", "sehen an"], note: "可分 + 强变化" },
  { de: "ausgehen", zh: "外出；约会", art: "stark", trenn: "aus", hilf: "ist", praet: "ging aus", part: "ausgegangen", formen: ["gehe aus", "gehst aus", "geht aus", "gehen aus", "geht aus", "gehen aus"], note: "可分 + 强变化" },
  { de: "durchgehen", zh: "走过；过一遍", art: "stark", trenn: "durch", hilf: "ist", praet: "ging durch", part: "durchgegangen", formen: ["gehe durch", "gehst durch", "geht durch", "gehen durch", "geht durch", "gehen durch"], note: "可分 + 强变化" },
  { de: "einschlafen", zh: "入睡", art: "stark", trenn: "ein", hilf: "ist", praet: "schlief ein", part: "eingeschlafen", formen: ["schlafe ein", "schläfst ein", "schläft ein", "schlafen ein", "schlaft ein", "schlafen ein"], note: "可分 + 变音 + 强变化" }
];

/* ---------- ② 形容词比较级 ---------- */
const FORMEN_ADJ = [
  ["gut", "好的", "besser", "am besten", "不规则"],
  ["viel", "多", "mehr", "am meisten", "不规则"],
  ["gern", "乐意", "lieber", "am liebsten", "不规则（副词）"],
  ["gesund", "健康的", "gesünder", "am gesündesten", "变音"],
  ["krank", "生病的", "kränker", "am kränksten", "变音"],
  ["kalt", "冷的", "kälter", "am kältesten", "变音"],
  ["schwarz", "黑色", "schwärzer", "am schwärzesten", "变音"],
  ["rot", "红色", "röter", "am rötesten", "变音"],
  ["hell", "明亮的", "heller", "am hellsten", ""],
  ["heiß", "热的", "heißer", "am heißesten", ""],
  ["müde", "疲惫的", "müder", "am müdesten", ""],
  ["hungrig", "饥饿的", "hungriger", "am hungrigsten", ""],
  ["durstig", "口渴的", "durstiger", "am durstigsten", ""],
  ["glücklich", "幸福的", "glücklicher", "am glücklichsten", ""],
  ["beschäftigt", "忙碌的", "beschäftigter", "am beschäftigtsten", ""],
  ["kaputt", "坏了的", "kaputter", "am kaputtesten", ""],
  ["zufrieden", "满意的", "zufriedener", "am zufriedensten", ""],
  ["schwierig", "困难的", "schwieriger", "am schwierigsten", ""],
  ["langweilig", "无聊的", "langweiliger", "am langweiligsten", ""],
  ["unerwartet", "意外的", "unerwarteter", "am unerwartetsten", ""],
  ["ungewöhnlich", "不寻常的", "ungewöhnlicher", "am ungewöhnlichsten", ""],
  ["zufällig", "凑巧的", "zufälliger", "am zufälligsten", ""],
  ["bewölkt", "多云的", "bewölkter", "am bewölktesten", ""],
  ["gering", "少的", "geringer", "am geringsten", ""],
  ["mild", "温和的", "milder", "am mildesten", ""],
  ["kühl", "凉爽的", "kühler", "am kühlsten", ""],
  ["blau", "蓝色", "blauer", "am blauesten", ""],
  ["gelb", "黄色", "gelber", "am gelbsten", ""],
  ["weiß", "白色", "weißer", "am weißesten", ""],
  ["grün", "绿色", "grüner", "am grünsten", "变音"]
];

/* ---------- ③ 冠词 / 代词变格 ---------- */
const FORMEN_DEKL = {
  artikelBest: [
    ["第一格 N", "der", "die", "das", "die"],
    ["第四格 A", "den", "die", "das", "die"],
    ["第三格 D", "dem", "der", "dem", "den + n"],
    ["第二格 G", "des + s", "der", "des + s", "der"]
  ],
  artikelUnbest: [
    ["第一格 N", "ein", "eine", "ein", "—（无复数）"],
    ["第四格 A", "einen", "eine", "ein", "—"],
    ["第三格 D", "einem", "einer", "einem", "—"],
    ["第二格 G", "eines + s", "einer", "eines + s", "—"]
  ],
  pronomen: [
    ["ich", "mich", "mir"],
    ["du", "dich", "dir"],
    ["er", "ihn", "ihm"],
    ["sie", "sie", "ihr"],
    ["es", "es", "ihm"],
    ["wir", "uns", "uns"],
    ["ihr", "euch", "euch"],
    ["sie", "sie", "ihnen"],
    ["Sie（尊称）", "Sie", "Ihnen"]
  ],
  possessiv: [
    ["ich", "mein", "meine"],
    ["du", "dein", "deine"],
    ["er / es", "sein", "seine"],
    ["sie", "ihr", "ihre"],
    ["wir", "unser", "unsere"],
    ["ihr", "euer", "eure"],
    ["sie / Sie", "ihr / Ihr", "ihre / Ihre"]
  ],
  pluralRegeln: [
    ["加 -e", "der Tisch → die Tische", "多数阳性；常配变音（der Stuhl → die Stühle）"],
    ["加 -en / -n", "die Frau → die Frauen", "多数阴性"],
    ["加 -er", "das Kind → die Kinder", "多数中性；常配变音（das Haus → die Häuser）"],
    ["加 -s", "das Auto → die Autos", "外来词"],
    ["不变", "das Mädchen → die Mädchen", "以 -chen / -er / -el / -en 结尾"],
    ["只变音", "der Apfel → die Äpfel", "部分阳性 / 阴性"]
  ]
};
