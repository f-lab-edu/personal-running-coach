from uuid import UUID, uuid4
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy import Column, JSON, DateTime, BigInteger, Sequence, UniqueConstraint
from sqlmodel import SQLModel, Field, Relationship

# --- User ---
class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str
    hashed_pwd: Optional[str] = Field(default=None) 
    name: Optional[str] = Field(default=None)  # Make name optional for OAuth users
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  # tz-aware
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    provider: str = Field(default="local")  # Default to "local" for email/password users

    user_info:List["UserInfo"] = Relationship(back_populates="user", cascade_delete=True)
    tokens: List["Token"] = Relationship(back_populates="user", cascade_delete=True)
    third_party_tokens: List["ThirdPartyToken"] = Relationship(back_populates="user", cascade_delete=True)
    train_sessions: List["TrainSession"] = Relationship(back_populates="user", cascade_delete=True)
    llms: List["LLM"] = Relationship(back_populates="user", cascade_delete=True)
    feeds: List["Feed"] = Relationship(back_populates="user", cascade_delete=True)
    feed_likes: List["FeedLikes"] = Relationship(back_populates="user", cascade_delete=True)

class UserInfo(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    height:Optional[float] = None
    weight:Optional[float] = None
    age:Optional[int] = None
    sex:Optional[str] = None
    train_goal: Optional[str] = None

    user: Optional[User] = Relationship(back_populates="user_info")

class Token(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    device_id: UUID = Field(default_factory=uuid4)
    refresh_token: str
    expires_at: int
    
    user: Optional[User] = Relationship(back_populates="tokens")


class ThirdPartyToken(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    provider: str  # 'strava', 'google', 'naver' 등
    provider_user_id:str # 외부 서비스 아이디
    access_token: str
    refresh_token: str
    expires_at: int 
    extra_data: Optional[str] = None  

    user: Optional["User"] = Relationship(back_populates="third_party_tokens")


class TrainSession(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    provider: Optional[str] = None
    activity_id: int = Field(
        sa_column=Column(BigInteger, 
                         Sequence("local_activity_id_seq", start=1, increment=1),
                         nullable=True)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  # tz-aware 유지
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    train_date: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    distance:Optional[float] = None
    avg_speed: Optional[float] = None
    total_time: Optional[float] = None
    activity_title: Optional[str] = None
    analysis_result: Optional[str] = None
    
    user: Optional[User] = Relationship(back_populates="train_sessions")
    stream: Optional["TrainSessionStream"] = Relationship(back_populates="session", cascade_delete=True)
    laps: List["TrainSessionLap"] = Relationship(back_populates="session", cascade_delete=True)

    __table_args__ = (
        UniqueConstraint("provider", "activity_id", name="uq_provider_activity"),
    )
    

class TrainSessionStream(SQLModel, table=True):
    # 스트림 데이터는 jsonstring 으로 저장
    session_id: UUID = Field(foreign_key="trainsession.id", primary_key=True)
    heartrate: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    cadence: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    distance: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    velocity: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))
    altitude: Optional[List[float]] = Field(default=None, sa_column=Column(JSON))

    session: Optional[TrainSession] = Relationship(back_populates="stream")
    
class TrainSessionLap(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: Optional[UUID] = Field(foreign_key="trainsession.id", nullable=False)
    lap_index: int
    distance: float  # meters
    elapsed_time: int  # seconds
    average_speed: float  # m/s
    max_speed: float  # m/s
    average_heartrate: Optional[float] = None
    max_heartrate: Optional[float] = None
    average_cadence: Optional[float] = None
    elevation_gain:Optional[float] = None
    
    session: Optional[TrainSession] = Relationship(back_populates="laps")
    
class LLM(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    executed_at: datetime = Field(default_factory=lambda : datetime.now(timezone.utc),
                                  sa_column=Column(
                                        DateTime(timezone=True),  # ✅ tz-aware datetime
                                        onupdate=datetime.now(timezone.utc)
                                    )
                                )
                                
    workout: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    coach_advice: Optional[str] = None

    user: Optional[User] = Relationship(back_populates="llms")

class Feed(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  # tz-aware 유지
        sa_column=Column(DateTime(timezone=True), nullable=False)
        )
    title:str
    train_date: datetime = Field(default_factory=lambda : datetime.now(timezone.utc),
                                  sa_column=Column(DateTime(timezone=True))
                                )
    train_summary:str
    note: Optional[str] = None

    user: Optional[User] = Relationship(back_populates="feeds")
    likes: List["FeedLikes"] = Relationship(back_populates="feed")

class FeedLikes(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    feed_id: UUID = Field(foreign_key="feed.id")
    user_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  # tz-aware 유지
        sa_column=Column(DateTime(timezone=True), nullable=False)
        )
    
    user: Optional[User] = Relationship(back_populates="feed_likes")
    feed: Optional[Feed] = Relationship(back_populates="likes")

    __table_args__ = (
        UniqueConstraint("feed_id", "user_id", name="uq_feed_user_like"),
    )


    