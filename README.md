[![Codacy Badge](https://app.codacy.com/project/badge/Grade/68114bc7e8e948ac9292943d26f0dc2c)](https://www.codacy.com/gh/galyfray/Vo-Table-Reader/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=galyfray/Vo-Table-Reader&amp;utm_campaign=Badge_Grade)
# Vo-Table-Reader

VO Table parser that aims for performance as well as compatibility. One of the goal of this parser is to be available for both node JS and as a librairy for web applications.

## Vo-Table 
>The VOTable format is an XML standard for the interchange of data represented as a set of tables. In this context,
a table is an unordered set of rows, each of a uniform structure, as specified in the table description (the table
metadata). Each row in a table is a sequence of table cells, and each of these contains either a primitive data type,
or an array of such primitives. VOTable is derived from the Astrores format [[1]](http://cds.u-strasbg.fr/doc/astrores.htx), itself modeled on the FITS Table
format [[2]](http://fits.gsfc.nasa.gov/); VOTable was designed to be close to the FITS Binary Table format.

*Introduction of the specification of the VOTable version 1.4*

A complete description of the standard can be found [here](http://www.ivoa.net/Documents/latest/VOT.html/)

## Why ?
Web applications are becoming more and more common in all kind of fields. I currently only know two web applications that use the VOTable format [Taphandle](https://taphandle.astro.unistra.fr/taphandle/index.html) and [TapComplex](http://taphandle.astro.unistra.fr/tapcomplex/app/Tap_Handle_MK2/taphandev.html). While the first one rely on a server to process the VOTables the second one use a parser under GPL3 for which I ~~can't find much documentation about it online~~ (see below), making this librairy hard to use. So I decided to create my own parser, document it with an emphasys on speed and optimisation as resources in web browsers are limited.
Also because I like the challenge of building such parser from scratch.

small erratum : while I was looking for a copy of the said parser I found a [project](https://github.com/cta-epfl/esap-gui) wich was using it and reference its [source](https://gitlab.com/cdsdevcorner/votable.js). As expected I found a good amount of documentation with it. I redirect you to this project if you are in need of a working parser even though it doesn't support the "new" `BINARY2` stream.

## Current state of the project 
The project is currently under developpement is not ready for an initial release.

## TODO
The [TODO](./TODO.md) list contains planed improvments.
