/* ================================================================
   HypnosAI 催眠助手 - 主应用逻辑
   将原 Python 后端全部重构为前端 JavaScript
   ================================================================ */

// ==================== 常量与配置 ====================
const APP_NAME = 'HypnosAI 催眠';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-pro-exp-03-25';

// ==================== 汉化后的倾向性测试题库 ====================
const TEST_QUESTIONS = [
    {
        id: 1,
        question: '在安静的环境中，你是否容易注意到自己身体内部的感觉（如心跳、呼吸）？',
        options: [
            { text: '非常容易，甚至不用刻意去想', score: 4 },
            { text: '比较留意就能感觉到', score: 3 },
            { text: '只有偶尔注意到', score: 2 },
            { text: '很难注意到', score: 1 },
            { text: '几乎从来没有', score: 0 }
        ]
    },
    {
        id: 2,
        question: '当你听一个故事时，你有多容易在脑海中形成逼真的画面？',
        options: [
            { text: '非常容易，画面感很强', score: 4 },
            { text: '经常可以', score: 3 },
            { text: '偶尔可以，取决于内容', score: 2 },
            { text: '很少能形成画面', score: 1 },
            { text: '几乎不能，我主要靠文字理解', score: 0 }
        ]
    },
    {
        id: 3,
        question: '当你被某件事深深吸引时，你有多大程度上会忽略周围发生的事情？',
        options: [
            { text: '完全沉浸，周围人叫我可能都听不到', score: 4 },
            { text: '经常很专注，但大的声音还是会注意到', score: 3 },
            { text: '偶尔专注，但容易被干扰', score: 2 },
            { text: '比较难集中注意力', score: 1 },
            { text: '我几乎无法忽略周围环境', score: 0 }
        ]
    },
    {
        id: 4,
        question: '对于权威人士给出的建议，你一般会怎么对待？',
        options: [
            { text: '我很容易接受权威人士的说法', score: 4 },
            { text: '我会认真听，但也保持自己的判断', score: 3 },
            { text: '我倾向于自己先思考再决定', score: 2 },
            { text: '我通常对权威持怀疑态度', score: 1 },
            { text: '我完全不信权威那一套', score: 0 }
        ]
    },
    {
        id: 5,
        question: '回想过去，有没有一些经历让你觉得你的情绪很容易受到外界引导？',
        options: [
            { text: '经常有，我情绪总是被外界带着走', score: 4 },
            { text: '有时候会，比如看煽情的电影', score: 3 },
            { text: '很少，我情绪比较稳定', score: 2 },
            { text: '几乎没有', score: 1 },
            { text: '从来没有', score: 0 }
        ]
    },
    {
        id: 6,
        question: '当你重复听一段旋律或声音时，你有多容易感到放松或进入一种恍惚状态？',
        options: [
            { text: '非常容易，我经常用这种方式放松', score: 4 },
            { text: '比较有效果', score: 3 },
            { text: '有时候有用', score: 2 },
            { text: '几乎感觉不到什么不同', score: 1 },
            { text: '重复的声音让我烦躁', score: 0 }
        ]
    },
    {
        id: 7,
        question: '你对新想法的开放态度是怎样的？',
        options: [
            { text: '我非常乐于接受新想法，享受尝试不同的思维角度', score: 4 },
            { text: '比较愿意尝试，只要合理就可以', score: 3 },
            { text: '有一定保留，但善意看待', score: 2 },
            { text: '比较守旧，喜欢既定的思维方式', score: 1 },
            { text: '我坚信自己的方式是最好的', score: 0 }
        ]
    },
    {
        id: 8,
        question: '你过去尝试过冥想、催眠或类似的放松练习吗？体验如何？',
        options: [
            { text: '经常尝试并且效果很好', score: 4 },
            { text: '偶尔尝试，有时有效果', score: 3 },
            { text: '试过一两次，感觉一般', score: 2 },
            { text: '没试过但感兴趣', score: 1 },
            { text: '没试过，也没什么兴趣', score: 0 }
        ]
    },
    {
        id: 9,
        question: '在你的日常生活中，你更多依赖理性逻辑还是直觉感受？',
        options: [
            { text: '完全靠直觉和感觉', score: 4 },
            { text: '大部分时候靠直觉', score: 3 },
            { text: '两者各占一半', score: 2 },
            { text: '大部分时候靠逻辑', score: 1 },
            { text: '几乎完全依赖逻辑分析', score: 0 }
        ]
    },
    {
        id: 10,
        question: '你有没有过被完全带入某个情境的经历（比如看电影、读书或听故事时感到身临其境）？',
        options: [
            { text: '经常有，这是我最享受的体验之一', score: 4 },
            { text: '比较常发生', score: 3 },
            { text: '偶尔会有', score: 2 },
            { text: '很少，只有特别好的作品才会', score: 1 },
            { text: '从来没有过', score: 0 }
        ]
    }
];

