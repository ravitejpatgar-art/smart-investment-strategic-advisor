"""Initial schema with users, financial_profiles, expenses, goals, and portfolio_holdings

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-27 16:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('email', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), default='user'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )

    # Financial Profiles table
    op.create_table(
        'financial_profiles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('occupation', sa.String(), nullable=True),
        sa.Column('monthly_income', sa.Float(), default=0.0),
        sa.Column('monthly_expenses', sa.Float(), default=0.0),
        sa.Column('existing_savings', sa.Float(), default=0.0),
        sa.Column('existing_investments', sa.Float(), default=0.0),
        sa.Column('financial_goal', sa.String(), default='Wealth Creation & Early Independence'),
        sa.Column('investment_horizon', sa.String(), default='5-10 Years'),
        sa.Column('investment_experience', sa.String(), default='Beginner'),
        sa.Column('risk_tolerance', sa.String(), default='Moderate'),
        sa.Column('risk_score', sa.Integer(), default=75),
        sa.Column('primary_goals', sa.JSON(), default=list),
        sa.Column('onboarding_completed', sa.Boolean(), default=False),
        sa.Column('baseline_health_score', sa.Integer(), default=75),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )

    # Expenses table
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('category', sa.String(), nullable=False, index=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('date', sa.String(), nullable=False, index=True),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('is_recurring', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )
    op.create_index('ix_expenses_user_date', 'expenses', ['user_id', 'date'])

    # Goals table
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('category', sa.String(), default='Wealth Creation'),
        sa.Column('target_amount', sa.Float(), nullable=False),
        sa.Column('current_amount', sa.Float(), default=0.0),
        sa.Column('target_date', sa.String(), nullable=False, index=True),
        sa.Column('risk_profile', sa.String(), default='Moderate'),
        sa.Column('monthly_sip_required', sa.Float(), default=0.0),
        sa.Column('probability', sa.Integer(), default=85),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )
    op.create_index('ix_goals_user_target_date', 'goals', ['user_id', 'target_date'])

    # Portfolio Holdings table
    op.create_table(
        'portfolio_holdings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('symbol', sa.String(), nullable=False, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('asset_class', sa.String(), default='Indian Stocks'),
        sa.Column('shares', sa.Float(), nullable=False),
        sa.Column('avg_buy_price', sa.Float(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )
    op.create_index('ix_portfolio_user_symbol', 'portfolio_holdings', ['user_id', 'symbol'])

def downgrade() -> None:
    op.drop_table('portfolio_holdings')
    op.drop_table('goals')
    op.drop_table('expenses')
    op.drop_table('financial_profiles')
    op.drop_table('users')
