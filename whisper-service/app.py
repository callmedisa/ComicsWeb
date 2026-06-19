import os
import struct
import tempfile
import time
import wave

import mlx_whisper
from fastapi import FastAPI, File, UploadFile

MODEL = os.environ.get("WHISPER_MODEL", "mlx-community/whisper-small.en-mlx")

app = FastAPI()


def _make_silent_wav(path: str, seconds: float = 1.0, sample_rate: int = 16000) -> None:
    n_frames = int(seconds * sample_rate)
    with wave.open(path, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(struct.pack(f"<{n_frames}h", *([0] * n_frames)))


@app.on_event("startup")
def warmup() -> None:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        _make_silent_wav(tmp.name)
        path = tmp.name
    t0 = time.time()
    mlx_whisper.transcribe(path, path_or_hf_repo=MODEL)
    os.unlink(path)
    print(f"[whisper-service] model '{MODEL}' warmed up in {time.time() - t0:.1f}s")


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    suffix = os.path.splitext(audio.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await audio.read())
        path = tmp.name
    try:
        result = mlx_whisper.transcribe(path, path_or_hf_repo=MODEL)
        return {"text": result["text"].strip()}
    finally:
        os.unlink(path)


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL}
