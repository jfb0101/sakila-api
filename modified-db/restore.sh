#!/bin/bash

docker exec sakila-database mysql -u root -p1q2w3e4r -e "drop database sakila; create database sakila;"

cat /home/jb/aulas/sakila-api/modified-db/sakila.sql | docker exec -i sakila-database mysql -u root -p1q2w3e4r sakila