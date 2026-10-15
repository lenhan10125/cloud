(function () {
const PASSAGE_1 = `<p class="font-bold text-center" style="text-indent:0">THE AGE OF ADULTHOOD</p>
<p>In the United States, 16, 18, and 21 are significant ages in a person's life. A person can do new things at each age to show that he or she is no longer a child. These are all part of the transition to adulthood.</p>
<p>After turning 16 in the United States, a person can be employed, get a driver's license, and leave home. Many high school students learn to drive and get part-time jobs soon after celebrating their 16th birthday. At 18, people in the United States can vote in government elections and join the military, but they are <strong>prohibited</strong> from going into nightclubs, buying alcohol like beer or wine, or gambling until they are 21.</p>
<p>In many Latin American countries, a young woman's 15th birthday is important. At this age, she is no longer considered to be a girl, but a woman. To mark this special day, families with 15-year-old daughters have a celebration called a <strong>quinceanera</strong>. The day begins with the young woman and her family going to church. Later, there is a party to which many guests are invited.</p>
<p>In many countries, celebrations do not stop at adulthood. People like to celebrate what they consider to be important ages such as their 50th or 60th birthdays, or significant events such as the birth of their first child, or their retirement.</p>`;

const PASSAGE_2 = `<p class="font-bold text-center" style="text-indent:0">Highest Life Expectancy in The World</p>
<p>Longevity hot spots are located in regions of different countries where people commonly lead active lives past the age of 100. The longest living women were found in Okinawa, Japan. Another blue zone was discovered in the mountains of Sardinia, Italy where even men reach the age of 100 at an amazing rate, another was <strong>(1) ______</strong> on the Nicoya Peninsula of Costa Rica in 2007. The final blue zone was found on an expedition to the island of Ikaria, Greece where they have 50% lower rates of heart disease, 20% less cancer, and <strong>(2) ______</strong> zero dementia - loss of memory. What's their secret formula for <strong>(3) ______</strong> another 10 healthy years? Scientists focused on these longevity hot spots to answer that question and found that while it helps to have good genes, that's less than 30% of the equation. If you adopt the right <strong>(4) ______</strong>, they concluded the other 70% can be up to us. Other traits the people living in the blue zones have in common include less stress and more <strong>(5) ______</strong>, strong emphasis on family, a fresh natural plant based, diet, very little red meat and daily exercise.</p>`;

// correct = chỉ số (bắt đầu từ 0) của đáp án đúng trong mảng options
let questions = [
{id:1,question:"Lack of water and nutrients has impeded the growth of these cherry tomato plants. (CLOSEST in meaning to the underlined word \"impeded\")",options:["promoted","assisted","realized","prevented"],correct:3,rationale:"impede = cản trở, ngăn cản ≈ prevent."},
{id:2,question:"Jane was the centre of attention when she wore an elegant dress at the party. (CLOSEST in meaning to \"elegant\")",options:["stylish","difficult","unattractive","tiring"],correct:0,rationale:"elegant = thanh lịch ≈ stylish."},
{id:3,question:"The health department has just implemented a policy that prohibits smoking in public. (CLOSEST in meaning to \"prohibits\")",options:["permits","accepts","forbids","refuses"],correct:2,rationale:"prohibit = cấm ≈ forbid."},
{id:4,question:"The specialist cautioned his patients to avoid drinking too many sugary drinks. (CLOSEST in meaning to \"cautioned\")",options:["yelled","boycotted","punished","warned"],correct:3,rationale:"caution = cảnh báo ≈ warn."},
{id:5,question:"To stay healthy, make sure you obtain a variety of vitamins and minerals. (CLOSEST in meaning to \"obtain\")",options:["permit","stimulate","consume","assimilate"],correct:2,rationale:"Trong ngữ cảnh ăn uống, obtain (nạp/lấy vào cơ thể) gần nghĩa nhất với consume."},

{id:6,question:"Women's skin health is essential for maintaining their attractiveness. (OPPOSITE in meaning to \"essential\")",options:["trivial","meaningful","vital","contributory"],correct:0,rationale:"essential = thiết yếu; trái nghĩa: trivial (tầm thường, không quan trọng)."},
{id:7,question:"The second theme emphasizes the women's rejection of the pressures around body size and food, as well as their willingness to eat the meals they preferred. (OPPOSITE in meaning to \"willingness\")",options:["cultivation","hesitation","digestion","consumption"],correct:1,rationale:"willingness = sự sẵn lòng; trái nghĩa: hesitation (sự do dự)."},
{id:8,question:"He suffered a second heart attack two days ago but his condition has now stabilized. (OPPOSITE in meaning to \"attack\")",options:["stability","defence","lift","change"],correct:1,rationale:"attack = tấn công; trái nghĩa: defence (phòng thủ)."},
{id:9,question:"Skills can be enhanced by the appropriate use of technology in certain circumstances. (OPPOSITE in meaning to \"appropriate\")",options:["ill-prepared","unsuitable","irregular","unimportant"],correct:1,rationale:"appropriate = phù hợp; trái nghĩa: unsuitable (không phù hợp)."},
{id:10,question:"\"We strongly believe that he's innocent of the crime. We do not think that he did it\". (OPPOSITE in meaning to \"innocent\")",options:["clean","guilty","faultless","crimeless"],correct:1,rationale:"innocent = vô tội; trái nghĩa: guilty (có tội)."},

{id:11,question:"When ________ the trip to Ha Long?",options:["have you joined","did you joined","did you join","have you ever joined"],correct:2,rationale:"Câu hỏi với When → quá khứ đơn: did + S + V nguyên mẫu."},
{id:12,question:"________ in Phu Quoc island?",options:["Did you ever worked","Have you ever worked","Worked you","Didn't you have worked"],correct:1,rationale:"Hỏi về kinh nghiệm: Have you ever + V3?"},
{id:13,question:"I ________ hot food before. It is quite strange to me.",options:["haven't try","haven't tried","don't try","didn't try"],correct:1,rationale:"before + chưa từng trải nghiệm → hiện tại hoàn thành: haven't tried."},
{id:14,question:"I ________ his mother since I ________ 5 years old because she was my neighbour.",options:["have known / be","have known / was","knew / was","knew / were"],correct:1,rationale:"since + mệnh đề quá khứ đơn (was); mệnh đề chính dùng hiện tại hoàn thành (have known)."},
{id:15,question:"________ to him last week.",options:["I spoke","I've already spoken","I didn't speak","I speaked"],correct:0,rationale:"last week → quá khứ đơn. (A và C đều đúng ngữ pháp; đáp án thường dùng là A: I spoke.)"},
{id:16,question:"Quan (start) ________ (learn) ________ driving 5 months ago. He (buy) ________ a car recently.",options:["starts / learning / will buy","started / learned / buys","has started / learning / bought","started / to learn / has bought"],correct:3,rationale:"ago → started; start + to learn; recently → has bought."},
{id:17,question:"The worker ________ from a business trip to New York.",options:["I come back","I came back","I never came back","I've just come back"],correct:3,rationale:"Hành động vừa xảy ra, còn liên quan hiện tại → I've just come back."},
{id:18,question:"Prices ________ in 1995 but then ________ in 1996.",options:["rised / felled","rose / fell","have risen / have fallen","rose / have fallen"],correct:1,rationale:"Mốc thời gian quá khứ (1995, 1996) → quá khứ đơn: rose / fell."},
{id:19,question:"In the past, people ________ to the beach more often.",options:["have gone","used to go","were going","had gone"],correct:1,rationale:"In the past + thói quen quá khứ → used to go."},
{id:20,question:"My dog ________ my cat since I came home.",options:["is chasing","has chased","chased","chases"],correct:1,rationale:"since + quá khứ đơn → mệnh đề chính dùng hiện tại hoàn thành: has chased."},
{id:21,question:"For the past ten years, Iceland ________ in the first rank of educational achievement and improvement in women's economic conditions.",options:["have been","has been","has had beeing","had been"],correct:1,rationale:"For the past ten years → hiện tại hoàn thành; Iceland số ít → has been."},
{id:22,question:"She ________ two miles and a half, and now she feels exhausted.",options:["will have run","was running","has run","has been running"],correct:2,rationale:"Có quãng đường cụ thể đã hoàn thành, kết quả ở hiện tại (kiệt sức) → has run."},
{id:23,question:"I haven't met her again since we ________ school 20 years ago.",options:["have left","leave","left","had left"],correct:2,rationale:"since + mệnh đề quá khứ đơn (có 20 years ago) → left."},
{id:24,question:"Tom Holland ________ the Global success book 11 four months ago.",options:["wrote","write","had written","will write"],correct:0,rationale:"four months ago → quá khứ đơn: wrote."},
{id:25,question:"These walls ________ since I was born.",options:["have been painted","were painted","painted","has painted"],correct:0,rationale:"since + quá khứ đơn; walls là vật bị sơn → bị động hiện tại hoàn thành: have been painted."},

{id:26,question:"My mom has not seen her for ten years.",options:["My mom has often seen her for the last ten years.","About ten years ago, my mom used to meet her.","The last time my mom saw her was ten years ago.","My mom saw her ten years ago and will never meet her again."],correct:2,rationale:"has not seen ... for ten years = The last time ... saw her was ten years ago."},
{id:27,question:"\"What a beautiful skirt you have just bought!\" Peter said to Liz.",options:["Peter promised to buy Liz a beautiful skirt.","Peter said thanks to Liz for her beautiful skirt.","Peter complimented Liz on her beautiful skirt.","Peter asked Liz how she had just bought her beautiful skirt."],correct:2,rationale:"Lời khen → complimented sb on sth."},
{id:28,question:"\"Please don't leave until I go back,\" Hana said.",options:["Hana suggested not leaving until she goes back.","Hana asked us to leave until she went back.","Hana told us not to leave until she went back.","Hana offered to leave until she went back."],correct:2,rationale:"Câu mệnh lệnh phủ định → told sb not to V; lùi thì go → went."},
{id:29,question:"\"Stop smoking or you'll be sick\", the doctor told John.",options:["The doctor advised John to give up smoking to avoid sickness.","The doctor suggested smoking to treat sickness.","John was ordered not to smoke to recover from sickness.","John was warned against smoking a lot of cigarettes."],correct:0,rationale:"Stop smoking = give up smoking; or you'll be sick = để tránh bị bệnh → advised."},
{id:30,question:"He said, \"Mark, I'll show you round my city when you come here.\"",options:["He made a trip round his city with Mark.","He planned to show Mark round his city.","He promised to show Mark round his city.","He organized a trip round his city for Mark."],correct:2,rationale:"I'll + V thể hiện lời hứa → promised to show."},

{id:31,passage:PASSAGE_1,question:"[Reading 1] The main idea of the passage is ______________.",options:["being a young person in Latin America is easier than in Japan or the U.S.","there are special ages and celebrations around the world that show a person is becoming an adult","the age of adulthood is too young in some places but too old in others","the birth of their first child is the most important event."],correct:1,rationale:"Bài nói về các độ tuổi và lễ kỷ niệm đánh dấu việc trở thành người lớn ở nhiều nơi."},
{id:32,passage:PASSAGE_1,question:"[Reading 1] Americans are NOT allowed to ______________ when they turn 18.",options:["buy alcohol.","join the military","drive","get part-time jobs"],correct:0,rationale:"Đoạn 2: ở tuổi 18 vẫn bị cấm mua rượu bia cho đến 21 tuổi."},
{id:33,passage:PASSAGE_1,question:"[Reading 1] The word \"prohibited\" in paragraph 2 is CLOSEST in meaning to ______________.",options:["allowed","banned","protected","encouraged"],correct:1,rationale:"prohibited = bị cấm ≈ banned."},
{id:34,passage:PASSAGE_1,question:"[Reading 1] According to the passage, which of the following shows you are becoming an adult?",options:["throwing a party","celebrating your birthday","voting in an election","listening to speeches"],correct:2,rationale:"Đoạn 2: ở tuổi 18 có thể bỏ phiếu trong các cuộc bầu cử."},
{id:35,passage:PASSAGE_1,question:"[Reading 1] The word \"quinceanera\" in paragraph 3 is CLOSEST in meaning to ______________.",options:["family reunion","festival","a religious ceremony","meeting"],correct:1,rationale:"quinceanera là một lễ kỷ niệm (có đi nhà thờ và tiệc) ≈ festival."},

{id:36,passage:PASSAGE_2,question:"[Reading 2 - Blank 1] ...another was (1) ______ on the Nicoya Peninsula of Costa Rica in 2007.",options:["got","discovered","come","become"],correct:1,rationale:"Bị động, song song với 'was discovered' ở câu trước → discovered."},
{id:37,passage:PASSAGE_2,question:"[Reading 2 - Blank 2] ...they have 50% lower rates of heart disease, 20% less cancer, and (2) ______ zero dementia...",options:["almost","quite","hardly","about"],correct:0,rationale:"almost zero = gần như bằng không."},
{id:38,passage:PASSAGE_2,question:"[Reading 2 - Blank 3] What's their secret formula for (3) ______ another 10 healthy years?",options:["making","adding","bringing","supplying"],correct:1,rationale:"adding another 10 years = thêm 10 năm khỏe mạnh."},
{id:39,passage:PASSAGE_2,question:"[Reading 2 - Blank 4] If you adopt the right (4) ______, they concluded the other 70% can be up to us.",options:["remedy","behaviour","lifestyle","medicine"],correct:2,rationale:"adopt the right lifestyle = áp dụng lối sống đúng đắn."},
{id:40,passage:PASSAGE_2,question:"[Reading 2 - Blank 5] ...include less stress and more (5) ______, strong emphasis on family...",options:["sociable","social","society","socializing"],correct:3,rationale:"Sau 'more' cần danh từ/danh động từ, song song với 'less stress' → socializing (giao tiếp xã hội)."},

{id:41,question:"John and Daisy are talking about culture identity.\n- John: \"I think that people should protect their health carefully.\"\n- Daisy: \"______\"",options:["Let's go!","I'd rather you didn't.","Of course not!","There is no doubt about it."],correct:3,rationale:"Thể hiện sự đồng ý mạnh mẽ → There is no doubt about it."},
{id:42,question:"Daniel and Anthony are discussing the causes of ill health.\n- Daniel: \"I think urbanization has led to bad consequences on our health.\"\n- Anthony: \"______\"",options:["I can't agree with you more.","Absolutely. I am not with you there.","No worries. I'm fine.","Can I help you?"],correct:0,rationale:"I can't agree with you more = hoàn toàn đồng ý."},
{id:43,question:"At the school canteen.\n- Alexina: \"I like doing exercises.\"\n- Serena: \"______\"",options:["So am I","Me too","Me either","I too like doing exercises."],correct:1,rationale:"Đồng tình với câu khẳng định → Me too. (So am I sai vì động từ là like → So do I.)"},
{id:44,question:"Helen and Steve are talking together.\n- Helen: \"That is the most horrifying wound that I've ever seen.\"\n- Steve: \"______ . I was really scared of blood.\"",options:["I don't think so","No, it was fascinating","Yes, I've already watched it","I couldn't agree with you more"],correct:3,rationale:"Steve sợ máu nên đồng ý với Helen → I couldn't agree with you more."},
{id:45,question:"Mary and Jane are talking together.\n- Mary: \"You look nice today. I like your new hairstyle\"\n- Jane: \"______\"",options:["It's nice of you to say so","Shall I? Thanks","Oh, Well done","I feel interesting to hear that."],correct:0,rationale:"Đáp lại lời khen → It's nice of you to say so."}
];

const unit1Questions = questions.slice();
const UNIT2_PASSAGE_BIRTHDAY = `<p class="font-bold text-center">A SURPRISE BIRTHDAY PARTY</p>
<p>Last Friday was my dad's birthday, and we organised a surprise party for him. It was great! We decorated the living room (1) ________ balloons and Mum baked a big cake. There were forty candles on the cake because my dad was forty years old. We invited all the family and a few of his friends and waited in the living room for him to come home from work. It was very funny! We had turned out all the lights, and were hiding behind the chairs, the sofa and the curtains. (2) ________, he came into the house and shouted "Hi, everyone! I'm home!". We didn't (3) ________ a sound. "Where is everyone?" he said and came into the room. He turned on the lights and we all shouted "Surprise!". He was so shocked! Dad blew out all the candles on the cake (4) ________ we sang "Happy Birthday". I gave him a tie and my brother got him a CD. Mum bought him a bottle of his favourite wine. We had a great party, and Dad said it was the best birthday he had (5) ________ had. He also said that being forty wasn't as bad as he had thought it could be.</p>`;
const UNIT2_PASSAGE_GENERATION_GAP = `<p class="font-bold text-center">THE GENERATION GAP</p>
<p>The generation gap that was so in evidence during the 60s has resurfaced, but it is not the disruptive force that it was during the Vietnam era, a 2009 study suggests. The Pew Research Center study found that 79% of Americans see major differences between younger and older adults in the way they look at the world. In 1969, a Gallup Poll found that a smaller percentage, 74%, perceived major differences.</p>
<p>Today, however, although more Americans see generational differences, most do not see them as divisive. That is partly because of the areas of difference. The top areas of disagreement between young and old, according to the Pew Research Study, are the use of technology and taste in music. Grandparents are likely to have observed these differences in their grandchildren who are tweens, teens, and young adults.</p>
<p>If large differences between the generations exist, why don't they spawn conflict? The answer is twofold.</p>
<p>First, the two largest areas of difference—technology and music—are less emotionally charged than political issues. The older generation is likely to be proud of the younger generation's prowess in technology rather than to view it as a problem. As for the musical differences, each generation wants its own style of music, and the older generation generally can relate to that desire.</p>
<p>Second, in the other areas of difference, the younger generation tends to regard the older generation as superior to their own generation—clearly a difference from the 1960s with its rallying cry of "Don't trust anyone over thirty." According to the Pew study, all generations regard older Americans as superior in moral values, work ethic and respect for others.</p>
<p class="text-xs text-slate-400">(Adapted from www.verywellfamily.com)</p>`;
const unit2Questions = [
  {id:101,question:"The advice from the health committee is that all people with symptoms ____________ go to the doctor.",type:"text",acceptedAnswers:["should","ought to"],rationale:"Đưa ra lời khuyên → should hoặc ought to."},
  {id:102,question:"This is a non-smoking area, you ____________ smoke here.",type:"text",acceptedAnswers:["mustn't","must not"],rationale:"Khu vực cấm hút thuốc → mustn't."},
  {id:103,question:"He ____________ cook tonight because he's going to a restaurant.",type:"text",acceptedAnswers:["doesn't have to","does not have to"],rationale:"Không cần nấu ăn vì sẽ đi nhà hàng → doesn't have to."},
  {id:104,question:"I ____________ get up early tomorrow because I want to go running very early.",type:"text",acceptedAnswers:["must","have to"],rationale:"Cần dậy sớm để đi chạy → must hoặc have to."},
  {id:105,question:"You ____________ eat so many sweets. They are bad for you.",type:"text",acceptedAnswers:["shouldn't","should not","oughtn't to","ought not to"],rationale:"Đưa lời khuyên không nên ăn nhiều kẹo → shouldn't hoặc ought not to."},
  {id:106,question:"Teachers should respect Tom Holland as much as possible because he put a lot of effort and time into writing the Global Success 11 book for them to teach. (CLOSEST in meaning to “respect”)",options:["look up to","look forwards to","look back on","look down on"],correct:0,rationale:"Respect someone = look up to someone (tôn trọng, ngưỡng mộ)."},
  {id:107,question:"It's vital that our children's handwriting should be legible. (CLOSEST in meaning to “vital”)",options:["divergent","compulsory","essential","obliged"],correct:2,rationale:"vital = thiết yếu ≈ essential."},
  {id:108,question:"Currently, I understand why you moved out of that house. (CLOSEST in meaning to “understand”)",options:["I am surprised","it frustrates me","I am intrigued","it makes sense to me"],correct:3,rationale:"I understand why = it makes sense to me."},
  {id:109,question:"He resembles his father in appearance very much. (CLOSEST in meaning to “resembles”)",options:["looks after","names after","takes after","calls after"],correct:2,rationale:"Resembles in appearance = takes after."},
  {id:110,question:"According to today's newspaper, the price of gasoline fluctuates daily. (CLOSEST in meaning to “fluctuates”)",options:["spin out of control","run faster","change frequently","disappear"],correct:2,rationale:"fluctuates = thay đổi thường xuyên."},
  {id:111,question:"Nuclear family: a family that consists of father, mother and children, when it is thought of as a unit in society. (OPPOSITE in meaning to “nuclear family”)",options:["joint family","traditional family","extended family","single-parent family"],correct:2,rationale:"Nuclear family (gia đình hạt nhân) trái nghĩa theo ngữ cảnh với extended family (gia đình nhiều thế hệ)."},
  {id:112,question:"He is a narrow-minded person in his family and not willing to accept ideas or ways of behaving that are different from his own. (OPPOSITE in meaning to “narrow-minded”)",options:["old-fashioned","mouth-watering","close-knit","open-minded"],correct:3,rationale:"narrow-minded trái nghĩa với open-minded."},
  {id:113,question:"She decided to remain celibate and devote her life to helping the homeless and orphans. (OPPOSITE in meaning to “celibate”)",options:["single","married","separated","divorced"],correct:1,rationale:"celibate (sống độc thân/không kết hôn) trái nghĩa với married."},
  {id:114,question:"My mother is a caring woman and always thoughtful of others. (OPPOSITE in meaning to “caring”)",options:["rude","inconsiderate","inconsiderable","critical"],correct:1,rationale:"caring, thoughtful trái nghĩa với inconsiderate (thiếu quan tâm)."},
  {id:115,question:"My sister had decided to settle permanently in France. (OPPOSITE in meaning to “permanently”)",options:["regularly","temporarily","constantly","sustainably"],correct:1,rationale:"permanently trái nghĩa với temporarily."},
  {id:116,question:"Tom ________ tell me the truth for his own good.",options:["must","should","must not","does not have to"],correct:1,rationale:"Lời khuyên vì lợi ích của Tom → should."},
  {id:117,question:"I ________ be 18 before I can drive in Spain.",options:["should not","has to","have to","must"],correct:2,rationale:"Chủ ngữ I và nghĩa vụ theo luật → have to."},
  {id:118,question:"The children ________ wake up earlier than 7:30 am. They have to go camping at 8:00 am.",options:["must","should not","should","don't have to"],correct:0,rationale:"Cần thức dậy sớm để đi cắm trại lúc 8 giờ → must."},
  {id:119,question:"It is the end of the semester, I ________ study harder.",options:["ought to","must to","should not","have to"],correct:0,rationale:"ought to + động từ nguyên mẫu, diễn đạt lời khuyên."},
  {id:120,question:"You ________ wear a school uniform in most Spanish state schools.",options:["should","mustn't","shouldn't","don't have to"],correct:3,rationale:"Câu nói về việc không bắt buộc mặc đồng phục → don't have to."},
  {id:121,question:"You ________ copy during exams because that is illegal.",options:["should","have to","ought to","mustn't"],correct:3,rationale:"Hành vi bị cấm → mustn't."},
  {id:122,question:"I ________ finish my homework before going to bed.",options:["must","have to","should","ought to"],correct:0,rationale:"Diễn đạt việc cần hoàn thành bài tập trước khi ngủ → must."},
  {id:123,question:"This warning sign shows that everyone ________ step on the grass.",options:["shouldn't","mustn't","don't have to","ought not to"],correct:1,rationale:"Biển cảnh báo cấm giẫm lên cỏ → mustn't."},
  {id:124,question:"We ________ do exercise regularly every day to keep our body strong.",options:["must","should","ought to","Both B and C"],correct:3,rationale:"Cả should và ought to đều diễn đạt lời khuyên."},
  {id:125,question:"You ________ be an expert to use the basic functions of the program.",options:["should","have to","must","mustn't","don't have to"],correct:4,rationale:"Không bắt buộc phải là chuyên gia → don't have to. Giữ nguyên bốn lựa chọn được cung cấp và bổ sung lựa chọn đúng bị thiếu."},
  {id:126,question:"Hoa ________ feed the cats because her mother has done it already.",options:["has to","doesn't have to","must","Both A and C"],correct:1,rationale:"Mẹ đã cho mèo ăn rồi nên Hoa không cần làm nữa → doesn't have to."},
  {id:127,question:"You ________ give children money as a present.",options:["have to","must","ought not to","don't have to"],correct:2,rationale:"ought not to = không nên."},
  {id:128,question:"You are ill, so I think you ________ go to school today.",options:["mustn't","ought to not","shouldn't","Both B and C"],correct:2,rationale:"Lời khuyên khi bị ốm → shouldn't."},
  {id:129,question:"Please, tell her that she ________ get good results at school!",options:["had better","has to","ought","have to"],correct:1,rationale:"has to + động từ nguyên mẫu; ought trong lựa chọn thiếu 'to'."},
  {id:130,question:"We go to bed right after dinner because we ________ get up early tomorrow.",options:["have to","mustn't","should","don't have to"],correct:0,rationale:"Có nghĩa vụ phải dậy sớm vào ngày mai → have to."},
  {id:131,question:"The food price will change at the end of this month.",options:["The food price will be the same until the end of this month.","The food price of this month will be equal to the one of next month.","There will be no same food price from now till next month.","There will be two different food prices next month."],correct:2,rationale:"Câu C diễn đạt giá sẽ không giữ nguyên từ nay đến tháng sau."},
  {id:132,question:"All the other schools in the city are more expensive than my school.",options:["My school is one of the most expensive schools in the city.","There are some more expensive schools than mine in the city.","My school is the least expensive school in the city.","There are some cheaper schools than my school in the city."],correct:2,rationale:"Nếu tất cả trường còn lại đều đắt hơn trường tôi, trường tôi là rẻ nhất."},
  {id:133,question:"Somebody broke into our cottage last Saturday.",options:["Our cottage was broken into last Saturday.","Our cottage was being broken into last Saturday.","Our cottage has been broken into last Saturday.","Our cottage had broken into last Saturday."],correct:0,rationale:"Chuyển sang bị động quá khứ đơn: was broken into."},
  {id:134,question:"“Stop treating me that way!” she cried out.",options:["She warned me not to treat her that way.","She urged me not to treat her that way.","She begged me to treat her that way.","She advised me not to treat her that way."],correct:0,rationale:"Câu mệnh lệnh phản đối có thể tường thuật là warned me not to treat her that way."},
  {id:135,question:"She can do it because she knows the system inside out.",options:["She can do it because she is from inside the system.","She can do it because the system is sometimes in and sometimes out.","She can do it because she understands the system thoroughly.","The confidential system enables her to do because she knows it."],correct:2,rationale:"know something inside out = hiểu điều gì đó rất cặn kẽ."},
  {id:136,question:"I am the youngest son in the family. I didn’t have to do much housework.",options:["Being the youngest son in the family, I didn’t have to do much housework.","If I was the youngest son in the family, I wouldn’t have done much housework.","Although I am the youngest son in the family, I wouldn’t have done much housework.","Despite the fact that I am the youngest son in the family, I did not have to do much housework."],correct:0,rationale:"Dùng Being... làm mệnh đề phân từ chỉ nguyên nhân."},
  {id:137,question:"We need to share the tasks. The burden on each family member will be more tolerable.",options:["Although the burden on each family member will be more tolerable, we still need to share the tasks.","We need to share the tasks so the burden on each family member will be more tolerable.","Unless we share the tasks, the burden on each family member will be more tolerable.","It is essential to share the tasks, otherwise, the burden on each family member will be more tolerable."],correct:1,rationale:"so nối nguyên nhân/mục đích với kết quả phù hợp."},
  {id:138,question:"Dan saw all the paintings. He left right after.",options:["Dan left right after to see all the paintings.","Dan left all the paintings after seeing them.","Right after seeing all the paintings, Dan left.","He left and then saw the paintings right after."],correct:2,rationale:"Right after seeing... diễn đạt việc rời đi ngay sau khi xem tranh."},
  {id:139,question:"I usually like red. I wore black to the party with my family last night.",options:["Because I usually like red, I wore black to the party with my family last night.","Although I usually like red, I wore black to the party with my family last night.","Unless I like red, I wore black to the party with my family last night.","As a result of my interest in red, I wore black to the party with my family last night."],correct:1,rationale:"Although diễn đạt sự tương phản giữa thường thích màu đỏ nhưng đã mặc đen."},
  {id:140,question:"She tried her best. She won the biggest prize to make her parents happy.",options:["If she had tried her best, she could have won the biggest prize to make her parents happy.","Unless she tried her best, she couldn’t win the biggest prize to make her parents happy.","Although she tried her best, she still won the biggest prize to make her parents happy.","If she hadn’t tried her best, she couldn’t have won the biggest prize to make her parents happy."],correct:3,rationale:"Câu điều kiện loại 3: nếu cô ấy không cố gắng thì đã không thể thắng."},
  {id:141,question:"Ann is carrying a heavy bag.\nJohn: “Would you like me to carry the bag for you, Ann?”\nAnn: “________________”",options:["No, do it as you want.","Oh, thanks. I can carry it myself.","Yes. That’s fine.","No, I don’t need."],correct:2,rationale:"Yes. That's fine là cách chấp nhận lời đề nghị tự nhiên."},
  {id:142,question:"Mom and her son are talking together.\nSon: “Mom, I've received an offer for a summer internship in Singapore!”\nMom: “________________”",options:["Really? Good luck!","Oh, that's great! Congratulations!","I couldn't agree more.","Oh, I'm sorry to hear that."],correct:1,rationale:"Tin vui nhận được cơ hội thực tập → chúc mừng."},
  {id:143,question:"Sarah and Kathy are talking about bad habits of children.\nSarah: “Children under ten shouldn't stay up late to play computer games.”\nKathy: “________________”",options:["I don't quite agree with you","Yes, I share your opinion.","You are absolute right.","Surely, they shouldn't"],correct:1,rationale:"Yes, I share your opinion thể hiện đồng tình; lựa chọn C sai dạng đúng phải là 'absolutely right'."},
  {id:144,question:"Nancy and James are talking about their family.\nNancy: “I think Lunar New Year's days are the best time of our family.”\nJames: “________. We had sweet memories together then.”",options:["Absolutely","That's nonsense","I'm afraid so","I doubt it"],correct:0,rationale:"Câu sau nói về kỷ niệm đẹp, xác nhận sự đồng tình → Absolutely."},
  {id:145,question:"Peter and Tam are talking together about their family.\nPeter: “From my point of view, all family members should share the chores equally.”\nTam: “________________”",options:["It's a breathtaking view.","You lied to me.","But you're right.","There's no doubt about it."],correct:3,rationale:"There's no doubt about it thể hiện đồng ý với ý kiến."},
  {id:146,passage:UNIT2_PASSAGE_BIRTHDAY,question:"[Reading 1 - Blank 1] We decorated the living room (1) ________ balloons.",options:["in","at","on","with"],correct:3,rationale:"decorate a room with balloons = trang trí phòng bằng bóng."},
  {id:147,passage:UNIT2_PASSAGE_BIRTHDAY,question:"[Reading 1 - Blank 2] (2) ________, he came into the house and shouted “Hi, everyone! I'm home!”.",options:["In particular","At least","As usual","In general"],correct:2,rationale:"As usual = như thường lệ."},
  {id:148,passage:UNIT2_PASSAGE_BIRTHDAY,question:"[Reading 1 - Blank 3] We didn't (3) ________ a sound.",options:["do","hear","take","make"],correct:3,rationale:"make a sound = phát ra tiếng động."},
  {id:149,passage:UNIT2_PASSAGE_BIRTHDAY,question:"[Reading 1 - Blank 4] Dad blew out all the candles on the cake (4) ________ we sang “Happy Birthday”.",options:["and","because","as","however"],correct:2,rationale:"as = trong khi/khi chúng tôi hát."},
  {id:150,passage:UNIT2_PASSAGE_BIRTHDAY,question:"[Reading 1 - Blank 5] Dad said it was the best birthday he had (5) ________ had.",options:["almost","ever","hardly","never"],correct:1,rationale:"the best ... ever = ... tuyệt nhất từ trước đến nay."},
  {id:151,passage:UNIT2_PASSAGE_GENERATION_GAP,question:"[Reading 2] Which of the following could be the main idea of the passage?",options:["Generation gap doesn't cause a big problem in American families.","Different points of view are the main problem between generations in America.","The generation gap in the past was different from that in modern time.","The areas of differences in generation gap have changed over the years."],correct:0,rationale:"Bài đọc giải thích vì sao khoảng cách thế hệ hiện nay không phải là nguyên nhân gây xung đột lớn."},
  {id:152,passage:UNIT2_PASSAGE_GENERATION_GAP,question:"[Reading 2] The word “divisive” in the second paragraph is closest in meaning to ________.",options:["agreeing","positive","serious","discordant"],correct:3,rationale:"divisive = gây chia rẽ, bất hòa ≈ discordant."},
  {id:153,passage:UNIT2_PASSAGE_GENERATION_GAP,question:"[Reading 2] What are the two reasons why large differences between generations don't cause disagreement?",options:["The generosity of the elder generation and the attitude of the younger generation.","The different styles of music and the knowledge of the elder generation.","The major aspects of differences between generations and the respect to the elder generation.","The pride of the elder generation and the obedience of the younger one."],correct:2,rationale:"Hai lý do là các lĩnh vực khác biệt ít gây cảm xúc hơn và thế hệ trẻ tôn trọng thế hệ lớn tuổi."},
  {id:154,passage:UNIT2_PASSAGE_GENERATION_GAP,question:"[Reading 2] The word “their” in the last paragraph refers to ________.",options:["the older generation's","the younger generation's","supervisor's","over-thirty people's"],correct:1,rationale:"their own generation quy chiếu về the younger generation."},
  {id:155,passage:UNIT2_PASSAGE_GENERATION_GAP,question:"[Reading 2] According to the passage, which is NOT true?",options:["The majority of Americans agree generations' viewpoint to be the major differences.","Technology is one of the two biggest areas creating the gap between the old and the young.","Grandparents feel uncomfortable with their grandchildren because of their better technology skills.","The elderly in America are admired in moral values, work ethic and respect for others."],correct:2,rationale:"Bài nói thế hệ lớn tuổi thường tự hào về khả năng công nghệ của người trẻ, không phải cảm thấy khó chịu."}
];
const allUnitQuestions = unit1Questions.concat(unit2Questions);
const combinedQuestionPools = {
  grammar: allUnitQuestions.filter(question =>
    (question.id >= 11 && question.id <= 30) || (question.id >= 116 && question.id <= 130)),
  synonyms: allUnitQuestions.filter(question =>
    (question.id >= 1 && question.id <= 5) || (question.id >= 106 && question.id <= 110)),
  antonyms: allUnitQuestions.filter(question =>
    (question.id >= 6 && question.id <= 10) || (question.id >= 111 && question.id <= 115)),
  reading: allUnitQuestions.filter(question =>
    (question.id >= 31 && question.id <= 35) || (question.id >= 151 && question.id <= 155)),
  'passage-fill': allUnitQuestions.filter(question =>
    (question.id >= 36 && question.id <= 40) || (question.id >= 146 && question.id <= 150)),
  'verb-fill': allUnitQuestions.filter(question => question.id >= 101 && question.id <= 105)
};
const combinedCategoryLabels = {
  grammar: 'Ngữ pháp · Unit 1 + Unit 2',
  synonyms: 'Từ đồng nghĩa',
  antonyms: 'Từ trái nghĩa',
  reading: 'Reading · Đọc hiểu',
  'passage-fill': 'Điền vào chỗ trống của đoạn văn',
  'verb-fill': 'Điền động từ'
};
const combinedExamQuestionCount = 31;
function createCombinedCategories() {
  return Object.fromEntries(Object.entries(combinedQuestionPools).map(([key]) => [
    key,
    { label: combinedCategoryLabels[key], questionIds: new Set() }
  ]));
}
let originalQuestions = unit1Questions.slice();
let currentIndex = 0, userAnswers = new Array(questions.length).fill(null), score = 0;
let submitted = false, processing = false, unansweredOnly = false, wrongReviewVisible = false;
let activeQuestionIndices = questions.map((_, i) => i);
let examCode = '', answerCode = '', answerOrders = new Map();
let selectedCategory = 'all';
let quizStarted = false;
let selectedExamDurationSeconds = 0;
let activeFullExam = false;
let activeCombinedExam = false;
let timeExpired = false;
let antiCheatTemporarilyDisabled = false;
let developerAiUnlocked = false;
let developerAiHintOnly = false;
let pickerTransitionTimeout = 0;
let quizTimerInterval = 0;
let quizTimerDeadline = 0;
let quizTimerStartedAt = 0;
let developerBoardDrag = null;
let developerElementHistory = [];
let quizStatusCompactTimeout = 0;
let previousScrollY = window.scrollY;
let customBackgroundSelected = false;
let developerBoardResizeObserver = null;
const $ = id => document.getElementById(id);
const letter = i => String.fromCharCode(65 + i);
let categories = {
  'multiple-choice': {
    label: 'Trắc nghiệm ngữ pháp',
    questionIds: new Set(Array.from({ length: 20 }, (_, i) => i + 11))
  },
  dialogue: {
    label: 'Hội thoại',
    questionIds: new Set([41, 42, 43, 44, 45])
  },
  reading: {
    label: 'Reading',
    questionIds: new Set([31, 32, 33, 34, 35, 36, 37, 38, 39, 40])
  },
  synonyms: {
    label: 'Từ đồng nghĩa',
    questionIds: new Set([1, 2, 3, 4, 5])
  },
  antonyms: {
    label: 'Từ trái nghĩa',
    questionIds: new Set([6, 7, 8, 9, 10])
  }
};
const unit1Categories = categories;
const unit2Categories = {
  'modal-practice': {
    label: 'Modal verbs · Điền từ',
    questionIds: new Set([101, 102, 103, 104, 105])
  },
  synonyms: {
    label: 'Từ đồng nghĩa',
    questionIds: new Set([106, 107, 108, 109, 110])
  },
  antonyms: {
    label: 'Từ trái nghĩa',
    questionIds: new Set([111, 112, 113, 114, 115])
  },
  grammar: {
    label: 'Ngữ pháp · Modal verbs',
    questionIds: new Set(Array.from({ length: 15 }, (_, i) => i + 116))
  },
  'sentence-transformations': {
    label: 'Viết lại câu',
    questionIds: new Set([131, 132, 133, 134, 135])
  },
  'sentence-combining': {
    label: 'Kết hợp câu',
    questionIds: new Set([136, 137, 138, 139, 140])
  },
  dialogue: {
    label: 'Speaking · Hội thoại',
    questionIds: new Set([141, 142, 143, 144, 145])
  },
  reading: {
    label: 'Reading',
    questionIds: new Set([146, 147, 148, 149, 150, 151, 152, 153, 154, 155])
  }
};
let activeUnit = 1;

function initApp() {
  document.body.append($('developer-board'), $('developer-board-bubble'));
  const storedTheme = localStorage.getItem('quiz-theme-mode');
  $('theme-setting').value = ['system', 'light', 'dark'].includes(storedTheme) ? storedTheme : 'system';
  applyTheme();
  $('theme-setting').addEventListener('change', () => applyTheme(true));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ($('theme-setting').value === 'system') applyTheme();
  });
  $('font-size-setting').addEventListener('input', applyFontSize);
  $('background-color-setting').addEventListener('input', applyBackgroundColor);
  document.addEventListener('keydown', handleAntiCheatKeydown, true);
  window.addEventListener('resize', checkDevTools);
  window.addEventListener('resize', constrainDeveloperBoard);
  if (typeof ResizeObserver === 'function') {
    developerBoardResizeObserver = new ResizeObserver(constrainDeveloperBoard);
    developerBoardResizeObserver.observe($('developer-board'));
  }
  window.addEventListener('scroll', updateQuizHeaderVisibility, { passive: true });
  window.addEventListener('pointermove', handleQuizDisplayActivity, { passive: true });
  window.addEventListener('wheel', scheduleQuizStatusCompact, { passive: true });
  window.addEventListener('touchstart', scheduleQuizStatusCompact, { passive: true });
  document.addEventListener('keydown', handleQuizKeyboard);
  $('question-list').addEventListener('click', event => {
    const googleLink = event.target.closest('.ask-google-ai');
    if (googleLink && !submitted && googleLink.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      return;
    }
    const option = event.target.closest('.question-card-option');
    if (!option || option.disabled) return;
    selectAnswerForQuestion(Number(option.dataset.questionIndex), Number(option.dataset.optionIndex));
  });
  $('question-list').addEventListener('input', event => {
    const answerInput = event.target.closest('.question-text-answer');
    if (!answerInput || submitted || timeExpired) return;
    userAnswers[Number(answerInput.dataset.questionIndex)] = answerInput.value.trim() || null;
    updateProgress();
  });
  $('submit-btn').addEventListener('click', showResults);
  $('developer-command-form').addEventListener('submit', event => {
    event.preventDefault();
    executeDeveloperCommand($('developer-command-input').value);
  });
  $('developer-board-command-form').addEventListener('submit', event => {
    event.preventDefault();
    const commandInput = $('developer-board-command-input');
    executeDeveloperCommand(commandInput.value);
    commandInput.select();
  });
  $('developer-board').addEventListener('click', event => {
    const button = event.target.closest('[data-dev-command]');
    if (button) executeDeveloperCommand(button.dataset.devCommand);
  });
  $('developer-board-collapse').addEventListener('click', collapseDeveloperBoard);
  $('developer-board-bubble').addEventListener('click', openDeveloperBoard);
  $('developer-board-drag-handle').addEventListener('pointerdown', startDeveloperBoardDrag);
  $('developer-board-drag-handle').addEventListener('pointermove', moveDeveloperBoardDrag);
  $('developer-board-drag-handle').addEventListener('pointerup', stopDeveloperBoardDrag);
  $('developer-board-drag-handle').addEventListener('pointercancel', stopDeveloperBoardDrag);
  $('developer-board-drag-handle').addEventListener('lostpointercapture', stopDeveloperBoardDrag);
  $('quiz-header').addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') $('quiz-header').classList.remove('quiz-header-compact');
  });
  $('quiz-header').addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && window.scrollY > 40) {
      $('quiz-header').classList.add('quiz-header-compact');
    }
  });
  $('quiz-header').addEventListener('focusin', () => {
    $('quiz-header').classList.remove('quiz-header-compact');
  });
  $('quiz-header').addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!$('quiz-header').matches(':focus-within') && window.scrollY > 40) {
        $('quiz-header').classList.add('quiz-header-compact');
      }
    }, 0);
  });
  $('quiz-status-bar').addEventListener('pointerenter', () => {
    $('quiz-status-bar').classList.remove('is-compact');
    clearQuizStatusCompactTimeout();
  });
  $('quiz-status-bar').addEventListener('pointerleave', scheduleQuizStatusCompact);
  $('quiz-status-bar').addEventListener('focusin', () => {
    $('quiz-status-bar').classList.remove('is-compact');
    clearQuizStatusCompactTimeout();
  });
  $('quiz-status-bar').addEventListener('focusout', scheduleQuizStatusCompact);
  $('quiz-timer-rail').addEventListener('click', () => {
    const timer = $('quiz-timer');
    const isOpen = timer.classList.toggle('is-open');
    $('quiz-timer-rail').setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) $('quiz-timer-rail').blur();
  });
  $('quiz-timer-rail').addEventListener('focus', () => {
    $('quiz-timer-rail').setAttribute('aria-expanded', 'true');
  });
  $('quiz-timer-rail').addEventListener('blur', () => {
    if (!$('quiz-timer').classList.contains('is-open')) {
      $('quiz-timer-rail').setAttribute('aria-expanded', 'false');
    }
  });
  $('quiz-timer').addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') $('quiz-timer-rail').setAttribute('aria-expanded', 'true');
  });
  $('quiz-timer').addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !$('quiz-timer').classList.contains('is-open')
      && !$('quiz-timer').matches(':focus-within')) {
      $('quiz-timer-rail').setAttribute('aria-expanded', 'false');
    }
  });
  $('open-unit1').addEventListener('click', () => showUnitSections(1));
  $('open-unit2').addEventListener('click', () => showUnitSections(2));
  $('back-to-units-from-combined').addEventListener('click', showUnitPicker);
  $('combined-exam-options').addEventListener('click', event => {
    const button = event.target.closest('[data-combined-exam-code]');
    if (button) startCombinedExam(button.dataset.combinedExamCode);
  });
  $('generate-exam').addEventListener('click', startFullExam);
  document.querySelectorAll('[data-exam-duration]').forEach(button => {
    button.addEventListener('click', () => selectExamDuration(button));
  });
  $('back-to-units').addEventListener('click', showUnitPicker);
  $('back-to-sections').addEventListener('click', () => {
    if (activeCombinedExam) showCombinedExamPicker();
    else showUnitSections();
  });
  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => startCategory(button.dataset.category));
  });
  document.addEventListener('click', handleActionClick);
  const params = new URLSearchParams(window.location.search);
  const qt = params.get('token'), at = params.get('answerToken');
  const ok = c => typeof c === 'string' && /^[0-9A-F]{8}$/i.test(c);
  activeCombinedExam = params.get('mode') === 'unit12';
  if (activeCombinedExam) {
    activeUnit = 0;
    questions = allUnitQuestions.slice();
    originalQuestions = allUnitQuestions.slice();
    categories = createCombinedCategories();
    selectedCategory = 'all';
    $('header-unit-title').textContent = 'Đề tổng hợp Unit 1 + Unit 2';
    $('active-category-label').textContent = `Đề tổng hợp Unit 1 + Unit 2 · ${combinedExamQuestionCount} câu`;
    $('back-to-sections').textContent = '← Chọn mã đề khác';
    document.title = 'Đề tổng hợp Unit 1 + Unit 2 · Bài tập Tiếng Anh';
    $('unit-picker').classList.add('hidden');
    $('combined-exam-picker').classList.add('hidden');
    $('unit1-section-picker').classList.add('hidden');
    revealQuizScreen();
  }
  examCode = ok(qt) ? qt.toUpperCase() : createExamCode();
  answerCode = ok(at) ? at.toUpperCase() : ok(qt) ? qt.toUpperCase() : createExamCode();
  setAnswerOrders(answerCode);
  $('current-answer-code').value = answerCode;
  $('answer-code-input').value = answerCode;
  $('header-answer-code').innerText = answerCode;
  setExamCode(examCode);
  if (activeCombinedExam) {
    activeFullExam = true;
    quizStarted = true;
    restartQuiz();
  }
}
function handleActionClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const actions = {
    'toggle-grid': toggleGrid,
    'open-settings': openSettings,
    'toggle-unanswered': toggleUnansweredQuestions,
    'prev-question': prevQuestion,
    'next-question': nextQuestion,
    'review-submitted': reviewSubmittedAnswers,
    'toggle-wrong': toggleWrongReview,
    'retry-wrong': retryWrongQuestions,
    'restart-quiz': restartQuiz,
    'apply-exam-code': applyEnteredExamCode,
    'new-exam-code': generateNewExamCode,
    'apply-answer-code': applyEnteredAnswerCode,
    'new-answer-code': generateNewAnswerCode,
    'share-exam-link': shareExamLink,
    'reset-settings': resetSettings
  };
  const action = actions[button.dataset.action];
  if (action) action();
}
function showUnitPicker() {
  stopQuizTimer();
  if (activeCombinedExam) {
    $('header-unit-title').textContent = 'Unit 1: A Long and Healthy Life';
    document.title = 'Bài Tập Tiếng Anh - Unit 1: A Long and Healthy Life';
  }
  activeCombinedExam = false;
  transitionPickerTo('unit-picker');
  $('quiz-app').hidden = true;
  syncExamCodesToUrl();
}
function transitionPickerTo(targetId) {
  const screens = ['unit-picker', 'unit1-section-picker', 'combined-exam-picker'].map($);
  const target = $(targetId);
  if (pickerTransitionTimeout) window.clearTimeout(pickerTransitionTimeout);
  screens.forEach(screen => screen.classList.remove('is-leaving', 'is-entering'));
  const outgoing = screens.filter(screen =>
    screen !== target && !screen.classList.contains('hidden'));
  outgoing.forEach(screen => screen.classList.add('is-leaving'));
  target.classList.remove('hidden');
  target.classList.add('is-entering');
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => target.classList.remove('is-entering'));
  });
  pickerTransitionTimeout = window.setTimeout(() => {
    outgoing.forEach(screen => {
      screen.classList.add('hidden');
      screen.classList.remove('is-leaving');
    });
    target.classList.remove('is-entering');
    pickerTransitionTimeout = 0;
  }, 240);
}
function revealQuizScreen() {
  const quiz = $('quiz-app');
  quiz.hidden = false;
  quiz.classList.add('is-entering');
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => quiz.classList.remove('is-entering'));
  });
}
function showUnitSections(unit = activeUnit) {
  stopQuizTimer();
  activeCombinedExam = false;
  activeUnit = unit;
  questions = (unit === 2 ? unit2Questions : unit1Questions).slice();
  originalQuestions = questions.slice();
  categories = unit === 2 ? unit2Categories : unit1Categories;
  setAnswerOrders(answerCode);
  questions.splice(0, questions.length, ...shuffleQuestions(examCode));
  selectedCategory = 'all';
  activeFullExam = false;
  submitted = false;
  quizStarted = false;
  $('section-unit-label').textContent = `Unit ${unit}`;
  $('section-unit-title').textContent = unit === 2 ? 'The Generation Gap' : 'A Long and Healthy Life';
  $('header-unit-title').textContent = unit === 2 ? 'Unit 2: The Generation Gap' : 'Unit 1: A Long and Healthy Life';
  document.title = `${$('header-unit-title').textContent} · Bài tập Tiếng Anh`;
  $('unit1-category-grid').classList.toggle('hidden', unit !== 1);
  $('unit2-category-grid').classList.toggle('hidden', unit !== 2);
  const total = questions.length;
  $('exam-time-summary').textContent = `Đề tổng hợp Unit ${unit} đủ ${total} câu · không giới hạn thời gian`;
  transitionPickerTo('unit1-section-picker');
  $('quiz-app').hidden = true;
  $('back-to-sections').textContent = '← Danh sách phần';
  syncExamCodesToUrl();
}
function showCombinedExamPicker() {
  stopQuizTimer();
  activeFullExam = false;
  activeCombinedExam = false;
  $('quiz-app').hidden = true;
  transitionPickerTo('combined-exam-picker');
  const codes = new Set();
  while (codes.size < 4) codes.add(createExamCode());
  $('combined-exam-options').replaceChildren(...Array.from(codes, (code, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.combinedExamCode = code;
    button.className = 'rounded-xl border border-slate-600 bg-slate-900/60 hover:border-indigo-400 p-5 text-left transition';
    const title = document.createElement('span');
    title.className = 'block font-bold text-indigo-300';
    title.textContent = `Mã đề ${String.fromCharCode(65 + index)}`;
    const token = document.createElement('span');
    token.className = 'block text-sm text-slate-400 mt-2 font-mono';
    token.textContent = `${code} · ${combinedExamQuestionCount} câu`;
    button.append(title, token);
    return button;
  }));
  $('back-to-sections').textContent = '← Chọn mã đề khác';
  syncExamCodesToUrl();
}
function startCombinedExam(code) {
  if (quizStarted && (submitted || userAnswers.some(answer => answer !== null)) &&
      !window.confirm('Bắt đầu đề tổng hợp sẽ xóa câu trả lời hiện tại. Bạn có muốn tiếp tục không?')) return;
  activeCombinedExam = true;
  activeUnit = 0;
  originalQuestions = allUnitQuestions.slice();
  questions = originalQuestions.slice();
  categories = createCombinedCategories();
  selectedCategory = 'all';
  activeFullExam = true;
  submitted = false;
  $('header-unit-title').textContent = 'Đề tổng hợp Unit 1 + Unit 2';
  $('active-category-label').textContent = `Đề tổng hợp Unit 1 + Unit 2 · ${combinedExamQuestionCount} câu`;
  $('back-to-sections').textContent = '← Chọn mã đề khác';
  document.title = 'Đề tổng hợp Unit 1 + Unit 2 · Bài tập Tiếng Anh';
  $('combined-exam-picker').classList.add('hidden');
  $('unit-picker').classList.add('hidden');
  $('unit1-section-picker').classList.add('hidden');
  revealQuizScreen();
  setAnswerOrders(answerCode);
  setExamCode(code);
  quizStarted = true;
}
function startCategory(category) {
  if (!categories[category]) return;
  if (quizStarted && category !== selectedCategory &&
      (submitted || activeQuestionIndices.some(index => userAnswers[index] !== null)) &&
      !window.confirm('Đổi sang phần khác sẽ xóa câu trả lời của phần hiện tại. Bạn có muốn tiếp tục không?')) return;
  const resume = quizStarted && category === selectedCategory;
  activeFullExam = false;
  selectedCategory = category;
  $('active-category-label').textContent = categories[category].label;
  $('unit-picker').classList.add('hidden');
  $('unit1-section-picker').classList.add('hidden');
  revealQuizScreen();
  if (!resume) restartQuiz();
  quizStarted = true;
}
function getCategoryQuestionIndices() {
  if (selectedCategory === 'all') {
    return Object.keys(categories).flatMap(categoryKey =>
      questions.reduce((indices, question, index) => {
        if (categories[categoryKey].questionIds.has(question.id)) indices.push(index);
        return indices;
      }, [])
    );
  }
  const category = categories[selectedCategory];
  return questions.reduce((indices, question, index) => {
    if (category.questionIds.has(question.id)) indices.push(index);
    return indices;
  }, []);
}
function startFullExam() {
  if (quizStarted && (submitted || userAnswers.some(answer => answer !== null)) &&
      !window.confirm('Bắt đầu đề tổng hợp sẽ tạo đề mới và xóa câu trả lời hiện tại. Bạn có muốn tiếp tục không?')) return;
  selectedCategory = 'all';
  activeFullExam = true;
  $('active-category-label').textContent = `Đề tổng hợp Unit ${activeUnit} · ${questions.length} câu`;
  activeCombinedExam = false;
  selectedExamDurationSeconds = Number(document.querySelector('[data-exam-duration][aria-pressed="true"]')?.dataset.examDuration || 0);
  $('unit-picker').classList.add('hidden');
  $('unit1-section-picker').classList.add('hidden');
  revealQuizScreen();
  let nextCode = createExamCode();
  while (nextCode === examCode) nextCode = createExamCode();
  setExamCode(nextCode);
  $(`question-card-${activeQuestionIndices[0]}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
  quizStarted = true;
}
function selectExamDuration(button) {
  const seconds = Number(button.dataset.examDuration);
  if (!Number.isInteger(seconds) || seconds < 0) return;
  selectedExamDurationSeconds = seconds;
  document.querySelectorAll('[data-exam-duration]').forEach(option => {
    option.setAttribute('aria-pressed', String(option === button));
  });
  const durationLabel = seconds === 0 ? 'không giới hạn thời gian' :
    `${button.querySelector('.exam-time-mode-copy strong').textContent} · ${button.querySelector('.exam-time-mode-copy span').textContent}`;
  $('exam-time-summary').textContent = `Đề tổng hợp Unit ${activeUnit} đủ ${questions.length} câu · xáo trộn · ${durationLabel}`;
}
function formatQuizTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
}
function stopQuizTimer() {
  if (quizTimerInterval) window.clearInterval(quizTimerInterval);
  quizTimerInterval = 0;
  quizTimerDeadline = 0;
}
function placeSubmitButtonInTimer(useTimer) {
  const submitButton = $('submit-btn');
  const timer = $('quiz-timer');
  if (useTimer) {
    timer.querySelector('.quiz-timer-details').appendChild(submitButton);
  } else {
    $('quiz-status-actions').appendChild(submitButton);
  }
}
function startQuizTimer() {
  stopQuizTimer();
  const timer = $('quiz-timer');
  timeExpired = false;
  timer.classList.remove('is-open', 'is-warning', 'is-expired');
  $('quiz-timer-rail').setAttribute('aria-expanded', 'false');
  $('quiz-timer-rail').setAttribute('aria-label', 'Mở thanh thời gian');
  placeSubmitButtonInTimer(activeFullExam);
  scheduleQuizStatusCompact();
  if (!activeFullExam) {
    timer.hidden = true;
    $('quiz-timer-value').textContent = '∞';
    $('quiz-timer-compact').textContent = '∞';
    $('quiz-elapsed-value').textContent = 'Đã dùng 00:00';
    return;
  }
  timer.hidden = false;
  quizTimerStartedAt = Date.now();
  quizTimerDeadline = selectedExamDurationSeconds > 0
    ? quizTimerStartedAt + selectedExamDurationSeconds * 1000
    : 0;
  const updateTimer = () => {
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - quizTimerStartedAt) / 1000));
    $('quiz-elapsed-value').textContent = `Đã dùng ${formatQuizTime(elapsedSeconds)}`;
    if (selectedExamDurationSeconds === 0) {
      $('quiz-timer-value').textContent = '∞';
      $('quiz-timer-compact').textContent = '∞';
      return;
    }
    const secondsLeft = Math.max(0, Math.ceil((quizTimerDeadline - now) / 1000));
    const remainingTime = formatQuizTime(secondsLeft);
    $('quiz-timer-value').textContent = remainingTime;
    $('quiz-timer-compact').textContent = remainingTime;
    timer.classList.toggle('is-warning', secondsLeft > 0 && secondsLeft <= 30);
    if (secondsLeft > 0) return;
    timer.classList.add('is-expired');
    timeExpired = true;
    $('quiz-timer-rail').setAttribute('aria-label', 'Hết giờ. Mở thanh thời gian để nộp bài');
    document.querySelectorAll('.question-card-option, .question-text-answer').forEach(control => {
      control.disabled = true;
    });
    if (quizTimerInterval) window.clearInterval(quizTimerInterval);
    quizTimerInterval = 0;
  };
  updateTimer();
  if (!submitted) quizTimerInterval = window.setInterval(updateTimer, 1000);
}
function createExamCode() { const v = new Uint32Array(1); window.crypto.getRandomValues(v); return v[0].toString(16).padStart(8, '0').toUpperCase(); }
function createSeededRandom(s0) { let s = s0 >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let v = s; v = Math.imul(v ^ (v >>> 15), v | 1); v ^= v + Math.imul(v ^ (v >>> 7), v | 61); return ((v ^ (v >>> 14)) >>> 0) / 4294967296; }; }
function shuffleList(items, random) {
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function shuffleQuestions(code) {
  const base = Number.parseInt(code, 16) >>> 0;
  if (activeCombinedExam) {
    const pick = (categoryKey, count) => {
      let seed = base;
      for (const char of categoryKey) seed = Math.imul(seed ^ char.charCodeAt(0), 0x45d9f3b) >>> 0;
      return shuffleList(combinedQuestionPools[categoryKey], createSeededRandom(seed)).slice(0, count);
    };
    const pickPassage = categoryKey => {
      let seed = base;
      for (const char of categoryKey) seed = Math.imul(seed ^ char.charCodeAt(0), 0x45d9f3b) >>> 0;
      const passageGroups = new Map();
      combinedQuestionPools[categoryKey].forEach(question => {
        const group = passageGroups.get(question.passage) || [];
        group.push(question);
        passageGroups.set(question.passage, group);
      });
      const groups = Array.from(passageGroups.values());
      if (groups.length !== 2 || groups.some(group => group.length !== 5)) {
        throw new Error(`Unexpected ${categoryKey} passage question pool.`);
      }
      return shuffleList(groups, createSeededRandom(seed))[0];
    };
    const pickAllPassages = categoryKey => {
      let seed = base;
      for (const char of categoryKey) seed = Math.imul(seed ^ char.charCodeAt(0), 0x45d9f3b) >>> 0;
      const passageGroups = new Map();
      combinedQuestionPools[categoryKey].forEach(question => {
        const group = passageGroups.get(question.passage) || [];
        group.push(question);
        passageGroups.set(question.passage, group);
      });
      const groups = Array.from(passageGroups.values());
      if (groups.length !== 2 || groups.some(group => group.length !== 5)) {
        throw new Error(`Unexpected ${categoryKey} passage question pool.`);
      }
      return shuffleList(groups, createSeededRandom(seed)).flatMap((group, index) =>
        shuffleList(group, createSeededRandom(seed ^ Math.imul(index + 1, 0x9E3779B1)))
      );
    };
    const selected = {
      grammar: pick('grammar', 12),
      synonyms: pick('synonyms', 1),
      antonyms: pick('antonyms', 1),
      reading: pickAllPassages('reading'),
      'passage-fill': pickPassage('passage-fill'),
      'verb-fill': pick('verb-fill', 2)
    };
    categories = createCombinedCategories();
    Object.entries(selected).forEach(([categoryKey, selectedQuestions]) => {
      categories[categoryKey].questionIds = new Set(selectedQuestions.map(question => question.id));
    });
  }
  return Object.entries(categories).flatMap(([categoryKey, category]) => {
    const matching = originalQuestions.filter(question => category.questionIds.has(question.id));
    let categorySeed = base;
    for (const char of categoryKey) categorySeed = Math.imul(categorySeed ^ char.charCodeAt(0), 0x45d9f3b) >>> 0;
    const random = createSeededRandom(categorySeed);
    const blocks = [];
    const standaloneQuestions = matching.filter(question => !question.passage);
    if (standaloneQuestions.length) blocks.push(shuffleList(standaloneQuestions, random));
    const passageGroups = [];
    matching.forEach(question => {
      if (!question.passage) return;
      let group = passageGroups.find(item => item.passage === question.passage);
      if (!group) {
        group = { passage: question.passage, questions: [] };
        passageGroups.push(group);
      }
      group.questions.push(question);
    });
    passageGroups.forEach(group => blocks.push(shuffleList(group.questions, random)));
    return shuffleList(blocks, random).flatMap(block => block);
  });
}
function setAnswerOrders(code) {
  answerOrders = new Map();
  const base = Number.parseInt(code, 16) >>> 0;
  originalQuestions.forEach(q => {
    if (!Array.isArray(q.options)) return;
    const order = q.options.map((_, i) => i);
    const r = createSeededRandom((base ^ Math.imul(q.id, 0x9E3779B1)) >>> 0);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    answerOrders.set(q.id, order);
  });
}
const getAnswerOrder = q => answerOrders.get(q.id) || [];
const getDisplayedOptionIndex = (q, o) => getAnswerOrder(q).indexOf(o);
function normalizeWrittenAnswer(answer) {
  return String(answer || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
}
function isAnswerCorrect(question, answer) {
  if (answer === null || answer === undefined) return false;
  if (question.type === 'text') {
    return question.acceptedAnswers.some(expected =>
      normalizeWrittenAnswer(expected) === normalizeWrittenAnswer(answer));
  }
  return answer === question.correct;
}
function formatUserAnswer(question, answer) {
  if (answer === null || answer === undefined || answer === '') return '(chưa trả lời)';
  if (question.type === 'text') return String(answer);
  const displayedIndex = getDisplayedOptionIndex(question, answer);
  return `${letter(displayedIndex)}. ${question.options[answer]}`;
}
function formatCorrectAnswer(question) {
  if (question.type === 'text') return question.acceptedAnswers.join(' / ');
  return `${letter(getDisplayedOptionIndex(question, question.correct))}. ${question.options[question.correct]}`;
}

function updateExamCodeStatus(msg, err = false) { const s = $('exam-code-status'); s.innerText = msg; s.className = `text-xs ${err ? 'text-rose-400' : 'text-emerald-400'}`; }
function canChangeExamCode() { return !userAnswers.some(a => a !== null) || window.confirm('Đổi mã đề sẽ xóa câu trả lời hiện tại. Bạn có muốn tiếp tục không?'); }
function setExamCode(code) {
  examCode = code;
  questions.splice(0, questions.length, ...shuffleQuestions(code));
  $('current-exam-code').value = code; $('exam-code-input').value = code; $('header-exam-code').innerText = code;
  syncExamCodesToUrl(); restartQuiz();
}
function setAnswerCode(code) {
  answerCode = code; setAnswerOrders(code);
  $('current-answer-code').value = code; $('answer-code-input').value = code; $('header-answer-code').innerText = code;
  syncExamCodesToUrl(); restartQuiz();
}
function syncExamCodesToUrl() {
  $('exam-share-link').classList.add('hidden');
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('token', examCode); url.searchParams.set('answerToken', answerCode);
    if (activeCombinedExam) url.searchParams.set('mode', 'unit12');
    else url.searchParams.delete('mode');
    if (url.protocol === 'http:' || url.protocol === 'https:') window.history.replaceState(window.history.state, '', url);
  } catch (e) {}
}
async function shareExamLink() {
  const url = new URL(window.location.href);
  url.searchParams.set('token', examCode); url.searchParams.set('answerToken', answerCode);
  if (activeCombinedExam) url.searchParams.set('mode', 'unit12');
  else url.searchParams.delete('mode');
  const li = $('exam-share-link'); li.value = url.href; li.classList.remove('hidden');
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') throw new Error();
    await navigator.clipboard.writeText(url.href);
    updateExamCodeStatus('Đã sao chép link đề thi vào bộ nhớ tạm.');
  } catch (e) { li.focus(); li.select(); updateExamCodeStatus('Đã tạo link. Vui lòng tự sao chép link bên trên.', true); }
}
function generateNewExamCode() { if (!canChangeExamCode()) return; let c = createExamCode(); while (c === examCode) c = createExamCode(); setExamCode(c); updateExamCodeStatus('Đã tạo mã đề mới.'); }
function applyEnteredExamCode() {
  const c = $('exam-code-input').value.trim().toUpperCase();
  if (!/^[0-9A-F]{8}$/.test(c)) { updateExamCodeStatus('Mã đề cần đủ 8 ký tự Hex (0-9, A-F).', true); return; }
  if (!canChangeExamCode()) return; setExamCode(c); updateExamCodeStatus('Đã áp dụng mã đề mới.');
}
function generateNewAnswerCode() { if (!canChangeExamCode()) return; let c = createExamCode(); while (c === answerCode) c = createExamCode(); setAnswerCode(c); updateExamCodeStatus('Đã đảo thứ tự đáp án.'); }
function applyEnteredAnswerCode() {
  const c = $('answer-code-input').value.trim().toUpperCase();
  if (!/^[0-9A-F]{8}$/.test(c)) { updateExamCodeStatus('Mã đáp án cần đủ 8 ký tự Hex (0-9, A-F).', true); return; }
  if (!canChangeExamCode()) return; setAnswerCode(c); updateExamCodeStatus('Đã áp dụng mã đáp án mới.');
}
function openSettings() { $('settings-modal').showModal(); }
function applyFontSize() { const s = $('font-size-setting').value; document.documentElement.style.setProperty('--quiz-font-size', `${s}px`); $('font-size-value').value = s; }
function applyBackgroundColor() {
  customBackgroundSelected = true;
  document.documentElement.style.setProperty('--page-background', $('background-color-setting').value);
}
function applyTheme(persist = false) {
  const mode = $('theme-setting').value;
  const effectiveTheme = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.body.dataset.theme = effectiveTheme;
  document.documentElement.style.colorScheme = effectiveTheme;
  if (persist) localStorage.setItem('quiz-theme-mode', mode);
  if (!customBackgroundSelected) {
    const background = effectiveTheme === 'dark' ? '#0f172a' : '#f1f5f9';
    document.documentElement.style.setProperty('--page-background', background);
    $('background-color-setting').value = background;
  }
}
function resetSettings() {
  $('font-size-setting').value = '16';
  $('theme-setting').value = 'system';
  customBackgroundSelected = false;
  applyFontSize();
  applyTheme(true);
}

function isDevToolsOpen() {
  return window.outerWidth - window.innerWidth > 250 ||
    window.outerHeight - window.innerHeight > 250;
}
function showAntiCheatOverlay() {
  if (antiCheatTemporarilyDisabled) return;
  $('anti-cheat-overlay').hidden = false;
}
function hideAntiCheatOverlay() {
  $('anti-cheat-overlay').hidden = true;
}
function checkDevTools() {
  if (antiCheatTemporarilyDisabled) return;
  if (isDevToolsOpen()) showAntiCheatOverlay();
  else hideAntiCheatOverlay();
}
function handleAntiCheatKeydown(event) {
  if (antiCheatTemporarilyDisabled) return;
  const devToolsShortcut = event.key === 'F12' ||
    (event.shiftKey && (event.ctrlKey || event.metaKey) &&
      ['i', 'j', 'c'].includes(event.key.toLowerCase()));
  if (event.key === 'Escape' && !$('anti-cheat-overlay').hidden) {
    if (!isDevToolsOpen()) hideAntiCheatOverlay();
    event.preventDefault();
    return;
  }
  if (!devToolsShortcut) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showAntiCheatOverlay();
  window.setTimeout(() => {
    if (isDevToolsOpen()) checkDevTools();
  }, 500);
}
function clearQuizStatusCompactTimeout() {
  if (quizStatusCompactTimeout) window.clearTimeout(quizStatusCompactTimeout);
  quizStatusCompactTimeout = 0;
}
function scheduleQuizStatusCompact() {
  clearQuizStatusCompactTimeout();
  quizStatusCompactTimeout = window.setTimeout(() => {
    quizStatusCompactTimeout = 0;
    const statusBar = $('quiz-status-bar');
    if (statusBar.contains(document.activeElement) &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.offsetParent === null) document.activeElement.blur();
    if (!statusBar.matches(':hover, :focus-within')) statusBar.classList.add('is-compact');
  }, 1800);
}
function handleQuizDisplayActivity(event) {
  if (event.pointerType !== 'mouse' || $('quiz-app').hidden) return;
  $('quiz-status-bar').classList.remove('is-compact');
  scheduleQuizStatusCompact();
}
function updateQuizHeaderVisibility() {
  const header = $('quiz-header');
  const currentScrollY = Math.max(0, window.scrollY);
  if (currentScrollY < 40 || currentScrollY < previousScrollY - 4) {
    header.classList.remove('quiz-header-compact');
  } else if (currentScrollY > previousScrollY + 4) {
    header.classList.add('quiz-header-compact');
  }
  previousScrollY = currentScrollY;
}
function openDeveloperBoard() {
  $('developer-board').hidden = false;
  $('developer-board-bubble').hidden = true;
  if ($('settings-modal').open) $('settings-modal').close();
  constrainDeveloperBoard();
  $('developer-board-command-input').focus();
}
function collapseDeveloperBoard() {
  $('developer-board').hidden = true;
  $('developer-board-bubble').hidden = false;
}
function constrainDeveloperBoard() {
  const board = $('developer-board');
  if (board.hidden) return;
  const rect = board.getBoundingClientRect();
  const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - rect.width - 8));
  const top = Math.min(Math.max(8, rect.top), Math.max(8, window.innerHeight - Math.min(rect.height, window.innerHeight - 16) - 8));
  board.style.left = `${left}px`;
  board.style.top = `${top}px`;
  board.style.bottom = 'auto';
}
function startDeveloperBoardDrag(event) {
  if (event.button !== 0 || event.target.closest('button')) return;
  const board = $('developer-board');
  const rect = board.getBoundingClientRect();
  developerBoardDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  event.preventDefault();
}
function moveDeveloperBoardDrag(event) {
  if (!developerBoardDrag || developerBoardDrag.pointerId !== event.pointerId) return;
  const board = $('developer-board');
  const left = Math.min(Math.max(8, event.clientX - developerBoardDrag.offsetX),
    Math.max(8, window.innerWidth - board.offsetWidth - 8));
  const top = Math.min(Math.max(8, event.clientY - developerBoardDrag.offsetY),
    Math.max(8, window.innerHeight - board.offsetHeight - 8));
  board.style.left = `${left}px`;
  board.style.top = `${top}px`;
}
function stopDeveloperBoardDrag(event) {
  if (developerBoardDrag?.pointerId !== event.pointerId) return;
  developerBoardDrag = null;
}
function reportDeveloperCommand(message, isError = false) {
  const status = $('developer-board-status');
  status.textContent = message;
  status.className = `min-h-5 text-xs ${isError ? 'text-rose-400' : 'text-emerald-400'}`;
  $('exam-code-status').textContent = message;
}
function executeDeveloperCommand(rawCommand) {
  const originalCommand = String(rawCommand || '').trim();
  const command = originalCommand.toLowerCase();
  if (command === 'cmd::[board]') {
    openDeveloperBoard();
    reportDeveloperCommand('Đã mở bảng lệnh.');
    return;
  }
  if (executeDeveloperElementCommand(originalCommand)) return;
  if (command === 'cmd::[open-scren]') {
    antiCheatTemporarilyDisabled = true;
    hideAntiCheatOverlay();
    reportDeveloperCommand('Đã tạm tắt chống gian lận đến khi tải lại trang hoặc bật lại.');
    return;
  }
  if (command === 'cmd::[close-scren]') {
    antiCheatTemporarilyDisabled = false;
    checkDevTools();
    reportDeveloperCommand('Đã bật lại chống gian lận.');
    return;
  }
  if (command === 'cmd::[true]' || command === 'cmd::[fasle]' || command === 'cmd::[false]') {
    if (!quizStarted || submitted || !activeQuestionIndices.length) {
      reportDeveloperCommand('Hãy bắt đầu một bài chưa nộp trước khi dùng lệnh này.', true);
      return;
    }
    const setCorrect = command === 'cmd::[true]';
    activeQuestionIndices.forEach(index => {
      const question = questions[index];
      userAnswers[index] = setCorrect
        ? question.type === 'text' ? question.acceptedAnswers[0] : question.correct
        : question.type === 'text' ? '__dev_wrong_answer__' : question.options.findIndex((_, optionIndex) => optionIndex !== question.correct);
    });
    renderQuestion();
    renderGrid();
    updateProgress();
    reportDeveloperCommand(setCorrect ? 'Đã điền đáp án đúng cho tất cả câu trong bài hiện tại.' :
      'Đã điền đáp án sai cho tất cả câu trong bài hiện tại.');
    return;
  }
  if (command === 'cmd::[ai]' || command === 'cmd::[true-ai]') {
    if (submitted) {
      reportDeveloperCommand('Bài đã nộp; không thể thay đổi quyền gợi ý AI.', true);
      return;
    }
    developerAiUnlocked = true;
    developerAiHintOnly = command === 'cmd::[true-ai]';
    renderQuestion();
    reportDeveloperCommand(developerAiHintOnly
      ? 'Đã mở gợi ý AI; yêu cầu AI không tiết lộ đáp án.'
      : 'Đã mở liên kết AI có thể giải thích và chọn đáp án.');
    return;
  }
  const timeCommand = command.match(/^cmd::\[time\.(\d+(?:\.\d+)?)\]$/);
  if (timeCommand) {
    const minutes = Number(timeCommand[1]);
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 525600) {
      reportDeveloperCommand('Thời gian phải lớn hơn 0 và không quá 525600 phút.', true);
      return;
    }
    if (!quizStarted || submitted) {
      reportDeveloperCommand('Hãy bắt đầu một bài chưa nộp trước khi cộng thời gian.', true);
      return;
    }
    const remainingSeconds = quizTimerDeadline
      ? Math.max(0, Math.ceil((quizTimerDeadline - Date.now()) / 1000))
      : 0;
    selectedExamDurationSeconds = remainingSeconds + Math.ceil(minutes * 60);
    activeFullExam = true;
    startQuizTimer();
    renderQuestion();
    reportDeveloperCommand(`Đã cộng ${minutes} phút vào bài hiện tại.`);
    return;
  }
  reportDeveloperCommand('Không nhận diện được lệnh. Dùng cmd::[board], cmd::[true], cmd::[fasle], cmd::[ai], cmd::[true-ai], cmd::[time.5] hoặc cmd::[open-scren].', true);
}
function getDeveloperElement(idSelector) {
  if (!/^#[^\s|]+$/.test(idSelector)) {
    reportDeveloperCommand('Chỉ chấp nhận bộ chọn ID dạng #element-id.', true);
    return null;
  }
  const element = document.getElementById(idSelector.slice(1));
  if (!element) {
    reportDeveloperCommand(`Không tìm thấy phần tử ${idSelector}.`, true);
    return null;
  }
  if (element.matches('html, body, script, style') ||
    element.closest('#developer-board, #developer-board-bubble')) {
    reportDeveloperCommand('Không thể sửa hoặc xóa phần tử gốc hay chính bảng lệnh.', true);
    return null;
  }
  return element;
}
function refreshAfterQuestionSetChange(preferredQuestionIndex) {
  currentIndex = Math.max(0, activeQuestionIndices.indexOf(preferredQuestionIndex));
  renderQuestion();
  renderGrid();
  updateProgress();
}
function executeDeveloperElementCommand(originalCommand) {
  const editMatch = originalCommand.match(/^cmd::\[edit\|(#?[^\s|]+)\|text\|([\s\S]*)\]$/i);
  if (editMatch) {
    const element = getDeveloperElement(editMatch[1]);
    if (!element) return true;
    const childNodes = Array.from(element.childNodes);
    const oldValue = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? element.value
      : null;
    developerElementHistory.push({ type: 'element-edit', element, childNodes, oldValue });
    if (oldValue !== null) element.value = editMatch[2];
    else element.replaceChildren(document.createTextNode(editMatch[2]));
    reportDeveloperCommand(`Đã sửa nội dung ${editMatch[1]}. Có thể dùng cmd::[restore] để hoàn tác.`);
    return true;
  }
  const deleteMatch = originalCommand.match(/^cmd::\[delete\|(#?[^\s|]+)\]$/i);
  if (deleteMatch) {
    const element = getDeveloperElement(deleteMatch[1]);
    if (!element) return true;
    if (element.id === 'quiz-app') {
      reportDeveloperCommand('Không thể xóa khung bài thi hoặc khối chứa câu hỏi. Hãy chọn một câu cụ thể.', true);
      return true;
    }
    if (element.matches('.question-card')) {
      if (submitted) {
        reportDeveloperCommand('Không thể xóa câu hỏi sau khi nộp bài.', true);
        return true;
      }
      const questionIndex = Number(element.id.slice('question-card-'.length));
      const position = activeQuestionIndices.indexOf(questionIndex);
      if (position < 0 || activeQuestionIndices.length <= 1) {
        reportDeveloperCommand('Không tìm thấy câu trong bài hiện tại hoặc đây là câu cuối cùng.', true);
        return true;
      }
      const currentQuestionIndex = activeQuestionIndices[currentIndex];
      developerElementHistory.push({
        type: 'question-delete',
        questionList: questions,
        activeQuestionList: activeQuestionIndices,
        questionIndex,
        position,
        currentQuestionIndex
      });
      activeQuestionIndices.splice(position, 1);
      refreshAfterQuestionSetChange(currentQuestionIndex);
      reportDeveloperCommand(`Đã xóa câu ID ${questions[questionIndex].id} khỏi bài hiện tại. Dùng cmd::[restore] để khôi phục.`);
      return true;
    }
    if (element.querySelector('.question-card')) {
      reportDeveloperCommand('Không thể xóa khối đang chứa câu hỏi vì kết quả chấm sẽ không khớp.', true);
      return true;
    }
    if (!element.parentNode) {
      reportDeveloperCommand('Phần tử này đã bị xóa khỏi tài liệu.', true);
      return true;
    }
    developerElementHistory.push({
      type: 'element-delete',
      element,
      parent: element.parentNode,
      nextSibling: element.nextSibling
    });
    element.remove();
    reportDeveloperCommand(`Đã xóa ${deleteMatch[1]} khỏi giao diện. Dùng cmd::[restore] để khôi phục.`);
    return true;
  }
  const questionEditMatch = originalCommand.match(/^cmd::\[question-edit\|(\d+)\|([\s\S]*)\]$/i);
  if (questionEditMatch) {
    if (submitted) {
      reportDeveloperCommand('Không thể sửa câu hỏi sau khi nộp bài.', true);
      return true;
    }
    const question = questions.find(item => item.id === Number(questionEditMatch[1]));
    if (!question || !activeQuestionIndices.some(index => questions[index] === question)) {
      reportDeveloperCommand(`Không tìm thấy câu hỏi ID ${questionEditMatch[1]} trong bài hiện tại.`, true);
      return true;
    }
    developerElementHistory.push({
      type: 'question-edit',
      questionList: questions,
      question,
      questionIndex: questions.indexOf(question),
      oldText: question.question,
      oldAnswer: userAnswers[questions.indexOf(question)]
    });
    userAnswers[questions.indexOf(question)] = null;
    question.question = questionEditMatch[2];
    renderQuestion();
    updateProgress();
    reportDeveloperCommand(`Đã sửa nội dung câu hỏi ID ${question.id}. Dùng cmd::[restore] để hoàn tác.`);
    return true;
  }
  const questionDeleteMatch = originalCommand.match(/^cmd::\[question-delete\|(\d+)\]$/i);
  if (questionDeleteMatch) {
    if (submitted) {
      reportDeveloperCommand('Không thể xóa câu hỏi sau khi nộp bài.', true);
      return true;
    }
    const question = questions.find(item => item.id === Number(questionDeleteMatch[1]));
    const questionIndex = questions.indexOf(question);
    const position = activeQuestionIndices.indexOf(questionIndex);
    if (!question || position < 0 || activeQuestionIndices.length <= 1) {
      reportDeveloperCommand(`Không tìm thấy câu hỏi ID ${questionDeleteMatch[1]} trong bài hiện tại hoặc đây là câu cuối cùng.`, true);
      return true;
    }
    const currentQuestionIndex = activeQuestionIndices[currentIndex];
    developerElementHistory.push({
      type: 'question-delete',
      questionList: questions,
      activeQuestionList: activeQuestionIndices,
      questionIndex,
      position,
      currentQuestionIndex
    });
    activeQuestionIndices.splice(position, 1);
    refreshAfterQuestionSetChange(currentQuestionIndex);
    reportDeveloperCommand(`Đã xóa câu hỏi ID ${question.id} khỏi bài hiện tại. Dùng cmd::[restore] để khôi phục.`);
    return true;
  }
  if (/^cmd::\[restore\]$/i.test(originalCommand)) {
    restoreDeveloperElement();
    return true;
  }
  return false;
}
function restoreDeveloperElement() {
  const change = developerElementHistory[developerElementHistory.length - 1];
  if (!change) {
    reportDeveloperCommand('Không có thao tác sửa/xóa nào để khôi phục.', true);
    return;
  }
  if (change.type === 'element-edit') {
    if (!change.element.isConnected) {
      reportDeveloperCommand('Phần tử đã bị xóa. Hãy khôi phục thao tác xóa trước.', true);
      return;
    }
    if (change.oldValue !== null) change.element.value = change.oldValue;
    else change.element.replaceChildren(...change.childNodes);
  } else if (change.type === 'element-delete') {
    if (!change.parent.isConnected) {
      reportDeveloperCommand('Phần tử cha chưa được khôi phục; hãy hoàn tác thao tác gần nhất trước.', true);
      return;
    }
    const nextSibling = change.nextSibling?.parentNode === change.parent ? change.nextSibling : null;
    change.parent.insertBefore(change.element, nextSibling);
  } else {
    if (questions !== change.questionList ||
      (change.type === 'question-delete' && activeQuestionIndices !== change.activeQuestionList)) {
      reportDeveloperCommand('Bài thi đã đổi; không thể khôi phục thao tác thuộc bài trước.', true);
      return;
    }
    if (change.type === 'question-edit') {
      change.question.question = change.oldText;
      userAnswers[change.questionIndex] = change.oldAnswer;
      renderQuestion();
      updateProgress();
    } else {
      if (activeQuestionIndices.includes(change.questionIndex)) {
        reportDeveloperCommand('Câu hỏi này đã có trong bài; không thể khôi phục trùng lặp.', true);
        return;
      }
      activeQuestionIndices.splice(change.position, 0, change.questionIndex);
      refreshAfterQuestionSetChange(change.currentQuestionIndex);
    }
  }
  developerElementHistory.pop();
  reportDeveloperCommand('Đã khôi phục thao tác sửa/xóa gần nhất.');
}

function renderQuestion() {
  const list = $('question-list');
  developerElementHistory = developerElementHistory.filter(change => {
    if (change.type === 'element-edit') return !list.contains(change.element);
    if (change.type === 'element-delete') return !list.contains(change.parent);
    return true;
  });
  list.innerHTML = '';
  Object.entries(categories).forEach(([categoryKey, category]) => {
    const indices = activeQuestionIndices.filter(index => category.questionIds.has(questions[index].id));
    if (!indices.length) return;
    const section = document.createElement('section');
    section.className = 'question-section space-y-4';
    const heading = document.createElement('h2');
    heading.className = 'sticky top-[64px] z-[1] rounded-xl border border-indigo-500/30 bg-slate-900/95 px-4 py-3 text-lg font-bold text-indigo-200 shadow';
    heading.textContent = category.label;
    section.appendChild(heading);

    let currentPassage = null;
    indices.forEach(index => {
      const question = questions[index];
      if (question.passage && question.passage !== currentPassage) {
        currentPassage = question.passage;
        const passage = document.createElement('div');
        passage.className = 'rounded-xl border border-slate-600 bg-slate-900/70 p-5 text-sm leading-relaxed text-slate-200';
        passage.innerHTML = currentPassage || '';
        section.appendChild(passage);
      }
      section.appendChild(createQuestionCard(index, activeQuestionIndices.indexOf(index)));
    });
    list.appendChild(section);
  });
  $('prev-btn').classList.add('hidden');
  $('next-btn').classList.add('hidden');
  $('submit-btn').classList.toggle('hidden', submitted);
  updateCurrentQuestion();
}
function createQuestionCard(questionIndex, position) {
  const question = questions[questionIndex];
  const card = document.createElement('article');
  card.id = `question-card-${questionIndex}`;
  card.className = 'question-card rounded-xl border border-slate-700 bg-slate-900/50 p-5';
  const title = document.createElement('h3');
  title.className = 'mb-4 whitespace-pre-line text-base font-semibold leading-relaxed text-slate-100';
  title.textContent = `Câu ${position + 1}. ${question.question}`;
  card.appendChild(title);

  if (question.type === 'text') {
    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.dataset.questionIndex = String(questionIndex);
    answerInput.className = 'question-text-answer w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-indigo-400';
    answerInput.placeholder = 'Nhập câu trả lời...';
    answerInput.value = userAnswers[questionIndex] || '';
    answerInput.disabled = submitted || timeExpired;
    card.appendChild(answerInput);
  } else {
    const options = document.createElement('div');
    options.className = 'space-y-3';
    getAnswerOrder(question).forEach((optionIndex, displayIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.questionIndex = String(questionIndex);
      button.dataset.optionIndex = String(optionIndex);
      button.className = 'question-card-option';
      button.disabled = submitted || timeExpired;
      button.classList.toggle('is-selected', userAnswers[questionIndex] === optionIndex);
      if (submitted) {
        button.classList.toggle('is-correct', optionIndex === question.correct);
        button.classList.toggle('is-incorrect', userAnswers[questionIndex] === optionIndex && optionIndex !== question.correct);
      }
      const letterLabel = document.createElement('strong');
      letterLabel.className = 'mr-2 text-indigo-300';
      letterLabel.textContent = `${letter(displayIndex)}.`;
      button.append(letterLabel, document.createTextNode(question.options[optionIndex]));
      options.appendChild(button);
    });
    card.appendChild(options);
  }

  const googleLink = document.createElement('a');
  const googleUrl = new URL('https://www.google.com/search');
  googleUrl.searchParams.set('udm', '50');
  const displayedOptions = getAnswerOrder(question).map((optionIndex, displayIndex) =>
    `${letter(displayIndex)}. ${question.options[optionIndex]}`);
  const passageText = question.passage ? `Đoạn văn:\n${question.passage.replace(/<[^>]+>/g, ' ')}\n` : '';
  const aiInstruction = developerAiHintOnly && !submitted
    ? 'Hãy chỉ đưa ra một vài gợi ý từng bước để người học tự giải. Không tiết lộ đáp án, không chọn phương án đúng và không điền đáp án thay người học.'
    : 'Hãy chọn đáp án đúng và giải thích.';
  googleUrl.searchParams.set('q', `${passageText}Câu hỏi: ${question.question}\nCác phương án:\n${displayedOptions.join('\n')}\n${aiInstruction}`);
  googleLink.className = 'ask-google-ai mt-4 inline-flex rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/20';
  if (submitted || developerAiUnlocked) {
    googleLink.href = googleUrl.href;
    googleLink.target = '_blank';
    googleLink.rel = 'noopener noreferrer';
    googleLink.textContent = !submitted && developerAiHintOnly
      ? 'Gợi ý AI cho câu này'
      : 'Hỏi AI Google về câu này';
    googleLink.removeAttribute('aria-disabled');
    googleLink.removeAttribute('tabindex');
  } else {
    googleLink.setAttribute('aria-disabled', 'true');
    googleLink.tabIndex = -1;
    googleLink.textContent = 'Nộp bài để mở Hỏi AI Google';
  }
  card.appendChild(googleLink);

  const feedback = document.createElement('div');
  feedback.className = 'mt-4 rounded-xl border p-4 text-sm';
  feedback.hidden = !submitted;
  if (submitted) {
    const isCorrect = isAnswerCorrect(question, userAnswers[questionIndex]);
    feedback.classList.add(isCorrect ? 'border-emerald-600' : 'border-rose-600',
      isCorrect ? 'bg-emerald-950/40' : 'bg-rose-950/40',
      isCorrect ? 'text-emerald-300' : 'text-rose-300');
    const result = document.createElement('strong');
    result.textContent = isCorrect ? 'Chính xác! ' :
      userAnswers[questionIndex] === null ? 'Chưa trả lời. ' : 'Chưa chính xác. ';
    feedback.appendChild(result);
    if (!isCorrect) {
      feedback.appendChild(document.createTextNode(
        `Đáp án đúng là ${formatCorrectAnswer(question)}. `));
    }
    feedback.appendChild(document.createTextNode(question.rationale || ''));
  }
  card.appendChild(feedback);
  return card;
}
function updateCurrentQuestion() {
  $('question-badge').innerText = `Câu hỏi ${currentIndex + 1} / ${activeQuestionIndices.length}`;
  $('prev-btn').disabled = currentIndex === 0;
  $('next-btn').disabled = currentIndex >= activeQuestionIndices.length - 1;
}
function selectAnswerForQuestion(questionIndex, optionIndex) {
  if (submitted || timeExpired || !activeQuestionIndices.includes(questionIndex)) return;
  userAnswers[questionIndex] = optionIndex;
  const card = $(`question-card-${questionIndex}`);
  card.querySelectorAll('.question-card-option').forEach(button => {
    button.classList.toggle('is-selected', Number(button.dataset.optionIndex) === optionIndex);
  });
  updateProgress();
  renderGrid();
}
function selectAnswer(o) {
  if (submitted) return;
  selectAnswerForQuestion(activeQuestionIndices[currentIndex], o);
}
function nextQuestion() {
  if (currentIndex < activeQuestionIndices.length - 1) goToQuestion(currentIndex + 1);
  else if (submitted) showResultsPanel();
  else $('submit-btn').focus();
}
function showResultsPanel() {
  $('question-panel').classList.add('hidden'); $('navigation-controls').classList.add('hidden'); $('results-panel').classList.remove('hidden');
  $('results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function buildWrongReview() {
  const box = $('wrong-review'); box.innerHTML = '';
  let count = 0;
  activeQuestionIndices.forEach(qi => {
    const q = questions[qi];
    if (isAnswerCorrect(q, userAnswers[qi])) return;
    count++;
    const d = document.createElement('div');
    d.className = 'p-4 rounded-xl bg-slate-900/60 border border-slate-700 text-sm';
    const yours = formatUserAnswer(q, userAnswers[qi]);
    const t = document.createElement('p'); t.className = 'font-semibold mb-2 whitespace-pre-line'; t.textContent = `Câu ${activeQuestionIndices.indexOf(qi) + 1}: ${q.question}`;
    const a = document.createElement('p'); a.className = 'text-rose-300'; a.textContent = `Bạn chọn: ${yours}`;
    const c = document.createElement('p'); c.className = 'text-emerald-300'; c.textContent = `Đáp án đúng: ${formatCorrectAnswer(q)}`;
    const r = document.createElement('p'); r.className = 'text-slate-400 mt-1'; r.textContent = q.rationale;
    d.append(t, a, c, r); box.appendChild(d);
  });
  const nw = $('no-wrong-answers');
  nw.classList.toggle('hidden', count !== 0);
  nw.textContent = count === 0 ? '🎉 Bạn làm đúng tất cả các câu!' : '';
  $('review-wrong-btn').classList.toggle('hidden', count === 0);
  $('retry-wrong-btn').classList.toggle('hidden', count === 0);
}
async function showResults() {
  if (processing) return;
  if (submitted) { showResultsPanel(); return; }
  stopQuizTimer();
  processing = true;
  const sb = $('submit-btn'), ls = $('submit-loading');
  sb.disabled = true; ls.hidden = false; ls.classList.add('flex');
  try {
    let unanswered = 0; score = 0;
    for (let c = 0; c < activeQuestionIndices.length; c++) {
      const i = activeQuestionIndices[c];
      if (userAnswers[i] === null) unanswered++;
      else if (isAnswerCorrect(questions[i], userAnswers[i])) score++;
      updateSubmitProgress(Math.floor((c + 1) / activeQuestionIndices.length * 100), `Đang chấm: ${c + 1} / ${activeQuestionIndices.length}`);
    }
    submitted = true;
    $('quiz-timer').hidden = true;
    $('quiz-timer').classList.remove('is-open');
    $('quiz-timer-rail').setAttribute('aria-expanded', 'false');
    renderQuestion();
    showResultsPanel();
    const total = activeQuestionIndices.length;
    $('results-score').innerText = `Số câu đúng: ${score} / ${total}`;
    $('results-unanswered').innerText = unanswered ? `Bạn chưa trả lời ${unanswered} câu.` : 'Bạn đã trả lời tất cả các câu!';
    wrongReviewVisible = false; $('wrong-review').classList.add('hidden');
    buildWrongReview(); updateProgress();
  } catch (e) { console.error(e); }
  finally { ls.hidden = true; ls.classList.remove('flex'); processing = false; sb.disabled = false; }
}
function updateSubmitProgress(p, s) { const v = Math.max(0, Math.min(100, p)); $('submit-progress-bar').style.width = `${v}%`; $('submit-progress-label').innerText = `${v}%`; $('submit-progress-status').innerText = s; }
function toggleWrongReview() { wrongReviewVisible = !wrongReviewVisible; $('wrong-review').classList.toggle('hidden', !wrongReviewVisible); }
function restartQuiz() {
  timeExpired = false;
  currentIndex = 0; userAnswers = new Array(questions.length).fill(null); score = 0; submitted = false;
  activeQuestionIndices = getCategoryQuestionIndices(); unansweredOnly = false; wrongReviewVisible = false;
  $('results-panel').classList.add('hidden'); $('question-panel').classList.remove('hidden');
  $('wrong-review').classList.add('hidden');
  renderQuestion(); renderGrid(); updateProgress(); startQuizTimer();
  if (!$('quiz-app').hidden) $(`question-card-${activeQuestionIndices[0]}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function reviewSubmittedAnswers() {
  $('results-panel').classList.add('hidden'); $('question-panel').classList.remove('hidden');
  currentIndex = 0; renderQuestion(); renderGrid(); updateProgress();
  $(`question-card-${activeQuestionIndices[0]}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function retryWrongQuestions() {
  const redo = activeQuestionIndices.filter(i => !isAnswerCorrect(questions[i], userAnswers[i]));
  if (!redo.length) { alert('Bạn đã làm đúng tất cả các câu!'); return; }
  redo.forEach(i => userAnswers[i] = null);
  activeQuestionIndices = redo; currentIndex = 0; submitted = false; timeExpired = false; unansweredOnly = false; wrongReviewVisible = false;
  $('wrong-review').classList.add('hidden');
  $('results-panel').classList.add('hidden'); $('question-panel').classList.remove('hidden');
  renderQuestion(); renderGrid(); updateProgress(); startQuizTimer();
  $(`question-card-${activeQuestionIndices[0]}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function prevQuestion() { if (currentIndex > 0) goToQuestion(currentIndex - 1); }
function goToQuestion(i) {
  if (i < 0 || i >= activeQuestionIndices.length) return;
  currentIndex = i;
  updateCurrentQuestion();
  renderGrid();
  if (!$('grid-modal').classList.contains('hidden')) toggleGrid();
  const questionIndex = activeQuestionIndices[i];
  $(`question-card-${questionIndex}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function updateProgress() {
  const n = activeQuestionIndices.filter(i => userAnswers[i] !== null).length;
  $('answered-count').innerText = `Đã làm ${n} / ${activeQuestionIndices.length}`;
}
function renderGrid() {
  const grid = $('question-grid'); grid.innerHTML = '';
  const un = activeQuestionIndices.filter(i => userAnswers[i] === null).length;
  $('question-grid-title').innerText = `Danh sách ${activeQuestionIndices.length} câu hỏi`;
  $('unanswered-filter-btn').innerText = `${unansweredOnly ? 'Hiện tất cả câu' : 'Chỉ câu chưa làm'} (${unansweredOnly ? activeQuestionIndices.length : un})`;
  activeQuestionIndices.map((qi, ai) => ({ qi, ai })).filter(({ qi }) => !unansweredOnly || userAnswers[qi] === null).forEach(({ qi, ai }) => {
    const b = document.createElement('button');
    let cls = 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600';
    if (userAnswers[qi] !== null) cls = 'bg-indigo-900/60 text-indigo-200 border-indigo-600 hover:bg-indigo-800';
    if (submitted && userAnswers[qi] !== null) cls = isAnswerCorrect(questions[qi], userAnswers[qi]) ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600' : 'bg-rose-900/60 text-rose-200 border-rose-600';
    if (ai === currentIndex) cls += ' ring-2 ring-indigo-400';
    b.className = `h-10 rounded-xl border text-sm font-semibold flex items-center justify-center transition ${cls}`;
    b.innerText = ai + 1; b.onclick = () => goToQuestion(ai); grid.appendChild(b);
  });
}
function toggleUnansweredQuestions() { unansweredOnly = !unansweredOnly; renderGrid(); }
function handleQuizKeyboard(e) {
  if (processing) return;
  const t = e.target, tn = t && t.tagName ? t.tagName.toLowerCase() : '';
  if (['input', 'textarea', 'select'].includes(tn) || t.isContentEditable) return;
  if (!$('results-panel').classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevQuestion(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); nextQuestion(); }
}
function toggleGrid() { const m = $('grid-modal'); m.classList.toggle('hidden'); m.classList.toggle('flex'); }
window.onload = initApp;
$('open-combined-exam').addEventListener('click', showCombinedExamPicker);
Object.assign(window, { applyEnteredAnswerCode, applyEnteredExamCode, generateNewAnswerCode, generateNewExamCode, nextQuestion, openSettings, prevQuestion, resetSettings, restartQuiz, retryWrongQuestions, reviewSubmittedAnswers, runQuizCommand: executeDeveloperCommand, shareExamLink, toggleGrid, toggleUnansweredQuestions, toggleWrongReview });
})();