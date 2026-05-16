import logging
import sys

from app.core.config import settings


def setup_logging():
    fmt = (
        '{"time":"%(asctime)s","level":"%(levelname)s","name":"%(name)s","message":"%(message)s"}'
        if settings.LOG_FORMAT == "json"
        else "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt))

    root = logging.getLogger()
    root.handlers = []
    root.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
    root.addHandler(handler)

    for noisy in ("httpx", "httpcore", "openai", "uvicorn.access"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return root


logger = setup_logging()
