/* ============================================================
   Mein Deutschheft · 数据层
   内容来源：Jian 的德语课堂笔记
   （本目录 notion/、A2_notion/ 与 Notion 在线笔记）
   ============================================================ */

const SITE = {
  title: "Mein Deutschheft",
  subtitle: "Jian 的德语学习手册",
  stand: "2026-10-12",
  level: "A1.2"
};

/* ------------------------------------------------------------
   一、课程目录（13 课：A1 × 11 + A1.2 × 2）
   ------------------------------------------------------------ */
const LESSONS = [
  {
    id: "l0", level: "A1", num: "00", date: "2026-04 起",
    title: "课程大纲与字母发音", de: "Kursüberblick & Alphabet",
    topic: "基础与发音",
    summary: "15 个生存导向主题构成的 A1–A2 课程地图；德语 26 个基础字母 + Ä Ö Ü ß 的音名体系与发音规则。",
    focus: "字母音名用于拼读（buchstabieren），与字母在单词中的发音是两回事；V/W 发音「灵魂对调」是初学核心陷阱。",
    grammar: [
      "单元音系列：A [a:]、E [e:]、I [i:]、O [o:]、U [u:]，口型固定、不滑动",
      "「-e」结尾辅音：B C D G P T W 均以长元音 [e:] 收尾（G 读 [ge:] 不读 gi，P 读 [pe:] 不读 pi）",
      "「-ε-」夹心辅音：F L M N S R 先发短促 [ɛ] 再接辅音；R 含小舌音 [ɛʁ]",
      "特殊音名：J [jɔt] 哟特、V [faʊ] 发乌、Y [ˈʏpsilɔn]、Z [tsɛt]",
      "四个特有字母：Ä [ɛ:]、Ö [ø:]、Ü [y:]（同拼音 ü）、ß [ɛsˈtsɛt]",
      "纠偏：字母名 ≠ 单词发音；W 发英语 V 的音，V 发英语 F 的音",
      "名词首字母大写：der Buchstabe / das Alphabet，动词 buchstabieren 小写"
    ],
    sentences: [
      { de: "Wie heißen Sie? Können Sie das bitte buchstabieren?", zh: "您叫什么名字？能请您拼读一下吗？" },
      { de: "Jian → J (yot) – i (i:) – a (a:) – n (ɛn)", zh: "用音名拼读名字 Jian" },
      { de: "Wu → W (ve:) – u (u:)", zh: "用音名拼读姓氏 Wu" }
    ]
  },
  {
    id: "l1", level: "A1", num: "01", date: "2026-04-10",
    title: "自我介绍", de: "Vorstellung",
    topic: "自我介绍",
    summary: "用德语介绍姓名、居住地、年龄、国籍、职业与爱好；A1 两大基石动词 sein / haben 及规则动词现在时变位框架。",
    focus: "规则动词变位口诀「e-st-t-en-t-en」可套用绝大多数动词；词干以 -t/-d 结尾时（arbeiten）du/er 形式插入 -e-。",
    grammar: [
      "sein 变位：bin / bist / ist / sind / seid / sind（不规则，须死记）",
      "haben 变位：habe / hast / hat / haben / habt / haben",
      "规则动词：词干 + 词尾 -e, -st, -t, -en, -t, -en",
      "arbeiten 特例：词干以 t 结尾 → du arbeitest, er arbeitet（插入 -e-）",
      "介词搭配：kommen aus + 来源地；wohnen in + 居住地；arbeiten für + 单位",
      "sein + 形容词描述状态（krank, müde...）；haben + 名词宾语表拥有（Ich habe Geld.）"
    ],
    sentences: [
      { de: "Mein Name ist Jian.", zh: "我的名字是 Jian。" },
      { de: "Ich komme aus China.", zh: "我来自中国。" },
      { de: "Ich wohne in XX.", zh: "我住在XX。" },
      { de: "Ich bin 34 Jahre alt.", zh: "我今年 34 岁。" },
      { de: "Ich arbeite für Max Planck.", zh: "我在马克斯·普朗克研究所工作。" },
      { de: "Ich studiere Biologie.", zh: "我学习生物学。" },
      { de: "Meine Hobbys sind Tennis spielen und Laufen.", zh: "我的爱好是打网球和跑步。" },
      { de: "Ich bin ein Angestellter.", zh: "我是一名职员。" },
      { de: "Ich habe das Haus.", zh: "我有这栋房子。" }
    ]
  },
  {
    id: "l2", level: "A1", num: "02", date: "2026-04-20",
    title: "数字", de: "Zahlen",
    topic: "数字",
    summary: "0–100 数字系统：不规则基数词、「个位 + zehn」、「个位 + zig」，以及德语标志性的「个位先说」颠倒逻辑。",
    focus: "三大陷阱：16/17 词干缩减（sechzehn / siebzehn）；30 是唯一用 ß 的整十数（dreißig）；21 以上个位 1 要脱 s（einundzwanzig）。",
    grammar: [
      "0–12 不规则，逐个死记：null, eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf",
      "13–19 = 个位 + zehn；16 = sechzehn（去 s），17 = siebzehn（去 en）",
      "整十 = 个位 + zig；20 zwanzig 特殊词干，30 dreißig 唯一用 ß",
      "21–99 = 个位 + und + 十位，连写一个词：vierunddreißig (34)",
      "组合中 1 变 ein-：21 einundzwanzig",
      "电话号码 / 邮编：初学者逐位念最安全（null-eins-sieben-sechs...）"
    ],
    sentences: [
      { de: "34 = vierunddreißig", zh: "4 + und + 30，先个位后十位" },
      { de: "79 = neunundsiebzig", zh: "9 + und + 70" },
      { de: "45 = fünfundvierzig", zh: "5 + und + 40" },
      { de: "Meine Telefonnummer ist null-eins-sieben-sechs ...", zh: "我的电话号码是 0176……（逐位念）" },
      { de: "35390 → drei-fünf-drei-neun-null", zh: "邮编 35390 逐位读出" }
    ]
  },
  {
    id: "l3", level: "A1", num: "03", date: "2026-05",
    title: "食物与饮料", de: "Essen & Getränke",
    topic: "食物饮料",
    summary: "水果、蔬菜、肉类、饮料核心词汇；essen / trinken / nehmen 变位；餐厅点餐高频句与第四格 einen 的初次登场。",
    focus: "点餐最礼貌的说法是 Ich hätte gern …（第二虚拟式）；点阳性名词时 ein 必须变 einen。",
    grammar: [
      "essen 强变化：du isst, er isst（e→i）；nehmen 强变化：du nimmst, er nimmt",
      "泛指吃喝用零冠词：Ich esse Pizza. / Ich trinke Wasser.",
      "喜好表达：动词 + gern（Ich esse gern Salat.）",
      "第四格阳性变化：der → einen（Ich nehme einen Apfel.）；阴性/中性不变",
      "复合词词性由最后一个词决定：das Fleisch → das Rindfleisch / Schweinefleisch / Hackfleisch",
      "-chen 指小词永远中性：das Hähnchen"
    ],
    sentences: [
      { de: "Ich esse gern Salat.", zh: "我喜欢吃沙拉。" },
      { de: "Was trinkst du gern?", zh: "你喜欢喝什么？" },
      { de: "Ich hätte gern eine Pizza und ein Wasser.", zh: "我想要一份比萨和一杯水。（最礼貌点餐式）" },
      { de: "Ich nehme einen Kaffee.", zh: "我要一杯咖啡。（阳性 → einen）" },
      { de: "Was kostet das?", zh: "这个多少钱？" },
      { de: "Die Rechnung, bitte.", zh: "请买单。" },
      { de: "— Noch etwas? — Nein, danke.", zh: "— 还要别的吗？— 不用了，谢谢。" }
    ]
  },
  {
    id: "l5", level: "A1", num: "05", date: "2026-05-19",
    title: "休闲活动", de: "Freizeitaktivitäten",
    topic: "休闲活动",
    summary: "14 个高频业余活动动词；规则变位四大派系（规则 / s·z 词干 / 强变化 / 可分离）一次性打通；gern 句型表达喜好。",
    focus: "强变化只在 du 和 er/sie/es 变身；词干以 s/z 结尾时 du 变位省 s 加 t（du tanzt / du reist / du liest）。",
    grammar: [
      "弱变化（规则）：schwimmen, kochen, singen → 严格套 -e, -st, -t, -en, -t, -en",
      "词干以 s/z 结尾：du 省 s 加 t → du tanzt, du reist（du 与 er 同形）",
      "强变化换音：lesen (e→ie: du liest)、treffen (e→i: du triffst)；变音：fahren (a→ä: du fährst)",
      "可分离动词：einkaufen, fernsehen → 前缀甩句尾（Ich kaufe am Samstag ein.）",
      "fernsehen 是复合考点：sehen 换音 + fern 分离（Er sieht gern fern.）",
      "喜好梯度：gern / sehr gern / nicht gern"
    ],
    sentences: [
      { de: "Ich lese gern.", zh: "我喜欢看书。" },
      { de: "Ich schwimme sehr gern.", zh: "我非常喜欢游泳。" },
      { de: "Ich tanze nicht gern.", zh: "我不喜欢跳舞。" },
      { de: "Was machst du gern? / Was machen Sie gern?", zh: "你 / 您喜欢做什么？" },
      { de: "Ich kaufe am Samstag ein.", zh: "我周六购物。（ein 甩句尾）" },
      { de: "Er sieht gern fern.", zh: "他喜欢看电视。（换音 + 分离）" },
      { de: "Mit Freunden koche ich gern.", zh: "我喜欢和朋友们一起做饭。（倒装）" },
      { de: "Ich fahre Rad. / Ich spiele Fußball.", zh: "我骑自行车。/ 我踢足球。" }
    ]
  },
  {
    id: "l6", level: "A1", num: "06", date: "2026-06",
    title: "房屋与家具", de: "Wohnung & Möbel",
    topic: "房屋家具",
    summary: "房间与家具词汇（-zimmer 复合词全中性）；两大公式：Es gibt + 第四格、in + 第三格（im / in der）。",
    focus: "问「哪里有什么」用 es gibt + Akkusativ；问「东西在哪个房间」用 in + Dativ：das → im，die → in der，绝不可写 im Küche。",
    grammar: [
      "复合词：das Zimmer → das Wohnzimmer / Schlafzimmer / Badezimmer / Kinderzimmer（全中性）",
      "Es gibt + Akkusativ：Es gibt einen Tisch in der Küche.（阳性 einen）",
      "静态位置 in + Dativ：im Wohnzimmer (in dem)、in der Küche",
      "阳台用 auf：Die Blumen sind auf dem Balkon.",
      "写作任务 Übung 16：8–10 句描述一天，时间副词开头练倒装"
    ],
    sentences: [
      { de: "Maria hat eine kleine Wohnung.", zh: "Maria 有一套小公寓。" },
      { de: "Es gibt ein Wohnzimmer, ein Schlafzimmer und eine Küche.", zh: "（公寓里）有一间客厅、一间卧室和一间厨房。" },
      { de: "Im Wohnzimmer gibt es ein Sofa und einen Fernseher.", zh: "客厅里有一张沙发和一台电视机。" },
      { de: "Der Tisch ist in der Küche.", zh: "桌子在厨房里。（die Küche → in der）" },
      { de: "Das Bett ist im Schlafzimmer.", zh: "床在卧室里。（das → im）" },
      { de: "Der Grill steht auf dem Balkon.", zh: "烤肉架在阳台上。" }
    ]
  },
  {
    id: "l7", level: "A1", num: "07", date: "2026-06",
    title: "时间与一日作息", de: "Uhrzeit & Tagesablauf",
    topic: "时间作息",
    summary: "口语报时（整点 / 一刻 / 半点 / 三刻）；一日时间段副词；8 个作息核心动词与「动词第二位」黄金语序。",
    focus: "德语半点看「未来」：halb neun = 8:30（通往 9 点的一半），不是 9:30！这是本课最大地雷。",
    grammar: [
      "整点：Es ist acht Uhr.；一刻：Viertel nach acht (8:15)；三刻：Viertel vor neun (8:45，小时 +1)",
      "半点：halb + 下一个小时 → halb neun = 8:30 ⚠️",
      "正式场合直接念数字：zehn Uhr dreißig (10:30)",
      "时间段副词（-s 表规律）：morgens / vormittags / mittags / nachmittags / abends / nachts",
      "作息动词：aufstehen（可分）、frühstücken、arbeiten、lernen、essen（换音）、nach Hause gehen、fernsehen（可分+换音）、schlafen（变音 schläft）",
      "问时间：Wie viel Uhr ist es? / Wie spät ist es?；在几点用 um"
    ],
    sentences: [
      { de: "Es ist Viertel nach acht.", zh: "8:15（8 点过了一刻）。" },
      { de: "Es ist halb neun.", zh: "8:30！（通往 9 点的一半）" },
      { de: "Es ist Viertel vor neun.", zh: "8:45（差一刻到 9 点）。" },
      { de: "Ich stehe um halb acht auf.", zh: "我 7:30 起床。" },
      { de: "Morgens trinke ich Kaffee.", zh: "我早上喝咖啡。（倒装：动词第二）" },
      { de: "Abends sehe ich fern.", zh: "我晚上看电视。" },
      { de: "Wann stehen Sie auf?", zh: "您几点起床？" },
      { de: "Ich schlafe um halb elf.", zh: "我 10:30 睡觉。" }
    ]
  },
  {
    id: "l9", level: "A1", num: "09", date: "2026-06-15",
    title: "服装与颜色", de: "Kleidung & Farben",
    topic: "服装颜色",
    summary: "服装与颜色核心词汇；tragen / passen / kosten 三大动词的用法分工；购物对话与个人穿搭表达。",
    focus: "tragen 主语是「人」且强变化（du trägst）；passen / kosten 主语是「物」，只看单复数。",
    grammar: [
      "tragen 强变化（a→ä）：ich trage, du trägst, er trägt",
      "passen：Die Hose passt.（单）/ Die Schuhe passen.（复）",
      "kosten：Das T-Shirt kostet 20 Euro. / Die Schuhe kosten 80 Euro.",
      "颜色作表语小写：blau, rot, gelb, weiß, grün",
      "季节句倒装：Im Herbst sind die Blätter rot und gelb."
    ],
    sentences: [
      { de: "Ich trage gern Jeans.", zh: "我喜欢穿牛仔裤。" },
      { de: "Meine Lieblingsfarbe ist Blau.", zh: "我最喜欢的颜色是蓝色。" },
      { de: "Ich kaufe Kleidung bei H&M.", zh: "我常在 H&M 买衣服。" },
      { de: "— Kann ich Ihnen helfen? — Welche Größe?", zh: "— 我能帮您吗？— 什么尺码？（店员用语）" },
      { de: "Wie viel kostet das? — Ich nehme es.", zh: "这个多少钱？— 我要了。" },
      { de: "Im Herbst sind die Blätter rot und gelb.", zh: "秋天，树叶是红色和黄色的。" }
    ]
  },
  {
    id: "l10", level: "A1", num: "10", date: "2026-06-29",
    title: "四季与天气", de: "Jahreszeiten & Wetter",
    topic: "天气四季",
    summary: "春夏秋冬四大词汇网络（自然、穿搭、活动、节日）；天气句型的正装与倒装两种语序。",
    focus: "天气句两套语序自由切换：Es ist im Sommer heiß. ⇄ Im Sommer ist es heiß. —— 动词永远第二位。",
    grammar: [
      "正装：Es + 动词 + 天气 + 时间（Es regnet im Herbst oft.）",
      "倒装：Im Herbst regnet es oft.（季节提前，es 退居第三）",
      "季节全部阳性：der Frühling / Sommer / Herbst / Winter；「在某个季节」用 im",
      "天气动词：regnen, schneien, scheinen (die Sonne scheint), blühen",
      "节日词汇：Ostern（der Osterhase, das Osterei）、Weihnachten（der Glühwein, der Weihnachtsmarkt）、das Erntedankfest、das Oktoberfest"
    ],
    sentences: [
      { de: "Es ist im Sommer heiß.", zh: "夏天热。（正装）" },
      { de: "Im Winter ist es kalt.", zh: "冬天冷。（倒装）" },
      { de: "Im Herbst regnet es oft.", zh: "秋天经常下雨。" },
      { de: "Heute ist es sehr warm.", zh: "今天非常暖和。" },
      { de: "Im Frühling blühen die Blumen.", zh: "春天百花盛开。" },
      { de: "Im Winter bauen die Kinder einen Schneemann.", zh: "冬天孩子们堆雪人。" },
      { de: "Das Gras ist grün.", zh: "草是绿色的。" }
    ]
  },
  {
    id: "l11", level: "A1", num: "11", date: "2026-07-13 / 07-20",
    title: "交通与问路", de: "Verkehr & Wegbeschreibung",
    topic: "交通问路",
    summary: "问路指路全套表达；gehen 与 fahren 的分工；mit + 第三格表交通工具；zu → zum / zur 缩写规则；方位介词。",
    focus: "乘交通工具 = mit + Dativ（mit dem Bus / mit der U-Bahn）；步行特例 zu Fuß gehen；去某处 = zu + Dativ（zum / zur）。",
    grammar: [
      "gehen（步行）vs. fahren（借助交通工具，含骑自行车）",
      "fahren 强变化：du fährst, er fährt",
      "mit + Dativ 表交通方式：mit dem Zug / Bus / Auto / Fahrrad；mit der U-Bahn",
      "zu 缩写：zu + dem = zum（阳性/中性）；zu + der = zur（阴性）",
      "方位介词 + Dativ：neben（旁边）、gegenüber（对面）、zwischen（之间）",
      "指路高频：geradeaus 直走、links/rechts、an der Ampel、vorbei（经过）、bis（直到）"
    ],
    sentences: [
      { de: "Wo ist die Bank?", zh: "银行在哪里？（问静态位置）" },
      { de: "Wie komme ich zum Bahnhof / zur Arztpraxis?", zh: "去火车站 / 诊所怎么走？（问动态路线）" },
      { de: "Gehen Sie geradeaus.", zh: "请您直走。" },
      { de: "Gehen Sie an der Ampel nach links.", zh: "请在红绿灯处左转。" },
      { de: "Ich fahre mit dem Bus.", zh: "我乘公交车。" },
      { de: "Ich gehe zu Fuß.", zh: "我步行去。" },
      { de: "Die Arztpraxis ist neben dem Bäcker.", zh: "诊所在面包店旁边。" },
      { de: "Geh die Straße runter, dann links neben dem Bäcker — da ist die Arztpraxis.", zh: "沿街往下走，然后左转，面包店旁边就是诊所。" }
    ]
  },
  {
    id: "l12", level: "A1", num: "12/13", date: "2026-07-27",
    title: "办公与通勤全天词汇", de: "Büroalltag & unterwegs",
    topic: "办公通勤",
    summary: "办公文具、科研日常、通勤场所的整合词汇包；fahren / gehen 强弱变位对比；第四格宾语与方位介词综合复习。",
    focus: "brauchen / suchen / kaufen 后接第四格：阳性 der → den / einen；机器坏了说 Der Drucker funktioniert nicht.",
    grammar: [
      "强弱对比：fahren（du fährst，变音）vs. gehen（du gehst，规则）",
      "第四格阳性：der Ordner → den Ordner；ein Tacker → einen Tacker",
      "mit + Dativ 复习：mit dem Auto / mit der U-Bahn",
      "静态方位 + Dativ：am Fenster (an dem)、gegenüber der Bank、zwischen der Bank und dem Supermarkt",
      "状态表达：Ich bin beschäftigt / spät dran.；Überstunden machen 加班；länger bleiben 多留一会"
    ],
    sentences: [
      { de: "Der Drucker funktioniert nicht.", zh: "打印机坏了 / 不工作了。" },
      { de: "Ich brauche einen Tacker.", zh: "我需要一个订书机。（阳性 einen）" },
      { de: "Ich mache heute Überstunden.", zh: "我今天加班。" },
      { de: "Ich bleibe länger.", zh: "我多留一会儿。" },
      { de: "Ich bin spät dran.", zh: "我快迟到了。" },
      { de: "Wir haben ein Meeting.", zh: "我们有个会议。" }
    ]
  },
  {
    id: "a2t1", level: "A1.2", num: "A2-1", date: "2026-08-31",
    title: "实验室的一天", de: "Ein Tag im Labor",
    topic: "实验室",
    summary: "以生物学家 Daniel 的一天为范文的 A1/A2 过渡课文；可分离动词集群、时间表达、W-疑问词（Womit / Worüber）与从句预热。",
    focus: "叙述日常流程的标准范式：时间状语开头 + 动词第二位 + 可分离动词前缀钉句尾。",
    grammar: [
      "时间顺序叙事：Einleitung → Morgen → Mittag → Nachmittag → Feierabend → Fazit",
      "可分离动词：anziehen, vorbereiten, aufschreiben, ansehen, aufräumen, einschalten",
      "换音动词：sehen (e→ie: er sieht)、sprechen (e→i: er spricht)",
      "口语半点：10:30 = halb elf；12:30 = halb eins",
      "复合疑问词：Womit（用什么工具）+ mit；Worüber（关于什么）+ über",
      "从句预热（动词后置）：Wenn ich ins Labor komme, ... / Bevor ich nach Hause gehe, ... / ... weil es immer etwas Neues zu entdecken gibt."
    ],
    sentences: [
      { de: "Ich arbeite als Biologe in einem Labor.", zh: "我在实验室担任生物学家。" },
      { de: "Am Morgen kontrolliere ich meine Experimente.", zh: "早上我检查我的实验。（倒装）" },
      { de: "Wenn ich ins Labor komme, ziehe ich zuerst meinen Laborkittel an.", zh: "我到实验室时，先穿上实验服。" },
      { de: "Gegen 10:30 Uhr mache ich eine kurze Pause.", zh: "10 点半左右我短暂休息。" },
      { de: "Womit untersucht er die Pflanzenzellen? — Mit einem Mikroskop.", zh: "他用什么研究植物细胞？— 用显微镜。" },
      { de: "Meine Arbeit ist manchmal schwierig, aber sie ist nie langweilig.", zh: "我的工作有时很难，但从不无聊。" }
    ]
  },
  {
    id: "a2t2", level: "A1.2", num: "A2-2", date: "2026-10-07",
    title: "现在完成时", de: "Das Perfekt · Ein besonderer Tag im Labor",
    topic: "完成时",
    summary: "通过 Mia 在实验室的特殊一天，系统学习德语口语中表达过去最核心的时态：haben / sein + 第二分词的框架结构。",
    focus: "框架结构：助动词（第二位）+ … + Partizip II（句末）。sein 只配两类动词：位置移动（kommen, gehen, fahren）与状态改变（aufstehen, einschlafen），其余一律 haben。",
    grammar: [
      "结构：主语 + haben/sein（变位，第二位）+ … + Partizip II（句末）",
      "haben 阵营（约 80–90%）：及物动词、无位移/状态变化的动词、反身与无人称动词",
      "sein 阵营：位置移动（kommen, gehen, fahren）、状态改变（aufstehen, einschlafen, werden）、sein / bleiben / passieren 本身",
      "Partizip II 四种构成：规则 ge-+词干+(e)t；强变化 ge-+变音词干+en；可分动词 前缀+ge+词干；-ieren 与不可分前缀（be-, er-, ent-, ver-, unter-, wieder-）不加 ge-",
      "示例：hat gearbeitet / ist gekommen / hat eingeschaltet / hat kontrolliert / hat benutzt",
      "过去时残留：war（sein 的 Präteritum）描述状态时可用（Am Abend war Mia müde.）"
    ],
    sentences: [
      { de: "Gestern hat sie einen besonders interessanten Arbeitstag gehabt.", zh: "昨天她度过了特别有趣的一个工作日。" },
      { de: "Mia ist schon um 7:15 Uhr ins Labor gekommen.", zh: "Mia 早上 7:15 就来到了实验室。（位移 → sein）" },
      { de: "Sie hat zuerst ihren Computer eingeschaltet.", zh: "她首先打开了电脑。（可分：ein+ge+schaltet）" },
      { de: "Sie hat alle Behälter kontrolliert und die Nummern notiert.", zh: "她检查了所有容器并记录了编号。（-ieren 无 ge-）" },
      { de: "Bei einer Probe haben sie ein unerwartetes Ergebnis gefunden.", zh: "在一份样品中她们发现了意外的结果。" },
      { de: "Um 16:30 Uhr ist sie mit dem Fahrrad nach Hause gefahren.", zh: "16:30 她骑自行车回家了。（位移 → sein）" },
      { de: "Trotzdem war sie zufrieden, denn sie hat etwas Neues gelernt.", zh: "但她依然很满足，因为她学到了新东西。" }
    ]
  }
];

