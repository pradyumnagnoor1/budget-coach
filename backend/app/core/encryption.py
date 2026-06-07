"""Symmetric encryption for sensitive at-rest values (Plaid access tokens).

For dev we use Fernet (AES-128-CBC + HMAC) with a local key in env. In prod
this should be replaced with a KMS-backed adapter that calls Encrypt/Decrypt
on a customer-managed key. The interface here (encrypt / decrypt of strings)
is what the rest of the app sees, so swapping the implementation is local.
"""

from __future__ import annotations

from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


class EncryptionError(Exception):
    pass


@lru_cache(maxsize=1)
def _fernet() -> Fernet:
    if not settings.plaid_token_encryption_key:
        raise EncryptionError(
            "PLAID_TOKEN_ENCRYPTION_KEY is not set. Generate one with:\n"
            "  python3 -c \"from cryptography.fernet import Fernet; "
            'print(Fernet.generate_key().decode())"'
        )
    try:
        return Fernet(settings.plaid_token_encryption_key.encode())
    except (ValueError, TypeError) as e:
        raise EncryptionError(f"invalid Fernet key: {e}") from e


def encrypt(plaintext: str) -> str:
    """Encrypt a string. Returns urlsafe-base64 ciphertext."""
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    """Decrypt a string produced by `encrypt`."""
    try:
        return _fernet().decrypt(ciphertext.encode()).decode()
    except InvalidToken as e:
        raise EncryptionError("ciphertext is corrupt or wrong key") from e
