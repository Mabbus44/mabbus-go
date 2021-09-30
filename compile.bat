@echo off
@echo ***Deleting old .js files***
cd js/server
del *.js
cd ../common
del *.js
cd ../../public/js
del *js
@echo ***Compiling .ts files***
cd ../../src/server
call tsc
cd ../common
call tsc
cd ../client
call tsc
@echo ***Browserifying .js files***
for /f "delims=|" %%f in ('dir /b  *.js') do call browserify %%f --s mymodule -o ../../public/js/%%f
del *.js
cd ../common
del *.js
