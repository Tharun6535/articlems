@echo off
echo Starting the application with the correct class name...
cd %~dp0
java -classpath target/classes;target/dependency/* com.ali.BlogApplication 