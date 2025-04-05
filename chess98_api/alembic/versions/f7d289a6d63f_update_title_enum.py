"""update title enum

Revision ID: f7d289a6d63f
Revises: d91dd9ecc38e
Create Date: 2025-04-05 23:28:11.230752

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7d289a6d63f'
down_revision: Union[str, None] = 'd91dd9ecc38e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

from sqlalchemy import Enum as PGEnum
from alembic import op

# Nueva lista de valores
new_enum = PGEnum(
    "GM", "IM", "FM", "CM", "NM", "GP", "PI", "FP", "CP",
    name="title_enum"
)

# Lista anterior (antes del cambio)
old_enum = PGEnum(
    "GM", "IM", "FM", "CM", "NM",
    name="title_enum"
)

def upgrade():
    # Solo para PostgreSQL: ALTER TYPE
    # Agregar nuevos valores (no se puede cambiar directamente en PGEnum)
    op.execute("ALTER TYPE title_enum ADD VALUE IF NOT EXISTS 'GP'")
    op.execute("ALTER TYPE title_enum ADD VALUE IF NOT EXISTS 'PI'")
    op.execute("ALTER TYPE title_enum ADD VALUE IF NOT EXISTS 'FP'")
    op.execute("ALTER TYPE title_enum ADD VALUE IF NOT EXISTS 'CP'")


def downgrade():
    # Downgrade real no es posible automáticamente para Enums en PostgreSQL
    # Requiere reemplazar la columna o hacer type casting
    raise NotImplementedError("Downgrade of ENUM values not supported automatically.")
