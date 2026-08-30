"""Add conversations and conversation_messages tables

Revision ID: 002_conversations
Revises: 001_initial_schema
Create Date: 2026-08-30 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_conversations'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(100), nullable=False, server_default='New Financial Chat'),
        sa.Column('is_pinned', sa.Boolean(), server_default=sa.false(), index=True),
        sa.Column('message_count', sa.Integer(), server_default='0'),
        sa.Column('last_message_at', sa.DateTime(), server_default=sa.func.now(), index=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_conversations_user_last_msg', 'conversations', ['user_id', 'last_message_at'])
    op.create_index('ix_conversations_user_pinned', 'conversations', ['user_id', 'is_pinned'])

    # Conversation Messages table
    op.create_table(
        'conversation_messages',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('conversation_id', sa.String(), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )
    op.create_index('ix_conv_msg_conv_created', 'conversation_messages', ['conversation_id', 'created_at'])


def downgrade() -> None:
    op.drop_table('conversation_messages')
    op.drop_table('conversations')
