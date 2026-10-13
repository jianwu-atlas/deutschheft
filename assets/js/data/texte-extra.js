/* eslint-disable */
// 课文精读增强数据：逐句中文（zhs）+ 段末知识点（notes）
// 由 Jian 2026-10-13 要求新增：① 一行德文 / 一行音标 / 一行中文；② 段末强调并解释重要知识点&词汇&语法
// 结构：window.TEXTE_EXTRA[textId][段序号(1-based)] = { zhs:[逐句中文], notes:[{k:分类, v:说明}] }
// 说明：zhs 与正文 splitSentences(p.de) 一一对应；notes 的 k 建议用「语序 / 从句 / 可分动词 / 词汇 …」
window.TEXTE_EXTRA = {
  t1: {
    1: {
      zhs: ["我叫 Daniel。", "我 38 岁，在一家实验室担任生物学家。", "我对植物和细胞特别感兴趣。"],
      notes: [
        { k: "语序", v: "德语陈述句里，变位动词固定占第二位：Ich bin … / Ich arbeite …" },
        { k: "搭配", v: "sich interessieren für + 第四格（对……感兴趣）" },
        { k: "词汇", v: "der Biologe 生物学家 · das Labor 实验室 · die Pflanze 植物 · die Zelle 细胞" }
      ]
    },
    2: {
      zhs: ["我的工作日 8 点开始。", "我到实验室时，先穿上实验服。", "然后我洗手并准备工作台。"],
      notes: [
        { k: "可分动词", v: "anziehen（穿上）、vorbereiten（准备）——前缀甩到句尾：ziehe … an / bereite … vor" },
        { k: "时间", v: "um 8:00 Uhr（在……点）" },
        { k: "从句", v: "wenn ich ins Labor komme —— wenn 从句里动词到句尾" }
      ]
    },
    3: {
      zhs: ["早上我检查实验。", "我研究植物细胞，经常用显微镜工作。", "在显微镜下，我能看到肉眼看不见的微小东西。"],
      notes: [
        { k: "关系从句", v: "… Dinge, die man … sehen kann —— die 引导定语从句，动词到句尾" },
        { k: "情态动词", v: "kann … sehen —— 情态动词 + 实义动词不定式到句尾" },
        { k: "介词", v: "mit + 第三格（mit einem Mikroskop 用显微镜）" }
      ]
    },
    4: {
      zhs: ["我也做很多笔记。", "每个实验我都记下我做了什么、观察到了什么。", "这对我的工作非常重要。"],
      notes: [
        { k: "可分动词", v: "aufschreiben（记下）→ schreibe … auf" },
        { k: "从句", v: "was ich mache / was ich beobachte —— 间接疑问从句，动词到句尾" },
        { k: "介词", v: "für + 第四格（für meine Arbeit 对我的工作）" }
      ]
    },
    5: {
      zhs: ["10 点半左右我短暂休息。", "我喝杯咖啡，和同事们聊天。", "我们聊工作，有时也聊周末或家人。"],
      notes: [
        { k: "介词", v: "sprechen mit + 第三格（和某人）· über + 第四格（关于某事）" },
        { k: "时间", v: "gegen 10:30 Uhr（约……点）" }
      ]
    },
    6: {
      zhs: ["之后我回到实验室。", "有时我准备新实验。", "我使用各种仪器并检测样品。", "样品可以是比如一小块植物。"],
      notes: [
        { k: "可分动词", v: "vorbereiten（准备）→ bereite … vor" },
        { k: "情态动词", v: "kann … sein —— 情态动词 + 不定式到句尾" },
        { k: "短语", v: "zum Beispiel（缩写 z. B.）例如" }
      ]
    },
    7: {
      zhs: ["12 点半我午休。", "我通常和同事们在食堂吃饭。"],
      notes: [
        { k: "倒装", v: "时间状语 Meistens 置句首 → 动词第二位、主语后移" },
        { k: "介词", v: "in der Kantine（in + 第三格，表地点）" }
      ]
    },
    8: {
      zhs: ["下午我常在电脑前工作。", "我查看实验结果、撰写报告。", "有时我们也开会。", "我们讨论新项目和研究。"],
      notes: [
        { k: "可分动词", v: "sich etwas ansehen（查看）→ sehe mir … an" },
        { k: "介词", v: "über + 第四格（über neue Projekte 关于新项目）" }
      ]
    },
    9: {
      zhs: ["我的工作日常在 17 点结束。", "回家前，我整理工作台并再次检查实验。"],
      notes: [
        { k: "从句", v: "bevor ich nach Hause gehe —— bevor 从句里动词到句尾" },
        { k: "可分动词", v: "aufräumen（整理）→ räume … auf" }
      ]
    },
    10: {
      zhs: ["我的工作有时很难，但从不无聊。", "我喜欢生物学，因为总有新东西可以发现。"],
      notes: [
        { k: "从句", v: "weil es … gibt —— weil 从句里动词到句尾" },
        { k: "名词化", v: "etwas Neues（形容词名词化：新的东西）" }
      ]
    }
  },
  t2: {
    1: {
      zhs: ["Mia 在一家小型研究实验室担任生物学家。", "她在那里检测食品和微生物。", "昨天，她度过了特别有趣的一个工作日。"],
      notes: [
        { k: "现在完成时", v: "haben/sein + 过去分词：hat … gehabt（她度过了）" },
        { k: "介词", v: "als + 职业（als Biologin 作为生物学家）" },
        { k: "词汇", v: "das Lebensmittel 食品 · der Mikroorganismus 微生物" }
      ]
    },
    2: {
      zhs: ["早上 7:15，Mia 就来到了实验室。", "她首先打开电脑、读了电子邮件。", "之后她穿上实验服并洗了手。"],
      notes: [
        { k: "助动词", v: "kommen 用 sein（ist … gekommen）——位移/状态变化用 sein" },
        { k: "可分动词", v: "einschalten → eingeschaltet、anziehen → angezogen（ge- 夹在中间）" },
        { k: "时间", v: "um 7:15 Uhr（在……点）" }
      ]
    },
    3: {
      zhs: ["她的桌上放着几份来自乳品厂的样品。", "Mia 需要检测样品中是否存在特定细菌。", "首先，她检查了所有容器，并记录了样品编号。"],
      notes: [
        { k: "完成时", v: "stehen → hat … gestanden（放置/站立）" },
        { k: "从句", v: "ob … vorhanden sind —— ob 引导间接疑问从句" },
        { k: "-ieren 动词", v: "kontrollieren / notieren 的过去分词不加 ge-（kontrolliert / notiert）" }
      ]
    },
    4: {
      zhs: ["随后，Mia 准备了少量样品。", "她使用了不同的仪器，工作非常细致。", "同事 Elena 随后来到实验室，协助了 Mia 的工作。"],
      notes: [
        { k: "可分动词", v: "vorbereiten → vorbereitet（不加 ge-）" },
        { k: "不可分前缀", v: "benutzen → benutzt（be- 开头的动词不加 ge-）" },
        { k: "搭配", v: "jdm. bei etw. helfen ——帮助某人做某事（helfen + 第三格）" }
      ]
    },
    5: {
      zhs: ["10 点左右，两人短暂休息。", "Mia 喝了杯咖啡，Elena 吃了盒酸奶。", "期间她们聊到了假期和周末计划。"],
      notes: [
        { k: "过去分词", v: "trinken → getrunken、essen → gegessen（强变化）" },
        { k: "连接", v: "dabei 指代「与此同时」" },
        { k: "介词", v: "über + 第四格（über ihren Urlaub 关于她的假期）" }
      ]
    },
    6: {
      zhs: ["休息过后，Mia 和 Elena 继续检测样品。", "在一份样品中，她们发现了一个意料之外的结果。", "因此她们把检测重新做了一遍。"],
      notes: [
        { k: "过去分词", v: "finden → gefunden（强变化 i→u）" },
        { k: "-ieren 动词", v: "wiederholen → wiederholt（不加 ge-）" },
        { k: "倒装", v: "Deshalb 置句首 → 动词第二位、主语后移" }
      ]
    },
    7: {
      zhs: ["12:30 她们去了食堂。", "午饭后 Mia 回到实验室。", "她在电脑上录入了新的结果。"],
      notes: [
        { k: "助动词", v: "gehen 用 sein（sind … gegangen）——位移用 sein" },
        { k: "可分动词", v: "eintragen → eingetragen（可分）" },
        { k: "介词", v: "in die Kantine（in + 第四格，表方向）" }
      ]
    },
    8: {
      zhs: ["下午，Mia 和团队主管通了电话。", "她向主管讲述了这一异常结果。", "主管决定团队第二天做进一步测试。"],
      notes: [
        { k: "-ieren 动词", v: "telefonieren → telefoniert（不加 ge-）" },
        { k: "搭配", v: "jdm. von etw. erzählen（向某人讲述某事）" },
        { k: "从句", v: "dass … machen soll —— dass 从句 + 情态动词到句尾" }
      ]
    },
    9: {
      zhs: ["最后，Mia 整理了工作台、清洗了仪器，并将样品安全归位。", "16:30 她骑自行车回家了。"],
      notes: [
        { k: "可分动词", v: "aufräumen → aufgeräumt、wegräumen → weggeräumt（ge- 夹在中间）" },
        { k: "助动词", v: "fahren 用 sein（ist … gefahren）——位移用 sein" }
      ]
    },
    10: {
      zhs: ["晚上 Mia 很累。", "但她依然很满足，因为这一天她学到了新东西。"],
      notes: [
        { k: "过去时", v: "war = sein 的过去时（表状态）" },
        { k: "连词", v: "trotzdem（尽管如此）/ denn（因为）" },
        { k: "名词化", v: "etwas Neues（形容词名词化）" }
      ]
    }
  }
};
