#!/bin/bash

rm -r ./out/*
DIR=`pwd`
SITE_PACKAGES_REL=/lib/python3.7/site-packages
mkdir -p temp/python$SITE_PACKAGES_REL
TEMP=$DIR/temp/python$SITE_PACKAGES_REL
cd $DIR/lambdas 

SITE_PACKAGES=$(pipenv --venv)
PACKAGE_ZIP='rf_lib.zip'

OUTDIR=$DIR/out

cd $SITE_PACKAGES$SITE_PACKAGES_REL

cp -r ./ $TEMP

cd $TEMP 
cd ../../../../
zip -r9 $OUTDIR/$PACKAGE_ZIP *

cd $DIR/lambdas/handlers
for file_inner in ./** #separate zip for each lambda
do
    len=${#file_inner}

    shortfile=${file_inner:2:len-5} # change this to "not have the .py" exclude last 3 characters

    for file_inner in ./**
    do
        zip -r9g $OUTDIR/$shortfile.zip $file_inner
    done

done

rm -r $DIR/temp
