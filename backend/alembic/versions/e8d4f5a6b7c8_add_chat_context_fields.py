"""Add chat context fields

Revision ID: e8d4f5a6b7c8
Revises: c392bc59c1f7
Create Date: 2025-12-15 20:21:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8d4f5a6b7c8'
down_revision: Union[str, None] = 'add_user_roles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add airplane_model and component_type columns to chats table
    op.add_column('chats', sa.Column('airplane_model', sa.String(), nullable=True))
    op.add_column('chats', sa.Column('component_type', sa.String(), nullable=True))
    
    # Set default values for existing chats
    op.execute("UPDATE chats SET airplane_model = 'Boeing 737', component_type = 'Estructural' WHERE airplane_model IS NULL")
    
    # Make columns non-nullable after setting defaults
    op.alter_column('chats', 'airplane_model', nullable=False)
    op.alter_column('chats', 'component_type', nullable=False)


def downgrade() -> None:
    # Remove airplane_model and component_type columns
    op.drop_column('chats', 'component_type')
    op.drop_column('chats', 'airplane_model')
