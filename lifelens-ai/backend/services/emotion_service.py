"""Facial emotion detection. Images processed in RAM, never stored."""
import base64, logging, numpy as np
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

MAP={"happy":"happy","sad":"sad","angry":"angry","fear":"stressed",
     "disgust":"stressed","surprise":"surprised","neutral":"neutral"}

def decode_b64(b64: str) -> np.ndarray:
    if b64.startswith("data:"): b64=b64.split(",",1)[1]
    img=Image.open(BytesIO(base64.b64decode(b64))).convert("RGB").resize((224,224))
    return np.array(img)

async def analyse_emotion(b64: str) -> dict:
    try:
        from deepface import DeepFace
        arr = decode_b64(b64)
        res = DeepFace.analyze(img_path=arr,actions=["emotion"],enforce_detection=False,silent=True)
        if isinstance(res,list): res=res[0]
        raw=res.get("emotion",{}); dom_raw=res.get("dominant_emotion","neutral").lower()
        dominant=MAP.get(dom_raw,"neutral")
        dist={"happy":0.,"neutral":0.,"sad":0.,"angry":0.,"stressed":0.,"surprised":0.}
        for k,v in raw.items(): m=MAP.get(k.lower(),"neutral"); dist[m]=dist.get(m,0)+v
        total=sum(dist.values())
        if total>0: dist={k:round(v/total*100,1) for k,v in dist.items()}
        del arr
        return {"emotion":dominant,"distribution":dist,"confidence":round(dist.get(dominant,0)/100,3)}
    except ImportError:
        logger.warning("DeepFace not installed — using mock")
        return _mock()
    except Exception as e:
        logger.error(f"Emotion analysis failed: {e}")
        return _mock()

def _mock() -> dict:
    import random
    dom=random.choice(["happy","neutral","stressed"])
    base={"happy":10.,"neutral":20.,"sad":5.,"angry":5.,"stressed":10.,"surprised":5.}
    base[dom]+=45.; total=sum(base.values())
    dist={k:round(v/total*100,1) for k,v in base.items()}
    return {"emotion":dom,"distribution":dist,"confidence":round(0.65+0.2*random.random(),3)}
