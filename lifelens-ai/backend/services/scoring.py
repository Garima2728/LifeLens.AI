"""Rule-based wellness scoring engine. All scores 0-100."""
from typing import Optional
from models.schemas import DailyLogCreate, DayScores

def score_sleep(wake: str, sleep: str, duration: Optional[float]=None) -> float:
    if duration is None:
        try:
            wh,wm = map(int,wake.split(":")); sh,sm = map(int,sleep.split(":"))
            wm2,sm2 = wh*60+wm, sh*60+sm
            if wm2<sm2: wm2+=24*60
            duration = (wm2-sm2)/60
        except: duration = 7.0
    if 7<=duration<=9:      base=100
    elif 6<=duration<7 or 9<duration<=10: base=80
    elif 5<=duration<6 or 10<duration<=11: base=55
    else: base=35
    try:
        sh=int(sleep.split(":")[0])
        if 21<=sh<=23: base=min(100,base+5)
        elif sh>=2: base=max(0,base-12)
    except: pass
    return float(base)

def score_diet(log: DailyLogCreate) -> float:
    if not log.meals: return 30.0
    qmap={"excellent":100,"good":75,"fair":45,"poor":20}
    avg_q=sum(qmap.get(m.quality,50) for m in log.meals)/len(log.meals)
    count=len(log.meals)
    cscore=100 if 3<=count<=4 else 70 if count==2 else 45 if count==1 else 80
    wscore=min(100,(log.waterIntake/2.0)*100) if log.waterIntake else 50
    return round(avg_q*0.5+cscore*0.3+wscore*0.2,1)

def score_productivity(log: DailyLogCreate) -> float:
    total=log.workHours+log.studyHours
    if 6<=total<=9:   ws=100
    elif 4<=total<6 or 9<total<=11: ws=75
    elif total<4:     ws=max(20,total*12)
    else:             ws=max(40,100-(total-9)*10)
    sp=max(0,(log.screenTime-6)*5)
    ss=max(20,100-sp)
    eb=min(10,log.exerciseMinutes/6)
    return round(min(100,ws*0.7+ss*0.3+eb),1)

def score_mood(log: DailyLogCreate) -> float:
    ss=max(0,100-(log.stressLevel-1)*11)
    eb=min(15,log.exerciseMinutes/4)
    sm={"none":0,"minimal":20,"moderate":70,"high":100}.get(log.socialInteraction,50)
    sp=max(0,(log.screenTime-5)*4)
    return round(min(100,ss*0.45+sm*0.25+eb+max(0,30-sp)),1)

def score_health(log,sleep,diet,mood) -> float:
    ex=min(100,(log.exerciseMinutes/30)*100)
    return round(sleep*0.25+diet*0.25+ex*0.25+mood*0.25,1)

def compute_scores(log: DailyLogCreate) -> DayScores:
    sl=score_sleep(log.wakeTime,log.sleepTime,log.sleepDuration)
    di=score_diet(log); pr=score_productivity(log); mo=score_mood(log)
    he=score_health(log,sl,di,mo)
    ov=round(he*0.3+pr*0.25+mo*0.25+sl*0.1+di*0.1,1)
    return DayScores(health=he,productivity=pr,mood=mo,sleep=sl,diet=di,overall=ov)

def get_rule_based_suggestions(log: DailyLogCreate, scores: DayScores) -> list:
    s=[]
    if scores.sleep<65:
        s.append({"id":"sl-01","category":"sleep","priority":"high","title":"Improve sleep",
            "description":f"Sleep score is {scores.sleep:.0f}/100.",
            "action":"Set a fixed bedtime 30 min earlier than usual.",
            "impact":"Better sleep improves mood by up to 30%.", "timeframe":"Tonight"})
    if log.screenTime>6:
        s.append({"id":"sc-01","category":"sleep","priority":"medium","title":"Reduce screen time",
            "description":f"Screen time {log.screenTime}h exceeds 6h guideline.",
            "action":"Enable night mode and set a screen cut-off 1h before bed.",
            "impact":"Reduces blue light for faster sleep onset.","timeframe":"This evening"})
    if log.exerciseMinutes<20:
        s.append({"id":"ex-01","category":"exercise","priority":"high" if not log.exerciseMinutes else "medium",
            "title":"Add daily movement",
            "description":"Exercise significantly boosts mood and cognitive function.",
            "action":"Start with a 20-minute walk.", "impact":"Reduces stress hormones by 26%.",
            "timeframe":"Tomorrow morning"})
    if log.stressLevel>=7:
        s.append({"id":"st-01","category":"mental_wellness","priority":"high","title":"Stress relief",
            "description":f"Stress level {log.stressLevel}/10 is elevated.",
            "action":"Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.",
            "impact":"Activates parasympathetic nervous system in minutes.","timeframe":"Now"})
    if log.waterIntake<1.5:
        s.append({"id":"wa-01","category":"health","priority":"medium","title":"Drink more water",
            "description":f"Only {log.waterIntake}L today. Aim for 2L.",
            "action":"Keep a bottle visible on your desk.", "impact":"Improves focus and energy.",
            "timeframe":"Today"})
    return s[:5]
