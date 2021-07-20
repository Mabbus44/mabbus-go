@echo off
set dirpath=%~dp0
echo. 2> ts-files.txt
FOR %%f in (%dirpath%*.ts) DO (echo %%f >> ts-files.txt)
FOR %%f in (%dirpath%modules\*.ts) DO (echo %%f >> ts-files.txt)
FOR %%f in (%dirpath%public\js\*.ts) DO (echo %%f >> ts-files.txt)
call tsc @ts-files.txt
del ts-files.txt