/* ------------------------------------------------------------
   二、生词表（按主题；pos: der/die/das/verb/adj/adv/phrase/pl）
   ------------------------------------------------------------ */
const VOCAB = [
  // 基础与发音
  { de: "der Buchstabe", zh: "字母", pos: "der", plural: "-n", topic: "基础与发音" },
  { de: "das Alphabet", zh: "字母表", pos: "das", plural: "-e", topic: "基础与发音" },
  { de: "buchstabieren", zh: "拼读", pos: "verb", topic: "基础与发音" },
  // 自我介绍
  { de: "der Name", zh: "名字", pos: "der", plural: "-n", topic: "自我介绍" },
  { de: "die Adresse", zh: "地址", pos: "die", plural: "-n", topic: "自我介绍" },
  { de: "das Hobby", zh: "爱好", pos: "das", plural: "-s", topic: "自我介绍" },
  { de: "das Jahr", zh: "年；岁（… Jahre alt）", pos: "das", plural: "-e", topic: "自我介绍" },
  { de: "der Angestellte", zh: "职员（男）", pos: "der", plural: "-n", topic: "自我介绍" },
  { de: "das Auto", zh: "汽车", pos: "das", plural: "-s", topic: "自我介绍" },
  { de: "das Haus", zh: "房子", pos: "das", plural: "¨-er", topic: "自我介绍" },
  { de: "das Geld", zh: "钱", pos: "das", plural: "-er", topic: "自我介绍" },
  { de: "die Zeit", zh: "时间", pos: "die", plural: "-en", topic: "自我介绍" },
  { de: "wohnen", zh: "居住", pos: "verb", ipa: "[ˈvoːnən]", topic: "自我介绍" },
  { de: "kommen", zh: "来；来自（aus）", pos: "verb", topic: "自我介绍" },
  { de: "arbeiten", zh: "工作", pos: "verb", ipa: "[ˈaʁbaɪ̯tn̩]", topic: "自我介绍" },
  { de: "studieren", zh: "（在大学）攻读", pos: "verb", topic: "自我介绍" },
  { de: "gesund", zh: "健康的", pos: "adj", topic: "自我介绍" },
  { de: "krank", zh: "生病的", pos: "adj", topic: "自我介绍" },
  { de: "müde", zh: "疲惫的", pos: "adj", topic: "自我介绍" },
  { de: "hungrig", zh: "饥饿的", pos: "adj", topic: "自我介绍" },
  { de: "durstig", zh: "口渴的", pos: "adj", topic: "自我介绍" },
  { de: "glücklich", zh: "幸福的；高兴的", pos: "adj", topic: "自我介绍" },
  { de: "beschäftigt", zh: "忙碌的", pos: "adj", ipa: "[bəˈʃɛftɪçt]", topic: "自我介绍" },
  { de: "kaputt", zh: "坏了的；累垮的", pos: "adj", topic: "自我介绍" },
  // 数字
  { de: "null / eins / zwei / drei", zh: "0 / 1 / 2 / 3", pos: "phrase", topic: "数字" },
  { de: "vier / fünf / sechs / sieben", zh: "4 / 5 / 6 / 7", pos: "phrase", topic: "数字" },
  { de: "acht / neun / zehn", zh: "8 / 9 / 10", pos: "phrase", topic: "数字" },
  { de: "elf / zwölf", zh: "11 / 12", pos: "phrase", topic: "数字" },
  { de: "sechzehn / siebzehn", zh: "16 / 17（词干缩减）", pos: "phrase", topic: "数字" },
  { de: "zwanzig / dreißig", zh: "20 / 30（ß 特例）", pos: "phrase", topic: "数字" },
  { de: "hundert", zh: "100", pos: "phrase", topic: "数字" },
  { de: "die Telefonnummer", zh: "电话号码", pos: "die", plural: "-n", topic: "数字" },
  { de: "die Hausnummer", zh: "门牌号", pos: "die", plural: "-n", topic: "数字" },
  { de: "die Postleitzahl (PLZ)", zh: "邮政编码", pos: "die", plural: "-en", topic: "数字" },
  // 食物饮料
  { de: "der Apfel", zh: "苹果", pos: "der", plural: "¨-", topic: "食物饮料" },
  { de: "der Pfirsich", zh: "桃子", pos: "der", plural: "-e", topic: "食物饮料" },
  { de: "die Erdbeere", zh: "草莓", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "die Orange", zh: "橙子", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "die Zitrone", zh: "柠檬", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "die Ananas", zh: "菠萝", pos: "die", plural: "-", topic: "食物饮料" },
  { de: "die Wassermelone", zh: "西瓜", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "der Salat", zh: "沙拉；生菜", pos: "der", plural: "-e", topic: "食物饮料" },
  { de: "der Knoblauch", zh: "大蒜", pos: "der", topic: "食物饮料" },
  { de: "die Gurke", zh: "黄瓜", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "die Zwiebel", zh: "洋葱", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "die Karotte", zh: "胡萝卜", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "das Salz", zh: "盐", pos: "das", topic: "食物饮料" },
  { de: "der Pfeffer", zh: "胡椒", pos: "der", topic: "食物饮料" },
  { de: "der Käse", zh: "奶酪", pos: "der", topic: "食物饮料" },
  { de: "die Pizza", zh: "比萨", pos: "die", plural: "-s/Pizzen", topic: "食物饮料" },
  { de: "die Suppe", zh: "汤", pos: "die", plural: "-n", topic: "食物饮料" },
  { de: "die Butter", zh: "黄油", pos: "die", topic: "食物饮料" },
  { de: "das Brot", zh: "面包", pos: "das", plural: "-e", topic: "食物饮料" },
  { de: "das Steak", zh: "牛排", pos: "das", plural: "-s", topic: "食物饮料" },
  { de: "das Schnitzel", zh: "炸肉排", pos: "das", plural: "-", topic: "食物饮料" },
  { de: "das Rindfleisch", zh: "牛肉", pos: "das", topic: "食物饮料" },
  { de: "das Schweinefleisch", zh: "猪肉", pos: "das", topic: "食物饮料" },
  { de: "das Hähnchen", zh: "鸡肉", pos: "das", plural: "-", topic: "食物饮料" },
  { de: "der Kaffee", zh: "咖啡", pos: "der", plural: "-s", topic: "食物饮料" },
  { de: "der Tee", zh: "茶", pos: "der", plural: "-s", topic: "食物饮料" },
  { de: "das Wasser", zh: "水", pos: "das", ipa: "[ˈvasɐ]", topic: "食物饮料" },
  { de: "die Cola", zh: "可乐", pos: "die", plural: "-s", topic: "食物饮料" },
  { de: "essen", zh: "吃（du isst）", pos: "verb", ipa: "[ˈɛsn̩]", topic: "食物饮料" },
  { de: "trinken", zh: "喝（规则）", pos: "verb", topic: "食物饮料" },
  { de: "nehmen", zh: "拿；点（du nimmst）", pos: "verb", topic: "食物饮料" },
  { de: "die Rechnung", zh: "账单", pos: "die", plural: "-en", topic: "食物饮料" },
  // 休闲活动
  { de: "lesen", zh: "阅读（du liest）", pos: "verb", ipa: "[ˈleːzn̩]", topic: "休闲活动" },
  { de: "schwimmen", zh: "游泳", pos: "verb", ipa: "[ˈʃvɪmən]", topic: "休闲活动" },
  { de: "kochen", zh: "做饭；烹饪", pos: "verb", ipa: "[ˈkɔxn̩]", topic: "休闲活动" },
  { de: "tanzen", zh: "跳舞（du tanzt）", pos: "verb", topic: "休闲活动" },
  { de: "singen", zh: "唱歌", pos: "verb", ipa: "[ˈzɪŋən]", topic: "休闲活动" },
  { de: "Musik hören", zh: "听音乐", pos: "phrase", topic: "休闲活动" },
  { de: "fernsehen", zh: "看电视（可分+换音）", pos: "verb", ipa: "[ˈfɛrnˌzeːən]", topic: "休闲活动" },
  { de: "spazieren gehen", zh: "散步", pos: "phrase", topic: "休闲活动" },
  { de: "Sport machen", zh: "做运动", pos: "phrase", topic: "休闲活动" },
  { de: "reisen", zh: "旅行（du reist）", pos: "verb", ipa: "[ˈʁaɪ̯zn̩]", topic: "休闲活动" },
  { de: "fotografieren", zh: "拍照", pos: "verb", topic: "休闲活动" },
  { de: "einkaufen", zh: "购物（可分）", pos: "verb", topic: "休闲活动" },
  { de: "Freunde treffen", zh: "见朋友（du triffst）", pos: "phrase", topic: "休闲活动" },
  { de: "Rad fahren", zh: "骑自行车（du fährst）", pos: "phrase", topic: "休闲活动" },
  { de: "das Buch", zh: "书", pos: "das", plural: "¨-er", topic: "休闲活动" },
  { de: "die Musik", zh: "音乐", pos: "die", topic: "休闲活动" },
  { de: "der Fußball", zh: "足球", pos: "der", plural: "¨-e", topic: "休闲活动" },
  { de: "der Freund / die Freundin", zh: "朋友（男/女）", pos: "der", plural: "-e/-innen", topic: "休闲活动" },
  { de: "gern / sehr gern / nicht gern", zh: "喜欢 / 非常喜欢 / 不喜欢", pos: "adv", topic: "休闲活动" },
  // 房屋家具
  { de: "die Wohnung", zh: "公寓", pos: "die", plural: "-en", topic: "房屋家具" },
  { de: "das Wohnzimmer", zh: "客厅", pos: "das", plural: "-", topic: "房屋家具" },
  { de: "das Schlafzimmer", zh: "卧室", pos: "das", plural: "-", topic: "房屋家具" },
  { de: "das Badezimmer", zh: "浴室", pos: "das", plural: "-", topic: "房屋家具" },
  { de: "das Kinderzimmer", zh: "儿童房", pos: "das", plural: "-", topic: "房屋家具" },
  { de: "die Küche", zh: "厨房", pos: "die", plural: "-n", ipa: "[ˈkʏçə]", topic: "房屋家具" },
  { de: "der Flur", zh: "走廊；玄关", pos: "der", plural: "-e", topic: "房屋家具" },
  { de: "der Balkon", zh: "阳台", pos: "der", plural: "-e", topic: "房屋家具" },
  { de: "der Tisch", zh: "桌子", pos: "der", plural: "-e", topic: "房屋家具" },
  { de: "der Schrank", zh: "柜子", pos: "der", plural: "¨-e", topic: "房屋家具" },
  { de: "der Stuhl", zh: "椅子", pos: "der", plural: "¨-e", topic: "房屋家具" },
  { de: "der Fernseher", zh: "电视机", pos: "der", plural: "-", topic: "房屋家具" },
  { de: "der Kühlschrank", zh: "冰箱", pos: "der", plural: "¨-e", topic: "房屋家具" },
  { de: "das Bett", zh: "床", pos: "das", plural: "-en", topic: "房屋家具" },
  { de: "das Sofa", zh: "沙发", pos: "das", plural: "-s", topic: "房屋家具" },
  { de: "die Lampe", zh: "灯", pos: "die", plural: "-n", topic: "房屋家具" },
  { de: "die Dusche", zh: "淋浴", pos: "die", plural: "-n", topic: "房屋家具" },
  { de: "das Spielzeug", zh: "玩具", pos: "das", plural: "-e", topic: "房屋家具" },
  // 时间作息
  { de: "die Uhr", zh: "钟；点（um 8 Uhr）", pos: "die", plural: "-en", topic: "时间作息" },
  { de: "die Minute", zh: "分钟", pos: "die", plural: "-n", topic: "时间作息" },
  { de: "das Viertel", zh: "一刻钟", pos: "das", plural: "-", topic: "时间作息" },
  { de: "halb", zh: "半（halb neun = 8:30!）", pos: "adv", topic: "时间作息" },
  { de: "nach / vor", zh: "过 / 差（几分）", pos: "adv", topic: "时间作息" },
  { de: "aufstehen", zh: "起床（可分）", pos: "verb", topic: "时间作息" },
  { de: "frühstücken", zh: "吃早饭", pos: "verb", topic: "时间作息" },
  { de: "lernen", zh: "学习", pos: "verb", topic: "时间作息" },
  { de: "nach Hause gehen", zh: "回家（用 nach）", pos: "phrase", topic: "时间作息" },
  { de: "schlafen", zh: "睡觉（du schläfst）", pos: "verb", ipa: "[ˈʃlaːfn̩]", topic: "时间作息" },
  { de: "morgens / vormittags", zh: "在早上 / 在上午", pos: "adv", topic: "时间作息" },
  { de: "mittags / nachmittags", zh: "在中午 / 在下午", pos: "adv", topic: "时间作息" },
  { de: "abends / nachts", zh: "在晚上 / 在夜里", pos: "adv", topic: "时间作息" },
  // 服装颜色
  { de: "die Hose", zh: "裤子（单数）", pos: "die", plural: "-n", topic: "服装颜色" },
  { de: "die Jacke", zh: "外套；夹克", pos: "die", plural: "-n", topic: "服装颜色" },
  { de: "das T-Shirt", zh: "T 恤", pos: "das", plural: "-s", topic: "服装颜色" },
  { de: "das Hemd", zh: "衬衫", pos: "das", plural: "-en", topic: "服装颜色" },
  { de: "der Schuh (die Schuhe)", zh: "鞋（常用复数）", pos: "der", plural: "-e", topic: "服装颜色" },
  { de: "die Jeans", zh: "牛仔裤", pos: "die", plural: "-", topic: "服装颜色" },
  { de: "tragen", zh: "穿；戴（du trägst）", pos: "verb", ipa: "[ˈtʁaːɡn̩]", topic: "服装颜色" },
  { de: "passen", zh: "合身（主语是物）", pos: "verb", topic: "服装颜色" },
  { de: "kosten", zh: "花费；价格为", pos: "verb", topic: "服装颜色" },
  { de: "die Größe", zh: "尺码", pos: "die", plural: "-n", topic: "服装颜色" },
  { de: "der Verkäufer", zh: "店员（男）", pos: "der", plural: "-", topic: "服装颜色" },
  { de: "die Lieblingsfarbe", zh: "最喜欢的颜色", pos: "die", plural: "-n", topic: "服装颜色" },
  { de: "blau / rot / gelb", zh: "蓝 / 红 / 黄", pos: "adj", topic: "服装颜色" },
  { de: "weiß / grün / schwarz", zh: "白 / 绿 / 黑", pos: "adj", topic: "服装颜色" },
  // 天气四季
  { de: "der Frühling", zh: "春天", pos: "der", plural: "-e", topic: "天气四季" },
  { de: "der Sommer", zh: "夏天", pos: "der", plural: "-", topic: "天气四季" },
  { de: "der Herbst", zh: "秋天", pos: "der", plural: "-e", topic: "天气四季" },
  { de: "der Winter", zh: "冬天", pos: "der", plural: "-", topic: "天气四季" },
  { de: "die Blume", zh: "花", pos: "die", plural: "-n", topic: "天气四季" },
  { de: "der Baum", zh: "树", pos: "der", plural: "¨-e", topic: "天气四季" },
  { de: "das Gras", zh: "草", pos: "das", plural: "¨-er", topic: "天气四季" },
  { de: "der Vogel", zh: "鸟", pos: "der", plural: "¨-", topic: "天气四季" },
  { de: "der Garten", zh: "花园", pos: "der", plural: "¨-", topic: "天气四季" },
  { de: "die Sonne", zh: "太阳", pos: "die", plural: "-n", topic: "天气四季" },
  { de: "die Sonnenbrille", zh: "太阳镜", pos: "die", plural: "-n", topic: "天气四季" },
  { de: "der See", zh: "湖泊", pos: "der", plural: "-n", topic: "天气四季" },
  { de: "der Biergarten", zh: "啤酒花园", pos: "der", plural: "¨-", topic: "天气四季" },
  { de: "der Regen", zh: "雨", pos: "der", topic: "天气四季" },
  { de: "regnen / schneien", zh: "下雨 / 下雪", pos: "verb", topic: "天气四季" },
  { de: "der Schnee", zh: "雪", pos: "der", topic: "天气四季" },
  { de: "das Eis", zh: "冰；冰淇淋", pos: "das", topic: "天气四季" },
  { de: "der Schneemann", zh: "雪人", pos: "der", plural: "¨-er", topic: "天气四季" },
  { de: "der Kürbis", zh: "南瓜", pos: "der", plural: "-se", topic: "天气四季" },
  { de: "das Eichhörnchen", zh: "松鼠", pos: "das", plural: "-", topic: "天气四季" },
  { de: "der Mantel", zh: "大衣", pos: "der", plural: "¨-", topic: "天气四季" },
  { de: "die Mütze", zh: "毛线帽", pos: "die", plural: "-n", topic: "天气四季" },
  { de: "der Schal", zh: "围巾", pos: "der", plural: "-s", topic: "天气四季" },
  { de: "die Handschuhe", zh: "手套（复数）", pos: "pl", topic: "天气四季" },
  { de: "das Geschenk", zh: "礼物", pos: "das", plural: "-e", topic: "天气四季" },
  { de: "der Glühwein", zh: "热红酒", pos: "der", plural: "-e", topic: "天气四季" },
  { de: "der Weihnachtsmarkt", zh: "圣诞市集", pos: "der", plural: "¨-e", topic: "天气四季" },
  { de: "Ostern / Weihnachten", zh: "复活节 / 圣诞节", pos: "das", topic: "天气四季" },
  { de: "das Oktoberfest", zh: "慕尼黑啤酒节", pos: "das", topic: "天气四季" },
  { de: "heiß / kalt / mild / kühl", zh: "热 / 冷 / 温和 / 凉爽", pos: "adj", topic: "天气四季" },
  { de: "blühen", zh: "开花", pos: "verb", topic: "天气四季" },
  { de: "wandern", zh: "徒步", pos: "verb", topic: "天气四季" },
  // 交通问路
  { de: "der Zug", zh: "火车", pos: "der", plural: "¨-e", ipa: "[tsuːk]", topic: "交通问路" },
  { de: "der Bus", zh: "公交车", pos: "der", plural: "-se", topic: "交通问路" },
  { de: "das Fahrrad", zh: "自行车", pos: "das", plural: "¨-er", topic: "交通问路" },
  { de: "die U-Bahn", zh: "地铁", pos: "die", plural: "-en", topic: "交通问路" },
  { de: "der Bahnhof", zh: "火车站", pos: "der", plural: "¨-e", ipa: "[ˈbaːnˌhoːf]", topic: "交通问路" },
  { de: "die Ampel", zh: "红绿灯", pos: "die", plural: "-n", topic: "交通问路" },
  { de: "die Kreuzung", zh: "十字路口", pos: "die", plural: "-en", topic: "交通问路" },
  { de: "die Ecke", zh: "拐角", pos: "die", plural: "-n", topic: "交通问路" },
  { de: "die Brücke", zh: "桥", pos: "die", plural: "-n", topic: "交通问路" },
  { de: "der Tunnel", zh: "隧道", pos: "der", plural: "-", topic: "交通问路" },
  { de: "der Zebrastreifen", zh: "斑马线", pos: "der", plural: "-", topic: "交通问路" },
  { de: "der Bäcker", zh: "面包店", pos: "der", plural: "-", topic: "交通问路" },
  { de: "der Metzger", zh: "肉铺", pos: "der", plural: "-", topic: "交通问路" },
  { de: "das Schwimmbad", zh: "游泳馆", pos: "das", plural: "¨-er", topic: "交通问路" },
  { de: "die Arztpraxis", zh: "诊所", pos: "die", plural: "-praxen", topic: "交通问路" },
  { de: "der Wald", zh: "森林", pos: "der", plural: "¨-er", topic: "交通问路" },
  { de: "die Bank", zh: "银行", pos: "die", plural: "-en", topic: "交通问路" },
  { de: "der Supermarkt", zh: "超市", pos: "der", plural: "¨-e", topic: "交通问路" },
  { de: "die Wegbeschreibung", zh: "路线描述；指路", pos: "die", plural: "-en", topic: "交通问路" },
  { de: "gehen / fahren", zh: "步行 / 乘车（du fährst）", pos: "verb", topic: "交通问路" },
  { de: "links / rechts / geradeaus", zh: "左 / 右 / 直走", pos: "adv", topic: "交通问路" },
  { de: "neben / gegenüber / zwischen", zh: "旁边 / 对面 / 之间（+ Dativ）", pos: "phrase", topic: "交通问路" },
  { de: "vorbei / bis", zh: "经过 / 直到", pos: "adv", topic: "交通问路" },
  // 办公通勤
  { de: "der Tacker", zh: "订书机", pos: "der", plural: "-", ipa: "[ˈtakɐ]", topic: "办公通勤" },
  { de: "das Notizbuch", zh: "笔记本", pos: "das", plural: "¨-er", topic: "办公通勤" },
  { de: "das Fenster", zh: "窗户", pos: "das", plural: "-", topic: "办公通勤" },
  { de: "der Ordner", zh: "文件夹", pos: "der", plural: "-", topic: "办公通勤" },
  { de: "der Stift", zh: "笔", pos: "der", plural: "-e", topic: "办公通勤" },
  { de: "das Lineal", zh: "直尺", pos: "das", plural: "-e", topic: "办公通勤" },
  { de: "der Drucker", zh: "打印机", pos: "der", plural: "-", topic: "办公通勤" },
  { de: "die Pflanze", zh: "植物", pos: "die", plural: "-n", topic: "办公通勤" },
  { de: "der Radiergummi", zh: "橡皮擦", pos: "der", plural: "-s", topic: "办公通勤" },
  { de: "das Meeting", zh: "会议", pos: "das", plural: "-s", topic: "办公通勤" },
  { de: "die Arbeit", zh: "工作；论文", pos: "die", plural: "-en", topic: "办公通勤" },
  { de: "die E-Mail", zh: "电子邮件", pos: "die", plural: "-s", topic: "办公通勤" },
  { de: "die Überstunde", zh: "加班（常复数）", pos: "die", plural: "-n", topic: "办公通勤" },
  { de: "der Zufall", zh: "巧合", pos: "der", plural: "¨-e", topic: "办公通勤" },
  { de: "zufällig", zh: "随机的；凑巧的", pos: "adj", topic: "办公通勤" },
  { de: "früh / länger", zh: "早 / 更久（lang 比较级）", pos: "adv", topic: "办公通勤" },
  { de: "suchen / brauchen", zh: "寻找 / 需要（+ 第四格）", pos: "verb", topic: "办公通勤" },
  { de: "telefonieren", zh: "打电话", pos: "verb", topic: "办公通勤" },
  { de: "präsentieren", zh: "展示；汇报", pos: "verb", topic: "办公通勤" },
  { de: "funktionieren", zh: "运转；工作（机器）", pos: "verb", topic: "办公通勤" },
  { de: "bleiben", zh: "停留；留下", pos: "verb", ipa: "[ˈblaɪ̯bn̩]", topic: "办公通勤" },
  // 实验室（A1.2-1）
  { de: "das Labor", zh: "实验室", pos: "das", plural: "-e", ipa: "[laˈboːɐ̯]", topic: "实验室" },
  { de: "der Laborkittel", zh: "实验服；白大褂", pos: "der", plural: "-", topic: "实验室" },
  { de: "das Mikroskop", zh: "显微镜", pos: "das", plural: "-e", topic: "实验室" },
  { de: "die Pflanzenzelle", zh: "植物细胞", pos: "die", plural: "-n", topic: "实验室" },
  { de: "die Probe", zh: "样品；样本", pos: "die", plural: "-n", ipa: "[ˈpʁoːbə]", topic: "实验室" },
  { de: "das Experiment", zh: "实验", pos: "das", plural: "-e", topic: "实验室" },
  { de: "der Arbeitsplatz", zh: "工作台；工位", pos: "der", plural: "¨-e", topic: "实验室" },
  { de: "die Pause", zh: "休息", pos: "die", plural: "-n", topic: "实验室" },
  { de: "der Kollege / die Kollegin", zh: "同事（男/女）", pos: "der", plural: "-n/-innen", topic: "实验室" },
  { de: "die Kantine", zh: "食堂", pos: "die", plural: "-n", topic: "实验室" },
  { de: "die Besprechung", zh: "会议；讨论会", pos: "die", plural: "-en", topic: "实验室" },
  { de: "das Ergebnis", zh: "结果", pos: "das", plural: "-se", topic: "实验室" },
  { de: "der Bericht", zh: "报告", pos: "der", plural: "-e", topic: "实验室" },
  { de: "untersuchen", zh: "检测；研究", pos: "verb", topic: "实验室" },
  { de: "kontrollieren", zh: "检查", pos: "verb", topic: "实验室" },
  { de: "beobachten", zh: "观察", pos: "verb", topic: "实验室" },
  { de: "entdecken", zh: "发现", pos: "verb", topic: "实验室" },
  { de: "anziehen", zh: "穿上（可分）", pos: "verb", topic: "实验室" },
  { de: "vorbereiten", zh: "准备（可分）", pos: "verb", topic: "实验室" },
  { de: "aufschreiben", zh: "记录；写下（可分）", pos: "verb", topic: "实验室" },
  { de: "aufräumen", zh: "整理（可分）", pos: "verb", topic: "实验室" },
  { de: "einschalten", zh: "打开（设备，可分）", pos: "verb", topic: "实验室" },
  { de: "Feierabend machen", zh: "下班（地道表达）", pos: "phrase", topic: "实验室" },
  { de: "zuerst / dann / danach", zh: "首先 / 然后 / 之后", pos: "adv", topic: "实验室" },
  { de: "manchmal / meistens", zh: "有时 / 通常", pos: "adv", topic: "实验室" },
  { de: "schwierig / langweilig", zh: "困难的 / 无聊的", pos: "adj", topic: "实验室" },
  // 完成时（A1.2-2）
  { de: "die Biologin", zh: "女生物学家", pos: "die", plural: "-innen", topic: "完成时" },
  { de: "das Forschungslabor", zh: "研究实验室", pos: "das", plural: "-e", topic: "完成时" },
  { de: "das Lebensmittel", zh: "食品", pos: "das", plural: "-", topic: "完成时" },
  { de: "der Mikroorganismus", zh: "微生物", pos: "der", plural: "-men", topic: "完成时" },
  { de: "die Molkerei", zh: "乳品厂", pos: "die", plural: "-en", topic: "完成时" },
  { de: "der Behälter", zh: "容器", pos: "der", plural: "-", topic: "完成时" },
  { de: "die Bakterie", zh: "细菌", pos: "die", plural: "-n", topic: "完成时" },
  { de: "die Nummer", zh: "编号；号码", pos: "die", plural: "-n", topic: "完成时" },
  { de: "die Menge", zh: "量；数量", pos: "die", plural: "-n", topic: "完成时" },
  { de: "das Gerät", zh: "仪器；设备", pos: "das", plural: "-e", topic: "完成时" },
  { de: "der Joghurt", zh: "酸奶", pos: "der", plural: "-s", topic: "完成时" },
  { de: "der Urlaub", zh: "假期", pos: "der", plural: "-e", topic: "完成时" },
  { de: "die Untersuchung", zh: "检测；检查", pos: "die", plural: "-en", topic: "完成时" },
  { de: "die Teamleiterin", zh: "团队主管（女）", pos: "die", plural: "-innen", topic: "完成时" },
  { de: "eintragen", zh: "录入；登记（可分）", pos: "verb", topic: "完成时" },
  { de: "wiederholen", zh: "重复（不可分）", pos: "verb", topic: "完成时" },
  { de: "erzählen", zh: "讲述（不可分 er-）", pos: "verb", topic: "完成时" },
  { de: "entscheiden", zh: "决定（不可分 ent-）", pos: "verb", topic: "完成时" },
  { de: "reinigen", zh: "清洗；清洁", pos: "verb", topic: "完成时" },
  { de: "wegräumen", zh: "收走；归位（可分）", pos: "verb", topic: "完成时" },
  { de: "unerwartet / ungewöhnlich", zh: "意外的 / 不寻常的", pos: "adj", topic: "完成时" },
  { de: "zufrieden", zh: "满意的；满足的", pos: "adj", topic: "完成时" },
  { de: "trotzdem / denn", zh: "尽管如此 / 因为", pos: "adv", topic: "完成时" },
  { de: "zum Schluss", zh: "最后", pos: "phrase", topic: "完成时" }
];

