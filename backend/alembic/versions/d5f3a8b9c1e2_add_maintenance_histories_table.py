"""add_maintenance_histories_table

Revision ID: d5f3a8b9c1e2
Revises: c392bc59c1f7
Create Date: 2025-12-08 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd5f3a8b9c1e2'
down_revision = 'c392bc59c1f7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create maintenance_histories table
    op.create_table(
        'maintenance_histories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chat_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('aircraft_info', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('maintenance_actions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('parts_used', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['chat_id'], ['chats.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_maintenance_histories_id'), 'maintenance_histories', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_maintenance_histories_id'), table_name='maintenance_histories')
    op.drop_table('maintenance_histories')
