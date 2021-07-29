@echo off 
cd src/client
for /f "delims=|" %%f in ('dir /b  *.js') do call browserify %%f -o ../../public/js/%%f