const VOCAB_TOPICS = ["基础与发音", "自我介绍", "数字", "食物饮料", "休闲活动", "房屋家具", "时间作息", "服装颜色", "天气四季", "交通问路", "办公通勤", "实验室", "完成时"];

/* ------------------------------------------------------------
   三、语法专题（12 讲）
   ------------------------------------------------------------ */
const GRAMMAR = [
  {
    id: "g1", title: "动词第二位原则", de: "Verb an Position 2", tag: "语序",
    body: `
      <p class="rule">德语陈述句铁律：<strong>变位动词永远占据句子第二位</strong>。第一位放什么（主语、时间、地点）都可以，动词雷打不动。</p>
      <table>
        <tr><th>语序</th><th>结构</th><th>例句</th></tr>
        <tr><td>正装</td><td>主语 + 动词 + …</td><td><em>Ich <b>trinke</b> morgens Kaffee.</em> 我早上喝咖啡。</td></tr>
        <tr><td>倒装</td><td>状语 + 动词 + 主语 + …</td><td><em>Morgens <b>trinke</b> ich Kaffee.</em>（主语 ich 退居第三）</td></tr>
        <tr><td>倒装</td><td>地点 + 动词 + 主语</td><td><em>Im Restaurant <b>nehme</b> ich Fleisch.</em></td></tr>
      </table>
      <p class="tip">⚠️ 常见错误：<s>Morgens ich trinke Kaffee.</s> ❌ —— 时间副词抢了第一位，主语必须让位。</p>`
  },
  {
    id: "g2", title: "sein 与 haben", de: "Die zwei wichtigsten Verben", tag: "动词",
    body: `
      <p class="rule">A1 两大基石动词，不规则、必须死记。<strong>sein</strong> 描述身份与状态（+ 形容词/身份名词）；<strong>haben</strong> 表示拥有（+ 第四格名词）。</p>
      <table>
        <tr><th>人称</th><th>sein（是）</th><th>haben（有）</th></tr>
        <tr><td>ich</td><td>bin</td><td>habe</td></tr>
        <tr><td>du</td><td>bist</td><td>hast</td></tr>
        <tr><td>er/sie/es</td><td>ist</td><td>hat</td></tr>
        <tr><td>wir</td><td>sind</td><td>haben</td></tr>
        <tr><td>ihr</td><td>seid</td><td>habt</td></tr>
        <tr><td>sie/Sie</td><td>sind</td><td>haben</td></tr>
      </table>
      <p class="tip">💡 德语年龄用 sein：Ich bin 34 Jahre alt.（不说 habe）；否定形容词用 nicht，否定名词用 kein：Ich habe kein Geld.</p>`
  },
  {
    id: "g3", title: "规则动词现在时变位", de: "Regelmäßige Verben im Präsens", tag: "动词",
    body: `
      <p class="rule">公式：<strong>词干 + 人称词尾</strong>。记住口诀 <strong>「e-st-t-en-t-en」</strong> 即可套用约 90% 的德语动词。</p>
      <table>
        <tr><th>人称</th><th>词尾</th><th>kommen</th><th>wohnen</th><th>arbeiten ⚠️</th></tr>
        <tr><td>ich</td><td>-e</td><td>komme</td><td>wohne</td><td>arbeite</td></tr>
        <tr><td>du</td><td>-st</td><td>kommst</td><td>wohnst</td><td>arbeit<b>e</b>st</td></tr>
        <tr><td>er/sie/es</td><td>-t</td><td>kommt</td><td>wohnt</td><td>arbeit<b>e</b>t</td></tr>
        <tr><td>wir</td><td>-en</td><td>kommen</td><td>wohnen</td><td>arbeiten</td></tr>
        <tr><td>ihr</td><td>-t</td><td>kommt</td><td>wohnt</td><td>arbeit<b>e</b>t</td></tr>
        <tr><td>sie/Sie</td><td>-en</td><td>kommen</td><td>wohnen</td><td>arbeiten</td></tr>
      </table>
      <p class="tip">⚠️ 词干以 -t / -d 结尾（arbeiten, finden）：du / er / ihr 形式在词干与词尾之间插入 <strong>-e-</strong> 以便发音。词干以 s / z 结尾（reisen, tanzen）：du 省 s 直接加 -t → du reist, du tanzt。</p>`
  },
  {
    id: "g4", title: "强变化动词（换音与变音）", de: "Starke Verben", tag: "动词",
    body: `
      <p class="rule">强变化动词<strong>只在 du 和 er/sie/es</strong> 两个人称变身，其余人称（含全部复数）保持原样。</p>
      <table>
        <tr><th>类型</th><th>动词</th><th>du</th><th>er/sie/es</th></tr>
        <tr><td>e → ie</td><td>lesen 阅读</td><td>l<b>ie</b>st（词干 s，省 s）</td><td>l<b>ie</b>st</td></tr>
        <tr><td>e → ie</td><td>sehen 看</td><td>s<b>ie</b>hst</td><td>s<b>ie</b>ht</td></tr>
        <tr><td>e → i</td><td>essen 吃</td><td><b>i</b>sst</td><td><b>i</b>sst</td></tr>
        <tr><td>e → i</td><td>sprechen 说</td><td>spr<b>i</b>chst</td><td>spr<b>i</b>cht</td></tr>
        <tr><td>e → i</td><td>treffen 见面</td><td>tr<b>i</b>ffst</td><td>tr<b>i</b>fft</td></tr>
        <tr><td>a → ä</td><td>fahren 乘/驾</td><td>f<b>ä</b>hrst</td><td>f<b>ä</b>hrt</td></tr>
        <tr><td>a → ä</td><td>schlafen 睡</td><td>schl<b>ä</b>fst</td><td>schl<b>ä</b>ft</td></tr>
        <tr><td>a → ä</td><td>tragen 穿戴</td><td>tr<b>ä</b>gst</td><td>tr<b>ä</b>gt</td></tr>
      </table>
      <p class="tip">💡 nehmen 双重变化：du n<b>imm</b>st, er n<b>imm</b>t（e→i 且 h→mm）。</p>`
  },
  {
    id: "g5", title: "可分离动词", de: "Trennbare Verben", tag: "动词",
    body: `
      <p class="rule">带 <strong>an-, auf-, ein-, vor-, fern-, weg-</strong> 等重读前缀的动词，在一般现在时陈述句中拆成两半：基础动词变位居第二位，<strong>前缀甩到句子最末尾</strong>。</p>
      <table>
        <tr><th>动词</th><th>释义</th><th>例句</th></tr>
        <tr><td>aufstehen</td><td>起床</td><td><em>Ich <b>stehe</b> um 7 Uhr <b>auf</b>.</em></td></tr>
        <tr><td>fernsehen</td><td>看电视</td><td><em>Abends <b>sehe</b> ich <b>fern</b>.</em>（还叠加换音）</td></tr>
        <tr><td>einkaufen</td><td>购物</td><td><em>Ich <b>kaufe</b> am Samstag <b>ein</b>.</em></td></tr>
        <tr><td>anziehen</td><td>穿上</td><td><em>Ich <b>ziehe</b> meinen Laborkittel <b>an</b>.</em></td></tr>
        <tr><td>aufräumen</td><td>整理</td><td><em>... <b>räume</b> ich meinen Arbeitsplatz <b>auf</b>.</em></td></tr>
        <tr><td>einschalten</td><td>打开设备</td><td><em>Zuerst <b>schalte</b> ich meinen Computer <b>ein</b>.</em></td></tr>
      </table>
      <p class="tip">💡 在疑问句中同样分离：Wann <b>stehen</b> Sie <b>auf</b>?（您几点起床？）</p>`
  },
  {
    id: "g6", title: "名词词性 der / die / das", de: "Genus der Substantive", tag: "名词",
    body: `
      <p class="rule">德语名词首字母<strong>永远大写</strong>，且每个名词都有性别（阳 der / 阴 die / 中 das）。背单词必须连同冠词与复数一起记。</p>
      <table>
        <tr><th>规律</th><th>示例</th></tr>
        <tr><td>复合词词性 = 最后一个词的词性</td><td>das Zimmer → das Wohnzimmer；das Fleisch → das Rindfleisch；die Butter → die Erdnussbutter</td></tr>
        <tr><td>-chen 指小词 → 永远 das</td><td>das Hähnchen, das Eichhörnchen</td></tr>
        <tr><td>-ung / -heit / -keit / -schaft → die</td><td>die Wohnung, die Besprechung, die Untersuchung</td></tr>
        <tr><td>季节 / 月份 / 星期 → der</td><td>der Frühling, der Sommer, der Herbst, der Winter</td></tr>
      </table>
      <p class="tip">💡 本手册用颜色标记：<span class="gd-der">der 蓝</span> / <span class="gd-die">die 红</span> / <span class="gd-das">das 绿</span>。</p>`
  },
  {
    id: "g7", title: "第四格 Akkusativ", de: "Der Akkusativ", tag: "格",
    body: `
      <p class="rule">直接宾语用第四格。<strong>只有阳性名词的冠词会变</strong>：der → den，ein → einen；阴性和中性保持不变。</p>
      <table>
        <tr><th>词性</th><th>定冠词</th><th>不定冠词</th><th>例句</th></tr>
        <tr><td>阳性 der</td><td>der → <b>den</b></td><td>ein → <b>einen</b></td><td><em>Ich nehme <b>einen</b> Kaffee. / Ich brauche <b>einen</b> Tacker.</em></td></tr>
        <tr><td>阴性 die</td><td>die（不变）</td><td>eine（不变）</td><td><em>Ich hätte gern <b>eine</b> Pizza.</em></td></tr>
        <tr><td>中性 das</td><td>das（不变）</td><td>ein（不变）</td><td><em>Ich hätte gern <b>ein</b> Wasser.</em></td></tr>
      </table>
      <p class="tip">💡 典型动词：haben, essen, trinken, nehmen, brauchen, suchen, kaufen。es gibt 后面也接第四格：Es gibt <b>einen</b> Tisch.</p>`
  },
  {
    id: "g8", title: "第三格与常用介词", de: "Der Dativ & Präpositionen", tag: "格",
    body: `
      <p class="rule">第三格冠词：der → dem，das → dem，die → der。以下三组高频介词固定接第三格：</p>
      <table>
        <tr><th>场景</th><th>介词</th><th>例句</th></tr>
        <tr><td>交通方式</td><td><b>mit</b> + Dativ</td><td><em>mit <b>dem</b> Bus / mit <b>der</b> U-Bahn</em>（步行特例：zu Fuß）</td></tr>
        <tr><td>去某处（动态）</td><td><b>zu</b> + Dativ</td><td>zu + dem = <b>zum</b> Bahnhof；zu + der = <b>zur</b> Apotheke</td></tr>
        <tr><td>在某处（静态）</td><td><b>in</b> + Dativ</td><td>in + dem = <b>im</b> Wohnzimmer；<b>in der</b> Küche（阴性无缩写）</td></tr>
        <tr><td>方位关系</td><td>neben / gegenüber / zwischen</td><td><em>neben <b>dem</b> Bäcker / gegenüber <b>der</b> Bank / zwischen <b>dem</b> Supermarkt und <b>dem</b> Krankenhaus</em></td></tr>
      </table>
      <p class="tip">⚠️ 绝不能写 <s>im Küche</s> —— die Küche 是阴性，只能是 <strong>in der Küche</strong>。</p>`
  },
  {
    id: "g9", title: "时间表达 Uhrzeit", de: "Wie spät ist es?", tag: "表达",
    body: `
      <p class="rule">口语用 12 小时制，以 30 分为分水岭；过了 30 分，<strong>小时数看向下一个整点</strong>。</p>
      <table>
        <tr><th>时间</th><th>口语表达</th><th>逻辑</th></tr>
        <tr><td>08:00</td><td>Es ist acht Uhr.</td><td>整点 + Uhr</td></tr>
        <tr><td>08:15</td><td>Viertel <b>nach</b> acht.</td><td>8 点过了一刻</td></tr>
        <tr><td>08:30</td><td><b>halb neun</b>. ⚠️</td><td>「通往 9 点的一半」= 8:30，不是 9:30！</td></tr>
        <tr><td>08:45</td><td>Viertel <b>vor</b> neun.</td><td>差一刻到 9 点（小时 +1）</td></tr>
        <tr><td>19:45</td><td>Viertel vor acht.</td><td>晚 7:45 → 差一刻到 8 点</td></tr>
      </table>
      <p class="tip">💡 正式场合（车站广播等）直接念数字：10:30 = zehn Uhr dreißig。「在几点」用介词 um：um 8 Uhr。</p>`
  },
  {
    id: "g10", title: "喜好表达 gern", de: "Gefallen ausdrücken", tag: "表达",
    body: `
      <p class="rule">表达「喜欢做某事」不需要单独动词，直接在变位动词后加副词 <strong>gern</strong>：</p>
      <table>
        <tr><th>程度</th><th>结构</th><th>例句</th></tr>
        <tr><td>喜欢</td><td>动词 + gern</td><td><em>Ich lese gern. / Ich esse gern Salat.</em></td></tr>
        <tr><td>非常喜欢</td><td>动词 + sehr gern</td><td><em>Ich schwimme sehr gern.</em></td></tr>
        <tr><td>不喜欢</td><td>动词 + nicht gern</td><td><em>Ich tanze nicht gern.</em></td></tr>
      </table>
      <p class="tip">💡 提问分场合：Was machst <b>du</b> gern?（朋友）/ Was machen <b>Sie</b> gern?（尊称）。点餐想要某物用虚拟式：Ich <b>hätte gern</b> …</p>`
  },
  {
    id: "g11", title: "疑问词与从句预热", de: "W-Fragen & Nebensätze", tag: "进阶",
    body: `
      <p class="rule">复合疑问词 = <strong>Wo(r) + 介词</strong>，用来对「工具、话题」提问；wenn / weil / bevor 引导的从句中动词甩到句末。</p>
      <table>
        <tr><th>疑问词</th><th>含义</th><th>问答</th></tr>
        <tr><td>Womit</td><td>用什么（工具/手段）</td><td><em>Womit untersucht er die Zellen? — Mit einem Mikroskop.</em></td></tr>
        <tr><td>Worüber</td><td>关于什么</td><td><em>Worüber sprechen sie? — Über neue Projekte.</em></td></tr>
        <tr><td>Wann / Um wie viel Uhr</td><td>什么时候 / 几点</td><td><em>Wann stehen Sie auf?</em></td></tr>
      </table>
      <table>
        <tr><th>连词</th><th>例句（从句动词后置）</th></tr>
        <tr><td>wenn 当…时</td><td><em>Wenn ich ins Labor <b>komme</b>, ziehe ich meinen Kittel an.</em></td></tr>
        <tr><td>bevor 在…之前</td><td><em>Bevor ich nach Hause <b>gehe</b>, räume ich auf.</em></td></tr>
        <tr><td>weil 因为</td><td><em>..., weil es immer etwas Neues zu entdecken <b>gibt</b>.</em></td></tr>
      </table>`
  },
  {
    id: "g12", title: "现在完成时 Das Perfekt", de: "haben/sein + Partizip II", tag: "时态",
    body: `
      <p class="rule">口语中表达「过去发生的事」的核心时态。<strong>框架结构</strong>：助动词（第二位）+ … + 第二分词（句末）。</p>
      <table>
        <tr><th>助动词</th><th>适用动词</th><th>示例</th></tr>
        <tr><td><b>haben</b>（约 80–90%）</td><td>及物动词；无位移/状态变化的动词；反身与无人称动词</td><td><em>Sie <b>hat</b> den Computer eingeschaltet.</em></td></tr>
        <tr><td><b>sein</b></td><td>位置移动（kommen, gehen, fahren）；状态改变（aufstehen, einschlafen, werden）；sein / bleiben / passieren 本身</td><td><em>Sie <b>ist</b> ins Labor gekommen.</em></td></tr>
      </table>
      <table>
        <tr><th>Partizip II 类型</th><th>构成</th><th>示例</th></tr>
        <tr><td>规则（弱变化）</td><td>ge- + 词干 + (e)t</td><td>machen → <b>gemacht</b>；arbeiten → <b>gearbeitet</b></td></tr>
        <tr><td>强变化</td><td>ge- + 变音词干 + en</td><td>kommen → <b>gekommen</b>；trinken → <b>getrunken</b>；helfen → <b>geholfen</b></td></tr>
        <tr><td>可分动词</td><td>前缀 + ge + 词干</td><td>einschalten → <b>eingeschaltet</b>；aufräumen → <b>aufgeräumt</b></td></tr>
        <tr><td>不加 ge-</td><td>-ieren 结尾；不可分前缀 be-, er-, ent-, ver-, unter-, wieder-</td><td>kontrollieren → <b>kontrolliert</b>；benutzen → <b>benutzt</b>；erzählen → <b>erzählt</b></td></tr>
      </table>
      <p class="tip">💡 描述状态时可用 sein 的过去时 war 代替完成时：Am Abend <b>war</b> Mia müde.</p>`
  }
];

