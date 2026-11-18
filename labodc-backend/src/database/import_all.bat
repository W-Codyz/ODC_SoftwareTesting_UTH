@echo off
set PGPASSWORD=25012005Hdz

echo === Importing schema files ===
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Initial_Schema.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\schema.sql"

echo === Importing config and migrations ===
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Centralized_File_Management.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Notifications_System_Config.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Rejection_Management.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Tasks_Payment_Reports.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Migration_Enterprise_Feedback.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Migration_Enterprise_Status.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Migration_Project_Validation_Status.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Migration_Task_Submissions.sql"

echo === Importing seed data ===
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Seed_Test_Data.sql"
psql -U postgres -d labodc -f "D:\UTH\HK9\KCPM\ODC_SoftwareTesting_UTH\labodc-backend\src\database\Seed_Tasks_Payment_Reports.sql"

echo === Done! ===
pause
