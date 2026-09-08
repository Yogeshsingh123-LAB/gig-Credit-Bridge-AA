# CredBridge Database Documentation

## Database Technology
- **Engine**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+ (Python)
- **Migrations**: Alembic (to be configured in future steps)

## Configuration
The backend database connection is configured strictly via the `DATABASE_URL` environment variable.

### Format
`postgresql://<username>:<password>@<host>:<port>/<dbname>`

### Supported Providers
1. **Local Docker PostgreSQL**: `postgresql://credbridge_user:credbridge_password@localhost:5432/credbridge_db`
2. **Supabase**: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
3. **Neon PostgreSQL**: `postgresql://[user]:[password]@[ep-name].aws.neon.tech/neondb`

## Setup & Initialization
In Step 1, the database session helper is initialized under `backend/app/database/session.py`. 
SQLAlchemy's `Base.metadata.create_all(bind=engine)` will be executed when models are introduced in later steps.