/* ------------------------------------------------------------
   四、课文阅读（2 篇，逐段中德对照）
   ------------------------------------------------------------ */
const TEXTS = [
  {
    id: "t1",
    title: "实验室里的一天", de: "Ein Tag im Labor",
    level: "A1 → A2 过渡", date: "2026-08-31",
    intro: "以生物学家 Daniel 的日常工作为蓝本的叙事范文，按时间顺序展开，是现在时、可分离动词与倒装语序的综合演练。",
    paragraphs: [
      { title: "开场介绍", de: "Mein Name ist Daniel. Ich bin 38 Jahre alt und arbeite als Biologe in einem Labor. Ich interessiere mich besonders für Pflanzen und Zellen.", zh: "我叫 Daniel。我 38 岁，在实验室担任生物学家。我对植物和细胞特别感兴趣。" },
      { title: "早晨准备", de: "Mein Arbeitstag beginnt um 8:00 Uhr. Wenn ich ins Labor komme, ziehe ich zuerst meinen Laborkittel an. Dann wasche ich meine Hände und bereite meinen Arbeitsplatz vor.", zh: "我的工作日 8 点开始。到实验室时，我先穿上实验服，然后洗手并准备工作台。", verbs: ["anziehen 穿上（可分）", "vorbereiten 准备（可分）", "Wenn 从句：动词 komme 后置"] },
      { title: "上午工作", de: "Am Morgen kontrolliere ich meine Experimente. Ich untersuche Pflanzenzellen und arbeite oft mit einem Mikroskop. Unter dem Mikroskop kann ich sehr kleine Dinge sehen, die man mit den Augen nicht sehen kann.", zh: "早上我检查实验。我研究植物细胞，经常用显微镜工作。在显微镜下我能看到肉眼看不见的微小东西。", verbs: ["Am Morgen 开头 → 倒装", "unter + Dativ（静态位置）"] },
      { title: "做记录", de: "Ich mache auch viele Notizen. Für jedes Experiment schreibe ich auf, was ich mache und was ich beobachte. Das ist sehr wichtig für meine Arbeit.", zh: "我也做很多笔记。每个实验我都记下我做了什么、观察到了什么。这对我的工作非常重要。", verbs: ["aufschreiben 记录（可分）", "Notizen machen 做笔记"] },
      { title: "茶歇交流", de: "Gegen 10:30 Uhr mache ich eine kurze Pause. Ich trinke einen Kaffee und spreche mit meinen Kollegen. Wir sprechen über unsere Arbeit, aber manchmal auch über das Wochenende oder unsere Familien.", zh: "10 点半左右我短暂休息。我喝杯咖啡，和同事们聊天。我们聊工作，有时也聊周末或家人。", verbs: ["gegen + 时间 ≈ 将近", "sprechen über + Akk 谈论"] },
      { title: "返回实验室", de: "Danach gehe ich zurück ins Labor. Manchmal bereite ich neue Experimente vor. Ich benutze verschiedene Geräte und untersuche Proben. Eine Probe kann zum Beispiel ein kleines Stück von einer Pflanze sein.", zh: "之后我回到实验室。有时我准备新实验。我使用各种仪器并检测样品。样品可以是比如一小块植物。" },
      { title: "午休", de: "Um 12:30 Uhr mache ich Mittagspause. Meistens esse ich mit meinen Kollegen in der Kantine.", zh: "12 点半我午休。我通常和同事们在食堂吃饭。", verbs: ["12:30 口语 = halb eins"] },
      { title: "下午工作", de: "Am Nachmittag arbeite ich oft am Computer. Ich sehe mir die Ergebnisse meiner Experimente an und schreibe Berichte. Manchmal haben wir auch eine Besprechung. Dann sprechen wir über neue Projekte und unsere Forschung.", zh: "下午我常在电脑前工作。我查看实验结果、撰写报告。有时我们也开会，讨论新项目和研究。", verbs: ["ansehen 查看（可分）", "eine Besprechung haben 开会"] },
      { title: "下班收尾", de: "Um 17:00 Uhr ist mein Arbeitstag normalerweise zu Ende. Bevor ich nach Hause gehe, räume ich meinen Arbeitsplatz auf und kontrolliere noch einmal meine Experimente.", zh: "我的工作日常在 17 点结束。回家前，我整理工作台并再次检查实验。", verbs: ["aufräumen 整理（可分）", "Bevor 从句：动词 gehe 后置"] },
      { title: "总结感受", de: "Meine Arbeit ist manchmal schwierig, aber sie ist nie langweilig. Ich mag Biologie, weil es immer etwas Neues zu entdecken gibt.", zh: "我的工作有时很难，但从不无聊。我喜欢生物学，因为总有新东西可以发现。", verbs: ["weil 从句：动词 gibt 后置"] }
    ]
  },
  {
    id: "t2",
    title: "实验室里特殊的一天", de: "Ein besonderer Tag im Labor",
    level: "A1.2 · Das Perfekt", date: "2026-10-07",
    intro: "Mia 在食品检测实验室的一天——全文以现在完成时写成，是巩固 haben/sein + Partizip II 框架结构的最佳范本。",
    paragraphs: [
      { title: "背景介绍", de: "Mia arbeitet als Biologin in einem kleinen Forschungslabor. Dort untersucht sie Lebensmittel und Mikroorganismen. Gestern hat sie einen besonders interessanten Arbeitstag gehabt.", zh: "Mia 在一家小型研究实验室担任生物学家。她在那里检测食品和微生物。昨天，她度过了特别有趣的一个工作日。", verbs: ["hat … gehabt（haben 的完成时）"] },
      { title: "早晨的准备", de: "Am Morgen ist Mia schon um 7:15 Uhr ins Labor gekommen. Sie hat zuerst ihren Computer eingeschaltet und ihre E-Mails gelesen. Danach hat sie ihren Laborkittel angezogen und ihre Hände gewaschen.", zh: "早上 7:15，Mia 就来到了实验室。她首先打开电脑、读了电子邮件。之后她穿上实验服并洗了手。", verbs: ["ist … gekommen（位移 → sein）", "hat … eingeschaltet（可分）", "hat … gelesen", "hat … angezogen（可分）", "hat … gewaschen"] },
      { title: "检查与登记样品", de: "Auf ihrem Tisch haben mehrere Proben aus einer Molkerei gestanden. Mia sollte untersuchen, ob in den Proben bestimmte Bakterien vorhanden sind. Zuerst hat sie alle Behälter kontrolliert und die Nummern der Proben notiert.", zh: "她的桌上放着几份来自乳品厂的样品。Mia 需要检测样品中是否存在特定细菌。首先，她检查了所有容器，并记录了样品编号。", verbs: ["haben … gestanden（stehen）", "hat … kontrolliert（-ieren 无 ge-）", "hat … notiert（-ieren 无 ge-）"] },
      { title: "准备与同事协助", de: "Danach hat Mia kleine Mengen der Proben vorbereitet. Sie hat verschiedene Geräte benutzt und sehr genau gearbeitet. Eine Kollegin namens Elena ist später ins Labor gekommen und hat Mia bei der Arbeit geholfen.", zh: "随后，Mia 准备了少量样品。她使用了不同的仪器，工作非常细致。同事 Elena 随后来到实验室，协助了 Mia 的工作。", verbs: ["hat … vorbereitet（可分）", "hat … benutzt（be- 无 ge-）", "hat … gearbeitet", "ist … gekommen（sein）", "hat … geholfen（强变化 e→o）"] },
      { title: "休息与交流", de: "Gegen 10:00 Uhr haben die beiden eine kurze Pause gemacht. Mia hat einen Kaffee getrunken und Elena hat einen Joghurt gegessen. Dabei haben sie über ihren Urlaub und ihre Pläne für das Wochenende gesprochen.", zh: "10 点左右，两人短暂休息。Mia 喝了杯咖啡，Elena 吃了盒酸奶。期间她们聊到了假期和周末计划。", verbs: ["haben … gemacht", "hat … getrunken（i→u）", "hat … gegessen", "haben … gesprochen（e→o）"] },
      { title: "进一步检测与异常发现", de: "Nach der Pause haben Mia und Elena die Proben weiter untersucht. Bei einer Probe haben sie ein unerwartetes Ergebnis gefunden. Deshalb haben sie die Untersuchung noch einmal wiederholt.", zh: "休息过后，Mia 和 Elena 继续检测样品。在一份样品中，她们发现了一个意料之外的结果。因此她们把检测重新做了一遍。", verbs: ["haben … untersucht（unter- 无 ge-）", "haben … gefunden（i→u）", "haben … wiederholt（wieder- 无 ge-）"] },
      { title: "午餐与录入数据", de: "Um 12:30 Uhr sind sie in die Kantine gegangen. Nach dem Mittagessen ist Mia zurück ins Labor gegangen. Dort hat sie die neuen Ergebnisse am Computer eingetragen.", zh: "12:30 她们去了食堂。午饭后 Mia 回到实验室，在电脑上录入了新的结果。", verbs: ["sind … gegangen（位移 → sein）", "hat … eingetragen（可分）"] },
      { title: "汇报与决策", de: "Am Nachmittag hat Mia mit ihrer Teamleiterin telefoniert. Sie hat ihr von dem ungewöhnlichen Ergebnis erzählt. Die Teamleiterin hat entschieden, dass das Team am nächsten Tag weitere Tests machen soll.", zh: "下午，Mia 和团队主管通了电话，讲述了这一异常结果。主管决定团队第二天做进一步测试。", verbs: ["hat … telefoniert（-ieren 无 ge-）", "hat … erzählt（er- 无 ge-）", "hat … entschieden（ent- 无 ge-）"] },
      { title: "整理与下班", de: "Zum Schluss hat Mia ihren Arbeitsplatz aufgeräumt, die Geräte gereinigt und die Proben sicher weggeräumt. Um 16:30 Uhr ist sie mit dem Fahrrad nach Hause gefahren.", zh: "最后，Mia 整理了工作台、清洗了仪器，并将样品安全归位。16:30 她骑自行车回家了。", verbs: ["hat … aufgeräumt（可分）", "hat … gereinigt", "hat … weggeräumt（可分）", "ist … gefahren（位移 → sein）"] },
      { title: "总结与感受", de: "Am Abend war Mia müde. Trotzdem war sie zufrieden, denn sie hat an diesem Tag etwas Neues gelernt.", zh: "晚上 Mia 很累，但她依然很满足，因为这一天她学到了新东西。", verbs: ["war（sein 过去时，表状态）", "hat … gelernt"] }
    ]
  }
];