// ==================== 汉化后的模板催眠脚本生成器 ====================
// 对应原 hypnosis_generator.py 的模板逻辑

function getGenderText(gender) {
    const map = {
        'male': '男性',
        'female': '女性',
        'non_binary': '非二元性别',
        'prefer_not_to_say': '不愿透露'
    };
    return map[gender] || gender;
}

function getBeliefText(belief) {
    const map = {
        'spiritual': '偏灵性',
        'practical': '偏务实',
        'skeptical': '偏怀疑',
        'open': '保持开放',
        'not_sure': '不确定'
    };
    return map[belief] || belief;
}

function getToneText(tone) {
    const map = {
        'gentle': '温和引导',
        'authoritative': '坚定权威',
        'soothing': '安抚疗愈',
        'neutral': '中性平稳'
    };
    return map[tone] || tone;
}

function getScriptTypeText(type) {
    const map = {
        'progressive_relaxation': '渐进式放松',
        'visualization': '视觉化引导',
        'affirmations': '积极肯定语',
        'story_based': '故事隐喻',
        'custom': '自由定制'
    };
    return map[type] || type;
}

function getVoicePreferenceText(pref) {
    const map = {
        'male': '男声',
        'female': '女声',
        'no_preference': '随意'
    };
    return map[pref] || pref;
}

