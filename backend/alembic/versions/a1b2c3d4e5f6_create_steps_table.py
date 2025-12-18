"""Create steps table

Revision ID: a1b2c3d4e5f6
Revises: f9e5g6h7i8j9
Create Date: 2025-12-16 18:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f9e5g6h7i8j9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create steps table
    op.create_table(
        'steps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chat_id', sa.Integer(), nullable=False),
        sa.Column('step_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['chat_id'], ['chats.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('chat_id', 'step_number', name='uq_chat_step_number')
    )
    
    # Create indexes
    op.create_index('ix_steps_chat_id', 'steps', ['chat_id'])
    op.create_index('ix_steps_is_completed', 'steps', ['is_completed'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_steps_is_completed', table_name='steps')
    op.drop_index('ix_steps_chat_id', table_name='steps')
    
    # Drop table
    op.drop_table('steps')
