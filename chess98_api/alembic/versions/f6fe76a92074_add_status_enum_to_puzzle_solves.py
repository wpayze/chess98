"""add status enum to puzzle_solves

Revision ID: f6fe76a92074
Revises: 422e5e208f23
Create Date: 2025-04-21 20:42:50.687081

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6fe76a92074'
down_revision: Union[str, None] = '422e5e208f23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Paso 0: Crear el ENUM
    op.execute("CREATE TYPE puzzle_solve_status AS ENUM ('SOLVED', 'FAILED', 'SKIPPED')")

    # Paso 1: Crear columna como nullable temporalmente
    op.add_column('puzzle_solves', sa.Column(
        'status',
        sa.Enum('SOLVED', 'FAILED', 'SKIPPED', name='puzzle_solve_status'),
        nullable=True
    ))

    # Paso 2: Migrar datos con cast explícito
    op.execute("""
        UPDATE puzzle_solves
        SET status = CASE
            WHEN success = TRUE THEN 'SOLVED'::puzzle_solve_status
            ELSE 'FAILED'::puzzle_solve_status
        END
    """)

    # Paso 3: Marcar como NOT NULL
    op.alter_column('puzzle_solves', 'status', nullable=False)

def downgrade() -> None:
    op.drop_column('puzzle_solves', 'status')
    op.execute("DROP TYPE puzzle_solve_status")