// 生成模板脚本（完全不依赖外部 API）
function generateTemplateScript(userData, testResult) {
    const gender = userData.gender || 'prefer_not_to_say';
    const belief = userData.belief || 'not_sure';
    const tone = userData.tone || 'gentle';
    const scriptType = userData.script_type || 'progressive_relaxation';
    const customGoal = userData.custom_goal || '';
    const score = testResult ? testResult.percentage : 50;
    const name = userData.name || '朋友';

    const lines = [];
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    lines.push(`# 🌙 你的专属催眠脚本`);
    lines.push(`*生成时间：${now}*`);
    lines.push('');
    lines.push(`## 📋 个性化信息`);
    lines.push(`- 姓名：${name}`);
    lines.push(`- 性别：${getGenderText(gender)}`);
    lines.push(`- 信念倾向：${getBeliefText(belief)}`);
    lines.push(`- 引导语气：${getToneText(tone)}`);
    lines.push(`- 脚本类型：${getScriptTypeText(scriptType)}`);
    lines.push(`- 催眠易感度：${score}%`);
    if (customGoal) {
        lines.push(`- 目标设定：${customGoal}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // 介绍引导
    lines.push('## 🌀 第一阶段：进入放松');
    lines.push('');
    lines.push(`亲爱的${name}，请找一个安静舒适的地方坐下或躺下。`);
    lines.push('轻轻地闭上眼睛，做三次深长的呼吸……');
    lines.push('吸气——感受空气从鼻腔流入，充满你的胸腔和腹部。');
    lines.push('呼气——让所有的紧张和疲惫随着气息缓缓流出……');
    lines.push('');
    lines.push('非常好。再吸气……再呼气……');
    lines.push('每一次呼吸都让你感到更加放松，更加平静。');
    lines.push('');

    if (tone === 'gentle' || tone === 'soothing') {
        lines.push('现在，我想让你想象一束温暖柔和的光，从你的头顶开始，');
        lines.push('像液态的阳光一样，缓缓向下流淌……');
        lines.push('它流过你的额头，舒展你眉间的每一丝紧绷。');
        lines.push('它流过你的脸颊，松开你的下巴。');
        lines.push('它流过你的脖颈，释放肩头的重量。');
        lines.push('这温暖的光流过你的手臂，穿过你的手腕，直达指尖。');
        lines.push('每到一个地方，那里的肌肉就完全放松，完全释放。');
    } else if (tone === 'authoritative') {
        lines.push('现在，注意你的身体。从头顶开始，一寸一寸地放松。');
        lines.push('头皮放松。额头放松。眼睛周围的肌肉完全放松。');
        lines.push('下巴松开。颈部肌肉松开。双肩下沉。');
        lines.push('你的手臂变得沉重、温暖而松弛。');
        lines.push('每一块肌肉都在听从你的指令，完全放松，完全服从。');
    } else {
        lines.push('现在，将注意力带到你的身体。');
        lines.push('感受从头到脚的每一个部位，依次放松。');
        lines.push('头部放松，面部肌肉松弛，肩膀自然下沉。');
        lines.push('手臂放松，手掌自然地放在身体两侧。');
        lines.push('躯干的肌肉也慢慢松开，呼吸自然变得平缓。');
    }

    lines.push('');
    lines.push('## 🔮 第二阶段：深化催眠');
    lines.push('');

    if (score > 70) {
        lines.push('你做得非常好。你天生就拥有深度放松的能力，');
        lines.push('而此时此刻，这种能力正在为你打开一扇通往内心世界的大门。');
        lines.push('现在，想象你正站在一段向下的楼梯顶端。');
        lines.push('一共有十级台阶，每一级都让你进入更深的放松状态。');
        lines.push('十……向下迈出第一步，更深地放松……');
        lines.push('九……每一块肌肉都更加松弛……');
        lines.push('八……外界的声响变得遥远而模糊……');
    } else if (score > 40) {
        lines.push('你做得很好。你的身心正在慢慢适应这种放松的节奏。');
        lines.push('现在，我想你想象自己正站在一段缓缓下降的电梯里。');
        lines.push('电梯平稳地向下移动，每下降一层，你就放松一倍。');
        lines.push('从十层开始……九层……八层……');
        lines.push('让你的思绪跟随电梯，自然地向下，向更深的宁静之处……');
    } else {
        lines.push('没有关系。每个人的节奏不同，而你完全按照自己舒适的步调来。');
        lines.push('现在，只是把注意力放在你的呼吸上。');
        lines.push('吸气时，默数"一"，呼气时，默数"放松"。');
        lines.push('不需要做任何努力，只需要允许自己就这样安静地待着。');
    }

    lines.push('');
    if (scriptType === 'progressive_relaxation') {
        lines.push('## 💫 第三阶段：渐进式深度放松');
        lines.push('');
        lines.push('现在，我希望你重新扫描全身，从脚趾开始。');
        lines.push('感受你的脚趾，感受到它们变得温暖而松弛。');
        lines.push('这种感觉向上蔓延到脚掌、脚踝、小腿、膝盖……');
        lines.push('大腿也完全放松，骨盆区域变得柔软而松弛。');
        lines.push('腹部随着自然的呼吸轻轻起伏。');
        lines.push('胸部放松，心跳平稳而安静。');
        lines.push('肩膀完全下沉，手臂、手腕、手指都变得沉重、温暖。');
        lines.push('脖子柔软，下巴微张，嘴唇轻轻合上。');
        lines.push('眼球在眼窝中自然停息，不再焦躁地转动。');
        lines.push('整个身体都被深度的宁静包围着。');
    } else if (scriptType === 'visualization') {
        lines.push('## 🌿 第三阶段：心灵花园之旅');
        lines.push('');
        lines.push('现在，我想邀请你想象一个美丽的地方。');
        lines.push('这可以是你去过的地方，也可以是完全由你创造的秘密花园。');
        lines.push('你站在入口处，眼前是一片宁静的景致……');
        lines.push('也许是一片森林，阳光透过树叶洒下斑驳的光影。');
        lines.push('也许是一片海滩，海浪轻柔地亲吻着沙滩。');
        lines.push('也许是山间草地，微风带着花香轻轻拂过你的脸庞。');
        lines.push('走进这个属于你的地方。感受脚下的地面。');
        lines.push('听——周围有什么声音在欢迎你？');
        lines.push('闻——空气中有什么美好的气息？');
        lines.push('这里是完全安全的，完全属于你的。');
    } else if (scriptType === 'affirmations') {
        lines.push('## 🌟 第三阶段：积极肯定语');
        lines.push('');
        lines.push('在你的深度放松中，一些美好的话语正在进入你的内心深处。');
        lines.push('请和我一起，在内心轻轻重复：');
        lines.push('');
        lines.push('我是平静的。我是安全的。我是完整的。');
        lines.push('每一天，我都在变得更好。');
        lines.push('我拥有改变自己的力量。');
        lines.push('我接纳自己的全部，包括不完美的部分。');
        lines.push('我值得被爱，值得拥有美好的事物。');
        lines.push('我的身心正在进入和谐与平衡。');
        if (customGoal) {
            lines.push(`我正稳步走向"${customGoal}"的目标。`);
        }
    } else if (scriptType === 'story_based') {
        lines.push('## 📖 第三阶段：故事旅程');
        lines.push('');
        lines.push('现在，让我讲一个小故事，你可以闭上眼睛跟随它……');
        lines.push('');
        lines.push('从前，有一位旅人，常年背负着沉重的行囊赶路。');
        lines.push('有一天，旅人来到一条清澈的河边，决定坐下来休息。');
        lines.push('当卸下行囊的那一刻，旅人突然感到前所未有的轻松。');
        lines.push('原来，许多重量不是必须背负的。');
        lines.push('旅人打开行囊，发现里面装着许多叫"焦虑"的石头、');
        lines.push('叫"担忧"的沙子、叫"自我怀疑"的铁块。');
        lines.push('旅人把它们一块一块地拿了出来，');
        lines.push('轻轻地放在河岸边，然后让河水将它们带走。');
        lines.push('你，就是那位旅人。每一次呼气，');
        lines.push('你都在卸下一块不必要背负的重量。');
    } else {
        lines.push('## 🌊 第三阶段：自由深度探索');
        lines.push('');
        if (customGoal) {
            lines.push(`你来到这里，是为了"${customGoal}"。`);
            lines.push('现在，在你的深度放松中，这个目标变得越来越清晰。');
            lines.push('想象你已经达成了这个目标。你是什么样子？');
            lines.push('你身处何地？周围有谁在为你感到高兴？');
        } else {
            lines.push('在这深度的放松中，你的潜意识正在自由地整合。');
            lines.push('不需要刻意做什么，只需要允许你的内在智慧自然地工作。');
        }
        lines.push('感受这份宁静的能量在你身体中流淌。');
        lines.push('每一个细胞都在吸收这份平静和力量。');
    }

    lines.push('');
    lines.push('## 🌅 第四阶段：唤醒与回归');
    lines.push('');
    lines.push(`好的，亲爱的${name}。现在是时候慢慢回到清醒的状态了。`);
    lines.push('当我数到五的时候，你将完全清醒，感到精力充沛、');
    lines.push('头脑清晰，并且内心平静。');
    lines.push('');
    lines.push('一……开始感觉到你身下的椅子或床铺。');
    lines.push('二……轻轻动一动你的手指和脚趾。');
    lines.push('三……慢慢活动你的脖颈和肩膀。');
    lines.push('四……当你准备好了，缓缓睁开你的眼睛。');
    lines.push('五……完全清醒。欢迎回来。');

    lines.push('');
    lines.push('---');
    lines.push(`*此脚本由 HypnosAI 催眠助手自动生成 | 催眠易感度：${score}% | ${getScriptTypeText(scriptType)}*`);
    lines.push('*⚠️ 提示：AI 生成的催眠脚本仅供放松娱乐用途，不构成医疗建议。如有心理健康问题，请咨询专业医师。*');

    return lines.join('\n');
}

// ==================== 倾向性测试评分 ====================
function calculateTestScore(answers) {
    let totalScore = 0;
    let maxScore = 0;

    for (const question of TEST_QUESTIONS) {
        maxScore += 4; // 每题最高4分
        const answerIndex = answers[question.id];
        if (answerIndex !== undefined && answerIndex !== null) {
            totalScore += question.options[answerIndex].score;
        }
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    let level, levelClass, advice;

    if (percentage >= 80) {
        level = '非常高';
        levelClass = 'level-very-high';
        advice = '你的催眠易感性非常高。你天生擅长深度放松和内在探索，催眠体验可能会非常深刻而顺畅。建议选择温和而深入的引导方式，充分利用这份天赋。';
    } else if (percentage >= 60) {
        level = '较高';
        levelClass = 'level-high';
        advice = '你的催眠易感性较高。你具备良好的专注力和想象力，大多数催眠方法都适合你。可以多尝试不同的脚本风格，找到最适合自己的方式。';
    } else if (percentage >= 40) {
        level = '中等';
        levelClass = 'level-moderate';
        advice = '你的催眠易感性处于中等水平。某些引导方式可能对你更有效。建议从渐进式放松或故事隐喻类的脚本开始，给自己足够的时间进入状态。';
    } else if (percentage >= 20) {
        level = '较低';
        levelClass = 'level-low';
        advice = '你的催眠易感性偏低，但这并不意味着你不能享受催眠！你可能更适合逻辑清晰、结构明确的引导风格，给自己多一些耐心和练习的机会。';
    } else {
        level = '非常低';
        levelClass = 'level-very-low';
        advice = '你目前对催眠的易感性较低，这通常说明你是一个理性思考者。可以尝试将催眠视为一种"有引导的深度放松练习"而不是什么神秘体验，也许会有意外的收获。';
    }

    return {
        totalScore,
        maxScore,
        percentage,
        level,
        levelClass,
        advice
    };
}

// ==================== API 密钥管理 ====================
function getApiKeys() {
    try {
        const data = localStorage.getItem('hypnosai_keys');
        return data ? JSON.parse(data) : { gemini: '', elevenlabs: '' };
    } catch (e) {
        return { gemini: '', elevenlabs: '' };
    }
}

function saveApiKeys(keys) {
    localStorage.setItem('hypnosai_keys', JSON.stringify(keys));
}

function hasGeminiKey() {
    return !!getApiKeys().gemini;
}

function hasElevenLabsKey() {
    return !!getApiKeys().elevenlabs;
}

// ==================== Gemini API 调用（前端） ====================
async function callGeminiAPI(prompt) {
    const keys = getApiKeys();
    if (!keys.gemini) {
        throw new Error('请先在设置中填写 Gemini API 密钥');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${keys.gemini}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192
            }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API 错误 (${response.status}): ${err}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
    }
    throw new Error('Gemini 未返回有效内容');
}

// 构建发送给 Gemini 的 prompt
function buildGeminiPrompt(userData, testResult) {
    const gender = getGenderText(userData.gender || 'prefer_not_to_say');
    const belief = getBeliefText(userData.belief || 'not_sure');
    const tone = getToneText(userData.tone || 'gentle');
    const scriptType = getScriptTypeText(userData.script_type || 'progressive_relaxation');
    const name = userData.name || '用户';
    const customGoal = userData.custom_goal || '';
    const score = testResult ? testResult.percentage : 50;
    const level = testResult ? testResult.level : '中等';
    const voicePref = getVoicePreferenceText(userData.voice_preference || 'no_preference');

    return `你是一位经验丰富的催眠治疗师。请根据以下个人信息，生成一份完整的中文催眠引导脚本。

【用户个人信息】
- 称呼：${name}
- 性别：${gender}
- 世界观/信念倾向：${belief}
- 偏好的引导语气：${tone}
- 偏好的脚本类型：${scriptType}
- 催眠易感度：${score}%（等级：${level}）
- 语音偏好：${voicePref}
${customGoal ? `- 特别目标：${customGoal}` : ''}

【脚本要求】
1. 全部使用简体中文。
2. 包含完整的四个阶段：进入放松 → 深化催眠 → 主体内容 → 唤醒与回归。
3. 脚本主体内容应与用户选择的脚本类型（${scriptType}）紧密贴合。
4. 引导语气必须与用户偏好（${tone}）一致。
5. 根据催眠易感度调整引导深度，${level}易感度的用户需要${score > 60 ? '更深入、更细腻' : '更温和、更有耐心'}的引导。
6. 在合适的位置自然地使用用户的称呼"${name}"。
7. 整体脚本应该感觉温暖、贴心和专业，总长度约800-1500字。
8. 开头和结尾不要包含除脚本本身之外的其他内容。
9. 脚本用分段格式呈现，方便阅读。
10. 最后加上一行免责声明：「*此脚本由 AI 自动生成，仅供放松娱乐用途，不构成医疗建议。*」

请直接输出催眠脚本内容：`;
}

// ==================== ElevenLabs API 调用（前端） ====================
async function callElevenLabsAPI(text, voiceId) {
    const keys = getApiKeys();
    if (!keys.elevenlabs) {
        throw new Error('请先在设置中填写 ElevenLabs API 密钥');
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': keys.elevenlabs
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`ElevenLabs API 错误 (${response.status}): ${err}`);
    }

    return await response.arrayBuffer();
}

// 根据用户偏好选择 voice ID
function getVoiceId(preference) {
    // 默认中文语音 ID
    const voices = {
        'male': 'pNInz6obpgDQGcFmaJgB',   // Adam (男声)
        'female': 'EXAVITQu4vr4xnSDxMaL', // Sarah (女声)
        'no_preference': 'EXAVITQu4vr4xnSDxMaL' // 默认女声
    };
    return voices[preference] || voices['no_preference'];
}

// ==================== 清理用户输入 ====================
function cleanUserInput(data) {
    const cleaned = {};
    for (const key of Object.keys(data)) {
        if (data[key] && typeof data[key] === 'string') {
            cleaned[key] = data[key]
                .replace(/[<>{}[\]]/g, '')
                .trim()
                .substring(0, 200);
        } else {
            cleaned[key] = data[key];
        }
    }
    return cleaned;
}

// ==================== Toast 消息 ====================
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ==================== 暴露到全局 ====================
window.HypnosAI = {
    TEST_QUESTIONS,
    generateTemplateScript,
    calculateTestScore,
    getApiKeys,
    saveApiKeys,
    hasGeminiKey,
    hasElevenLabsKey,
    callGeminiAPI,
    callElevenLabsAPI,
    buildGeminiPrompt,
    getVoiceId,
    cleanUserInput,
    showToast,
    getGenderText,
    getBeliefText,
    getToneText,
    getScriptTypeText,
    getVoicePreferenceText
};