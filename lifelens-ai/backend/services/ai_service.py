"""LLM integration — supports Anthropic Claude and OpenAI."""
import json, logging
from datetime import datetime
from config import settings

logger = logging.getLogger(__name__)

SYSTEM = (
    "You are LifeLens AI, a compassionate personal wellness coach. "
    "Analyse routine data and provide warm, actionable guidance. "
    "NEVER give medical diagnoses. Use supportive, non-judgmental language. "
    "Focus on small, achievable improvements. Always include a disclaimer."
)

def build_prompt(period, logs, emotions, user):
    name = user.get("name","User")
    goals = ", ".join(user.get("goals",[])) or "general wellness"
    ls = [{
        "date":l.get("date"), "sleep_h":l.get("sleepDuration"),
        "work_h":l.get("workHours"), "screen_h":l.get("screenTime"),
        "exercise_min":l.get("exerciseMinutes"), "stress":l.get("stressLevel"),
        "water_L":l.get("waterIntake"), "social":l.get("socialInteraction"),
        "scores":l.get("scores",{})
    } for l in logs[:14]]
    es = [{"date":e.get("date"),"dominant":e.get("dominantEmotion")} for e in emotions[:7]]
    return f"""Analyse {name}'s {period} wellness data.
Goals: {goals}
Logs: {json.dumps(ls)}
Emotions: {json.dumps(es)}
Today: {datetime.utcnow().strftime("%Y-%m-%d")}

Return ONLY valid JSON:
{{
  "summary":"2-3 warm sentences",
  "positives":["positive 1","positive 2"],
  "concerns":["concern 1"],
  "suggestions":[{{"id":"x","category":"health|sleep|productivity|mental_wellness|diet|exercise",
    "priority":"high|medium|low","title":"..","description":"..","action":"..","impact":"..","timeframe":".."}}],
  "scores":{{"overall":0,"trend":"improving|stable|declining",
    "healthScore":0,"productivityScore":0,"mentalWellnessScore":0,"sleepScore":0,"dietScore":0}},
  "disclaimer":"This is AI-generated wellness guidance, not medical advice."
}}"""

async def _try_anthropic(prompt):
    import anthropic
    c = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    r = await c.messages.create(model="claude-sonnet-4-20250514", max_tokens=2000,
        system=SYSTEM, messages=[{"role":"user","content":prompt}])
    t = r.content[0].text
    if t.startswith("```"): t = t.split("```")[1]; t = t[4:] if t.startswith("json") else t
    return json.loads(t.strip())

async def _try_openai(prompt):
    from openai import AsyncOpenAI
    c = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    r = await c.chat.completions.create(model="gpt-4o", temperature=0.7, max_tokens=2000,
        response_format={"type":"json_object"},
        messages=[{"role":"system","content":SYSTEM},{"role":"user","content":prompt}])
    return json.loads(r.choices[0].message.content)

def _fallback(logs, period):
    if not logs: sl,st,ex=7,5,20
    else:
        sl=sum(l.get("sleepDuration",7) or 7 for l in logs)/len(logs)
        st=sum(l.get("stressLevel",5) for l in logs)/len(logs)
        ex=sum(l.get("exerciseMinutes",0) for l in logs)/len(logs)
    ss=min(100,(sl/8)*100); es=min(100,(ex/30)*100); ms=max(0,100-(st-1)*11)
    ov=round((ss+es+ms)/3)
    pos=["Maintaining wellness tracking is a positive habit."]
    if sl>=7: pos.append("Good sleep duration maintained.")
    if ex>=25: pos.append("Consistent exercise routine.")
    con=[] 
    if sl<7: con.append("Sleep below recommended 7h average.")
    if ex<25: con.append("Exercise could be increased.")
    return {"summary":f"Your {period} data shows {'good progress' if ov>=65 else 'room for improvement'}. Avg sleep {sl:.1f}h, stress {st:.1f}/10.",
        "positives":pos,"concerns":con or ["No major concerns identified."],
        "suggestions":[{"id":"fb-1","category":"sleep","priority":"medium","title":"Consistent sleep schedule",
            "description":"Irregular sleep affects energy and mood.","action":"Set a fixed wake time daily.",
            "impact":"Regulates circadian rhythm.","timeframe":"This week"}],
        "scores":{"overall":ov,"trend":"stable","healthScore":round((ss+es)/2),
            "productivityScore":round(es*0.7+ms*0.3),"mentalWellnessScore":round(ms),"sleepScore":round(ss),"dietScore":65},
        "disclaimer":"AI-generated wellness guidance only, not medical advice. Consult a healthcare professional for medical concerns."}

async def generate_insight(period, logs, emotions, user):
    p = build_prompt(period, logs, emotions, user)
    if settings.ANTHROPIC_API_KEY:
        try: return await _try_anthropic(p)
        except Exception as e: logger.warning(f"Anthropic: {e}")
    if settings.OPENAI_API_KEY:
        try: return await _try_openai(p)
        except Exception as e: logger.warning(f"OpenAI: {e}")
    return _fallback(logs, period)
