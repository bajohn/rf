#!/bin/bash

rm -r ./out/*
DIR=`pwd`
SITE_PACKAGES_REL=/lib/python3.7/site-packages
mkdir -p temp/python$SITE_PACKAGES_REL
TEMP=$DIR/temp/python$SITE_PACKAGES_REL
cd $DIR

SITE_PACKAGES=$(pipenv --venv)
PACKAGE_ZIP='rf_lib.zip'

OUTDIR=$DIR/out

cd $SITE_PACKAGES$SITE_PACKAGES_REL

cp -r ./ $TEMP

cd $TEMP 
cd ../../../../
zip -r9 $OUTDIR/$PACKAGE_ZIP *

cd $DIR/rf_python/lambda_handlers
for file_outer in ./** #separate zip for each lambda
do
    cd $DIR
    len=${#file_outer}

    shortfile=${file_outer:2:len-5} # change this to "not have the .py" exclude last 3 characters


    zip -r9g $OUTDIR/$shortfile.zip ./rf_python
    

done

rm -r $DIR/temp
