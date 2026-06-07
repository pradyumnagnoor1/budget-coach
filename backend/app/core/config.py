from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "postgresql+psycopg://budget:budget@localhost:5432/budget_coach"

    anthropic_api_key: str = ""

    plaid_client_id: str = ""
    plaid_secret: str = ""
    plaid_env: str = "sandbox"

    cors_origins: list[str] = ["http://localhost:3000"]

    # ----- Cognito -----
    cognito_region: str = "us-east-1"
    cognito_user_pool_id: str = ""
    cognito_app_client_id: str = ""
    cognito_app_client_secret: str = ""
    # The Cognito domain prefix (e.g. "budget-coach-prady-2026").
    # Full URL is https://{prefix}.auth.{region}.amazoncognito.com
    cognito_domain: str = ""

    # The URL the browser hits to complete OAuth. Backend will redirect here after exchange.
    auth_redirect_uri: str = "http://localhost:3000/auth/callback"
    # Where the frontend lives. Used for post-login + post-logout redirects.
    frontend_url: str = "http://localhost:3000"
    # Used for signing the state cookie. Override in prod.
    auth_state_secret: str = "dev-only-please-override-in-prod"

    @property
    def cognito_hosted_ui_url(self) -> str:
        return f"https://{self.cognito_domain}.auth.{self.cognito_region}.amazoncognito.com"

    @property
    def cognito_jwks_url(self) -> str:
        return (
            f"https://cognito-idp.{self.cognito_region}.amazonaws.com/"
            f"{self.cognito_user_pool_id}/.well-known/jwks.json"
        )

    @property
    def cognito_issuer(self) -> str:
        return (
            f"https://cognito-idp.{self.cognito_region}.amazonaws.com/"
            f"{self.cognito_user_pool_id}"
        )


settings = Settings()
