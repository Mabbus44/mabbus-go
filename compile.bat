@echo off
cd js/server
del *.js
cd ../common
del *.js
cd ../../public/js
del *js
cd ../../src/server
call tsc
cd ../common
cd ../client
del *.js
call tsc
for /f "delims=|" %%f in ('dir /b  *.js') do call browserify %%f -o ../../public/js/%%f
del *.js
