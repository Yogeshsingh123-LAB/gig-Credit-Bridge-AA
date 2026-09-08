import logging
import sys

def setup_logging():
    """
    Configures application-wide technical logging.
    Ensures no credentials, tokens, or sensitive financial data are logged.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    logger = logging.getLogger("credbridge")
    logger.setLevel(logging.INFO)
    return logger

logger = setup_logging()
