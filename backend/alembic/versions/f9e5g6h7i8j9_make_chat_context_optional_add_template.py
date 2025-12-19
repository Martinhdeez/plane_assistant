"""Make chat context optional and add template fields

Revision ID: f9e5g6h7i8j9
Revises: e8d4f5a6b7c8
Create Date: 2025-12-16 18:03:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9e5g6h7i8j9'
down_revision: Union[str, None] = 'e8d4f5a6b7c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make airplane_model and component_type nullable
    op.alter_column('chats', 'airplane_model', nullable=True)
    op.alter_column('chats', 'component_type', nullable=True)
    
    # Add instruction template fields
    op.add_column('chats', sa.Column('instruction_template_path', sa.String(), nullable=True))
    op.add_column('chats', sa.Column('instruction_template_filename', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove template fields
    op.drop_column('chats', 'instruction_template_filename')
    op.drop_column('chats', 'instruction_template_path')
    
    # Make fields non-nullable again (set defaults first)
    op.execute("UPDATE chats SET airplane_model = 'Boeing 737' WHERE airplane_model IS NULL")
    op.execute("UPDATE chats SET component_type = 'Estructural' WHERE component_type IS NULL")
    op.alter_column('chats', 'airplane_model', nullable=False)
    op.alter_column('chats', 'component_type', nullable=False)
