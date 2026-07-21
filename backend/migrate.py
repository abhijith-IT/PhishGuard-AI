import sqlite3

def run_migration():
    conn = sqlite3.connect('phishguard.db', timeout=10)
    cursor = conn.cursor()
    try:
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(analysis)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "supporting_indicators" in columns:
            print("Migration skipped: column supporting_indicators already exists.")
            return

        cursor.execute("ALTER TABLE analysis ADD COLUMN supporting_indicators VARCHAR")
        conn.commit()
        print("Migration successful: added supporting_indicators to analysis table.")
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    run_migration()
