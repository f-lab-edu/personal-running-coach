from abc import ABC, abstractmethod
from uuid import UUID

from schemas.models import TokenPayload, RefreshTokenResult


class TokenPort(ABC):
    
    
    @abstractmethod
    def create_access_token(self, user_id:UUID)->str: 
        ...
        
    @abstractmethod
    def create_refresh_token(self, user_id:UUID)->RefreshTokenResult: 
        ...
        
    @abstractmethod
    def verify_access_token(self, token_str:str)->TokenPayload: 
        ...
        
    @abstractmethod
    def verify_refresh_token(self, token_str:str)->TokenPayload: 
        ...

    
    