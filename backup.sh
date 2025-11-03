#!/bin/sh

# اطمینان از اینکه اسکریپت در صورت بروز خطا متوقف می‌شود
set -e

# تنظیم متغیرها
BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# ۱. بکاپ‌گیری از دیتابیس PostgreSQL
DB_FILE_NAME="db-backup-$DATE.sql.gz"
echo "Starting PostgreSQL backup to $BACKUP_DIR/$DB_FILE_NAME ..."
# ما از متغیرهای محیطی که در داکر-کامپوز تنظیم می‌شوند، استفاده می‌کنیم
export PGPASSWORD=$POSTGRES_PASSWORD
pg_dump -h db -U $POSTGRES_USER -d $POSTGRES_DB | gzip > $BACKUP_DIR/$DB_FILE_NAME
echo "PostgreSQL backup complete."


# ۲. بکاپ‌گیری از فایل‌های MinIO (Mirroring)
echo "Starting MinIO backup (mirroring)..."
# تنظیم کلاینت MinIO
mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
# میرور کردن باکت به یک پوشه در بکاپ
mc mirror --overwrite myminio/$S3_BUCKET_NAME $BACKUP_DIR/minio-files/
echo "MinIO backup complete."


# (اختیاری) پاک کردن بکاپ‌های قدیمی‌تر از ۷ روز
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "db-backup-*" -mtime +7 -exec rm {} \;
echo "Cleanup complete."

echo "--- Backup process finished successfully ---"