/* ------------------------------------------------------------
   五、互动练习（5 组测验）
   ------------------------------------------------------------ */
const QUIZZES = [
  {
    id: "q1", title: "动词变位", de: "Konjugation", desc: "现在时人称变位：规则、强变化、sein/haben",
    questions: [
      { q: "ich ___ (kommen)", options: ["komme", "kommst", "kommt", "kommen"], answer: 0, explain: "ich + 词尾 -e" },
      { q: "du ___ (lesen)", options: ["leset", "lest", "liest", "lesest"], answer: 2, explain: "lesen 换音 e→ie，词干以 s 结尾省 s：du liest" },
      { q: "er ___ (fahren)", options: ["fahrt", "fährt", "fahret", "fährst"], answer: 1, explain: "fahren 变音 a→ä：er fährt" },
      { q: "du ___ (sein)", options: ["bin", "bist", "ist", "seid"], answer: 1, explain: "sein 不规则：du bist" },
      { q: "er/sie/es ___ (haben)", options: ["habe", "hast", "hat", "habt"], answer: 2, explain: "haben：er hat" },
      { q: "wir ___ (arbeiten)", options: ["arbeitet", "arbeite", "arbeiten", "arbeitest"], answer: 2, explain: "wir 与动词原形一致：arbeiten" },
      { q: "du ___ (arbeiten)", options: ["arbeitst", "arbeitest", "arbeitet", "arbeite"], answer: 1, explain: "词干 -t 结尾插入 -e-：du arbeitest" },
      { q: "ihr ___ (essen)", options: ["isst", "esst", "esset", "esst ihr"], answer: 1, explain: "强变化只影响 du 和 er/sie/es，ihr 不变：ihr esst" },
      { q: "er ___ (schlafen)", options: ["schlaft", "schläft", "schlafet", "schlefet"], answer: 1, explain: "schlafen 变音 a→ä：er schläft" },
      { q: "ich ___ gern ___. (fernsehen 可分)", options: ["fernsehe / —", "sehe / fern", "fern / sehe", "siehe / fern"], answer: 1, explain: "前缀 fern 甩句尾：Ich sehe gern fern." }
    ]
  },
  {
    id: "q2", title: "数字 Zahlen", de: "0 – 100", desc: "词干缩减、ß 特例与个位先说的颠倒逻辑",
    questions: [
      { q: "16", options: ["sechszehn", "sechzehn", "sechzig", "sechzenhn"], answer: 1, explain: "sechs 去 s → sechzehn" },
      { q: "17", options: ["siebenzehn", "siebzig", "siebzehn", "siebentzehn"], answer: 2, explain: "sieben 去 en → siebzehn" },
      { q: "30", options: ["dreizig", "dreißig", "dreisig", "dreissig"], answer: 1, explain: "唯一用 ß 的整十数：dreißig" },
      { q: "21", options: ["einsundzwanzig", "einundzwanzig", "zwanzigeins", "einundzwanzsig"], answer: 1, explain: "组合中 1 脱 s → einundzwanzig" },
      { q: "34", options: ["dreiundvierzig", "vierunddreißig", "vierunddreizig", "dreißigvier"], answer: 1, explain: "4 + und + 30：vierunddreißig" },
      { q: "79", options: ["siebenundneunzig", "neunundsiebenzig", "neunundsiebzig", "siebzigundneun"], answer: 2, explain: "9 + und + 70：neunundsiebzig" },
      { q: "66", options: ["sechzigsechs", "sechsundsechzig", "sechundsechzig", "sechsundsechsig"], answer: 1, explain: "6 + und + 60：sechsundsechzig" },
      { q: "100", options: ["zehnzig", "hundert", "einhundret", "hunderd"], answer: 1, explain: "100 = hundert" }
    ]
  },
  {
    id: "q3", title: "时间 Uhrzeit", de: "halb 陷阱特训", desc: "口语报时：Viertel nach / halb / Viertel vor",
    questions: [
      { q: "08:30", options: ["halb acht", "halb neun", "acht Uhr halb", "neun Uhr dreißig"], answer: 1, explain: "⚠️ halb 看下一个小时：halb neun = 8:30" },
      { q: "08:15", options: ["Viertel vor acht", "Viertel nach acht", "halb acht", "acht Viertel"], answer: 1, explain: "过了一刻：Viertel nach acht" },
      { q: "08:45", options: ["Viertel nach neun", "Viertel vor acht", "Viertel vor neun", "drei Viertel acht"], answer: 2, explain: "差一刻到 9 点（小时 +1）：Viertel vor neun" },
      { q: "07:30", options: ["halb sieben", "halb acht", "sieben Uhr dreißig nach", "halb neun"], answer: 1, explain: "通往 8 点的一半：halb acht" },
      { q: "12:30", options: ["halb zwölf", "halb eins", "zwölf Uhr halb", "halb zwei"], answer: 1, explain: "通往 1 点的一半：halb eins" },
      { q: "19:45", options: ["Viertel vor sieben", "Viertel nach acht", "Viertel vor acht", "Viertel vor neun"], answer: 2, explain: "晚 7:45 = 差一刻到 8 点：Viertel vor acht" },
      { q: "10:15", options: ["Viertel nach zehn", "Viertel vor zehn", "halb zehn", "Viertel nach elf"], answer: 0, explain: "10 点过一刻：Viertel nach zehn" },
      { q: "04:30", options: ["halb vier", "halb fünf", "vier Uhr dreißig nach", "Viertel vor fünf"], answer: 1, explain: "通往 5 点的一半：halb fünf" }
    ]
  },
  {
    id: "q4", title: "现在完成时", de: "Das Perfekt", desc: "haben/sein 选择与 Partizip II 构成",
    questions: [
      { q: "kommen → ?", options: ["hat gekommt", "ist gekommen", "hat gekommen", "ist gekommt"], answer: 1, explain: "位置移动 → sein；kommen → gekommen" },
      { q: "arbeiten → ?", options: ["ist gearbeitet", "hat gearbeit", "hat gearbeitet", "hat gearbeitt"], answer: 2, explain: "无位移 → haben；ge + arbeit + et" },
      { q: "fahren → ?", options: ["hat gefahren", "ist gefahrt", "ist gefahren", "hat gefährt"], answer: 2, explain: "位置移动 → sein；fahren → gefahren" },
      { q: "kontrollieren → ?", options: ["hat gekontrolliert", "ist kontrolliert", "hat kontrolliert", "hat kontrollieren"], answer: 2, explain: "-ieren 结尾不加 ge-" },
      { q: "einschalten → ?", options: ["hat geschaltet ein", "hat eingeschaltet", "ist eingeschaltet", "hat einschaltet"], answer: 1, explain: "可分动词：前缀 + ge + 词干" },
      { q: "benutzen → ?", options: ["hat gebenutzt", "hat benutzt", "ist benutzt", "hat benutzet"], answer: 1, explain: "不可分前缀 be- 不加 ge-" },
      { q: "helfen → ?", options: ["hat gehelft", "hat geholfen", "ist geholfen", "hat gehülfen"], answer: 1, explain: "强变化 e→o：geholfen；helfen 用 haben" },
      { q: "gehen → ?", options: ["hat gegangen", "ist gegangen", "hat gegeht", "ist gegehen"], answer: 1, explain: "位置移动 → sein；gehen → gegangen" },
      { q: "aufstehen（起床）→ ?", options: ["hat aufgestanden", "ist aufgestanden", "hat aufgestanden", "ist aufstanden"], answer: 1, explain: "状态改变 → sein" },
      { q: "trinken → ?", options: ["hat getränkt", "hat getrunken", "ist getrunken", "hat getrinkt"], answer: 1, explain: "强变化 i→u：getrunken" }
    ]
  },
  {
    id: "q5", title: "词汇与词性", de: "Wortschatz & Genus", desc: "der/die/das 判断与核心词义",
    questions: [
      { de: "das Labor", q: "___ Labor（实验室）", options: ["der", "die", "das", "den"], answer: 2, explain: "das Labor，中性" },
      { de: "die Küche", q: "___ Küche（厨房）", options: ["der", "die", "das", "dem"], answer: 1, explain: "die Küche，阴性 → 在厨房里 in der Küche" },
      { de: "der Tisch", q: "___ Tisch（桌子）", options: ["der", "die", "das", "dem"], answer: 0, explain: "der Tisch，阳性" },
      { de: "das Wohnzimmer", q: "___ Wohnzimmer（客厅）", options: ["der", "die", "das", "dem"], answer: 2, explain: "复合词看最后：das Zimmer → das Wohnzimmer" },
      { de: "die U-Bahn", q: "___ U-Bahn（地铁）", options: ["der", "die", "das", "den"], answer: 1, explain: "die U-Bahn，阴性 → mit der U-Bahn" },
      { de: "der Laborkittel", q: "der Laborkittel 是？", options: ["实验记录本", "实验服/白大褂", "显微镜", "样品盒"], answer: 1, explain: "进实验室第一步：den Laborkittel anziehen" },
      { de: "die Probe", q: "die Probe 是？", options: ["考试", "样品/样本", "尝试（仅）", "探针"], answer: 1, explain: "实验室语境：样品（复数 die Proben）" },
      { de: "die Ampel", q: "die Ampel 是？", options: ["斑马线", "十字路口", "红绿灯", "路缘石"], answer: 2, explain: "an der Ampel links/rechts" },
      { de: "die Besprechung", q: "die Besprechung 是？", options: ["报告", "会议/讨论会", "休息", "决定"], answer: 1, explain: "eine Besprechung haben 开会" },
      { de: "das Viertel", q: "das Viertel 在时间表达中是？", options: ["半小时", "一刻钟（15 分钟）", "十分钟", "四分之一小时（45 分钟）"], answer: 1, explain: "Viertel nach/vor … 一刻钟" }
    ]
  }
];

