from typing import List
import logging

import numpy as np
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_EMBEDDING_MODEL

    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        # OpenAI API supports batches; chunk to be safe
        out: List[List[float]] = []
        BATCH = 96
        for i in range(0, len(texts), BATCH):
            batch = texts[i:i + BATCH]
            res = self.client.embeddings.create(model=self.model, input=batch)
            out.extend([d.embedding for d in res.data])
        return out

    def create_embedding(self, text: str) -> List[float]:
        return self.create_embeddings([text])[0]

    @staticmethod
    def cosine(a: List[float], b: List[float]) -> float:
        v1, v2 = np.array(a), np.array(b)
        denom = np.linalg.norm(v1) * np.linalg.norm(v2)
        return float(np.dot(v1, v2) / denom) if denom else 0.0
