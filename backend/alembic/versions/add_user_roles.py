"""Add user roles and divisions

Revision ID: add_user_roles
Revises: d5f3a8b9c1e2
Create Date: 2025-12-12

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_user_roles'
down_revision = 'd5f3a8b9c1e2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('role', sa.String(), nullable=False, server_default='mantenimiento'))
    op.add_column('users', sa.Column('division', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    
    # Create index on role column
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    
    # Create user_assignments table for oficinista-operario relationships
    op.create_table(
        'user_assignments',
        sa.Column('oficinista_id', sa.Integer(), nullable=False),
        sa.Column('operario_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['oficinista_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['operario_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('oficinista_id', 'operario_id')
    )


def downgrade() -> None:
    # Drop user_assignments table
    op.drop_table('user_assignments')
    
    # Drop index
    op.drop_index(op.f('ix_users_role'), table_name='users')
    
    # Drop columns from users table
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'created_at')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'division')
    op.drop_column('users', 'role')