/* ------------------------------------------------------------
   六、课程大纲（15 主题 + 学习进度）
   ------------------------------------------------------------ */
const KURSPLAN = [
  { group: "基础社交与个人表达", items: [
    { num: 1, de: "Vorstellung", zh: "自我介绍", status: "done", lesson: "l1" },
    { num: 7, de: "Wochenende, Spaß, Hobby, Urlaub", zh: "周末、娱乐、爱好、假期", status: "done", lesson: "l5" },
    { num: 10, de: "Dialoge Arbeit", zh: "工作场景对话", status: "done", lesson: "l12" }
  ]},
  { group: "日常生活实务", items: [
    { num: 4, de: "Bestellen (Café, Restaurant)", zh: "点餐（咖啡馆、餐厅）", status: "done", lesson: "l3" },
    { num: 5, de: "Lebensmittel (Getränke, Essen)", zh: "食品与饮料", status: "done", lesson: "l3" },
    { num: 12, de: "Haus", zh: "房屋与家居", status: "done", lesson: "l6" },
    { num: 15, de: "Dienstleistungen (Friseur etc.)", zh: "生活服务（理发店等）", status: "todo" }
  ]},
  { group: "城市生活与出行", items: [
    { num: 3, de: "Reisen, Geschäftsreisen, Transport, DB", zh: "旅行、出差、德铁", status: "part", lesson: "l11" },
    { num: 11, de: "Verkehr, Richtungsangaben", zh: "交通与问路", status: "done", lesson: "l11" },
    { num: 14, de: "Telefonieren", zh: "电话沟通", status: "todo" }
  ]},
  { group: "社会制度与公共事务", items: [
    { num: 2, de: "Gefühle, Arztbesuch", zh: "情感表达、看医生", status: "todo" },
    { num: 6, de: "Regierung", zh: "政府与行政", status: "todo" },
    { num: 8, de: "Jahreszeiten + Kleidung", zh: "季节与服装", status: "done", lesson: "l10" },
    { num: 9, de: "Weihnachten, Ostern, Feiertage", zh: "节假日文化", status: "done", lesson: "l10" },
    { num: 13, de: "Bürokratie (Bürgerbüro)", zh: "行政手续（市民服务中心）", status: "todo" }
  ]}
];

const STATUS_LABEL = { done: "已学", part: "部分涉及", todo: "待学" };
