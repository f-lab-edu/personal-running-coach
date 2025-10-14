"""utc tz-aware

Revision ID: 100e36ab38b4
Revises: 396b3c5e708b
Create Date: 2025-10-14 10:01:07.301088

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '100e36ab38b4'
down_revision: Union[str, Sequence[str], None] = '396b3c5e708b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: make datetime columns tz-aware and convert existing data to UTC."""
    # trainsession.created_at
    op.execute("""
        ALTER TABLE trainsession
        ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE
        USING created_at AT TIME ZONE 'UTC';
    """)
    # trainsession.train_date
    op.execute("""
        ALTER TABLE trainsession
        ALTER COLUMN train_date TYPE TIMESTAMP WITH TIME ZONE
        USING train_date AT TIME ZONE 'UTC';
    """)
    # user.created_at
    op.execute("""
        ALTER TABLE "user"
        ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE
        USING created_at AT TIME ZONE 'UTC';
    """)


def downgrade() -> None:
    """Downgrade schema: revert columns to tz-naive."""
    # trainsession.created_at
    op.execute("""
        ALTER TABLE trainsession
        ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
        USING created_at AT TIME ZONE 'UTC';
    """)
    # trainsession.train_date
    op.execute("""
        ALTER TABLE trainsession
        ALTER COLUMN train_date TYPE TIMESTAMP WITHOUT TIME ZONE
        USING train_date AT TIME ZONE 'UTC';
    """)
    # user.created_at
    op.execute("""
        ALTER TABLE "user"
        ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE
        USING created_at AT TIME ZONE 'UTC';
    """)